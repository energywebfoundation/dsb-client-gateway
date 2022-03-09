import type { NextApiRequest, NextApiResponse } from 'next'
import { isAuthorized } from '../../../../services/auth.service'
import { DsbApiService } from '../../../../services/dsb-api.service'
import { signPayload } from '../../../../services/identity.service'
import {
    ErrorBody,
    ErrorCode,
    errorOrElse,
    GatewayError,
    Message,
    SendMessageResult,
    UnknownError,
    Topic
} from '../../../../utils'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const authHeader = req.headers.authorization

    const { err } = isAuthorized(authHeader)
    if (!err) {
        switch (req.method) {
            case 'GET':
                return forGET(req, res)
            case 'POST':
                return forPOST(req, res)
            case 'PATCH':
                return forPATCH(req, res)
            default:
                return res.status(405).end()
        }
    } else {
        if (err.message === ErrorCode.UNAUTHORIZED) {
            res.status(401)
            res.setHeader('WWW-Authenticate', 'Basic realm="Authorization Required"')
            res.end()
        } else {
            res.status(403).end()
        }
    }
}

/**
 * Handles the GET /messages request
 */
async function forGET(req: NextApiRequest, res: NextApiResponse<Topic[] | { err: ErrorBody }>): Promise<void> {
    // todo: validate request bodies/queries
    const { ok: topics, err: reqError } = await DsbApiService.init().getTopics(req.query as any)
    if (topics === undefined) {
        const error = errorOrElse(reqError)
        return res.status(error.statusCode).send({ err: error.body })
    }
    return res.status(200).send(topics)
}

/**
 * Handles the POST /messages request
 */
async function forPOST(
    req: NextApiRequest,
    res: NextApiResponse<SendMessageResult | { err: ErrorBody }>
): Promise<void> {
    try {
        const { ok: sent, err: sendError } = await DsbApiService.init().postTopics({
            ...req.body
        })
        if (!sent) {
            throw sendError
        }
        return res.status(200).send(sent)
    } catch (err) {
        if (err instanceof GatewayError) {
            res.status(err.statusCode).send({ err: err.body })
        } else {
            const error = new UnknownError(err)
            res.status(500).send({ err: error.body })
        }
    }
}


/**
 * Handles the POST /messages request
 */
async function forPATCH(
    req: NextApiRequest,
    res: NextApiResponse<SendMessageResult | { err: ErrorBody }>
): Promise<void> {
    try {
        const { ok: sent, err: sendError } = await DsbApiService.init().updateTopics({
            ...req.body
        })
        if (!sent) {
            throw sendError
        }
        return res.status(200).send(sent)
    } catch (err) {
        if (err instanceof GatewayError) {
            res.status(err.statusCode).send({ err: err.body })
        } else {
            const error = new UnknownError(err)
            res.status(500).send({ err: error.body })
        }
    }
}

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '16mb'
        }
    }
}

export default handler
