import { Hono } from 'hono'
import { supabaseAdmin } from '../lib/supabase.js'

const health = new Hono()

health.get('/', async (c) => {
  const { error } = await supabaseAdmin
    .from('main_categories')
    .select('id')
    .limit(1)

  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      database: error ? 'error' : 'ok',
    },
  })
})

export default health
