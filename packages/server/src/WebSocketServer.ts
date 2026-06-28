import type { IncomingMessage, Server } from 'node:http'
import url from 'url'
import type { WebSocket } from 'ws'
import { WebSocketServer as OriginalWebSocketServer } from 'ws'
import { ChannelManager } from './ChannelManager'
import type { ConnectionMeta, WdmcpServerOptions } from './types'

export class WebSocketServer {
  constructor(private options: WdmcpServerOptions) {
    this.channelManager = new ChannelManager(this.options)
  }

  channelManager

  _wss = new OriginalWebSocketServer({ noServer: true })

  start = (server: Server) => {
    server.on('upgrade', (request, socket, head) => {
      const urlObj = url.parse(request.url!)

      const pathname = urlObj.pathname!.split('/')

      const len = pathname.length
      const type = pathname[len - 2] || ''
      const id = pathname[len - 1] || ''

      if (type !== 'target' && type !== 'client') {
        socket.destroy()
        return
      }

      const q = new URLSearchParams(urlObj.query || '')

      const meta: ConnectionMeta =
        type === 'target'
          ? {
              type: 'target',
              id,
              url: q.get('url'),
              title: q.get('title'),
              favicon: q.get('favicon'),
              rtc: q.get('rtc') === 'true',
            }
          : {
              type: 'client',
              id,
              target: q.get('target'),
            }

      this._wss.handleUpgrade(request, socket, head, (ws) => {
        this.handleConnection(ws, request, meta)
      })
    })
  }

  private handleConnection = (
    ws: WebSocket,
    req: IncomingMessage,
    meta: ConnectionMeta,
  ) => {
    if (meta.type === 'target') {
      let ip = req.socket.remoteAddress

      const userAgent = req.headers['user-agent']

      const forwardedFor = req.headers['x-forwarded-for']
      if (forwardedFor) {
        const value = Array.isArray(forwardedFor)
          ? forwardedFor[0]
          : forwardedFor
        const first = value?.split(',')[0]?.trim()
        if (first) ip = first
      }

      this.channelManager.createTarget(
        meta.id,
        ws,
        meta.url || '',
        meta.title || '',
        meta.favicon || '',
        ip || '',
        userAgent || '',
        meta.rtc,
      )
    } else {
      this.channelManager.createClient(meta.id, ws, meta.target || '')
    }
  }
}
