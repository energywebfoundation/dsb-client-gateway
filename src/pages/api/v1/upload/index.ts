// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { v4 as uuidv4 } from 'uuid'
import { ErrorCode } from '../../../../utils'
import { isAuthorized } from '../../../../services/auth.service'
import { DsbApiService } from '../../../../services/dsb-api.service'
import { signPayload } from '../../../../services/identity.service'
import { withSentry, captureException } from "@sentry/nextjs"

const handler = async (
    req: NextApiRequest,
    res: NextApiResponse<Response>
) => {
    if (req.method !== 'POST') {
        return res.status(405).end()
    }
    const authHeader = req.headers.authorization
    const { err } = isAuthorized(authHeader)
    if (!err) {
        return forPOST(req, res)
    } else {
        if (err.message === ErrorCode.UNAUTHORIZED) {
            res.status(401)
            res.setHeader("WWW-Authenticate", "Basic realm=\"Authorization Required\"")
            res.end()
        } else {
            res.status(403).end()
        }
    }
}

async function forPOST(
    req: NextApiRequest,
    res: NextApiResponse
): Promise<void> {
    //taking only the content of the file from the request body
    const lines = (req.body as string).split('\n')
    const payload = lines
        .slice(3, lines.length - 2)
        .filter((line) => line !== '\r')
        .join('')

    const { ok: signature, err: signError } = await signPayload(payload)

    if (!signature) {
        captureException(signError)
        return res.status(400).send({ err: signError })
    }
    let body = {
        fqcn: req.query.fqcn as string,
        topic: req.query.topic as string,
        payload: payload
    }

    const { ok: sent, err: sendError } = await DsbApiService.init().sendMessage({
        ...body,
        correlationId: uuidv4(),
        signature
    })

    if (!sent) {
        captureException(sendError)
        return res.status(400).send({ err: sendError })
    }
    return res.status(200).send(sent)

}
export default withSentry(handler)
