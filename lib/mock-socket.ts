// This file provides a mock Socket.IO implementation for demo/development purposes

class MockSocket {
  private listeners: Record<string, Function[]> = {}
  private connected = false
  private rooms: Record<string, string[]> = {}
  private currentRoom: string | null = null
  private username: string | null = null

  constructor() {
    // Auto-connect after a short delay
    setTimeout(() => {
      this.connected = true
      this.emit("connect")
    }, 1000)
  }

  on(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(callback)
    return this
  }

  off(event?: string, callback?: Function) {
    if (!event) {
      this.listeners = {}
      return this
    }

    if (!callback) {
      delete this.listeners[event]
      return this
    }

    const callbacks = this.listeners[event] || []
    this.listeners[event] = callbacks.filter((cb) => cb !== callback)
    return this
  }

  emit(event: string, ...args: any[]) {
    // Handle special events
    if (event === "join") {
      const { room, username } = args[0]
      this.currentRoom = room
      this.username = username

      if (!this.rooms[room]) {
        this.rooms[room] = []
      }

      // Send welcome message after a short delay
      setTimeout(() => {
        this.triggerEvent("message", {
          username: "System",
          text: `Welcome to the ${room} chat room, ${username}!`,
          timestamp: new Date().toISOString(),
        })

        // Send a mock message after another delay
        setTimeout(() => {
          this.triggerEvent("message", {
            username: "CryptoBot",
            text: `Hey ${username}, welcome to the ${room} discussion! How's your day going?`,
            timestamp: new Date().toISOString(),
          })
        }, 2000)
      }, 1000)
    }

    if (event === "message" && this.currentRoom) {
      const messageData = args[0]

      // Echo the message back after a short delay to simulate server processing
      setTimeout(() => {
        this.triggerEvent("message", messageData)

        // Sometimes have the bot respond
        if (Math.random() > 0.5) {
          setTimeout(
            () => {
              const responses = [
                "That's interesting! Tell me more.",
                "I agree with your point about crypto.",
                "Have you seen the latest market trends?",
                "What's your opinion on the recent developments?",
                "Thanks for sharing that insight!",
              ]

              const randomResponse = responses[Math.floor(Math.random() * responses.length)]

              this.triggerEvent("message", {
                username: "CryptoBot",
                text: randomResponse,
                timestamp: new Date().toISOString(),
                room: this.currentRoom,
              })
            },
            1500 + Math.random() * 3000,
          )
        }
      }, 300)
    }

    if (event === "typing") {
      const { isTyping, username } = args[0]

      // Echo typing indicator
      setTimeout(() => {
        this.triggerEvent("typing", { username, isTyping })
      }, 100)
    }

    return true
  }

  disconnect() {
    this.connected = false
    this.triggerEvent("disconnect")
    return this
  }

  private triggerEvent(event: string, ...args: any[]) {
    const callbacks = this.listeners[event] || []
    callbacks.forEach((callback) => {
      callback(...args)
    })
  }

  // Helper method to check connection status
  isConnected() {
    return this.connected
  }
}

export function createMockSocket() {
  return new MockSocket()
}
