"use client"

import { useEffect, useState, useCallback } from "react"
import { io, type Socket } from "socket.io-client"

export interface Message {
  id: string
  user: string
  message: string
  timestamp: string
  room: string
}

export function useSocket(room: string, username: string) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [users, setUsers] = useState(0)

  useEffect(() => {
    // Initialize socket connection
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000"
    const socketInstance = io(socketUrl, {
      path: "/api/socket",
      autoConnect: true,
    })

    socketInstance.on("connect", () => {
      console.log("Socket connected")
      setConnected(true)

      // Join the room
      socketInstance.emit("join", { room, user: username })
    })

    socketInstance.on("message", (data: Message) => {
      if (data.room === room) {
        setMessages((prev) => [...prev, data])
      }
    })

    socketInstance.on("room_update", (data) => {
      if (data.room === room) {
        setUsers(data.users)
      }
    })

    socketInstance.on("disconnect", () => {
      console.log("Socket disconnected")
      setConnected(false)
    })

    setSocket(socketInstance)

    return () => {
      // Leave the room and disconnect
      if (socketInstance.connected) {
        socketInstance.emit("leave", { room })
        socketInstance.disconnect()
      }
    }
  }, [room, username])

  const sendMessage = useCallback(
    (message: string) => {
      if (socket && connected && message.trim()) {
        const messageData = {
          id: Date.now().toString(),
          user: username,
          message,
          timestamp: new Date().toISOString(),
          room,
        }

        socket.emit("message", messageData)

        // Add message to local state immediately for better UX
        setMessages((prev) => [...prev, messageData])

        return true
      }
      return false
    },
    [socket, connected, username, room],
  )

  return {
    connected,
    messages,
    users,
    sendMessage,
  }
}
