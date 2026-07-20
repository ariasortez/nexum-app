"use client"

import { createClient, type RealtimeChannel, type SupabaseClient } from "@supabase/supabase-js"
import type { ConversationMessageItem, MessageRealtimeConfig } from "@/types/messages"

export type BroadcastMessage = {
  id: string
  conversation_id: string
  sender_id: string
  sender_name: string
  body: string | null
  created_at: string
  has_attachment?: boolean
  attachment_name?: string
}

type MessageBroadcastPayload = {
  type: "new_message"
  message: BroadcastMessage
}

export type MessageRealtimeSubscription = {
  unsubscribe: () => void
}

export class MessageBroadcastService {
  private client: SupabaseClient
  private channel: RealtimeChannel | null = null
  private conversationId: string | null = null

  constructor(config: MessageRealtimeConfig) {
    this.client = createClient(config.supabase_url, config.supabase_anon_key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
    this.client.realtime.setAuth(config.access_token)
  }

  subscribe(
    conversationId: string,
    onMessage: (message: BroadcastMessage) => void
  ): MessageRealtimeSubscription {
    // Cleanup previous subscription if any
    if (this.channel) {
      void this.client.removeChannel(this.channel)
    }

    this.conversationId = conversationId
    this.channel = this.client
      .channel(`chat:${conversationId}`, {
        config: { broadcast: { self: false } }, // Don't receive own broadcasts
      })
      .on("broadcast", { event: "new_message" }, (payload) => {
        const data = payload.payload as MessageBroadcastPayload
        if (data.type === "new_message") {
          onMessage(data.message)
        }
      })
      .subscribe()

    return {
      unsubscribe: () => {
        if (this.channel) {
          void this.client.removeChannel(this.channel)
          this.channel = null
        }
      },
    }
  }

  async broadcast(message: BroadcastMessage): Promise<void> {
    if (!this.channel || this.conversationId !== message.conversation_id) {
      // Create/switch channel if needed
      if (this.channel) {
        void this.client.removeChannel(this.channel)
      }
      this.conversationId = message.conversation_id
      this.channel = this.client.channel(`chat:${message.conversation_id}`, {
        config: { broadcast: { self: false } },
      })
      await this.channel.subscribe()
    }

    await this.channel.send({
      type: "broadcast",
      event: "new_message",
      payload: { type: "new_message", message } as MessageBroadcastPayload,
    })
  }

  dispose(): void {
    if (this.channel) {
      void this.client.removeChannel(this.channel)
      this.channel = null
    }
  }
}
