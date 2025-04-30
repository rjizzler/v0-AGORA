export interface Message {
  id: string
  sender: string
  content: string
  timestamp: string
  isSystem?: boolean
  isUser?: boolean
}

export class MessageStore {
  private messages: Record<string, Message[]> = {}

  constructor() {
    // Try to load messages from localStorage if available
    if (typeof window !== "undefined") {
      const storedMessages = localStorage.getItem("saino-messages")
      if (storedMessages) {
        try {
          this.messages = JSON.parse(storedMessages)
        } catch (error) {
          console.error("Failed to parse stored messages:", error)
        }
      }
    }
  }

  private saveToStorage() {
    if (typeof window !== "undefined") {
      localStorage.setItem("saino-messages", JSON.stringify(this.messages))
    }
  }

  getMessages(contractAddress: string): Message[] {
    // Normalize the contract address to ensure consistent storage
    const normalizedAddress = contractAddress.trim()
    return this.messages[normalizedAddress] || []
  }

  addMessage(contractAddress: string, message: Message) {
    // Normalize the contract address to ensure consistent storage
    const normalizedAddress = contractAddress.trim()

    if (!this.messages[normalizedAddress]) {
      this.messages[normalizedAddress] = []
    }

    this.messages[normalizedAddress].push(message)
    this.saveToStorage()
  }

  addMessages(contractAddress: string, messages: Message[]) {
    // Normalize the contract address to ensure consistent storage
    const normalizedAddress = contractAddress.trim()

    if (!this.messages[normalizedAddress]) {
      this.messages[normalizedAddress] = []
    }

    this.messages[normalizedAddress] = [...this.messages[normalizedAddress], ...messages]
    this.saveToStorage()
  }

  clearMessages(contractAddress: string) {
    // Normalize the contract address to ensure consistent storage
    const normalizedAddress = contractAddress.trim()
    this.messages[normalizedAddress] = []
    this.saveToStorage()
  }
}
