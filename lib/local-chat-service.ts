import { v4 as uuidv4 } from "uuid"
import type { Message } from "./message-store"

// Define the message interface
interface ChatMessage {
  sender: string
  text: string
  timestamp: number
}

class LocalChatService {
  private static instance: LocalChatService
  private clientId: string
  private messageListeners: { [roomId: string]: ((message: Message) => void)[] } = {}
  private messageQueue: { [roomId: string]: Message[] } = {}
  private pollingInterval = 1000 // Check for new messages every 1 second

  // Singleton pattern
  public static getInstance(): LocalChatService {
    if (!LocalChatService.instance) {
      LocalChatService.instance = new LocalChatService()
    }
    return LocalChatService.instance
  }

  private constructor() {
    this.clientId = uuidv4()
    console.log("LocalChatService initialized with client ID:", this.clientId)
  }

  public getMessages(roomId: string): Message[] {
    if (typeof window === "undefined") return []

    try {
      const messagesKey = `saino-messages-${roomId}`
      const messagesJson = localStorage.getItem(messagesKey)

      if (!messagesJson) return []

      return JSON.parse(messagesJson) as Message[]
    } catch (error) {
      console.error(`Error getting messages for room ${roomId}:`, error)
      return []
    }
  }

  public sendMessage(roomId: string, message: Message): void {
    if (typeof window === "undefined") return

    console.log(`Sending message to room ${roomId}:`, message)

    try {
      // Add client ID to message
      const messageWithClientId = {
        ...message,
        clientId: message.clientId || this.clientId,
      }

      // Get existing messages
      const messagesKey = `saino-messages-${roomId}`
      let messages: Message[] = []

      const messagesJson = localStorage.getItem(messagesKey)
      if (messagesJson) {
        messages = JSON.parse(messagesJson)
      }

      // Add new message
      messages.push(messageWithClientId)

      // Keep only the last 100 messages
      if (messages.length > 100) {
        messages = messages.slice(messages.length - 100)
      }

      // Save back to localStorage - this will trigger the storage event in other tabs
      localStorage.setItem(messagesKey, JSON.stringify(messages))
    } catch (error) {
      console.error(`Error sending message to room ${roomId}:`, error)
    }
  }

  public onMessage(roomId: string, callback: (message: Message) => void): () => void {
    if (!this.messageListeners[roomId]) {
      this.messageListeners[roomId] = []
    }

    this.messageListeners[roomId].push(callback)

    return () => {
      this.messageListeners[roomId] = this.messageListeners[roomId].filter((cb) => cb !== callback)
    }
  }
}

export { LocalChatService }
