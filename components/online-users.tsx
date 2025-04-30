"use client"

import { useState, useEffect } from "react"
import { Users } from "lucide-react"

interface OnlineUsersProps {
  contractAddress: string
  currentUsername: string
}

export function OnlineUsers({ contractAddress, currentUsername }: OnlineUsersProps) {
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])

  // In a real implementation, this would connect to the WebSocket server
  // and get the list of online users for this contract address
  useEffect(() => {
    // Simulate online users
    const simulatedUsers = [
      currentUsername,
      `Trader${Math.floor(Math.random() * 1000)}`,
      `Whale${Math.floor(Math.random() * 1000)}`,
    ]

    setOnlineUsers(simulatedUsers)

    // Simulate users joining and leaving
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        // Add a new user
        const newUser = `Trader${Math.floor(Math.random() * 1000)}`
        setOnlineUsers((prev) => [...prev, newUser])
      } else if (onlineUsers.length > 3 && Math.random() > 0.5) {
        // Remove a user (not the current user)
        setOnlineUsers((prev) => {
          const filtered = prev.filter((user) => user !== currentUsername)
          const indexToRemove = Math.floor(Math.random() * filtered.length)
          return [...filtered.slice(0, indexToRemove), ...filtered.slice(indexToRemove + 1), currentUsername]
        })
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [contractAddress, currentUsername])

  return (
    <div className="flex items-center text-xs text-gray-400">
      <Users size={14} className="mr-1" />
      <span>{onlineUsers.length} online</span>
    </div>
  )
}
