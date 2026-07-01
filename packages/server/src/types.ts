import type { Server } from 'node:http'
import type { WebSocket } from 'ws'
import type { Channel } from './Channel'
import type { WebSocketServer } from './WebSocketServer'

export interface WdmcpServerOptions {
  port?: number
  host?: string
  domain?: string
  server?: Server
  basePath?: string
  log: (...args: unknown[]) => void
}

export interface ChiiCtx {
  wss: WebSocketServer
}

export interface ChiiTarget {
  id: string
  title: string
  url: string
  favicon: string
  channel: Channel
  ws: WebSocket
  ip: string
  userAgent: string
  rtc: unknown
}

export interface ChiiClient {
  id: string
  target: string
  ws: WebSocket
  channel: Channel
}

export interface TargetConnectionMeta {
  type: 'target'
  id: string
  url: string | null
  title: string | null
  favicon: string | null
  rtc: boolean
}

export interface ClientConnectionMeta {
  type: 'client'
  id: string
  target: string | null
}

export type ConnectionMeta = TargetConnectionMeta | ClientConnectionMeta
