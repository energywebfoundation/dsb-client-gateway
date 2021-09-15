// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { DsbApiService } from '../../services/dsb-api.service'
import { ErrorBody, errorOrElse } from '../../utils'
import { withSentry } from "@sentry/nextjs"

type Response = void | { err: ErrorBody }

const handler = async (req: NextApiRequest, res: NextApiResponse<Response>) => {
  const { ok, err } = await DsbApiService.init().getHealth()
  if (!ok) {
    const error = errorOrElse(err)
    return res.status(error.statusCode).send({ err: error.body })
  }
  return res.status(200).end()
}
export default withSentry(handler)
