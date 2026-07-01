import Koa from 'koa'
import { compress } from './compress'
import { router } from './router'
import type { WdmcpServerOptions } from './types'
import { WebSocketServer } from './WebSocketServer'

export type * from './types'

export const start = (options: WdmcpServerOptions) => {
  let { port = 8080, host, domain, server, basePath = '/', log } = options

  domain = domain || `localhost:${port}`

  if (!basePath.endsWith('/')) {
    basePath += '/'
  }

  const app = new Koa()
  const wss = new WebSocketServer(options)

  app.use(compress()).use(router(wss.channelManager, basePath))

  if (server) {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    server.on('request', app.callback())
    wss.start(server)
  } else {
    log(`starting server at http://${domain}${basePath}`)
    const server = app.listen(port, host)
    wss.start(server)
  }

  return {
    wss,
  }
}
