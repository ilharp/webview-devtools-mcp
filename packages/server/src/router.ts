import { Router } from '@koa/router'
import send from 'koa-send'
import path from 'path'
import type { ChannelManager } from './ChannelManager'
import { proxy } from './proxy'

const maxAge = 2 * 60 * 60 * 1000 // 2h

export const router = (channelManager: ChannelManager, basePath: string) => {
  const router = new Router()

  router.all(`${basePath}proxy`, async (ctx) => {
    await proxy(ctx, ctx.query['url'])
  })

  router.get(`${basePath}targets`, (ctx) => {
    const targets = Object.entries(channelManager.getTargets())
      .map(([, target]) => {
        const { channel, ...rest } = target
        return rest
      })
      .reverse()

    ctx.body = {
      targets,
    }
  })

  function createStaticFile(file: string) {
    router.get(`${basePath}${file}`, async (ctx) => {
      await send(ctx, file, {
        root: path.resolve(import.meta.dirname, '../../server'),
        maxAge,
      })
    })
  }

  createStaticFile('target.js')

  return router.routes()
}
