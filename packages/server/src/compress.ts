import koaCompress from 'koa-compress'
import { constants } from 'node:zlib'

export const compress = () =>
  koaCompress({
    threshold: 2048,
    filter(content_type: string) {
      return [
        'application/javascript',
        'application/json',
        'text/css',
      ].includes(content_type)
    },
    gzip: {
      flush: constants.Z_SYNC_FLUSH,
    },
    deflate: {
      flush: constants.Z_SYNC_FLUSH,
    },
  })
