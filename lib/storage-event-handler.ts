import { v4 as uuidv4 } from "uuid"
import type { Message } from "./message-store"

// This class handles storage events to enable communication between tabs
export class StorageEventHandler {
  private static instance: StorageEventHandler
  private listeners: Record<string, ((message: Message) => void)[]> = {}
  private clientId: string

  private constructor() {
    this.clientId = uuidv4()

    // Listen for storage events
    if (typeof window !== "undefined") {
      window.addEventListener("storage", this.handleStorageEvent)
    }
  }

  public static getInstance(): StorageEventHandler {
    if (!StorageEventHandler.instance) {
      StorageEventHandler.instance = new StorageEventHandler()
    }
    return StorageEventHandler.instance
  }

  private handleStorageEvent = (event: StorageEvent) => {
    // Check if this is a chat message update
    if (event.key?.startsWith("saino-chat-")) {
      const roomId = event.key.replace("saino-chat-", "")

      // Only process if we have listeners for this room
      if (this.listeners[roomId] && this.listeners[roomId].length > 0) {
        try {
          // Get the new messages
          const newMessages = JSON.parse(event.newValue || "[]") as Message[]
          const oldMessages = JSON.parse(event.oldValue || "[]") as Message[]

          // Find messages that were added
          if (newMessages.length > oldMessages.length) {
            // Get the new messages (the ones that were added)
            const addedMessages = newMessages.slice(oldMessages.length)

            // Notify listeners of each new message
            addedMessages.forEach((message) => {
              // Don't notify about our own messages
              if (!message.clientId || message.clientId !== this.clientId) {
                this.listeners[roomId].forEach((listener) => listener(message))
              }
            })
          }
        } catch (error) {
          console.error("Error processing storage event:", error)
        }
      }
    }
  }

  public addListener(roomId: string, callback: (message: Message) => void): () => void {
    if (!this.listeners[roomId]) {
      this.listeners[roomId] = []
    }

    this.listeners[roomId].push(callback)

    return () => {
      this.listeners[roomId] = this.listeners[roomId].filter((cb) => cb !== callback)
    }
  }
}
