// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { Wallet } from 'ethers'
import fs from 'fs/promises'
import path from 'path'
import { Result } from '../../../utils'
import { config } from 'config';



async function processProxy(req, res) {
    const { clientId, tenantId, clientSecret } = req.body
    if (!clientId || !tenantId || !clientSecret) {
        return res.status(400).json({ err: 'clientId, tenantId, clientSecret all required' })
    }
    try {
        const filepath = path.join(process.cwd(), 'vc.cert')
        await fs.writeFile(filepath, `${clientId},${tenantId},${clientSecret}`)
        // here we could optionally restart the broker
        res.status(200).json({
            ok: true
        })
    } catch (err) {
        res.status(400).json({
            err: `Credentials invalid: ${err.message}`
        })
    }

}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Result<boolean, string>>
) {
    if (req.method !== 'POST') {
        return res.status(405).end()
    }

    try {
        const auth: string = req.headers.authorization as string;
        const username = config.authentication.username;
        const password = config.authentication.password;

        if (!config.authentication.username && !config.authentication.password) {
            return await processProxy(req, res);
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
                return await processProxy(req, res);
            } else {
                // The user typed in the username or password wrong.
                return res.status(403).json({ err: "Access Denied (incorrect credentials)" });
            }
        }
    } catch (err) {
        return res.status(err.statusCode ?? 500).json({ err: err.message })
    }

}
