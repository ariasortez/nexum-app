"use client"

import { createClient } from "@supabase/supabase-js"
import type { RealtimeNotificationConfig } from "@/types/notifications"
import type { MessageRealtimeConfig } from "@/types/messages"

export function createRealtimeClient(config: RealtimeNotificationConfig | MessageRealtimeConfig) {
  const client = createClient(config.supabase_url, config.supabase_anon_key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  client.realtime.setAuth(config.access_token)
  return client
}

export function createNotificationsRealtimeClient(config: RealtimeNotificationConfig) {
  return createRealtimeClient(config)
}

export function createMessagesRealtimeClient(config: MessageRealtimeConfig) {
  return createRealtimeClient(config)
}
