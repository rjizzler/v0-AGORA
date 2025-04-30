"use client"

import { useState, useEffect } from "react"
import { WebSocketChatService } from "@/lib/websocket-chat-service"

interface TypingIndicatorProps {
  contractAddress: string
}

export function TypingIndicator({ contractAddress }: TypingIndicatorProps) {
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [chatService] = useState(() => WebSocketChatService.getInstance())

  // Subscribe to typing indicators
  useEffect(() => {
    // Only set up typing indicators if not in fallback mode
    if (chatService.isFallbackMode()) {
      return () => {} // No cleanup needed
    }

    const unsubscribe = chatService.onTyping(contractAddress, ({ username, isTyping }) => {
      setTypingUsers((prev) => {
        if (isTyping && !prev.includes(username)) {
          return [...prev, username]
        } else if (!isTyping && prev.includes(username)) {
          return prev.filter((user) => user !== username)
        }
        return prev
      })
    })

    return unsubscribe
  }, [contractAddress, chatService])

  if (typingUsers.length === 0) {
    return null
  }

  let message = ""
  if (typingUsers.length === 1) {
    message = `${typingUsers[0]} is typing...`
  } else if (typingUsers.length === 2) {
    message = `${typingUsers[0]} and ${typingUsers[1]} are typing...`
  } else {
    message = `${typingUsers.length} people are typing...`
  }

  return (
    <div className="text-gray-500 text-sm italic flex items-center p-2">
      <div className="flex space-x-1 mr-2">
        <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
        <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
        <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
      </div>
      {message}
    </div>
  )
}
