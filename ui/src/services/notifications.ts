import type { ApiSuccessResponse } from "@fixo/contracts/api"
import { api } from "@/lib/api"
import type {
  NotificationItem,
  NotificationsResponse,
  RealtimeNotificationConfig,
} from "@/types/notifications"

export async function listNotifications(limit = 20): Promise<NotificationsResponse> {
  const response = await api.get<ApiSuccessResponse<NotificationsResponse>>(
    `/notifications?limit=${limit}`
  )
  return response.data
}

export async function getRealtimeNotificationConfig(): Promise<RealtimeNotificationConfig> {
  const response = await api.get<ApiSuccessResponse<RealtimeNotificationConfig>>(
    "/notifications/realtime-config"
  )
  return response.data
}

export async function markNotificationRead(notificationId: string): Promise<Pick<NotificationItem, "id" | "read_at">> {
  const response = await api.patch<ApiSuccessResponse<Pick<NotificationItem, "id" | "read_at">>>(
    `/notifications/${notificationId}/read`,
    {}
  )
  return response.data
}

export async function markAllNotificationsRead(): Promise<{ updated: boolean }> {
  const response = await api.patch<ApiSuccessResponse<{ updated: boolean }>>(
    "/notifications/read-all",
    {}
  )
  return response.data
}
