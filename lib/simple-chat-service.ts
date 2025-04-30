import { v4 as uuidv4 } from "uuid"
import type { Message } from "./message-store"

// This service provides real-time chat functionality using localStorage and the storage event
export class SimpleChatService {
  private static instance: SimpleChatService
  private clientId: string
  private messageListeners: Record<string, ((message: Message) => void)[]> = {}
  private currentRoom: string | null = null

  private constructor() {
    this.clientId = uuidv4()
    console.log("SimpleChatService initialized with client ID:", this.clientId)

    // Listen for storage events (this is how browsers communicate between tabs)
    if (typeof window !== "undefined") {
      window.addEventListener("storage", this.handleStorageEvent)
    }
  }

  public static getInstance(): SimpleChatService {
    if (!SimpleChatService.instance) {
      SimpleChatService.instance = new SimpleChatService()
    }
    return SimpleChatService.instance
  }

  private handleStorageEvent = (event: StorageEvent) => {
    // Check if this is a message update event
    if (event.key?.startsWith("saino-messages-")) {
      const roomId = event.key.replace("saino-messages-", "")

      // Only process if we have listeners for this room
      if (this.messageListeners[roomId] && this.messageListeners[roomId].length > 0) {
        try {
          // Get the new messages
          const newMessages = JSON.parse(event.newValue || "[]") as Message[]
          const oldMessages = JSON.parse(event.oldValue || "[]") as Message[]

          // Find messages that were added
          if (newMessages.length > oldMessages.length) {
            // Get the new messages (the ones that were added)
            const addedMessages = newMessages.slice(oldMessages.length)

            console.log(`[Storage Event] ${addedMessages.length} new messages in room ${roomId}:`, addedMessages)

            // Notify listeners of each new message
            addedMessages.forEach((message) => {
              // Don't notify about our own messages
              if (!message.clientId || message.clientId !== this.clientId) {
                this.messageListeners[roomId].forEach((listener) => listener(message))
              }
            })
          }
        } catch (error) {
          console.error("Error processing storage event:", error)
        }
      }
    }
  }

  public joinRoom(roomId: string): void {
    console.log(`Joining room: ${roomId} (localStorage)`)
    this.currentRoom = roomId
  }

  public leaveRoom(): void {
    this.currentRoom = null
  }

  public sendMessage(roomId: string, message: Message): void {
    if (typeof window === "undefined") return

    console.log(`Sending message to room ${roomId} (localStorage):`, message)

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

  public onMessage(roomId: string, callback: (message: Message) => void): () => void {
    if (!this.messageListeners[roomId]) {
      this.messageListeners[roomId] = []
    }

    this.messageListeners[roomId].push(callback)

    return () => {
      this.messageListeners[roomId] = this.messageListeners[roomId].filter((cb) => cb !== callback)
    }
  }

  // Add a method to simulate other users for testing
  public simulateOtherUser(roomId: string, username: string): void {
    const simulatedClientId = `simulated-${uuidv4()}`

    // Simulate user joining
    const joinMessage: Message = {
      id: `system-join-${uuidv4()}`,
      sender: "System",
      content: `${username} joined the chat`,
      timestamp: new Date().toISOString(),
      isSystem: true,
      clientId: simulatedClientId,
    }

    this.sendMessage(roomId, joinMessage)

    // Simulate user sending a message after a delay
    setTimeout(() => {
      const userMessage: Message = {
        id: `simulated-${uuidv4()}`,
        sender: username,
        content: `Hello from ${username}! I'm interested in this token. Anyone else buying?`,
        timestamp: new Date().toISOString(),
        isSystem: false,
        clientId: simulatedClientId,
      }

      this.sendMessage(roomId, userMessage)
    }, 3000)
  }

  // Clear all messages for testing
  public clearMessages(roomId: string): void {
    if (typeof window === "undefined") return

    localStorage.removeItem(`saino-messages-${roomId}`)
    console.log(`Cleared all messages for room ${roomId}`)
  }
}
