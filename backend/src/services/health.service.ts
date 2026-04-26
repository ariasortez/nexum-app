import { supabaseAdmin } from '../lib/supabase.js'

export interface HealthStatus {
  status: 'ok'
  timestamp: string
  services: {
    database: 'ok' | 'error'
  }
}

export async function getHealthStatus(): Promise<HealthStatus> {
  const { error } = await supabaseAdmin
    .from('main_categories')
    .select('id')
    .limit(1)

  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      database: error ? 'error' : 'ok',
    },
  }
}
