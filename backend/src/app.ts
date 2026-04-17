import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { env } from './config/env.js'
import { errorHandler } from './middleware/error-handler.js'
import api from './routes/index.js'
import type { Variables } from './types/index.js'

const app = new Hono<{ Variables: Variables }>()

app.use('*', logger())
app.use('*', cors({
  origin: env.FRONTEND_URL,
  credentials: true,
}))

app.onError(errorHandler)

app.route('/api', api)

app.get('/', (c) => c.redirect('/api/health'))

app.notFound((c) => {
  return c.json({ success: false, error: { message: 'Not found' } }, 404)
})

export default app
