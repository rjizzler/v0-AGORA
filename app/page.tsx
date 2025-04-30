"use client"

import { useState } from "react"
import ChatRoom from "@/components/chat-room"
import RoomSelector from "@/components/room-selector"

export default function Home() {
  const [currentRoom, setCurrentRoom] = useState<string | null>(null)
  const [username, setUsername] = useState<string | null>(null)

  const handleJoinRoom = (room: string, user: string) => {
    setCurrentRoom(room)
    setUsername(user)
  }

  const handleLeaveRoom = () => {
    setCurrentRoom(null)
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
      <h1 className="text-3xl font-bold mb-8">Crypto Chat Rooms</h1>

      {currentRoom && username ? (
        <div className="w-full max-w-4xl">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              Room: <span className="text-blue-600">{currentRoom}</span>
            </h2>
            <button onClick={handleLeaveRoom} className="text-sm text-gray-600 hover:text-gray-900">
              Leave Room
            </button>
          </div>
          <ChatRoom room={currentRoom} username={username} />
        </div>
      ) : (
        <RoomSelector onJoinRoom={handleJoinRoom} />
      )}
    </main>
  )
}
