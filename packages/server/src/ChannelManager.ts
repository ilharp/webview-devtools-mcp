import { EventEmitter } from 'node:events'
import type { WebSocket } from 'ws'
import { Channel } from './Channel'
import type { ChiiClient, ChiiTarget, WdmcpServerOptions } from './types'

export class ChannelManager extends EventEmitter {
  constructor(private options: WdmcpServerOptions) {
    super()
  }

  _targets: Record<string, ChiiTarget> = {}
  _clients: Record<string, ChiiClient> = {}

  createTarget = (
    id: string,
    ws: WebSocket,
    url: string,
    title: string,
    favicon: string,
    ip: string,
    userAgent: string,
    rtc: boolean,
  ) => {
    const channel = createChannel(ws)

    this.options.log(`[wdmcp] [chii] ${title} connected`)

    this._targets[id] = {
      id,
      title,
      url,
      favicon,
      channel,
      ws,
      ip,
      userAgent,
      rtc,
    }

    // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
    ws.on('close', () => this.removeTarget(id, title))

    ws.on('error', (error) => {
      this.options.log(`[wdmcp] [chii] ${title} error ${error.message}`)
    })

    this.emit('target_changed')
  }

  createClient = (id: string, ws: WebSocket, targetId: string) => {
    const target = this._targets[targetId]

    if (!target) {
      ws.close()
      return
    }

    const channel = createChannel(ws)

    this.options.log(
      `[wdmcp] [chii] client ${id} connected to target ${target.id}:${target.title}`,
    )

    channel.connect(target.channel)

    this._clients[id] = {
      id,
      target: target.id,
      ws,
      channel,
    }

    // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
    const closeClientWs = () => ws.close()

    ws.on('close', () => {
      target.ws.removeListener('close', closeClientWs)
      this.removeClient(id)
    })

    target.ws.on('close', closeClientWs)
  }

  removeTarget = (id: string, title = '') => {
    this.options.log(`[wdmcp] [chii] target ${id}:${title} disconnected`)

    delete this._targets[id]

    this.emit('target_changed')
  }

  removeClient = (id: string) => {
    this.options.log(`[wdmcp] [chii] client ${id} disconnected`)

    delete this._clients[id]
  }

  getTargets = () => {
    return this._targets
  }

  getClients = () => {
    return this._clients
  }
}

const createChannel = (ws: WebSocket) => {
  const channel = new Channel()

  // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
  ws.on('close', () => channel.destroy())

  ws.on('message', (data, isBinary) => {
    channel.send(isBinary ? data : data.toString())
  })

  // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
  channel.on('message', (msg) => ws.send(msg))

  return channel
}
