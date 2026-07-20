export type NotificationType = "proposal_received" | "quotation_accepted" | "quotation_rejected"

export type NotificationData = {
  request_id?: string
  response_id?: string
  estimated_price?: number
  provider_name?: string
}

export type NotificationItem = {
  id: string
  recipient_id: string
  actor_id: string | null
  type: NotificationType
  title: string
  body: string
  data: NotificationData
  read_at: string | null
  created_at: string
}

export type NotificationsResponse = {
  items: NotificationItem[]
  unread_count: number
}

export type RealtimeNotificationConfig = {
  supabase_url: string
  supabase_anon_key: string
  access_token: string
}
