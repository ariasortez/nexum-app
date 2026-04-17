import { Hono } from 'hono'
import type { Variables } from '../types/index.js'
import health from './health.routes.js'
import auth from './auth.routes.js'
import categories from './categories.routes.js'
import requests from './requests.routes.js'

const api = new Hono<{ Variables: Variables }>()

api.route('/health', health)
api.route('/auth', auth)
api.route('/categories', categories)
api.route('/requests', requests)

export default api
