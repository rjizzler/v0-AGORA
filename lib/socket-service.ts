import { io, type Socket } from "socket.io-client"
import type { Message } from "./message-store"

export class SocketService {
  private static instance: SocketService
  private socket: Socket | null = null
  private listeners: Record<string, ((data: any) => void)[]> = {}
  private currentRoom: string | null = null

  private constructor() {}

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService()
    }
    return SocketService.instance
  }

  public connect(): void {
    if (this.socket) return

    this.socket = io({
      path: "/api/socket",
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    this.socket.on("connect", () => {
      console.log("Socket connected")

      // Rejoin room if there was one
      if (this.currentRoom) {
        this.joinRoom(this.currentRoom)
      }
    })

    this.socket.on("disconnect", () => {
      console.log("Socket disconnected")
    })

    this.socket.on("new-message", (message) => {
      this.triggerEvent("message", message)
    })

    this.socket.on("user-joined", (data) => {
      this.triggerEvent("user-joined", data)
    })

    this.socket.on("user-typing", (data) => {
      this.triggerEvent("user-typing", data)
    })
  }

  public disconnect(): void {
    if (!this.socket) return

    this.socket.disconnect()
    this.socket = null
    this.currentRoom = null
  }

  public joinRoom(contractAddress: string): void {
    if (!this.socket) {
      this.connect()
    }

    this.currentRoom = contractAddress
    this.socket?.emit("join-room", contractAddress)
  }

  public sendMessage(contractAddress: string, message: Message): void {
    if (!this.socket) return

    this.socket.emit("send-message", {
      contractAddress,
      message,
    })
  }

  public sendTyping(contractAddress: string, username: string, isTyping: boolean): void {
    if (!this.socket) return

    this.socket.emit("typing", {
      contractAddress,
      username,
      isTyping,
    })
  }

  public on(event: string, callback: (data: any) => void): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }

    this.listeners[event].push(callback)

    // Return unsubscribe function
    return () => {
      this.listeners[event] = this.listeners[event].filter((cb) => cb !== callback)
    }
  }

  private triggerEvent(event: string, data: any): void {
    if (this.listeners[event]) {
      this.listeners[event].forEach((callback) => callback(data))
    }
  }
}
