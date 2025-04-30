import { v4 as uuidv4 } from "uuid"
import type { Message } from "./message-store"

// This service provides real-time chat functionality using localStorage
export class DirectChatService {
  private static instance: DirectChatService
  private clientId: string
  private messageListeners: Record<string, ((message: Message) => void)[]> = {}
  private typingListeners: Record<string, ((data: { username: string; isTyping: boolean }) => void)[]> = {}
  private userListeners: Record<string, ((users: string[]) => void)[]> = {}
  private pollingInterval: NodeJS.Timeout | null = null
  private lastMessageTimestamp: Record<string, number> = {}
  private activeUsers: Record<string, { username: string; lastSeen: number }[]> = {}

  private constructor() {
    this.clientId = uuidv4()
    console.log("DirectChatService initialized with client ID:", this.clientId)

    // Start polling for changes
    this.startPolling()

    // Handle page unload
    if (typeof window !== "undefined") {
      window.addEventListener("beforeunload", () => this.handleUnload())
    }
  }

  public static getInstance(): DirectChatService {
    if (!DirectChatService.instance) {
      DirectChatService.instance = new DirectChatService()
    }
    return DirectChatService.instance
  }

  private startPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
    }

    // Poll every 1 second for changes
    this.pollingInterval = setInterval(() => {
      this.checkForNewMessages()
      this.updateUserPresence()
    }, 1000)
  }

  private checkForNewMessages(): void {
    if (typeof window === "undefined") return

    // Check all rooms that have listeners
    Object.keys(this.messageListeners).forEach((roomId) => {
      try {
        // Get messages for this room
        const messagesKey = `saino-messages-${roomId}`
        const messagesJson = localStorage.getItem(messagesKey)

        if (!messagesJson) return

        const messages = JSON.parse(messagesJson) as Message[]

        // Find messages newer than our last check
        const lastTimestamp = this.lastMessageTimestamp[roomId] || 0
        const newMessages = messages.filter((msg) => {
          const msgTime = new Date(msg.timestamp).getTime()
          return msgTime > lastTimestamp && !msg.clientId?.includes(this.clientId)
        })

        // Update last timestamp
        if (messages.length > 0) {
          const latestMsg = messages.reduce((latest, msg) => {
            const msgTime = new Date(msg.timestamp).getTime()
            const latestTime = new Date(latest.timestamp).getTime()
            return msgTime > latestTime ? msg : latest
          }, messages[0])

          this.lastMessageTimestamp[roomId] = new Date(latestMsg.timestamp).getTime()
        }

        // Notify listeners of new messages
        if (newMessages.length > 0) {
          console.log(`Found ${newMessages.length} new messages for room ${roomId}`)
          newMessages.forEach((msg) => {
            this.messageListeners[roomId]?.forEach((listener) => listener(msg))
          })
        }
      } catch (error) {
        console.error(`Error checking for new messages in room ${roomId}:`, error)
      }
    })
  }

  private updateUserPresence(): void {
    if (typeof window === "undefined") return

    // Update presence for all rooms with listeners
    Object.keys(this.userListeners).forEach((roomId) => {
      try {
        // Get user list for this room
        const usersKey = `saino-users-${roomId}`
        const usersJson = localStorage.getItem(usersKey)

        if (!usersJson) return

        let users = JSON.parse(usersJson) as { username: string; lastSeen: number; clientId: string }[]

        // Filter out stale users (inactive for more than 30 seconds)
        const now = Date.now()
        users = users.filter((user) => now - user.lastSeen < 30000)

        // Update our own presence
        const currentUsername = this.getCurrentUsername(roomId)
        if (currentUsername) {
          // Remove our old entry
          users = users.filter((user) => user.clientId !== this.clientId)

          // Add updated entry
          users.push({
            username: currentUsername,
            lastSeen: now,
            clientId: this.clientId,
          })

          // Save back to localStorage
          localStorage.setItem(usersKey, JSON.stringify(users))
        }

        // Update active users
        this.activeUsers[roomId] = users

        // Notify listeners
        const usernames = users.map((user) => user.username)
        this.userListeners[roomId]?.forEach((listener) => listener(usernames))
      } catch (error) {
        console.error(`Error updating user presence in room ${roomId}:`, error)
      }
    })
  }

  private handleUnload(): void {
    // Clean up when page is closed
    if (typeof window === "undefined") return

    // Remove our presence from all active rooms
    Object.keys(this.activeUsers).forEach((roomId) => {
      try {
        const usersKey = `saino-users-${roomId}`
        const usersJson = localStorage.getItem(usersKey)

        if (!usersJson) return

        let users = JSON.parse(usersJson) as { username: string; lastSeen: number; clientId: string }[]

        // Remove our entry
        users = users.filter((user) => user.clientId !== this.clientId)

        // Save back to localStorage
        localStorage.setItem(usersKey, JSON.stringify(users))
      } catch (error) {
        console.error(`Error removing presence from room ${roomId}:`, error)
      }
    })

    // Clear polling interval
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
    }
  }

  private getCurrentUsername(roomId: string): string | null {
    if (typeof window === "undefined") return null

    try {
      const userDataKey = `saino-user-${roomId}`
      const userData = localStorage.getItem(userDataKey)

      if (!userData) return null

      const { username } = JSON.parse(userData)
      return username
    } catch (error) {
      console.error(`Error getting current username for room ${roomId}:`, error)
      return null
    }
  }

  public joinRoom(roomId: string, username: string): void {
    if (typeof window === "undefined") return

    console.log(`User ${username} joining room ${roomId}`)

    try {
      // Save user data for this room
      const userDataKey = `saino-user-${roomId}`
      localStorage.setItem(userDataKey, JSON.stringify({ username, clientId: this.clientId }))

      // Update user list
      const usersKey = `saino-users-${roomId}`
      let users: { username: string; lastSeen: number; clientId: string }[] = []

      const usersJson = localStorage.getItem(usersKey)
      if (usersJson) {
        users = JSON.parse(usersJson)
      }

      // Remove any existing entry for this client
      users = users.filter((user) => user.clientId !== this.clientId)

      // Add new entry
      users.push({
        username,
        lastSeen: Date.now(),
        clientId: this.clientId,
      })

      // Save back to localStorage
      localStorage.setItem(usersKey, JSON.stringify(users))

      // Add system message about joining
      const joinMessage: Message = {
        id: `system-join-${uuidv4()}`,
        sender: "System",
        content: `${username} joined the chat`,
        timestamp: new Date().toISOString(),
        isSystem: true,
        clientId: this.clientId,
      }

      this.sendMessage(roomId, joinMessage)

      // Update active users
      this.activeUsers[roomId] = users

      // Notify listeners
      const usernames = users.map((user) => user.username)
      this.userListeners[roomId]?.forEach((listener) => listener(usernames))
    } catch (error) {
      console.error(`Error joining room ${roomId}:`, error)
    }
  }

  public leaveRoom(roomId: string): void {
    if (typeof window === "undefined") return

    try {
      const username = this.getCurrentUsername(roomId)
      if (!username) return

      console.log(`User ${username} leaving room ${roomId}`)

      // Update user list
      const usersKey = `saino-users-${roomId}`
      let users: { username: string; lastSeen: number; clientId: string }[] = []

      const usersJson = localStorage.getItem(usersKey)
      if (usersJson) {
        users = JSON.parse(usersJson)
      }

      // Remove our entry
      users = users.filter((user) => user.clientId !== this.clientId)

      // Save back to localStorage
      localStorage.setItem(usersKey, JSON.stringify(users))

      // Add system message about leaving
      const leaveMessage: Message = {
        id: `system-leave-${uuidv4()}`,
        sender: "System",
        content: `${username} left the chat`,
        timestamp: new Date().toISOString(),
        isSystem: true,
        clientId: this.clientId,
      }

      this.sendMessage(roomId, leaveMessage)

      // Update active users
      this.activeUsers[roomId] = users

      // Notify listeners
      const usernames = users.map((user) => user.username)
      this.userListeners[roomId]?.forEach((listener) => listener(usernames))

      // Clear user data
      localStorage.removeItem(`saino-user-${roomId}`)
    } catch (error) {
      console.error(`Error leaving room ${roomId}:`, error)
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

      // Save back to localStorage
      localStorage.setItem(messagesKey, JSON.stringify(messages))

      // Update last timestamp
      this.lastMessageTimestamp[roomId] = new Date(messageWithClientId.timestamp).getTime()

      // Notify our own listeners immediately
      this.messageListeners[roomId]?.forEach((listener) => listener(messageWithClientId))

      // Trigger storage event in other tabs by updating a timestamp
      localStorage.setItem(`saino-update-${roomId}`, Date.now().toString())
    } catch (error) {
      console.error(`Error sending message to room ${roomId}:`, error)
    }
  }

  public setTyping(roomId: string, username: string, isTyping: boolean): void {
    if (typeof window === "undefined") return

    console.log(`User ${username} ${isTyping ? "started" : "stopped"} typing in room ${roomId}`)

    try {
      // Update typing status
      const typingKey = `saino-typing-${roomId}`
      let typing: { username: string; isTyping: boolean; timestamp: number; clientId: string }[] = []

      const typingJson = localStorage.getItem(typingKey)
      if (typingJson) {
        typing = JSON.parse(typingJson)
      }

      // Remove any existing entry for this user
      typing = typing.filter((t) => t.clientId !== this.clientId)

      // Add new entry if typing
      if (isTyping) {
        typing.push({
          username,
          isTyping,
          timestamp: Date.now(),
          clientId: this.clientId,
        })
      }

      // Save back to localStorage
      localStorage.setItem(typingKey, JSON.stringify(typing))

      // Notify our own listeners immediately
      this.typingListeners[roomId]?.forEach((listener) => listener({ username, isTyping }))

      // Trigger storage event in other tabs
      localStorage.setItem(`saino-typing-update-${roomId}`, Date.now().toString())
    } catch (error) {
      console.error(`Error updating typing status in room ${roomId}:`, error)
    }
  }

  public getMessages(roomId: string): Message[] {
    if (typeof window === "undefined") return []

    try {
      const messagesKey = `saino-messages-${roomId}`
      const messagesJson = localStorage.getItem(messagesKey)

      if (!messagesJson) return []

      const messages = JSON.parse(messagesJson) as Message[]

      // Update last timestamp
      if (messages.length > 0) {
        const latestMsg = messages.reduce((latest, msg) => {
          const msgTime = new Date(msg.timestamp).getTime()
          const latestTime = new Date(latest.timestamp).getTime()
          return msgTime > latestTime ? msg : latest
        }, messages[0])

        this.lastMessageTimestamp[roomId] = new Date(latestMsg.timestamp).getTime()
      }

      return messages
    } catch (error) {
      console.error(`Error getting messages for room ${roomId}:`, error)
      return []
    }
  }

  public getUsers(roomId: string): string[] {
    if (typeof window === "undefined") return []

    try {
      const usersKey = `saino-users-${roomId}`
      const usersJson = localStorage.getItem(usersKey)

      if (!usersJson) return []

      const users = JSON.parse(usersJson) as { username: string; lastSeen: number }[]

      // Filter out stale users
      const now = Date.now()
      const activeUsers = users.filter((user) => now - user.lastSeen < 30000)

      return activeUsers.map((user) => user.username)
    } catch (error) {
      console.error(`Error getting users for room ${roomId}:`, error)
      return []
    }
  }

  public getTypingUsers(roomId: string): string[] {
    if (typeof window === "undefined") return []

    try {
      const typingKey = `saino-typing-${roomId}`
      const typingJson = localStorage.getItem(typingKey)

      if (!typingJson) return []

      const typing = JSON.parse(typingJson) as {
        username: string
        isTyping: boolean
        timestamp: number
        clientId: string
      }[]

      // Filter out stale typing indicators (older than 5 seconds)
      const now = Date.now()
      const activeTyping = typing.filter((t) => now - t.timestamp < 5000 && t.clientId !== this.clientId)

      return activeTyping.map((t) => t.username)
    } catch (error) {
      console.error(`Error getting typing users for room ${roomId}:`, error)
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

  public onTyping(roomId: string, callback: (data: { username: string; isTyping: boolean }) => void): () => void {
    if (!this.typingListeners[roomId]) {
      this.typingListeners[roomId] = []
    }

    this.typingListeners[roomId].push(callback)

    return () => {
      this.typingListeners[roomId] = this.typingListeners[roomId].filter((cb) => cb !== callback)
    }
  }

  public onUserChange(roomId: string, callback: (users: string[]) => void): () => void {
    if (!this.userListeners[roomId]) {
      this.userListeners[roomId] = []
    }

    this.userListeners[roomId].push(callback)

    return () => {
      this.userListeners[roomId] = this.userListeners[roomId].filter((cb) => cb !== callback)
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

    // Add to user list
    if (typeof window !== "undefined") {
      const usersKey = `saino-users-${roomId}`
      let users: { username: string; lastSeen: number; clientId: string }[] = []

      const usersJson = localStorage.getItem(usersKey)
      if (usersJson) {
        users = JSON.parse(usersJson)
      }

      // Add simulated user
      users.push({
        username,
        lastSeen: Date.now(),
        clientId: simulatedClientId,
      })

      // Save back to localStorage
      localStorage.setItem(usersKey, JSON.stringify(users))

      // Update active users
      this.activeUsers[roomId] = users

      // Notify listeners
      const usernames = users.map((user) => user.username)
      this.userListeners[roomId]?.forEach((listener) => listener(usernames))
    }

    // Simulate user typing after a delay
    setTimeout(() => {
      // Set typing status
      if (typeof window !== "undefined") {
        const typingKey = `saino-typing-${roomId}`
        let typing: { username: string; isTyping: boolean; timestamp: number; clientId: string }[] = []

        const typingJson = localStorage.getItem(typingKey)
        if (typingJson) {
          typing = JSON.parse(typingJson)
        }

        // Add simulated typing
        typing.push({
          username,
          isTyping: true,
          timestamp: Date.now(),
          clientId: simulatedClientId,
        })

        // Save back to localStorage
        localStorage.setItem(typingKey, JSON.stringify(typing))

        // Trigger storage event in other tabs
        localStorage.setItem(`saino-typing-update-${roomId}`, Date.now().toString())
      }

      // Notify our own listeners
      this.typingListeners[roomId]?.forEach((listener) => listener({ username, isTyping: true }))

      // Simulate user sending a message after typing
      setTimeout(() => {
        // Stop typing
        if (typeof window !== "undefined") {
          const typingKey = `saino-typing-${roomId}`
          let typing: { username: string; isTyping: boolean; timestamp: number; clientId: string }[] = []

          const typingJson = localStorage.getItem(typingKey)
          if (typingJson) {
            typing = JSON.parse(typingJson)
          }

          // Remove simulated typing
          typing = typing.filter((t) => t.clientId !== simulatedClientId)

          // Save back to localStorage
          localStorage.setItem(typingKey, JSON.stringify(typing))

          // Trigger storage event in other tabs
          localStorage.setItem(`saino-typing-update-${roomId}`, Date.now().toString())
        }

        // Notify our own listeners
        this.typingListeners[roomId]?.forEach((listener) => listener({ username, isTyping: false }))

        // Send message
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
    }, 2000)
  }
}
