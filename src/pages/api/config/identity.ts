import type { NextApiRequest, NextApiResponse } from 'next'
import { Result, ErrorCode, BalanceState, RoleState } from 'utils'
import { initMessageBroker } from 'services/dsb.service'
import { initIdentity } from 'services/identity.service'
import { config } from 'config';


type Response = {
    did: string
    publicKey: string
    balance: BalanceState,
    status: {
        user: RoleState,
        messagebroker: RoleState
    }
}

async function processEnrolment(req, res) {

    if (req.method !== 'POST') {
        return res.status(405).end()
    }
    const { privateKey } = req.body
    if (!privateKey) {
        throw new Error(ErrorCode.NO_PRIVATE_KEY)
    }
    const { ok: identity, err: initError } = await initIdentity(privateKey)
    if (!identity) {
        throw initError
    }
    // get current state to know which claims need enrolment
    const { ok: state, err: stateError } = await identity.getEnrolmentState()
    if (!state) {
        throw stateError
    }
    // exit early if already approved
    if (state.ready) {
        const { ok: persisted, err: persistError } = await identity.writeToFile(state)
        if (!persisted) {
            throw persistError
        }
        // fire and forget starting the message broker
        await initMessageBroker({ privateKey, did: identity.did })
        return res.status(200).json({
            ok: {
                did: identity.did,
                publicKey: identity.publicKey,
                balance: identity.balance,
                status: state
            }
        })
    }
    // create messagebroker + user claims
    const { ok: enroled, err: enrolError } = await identity.handleEnrolement(state)
    if (!enroled) {
        throw enrolError
    }
    // fetch the state again based on new enrolments
    const { ok: newState, err: newStateError } = await identity.getEnrolmentState()
    if (!newState) {
        throw newStateError
    }
    // persist the current state
    const { ok: persisted, err: persistError } = await identity.writeToFile(newState)
    if (!persisted) {
        throw persistError
    }
    const { ok: broker, err: brokerError } = await initMessageBroker({
        privateKey,
        did: identity.did
    })
    if (!broker) {
        throw brokerError
    }
    // fire and forget starting the message broker
    await initMessageBroker({ privateKey, did: identity.did })
    return res.status(200).json({
        ok: {
            did: identity.did,
            publicKey: identity.publicKey,
            balance: identity.balance,
            status: newState
        }
    })
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Result<Response, string>>
) {
    try {
        const auth: string = req.headers.authorization as string;
        const username = config.authentication.username;
        const password = config.authentication.password;

        if (!config.authentication.username && !config.authentication.password) {
            return await processEnrolment(req, res);
        }

        if (!auth) {
            res.setHeader("WWW-Authenticate", "Basic realm=\"Authorization Required\"")
            return res.status(401).json({ err: 'Authorization Required' })
        } else {
            // If the user enters a username and password, the browser re-requests the route
            // and includes a Base64 string of those credentials.
            const token: string = auth.split(" ").pop() as string;
            var credentials = Buffer.from(token, "base64").toString("ascii").split(":");

            if (credentials[0] === username && credentials[1] === password) {
                // The username and password are correct, so the user is authorized.
                return await processEnrolment(req, res);
            } else {
                // The user typed in the username or password wrong.
                return res.status(403).json({ err: "Access Denied (incorrect credentials)" });
            }
        }
    } catch (err) {
        return res.status(err.statusCode ?? 500).json({ err: err.message })
    }
}
