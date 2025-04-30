"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { io, type Socket } from "socket.io-client"
import { Send } from "lucide-react"

interface Message {
  id: string
  sender: string
  text: string
  timestamp: number
  isSystem?: boolean
}

interface ChatRoomProps {
  address: string
  username: string
}

export default function ChatRoom({ address, username }: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const [users, setUsers] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Connect to socket server
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001"
    const newSocket = io(socketUrl, {
      query: {
        room: address,
        username,
      },
    })

    setSocket(newSocket)

    // Add system message when connecting
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: "System",
        text: "Connecting to chat room...",
        timestamp: Date.now(),
        isSystem: true,
      },
    ])

    // Socket event listeners
    newSocket.on("connect", () => {
      setConnected(true)
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: "System",
          text: "Connected to chat room!",
          timestamp: Date.now(),
          isSystem: true,
        },
      ])
    })

    newSocket.on("disconnect", () => {
      setConnected(false)
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: "System",
          text: "Disconnected from chat room",
          timestamp: Date.now(),
          isSystem: true,
        },
      ])
    })

    newSocket.on("message", (message: Message) => {
      setMessages((prev) => [...prev, message])
    })

    newSocket.on("userJoined", (user: string) => {
      setUsers((prev) => [...prev, user])
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: "System",
          text: `${user} joined the room`,
          timestamp: Date.now(),
          isSystem: true,
        },
      ])
    })

    newSocket.on("userLeft", (user: string) => {
      setUsers((prev) => prev.filter((u) => u !== user))
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: "System",
          text: `${user} left the room`,
          timestamp: Date.now(),
          isSystem: true,
        },
      ])
    })

    newSocket.on("roomUsers", (roomUsers: string[]) => {
      setUsers(roomUsers)
    })

    // Cleanup on unmount
    return () => {
      newSocket.disconnect()
    }
  }, [address, username])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputMessage.trim() && socket && connected) {
      const newMessage: Message = {
        id: Date.now().toString(),
        sender: username,
        text: inputMessage,
        timestamp: Date.now(),
      }

      socket.emit("sendMessage", newMessage)
      setInputMessage("")
    }
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)]">
      <div className="flex-1 overflow-y-auto mb-4 pr-2 custom-scrollbar">
        <div className="space-y-4 pb-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isSystem ? "justify-center" : message.sender === username ? "justify-end" : "justify-start"}`}
            >
              {message.isSystem ? (
                <div className="bg-gray-800/50 px-4 py-2 rounded-lg text-gray-400 text-sm">{message.text}</div>
              ) : (
                <div
                  className={`max-w-[80%] ${
                    message.sender === username ? "bg-red-600 text-white" : "bg-[#1E1E1E] text-white"
                  } px-4 py-3 rounded-lg`}
                >
                  {message.sender !== username && <div className="text-xs text-gray-400 mb-1">{message.sender}</div>}
                  <div>{message.text}</div>
                  <div className="text-xs text-gray-300 mt-1 text-right">{formatTime(message.timestamp)}</div>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="bg-[#1E1E1E] rounded-lg p-2">
        <form onSubmit={sendMessage} className="flex items-center">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="flex-1 bg-[#121212] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-red-500"
            placeholder="Type your message..."
            disabled={!connected}
          />
          <button
            type="submit"
            className="ml-2 bg-red-600 hover:bg-red-700 text-white p-3 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!connected || !inputMessage.trim()}
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>

      <div className="mt-4 text-sm text-gray-500">
        {connected ? (
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span>
              Connected • {users.length} user{users.length !== 1 ? "s" : ""} online
            </span>
          </div>
        ) : (
          <div className="flex items-center">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
            <span>Disconnected</span>
          </div>
        )}
      </div>
    </div>
  )
}
