// @ts-expect-error
import request from '@cypress/request'
import type { ParameterizedContext } from 'koa'

export const proxy = async (
  ctx: ParameterizedContext,
  url: string | string[] | undefined,
) => {
  const headers = Object.assign({}, ctx.header)
  delete headers.host
  delete headers.cookie

  const options = {
    uri: url,
    method: ctx.method,
    timeout: 5000,
    headers,
  }

  await pipeRequest(ctx, options)
}

function pipeRequest(ctx: ParameterizedContext, options: unknown) {
  return new Promise<void>((resolve, reject) => {
    const req = request(options)

    ctx.req.pipe(req)

    req
      .on('response', (res: any) => {
        const { headers } = res

        delete headers['set-cookie']

        headers['Access-Control-Allow-Credentials'] = 'true'
        headers['Access-Control-Allow-Headers'] = '*'
        headers['Access-Control-Allow-Methods'] =
          'OPTIONS, GET, PUT, POST, DELETE,GET, PUT, DELETE, POST, GET, OPTIONS'
        headers['Access-Control-Allow-Origin'] = '*'
      })
      .pipe(ctx.res)

    req.on('error', (err: Error) => {
      reject(err)
    })

    req.on('end', () => {
      ctx.res.end()

      resolve()
    })
  })
}
