import { serve } from '@hono/node-server'
import app from './app.js'
import { env } from './config/env.js'

serve(
  {
    fetch: app.fetch,
    port: env.PORT,
    hostname: '0.0.0.0',
  },
  (info) => {
    console.log(`FIXO Backend running on http://0.0.0.0:${info.port}`)
  }
)

export type AppType = typeof app
