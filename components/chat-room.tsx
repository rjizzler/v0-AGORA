"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useSocket, type Message } from "@/hooks/useSocket"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Send } from "lucide-react"

interface ChatRoomProps {
  room: string
  username: string
}

export default function ChatRoom({ room, username }: ChatRoomProps) {
  const [message, setMessage] = useState("")
  const { connected, messages, users, sendMessage } = useSocket(room, username)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (sendMessage(message)) {
      setMessage("")
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <Card className="w-full max-w-3xl h-[600px] flex flex-col">
      <CardHeader className="border-b">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">
            {room}
            <Badge variant="outline" className="ml-2">
              {connected ? "Connected" : "Connecting..."}
            </Badge>
          </CardTitle>
          <Badge>{users} online</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg: Message) => (
            <div key={msg.id} className={`flex flex-col ${msg.user === username ? "items-end" : "items-start"}`}>
              <div className="flex items-center mb-1">
                <span className="text-xs font-medium mr-2">{msg.user}</span>
                <span className="text-xs text-gray-500">{formatTime(msg.timestamp)}</span>
              </div>
              <div
                className={`px-4 py-2 rounded-lg max-w-[80%] ${
                  msg.user === username ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"
                }`}
              >
                {msg.message}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </CardContent>
      <CardFooter className="border-t p-4">
        <form onSubmit={handleSendMessage} className="flex w-full gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={!connected}
            className="flex-1"
          />
          <Button type="submit" disabled={!connected || !message.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
