import { Hono } from 'hono'
import { ok } from '../lib/api-response.js'
import * as healthService from '../services/health.service.js'

const health = new Hono()

health.get('/', async (c) => {
  const data = await healthService.getHealthStatus()
  return c.json(ok(data))
})

export default health
