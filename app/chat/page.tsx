"use client"

import type React from "react"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import ChatRoom from "@/components/chat-room"

export default function ChatPage() {
  const searchParams = useSearchParams()
  const address = searchParams.get("address") || ""
  const [roomJoined, setRoomJoined] = useState(false)
  const [inputAddress, setInputAddress] = useState(address)
  const [username, setUsername] = useState("")

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputAddress.trim() && username.trim()) {
      setRoomJoined(true)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full bg-black/70 backdrop-blur-md z-50 border-b border-red-600 p-4 flex items-center">
        <Link href="/" className="flex items-center text-red-500 hover:text-red-400 mr-4">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Link>
        <h1 className="text-2xl font-bold text-red-500">AGORA</h1>
        {roomJoined && (
          <div className="ml-4 px-3 py-1 bg-red-900/30 rounded-full text-sm">
            Room: {inputAddress.substring(0, 6)}...{inputAddress.substring(inputAddress.length - 4)}
          </div>
        )}
      </header>

      <div className="pt-20 px-4 pb-4 max-w-6xl mx-auto min-h-screen">
        {!roomJoined ? (
          <div className="flex flex-col items-center justify-center min-h-[80vh]">
            <div className="bg-[#1E1E1E] p-8 rounded-2xl shadow-lg max-w-md w-full">
              <h2 className="text-2xl font-bold text-red-500 mb-6 text-center">Join a Chat Room</h2>
              <form onSubmit={handleJoinRoom} className="space-y-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
                    Your Display Name
                  </label>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter your name"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-300 mb-1">
                    Contract or Coin Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    value={inputAddress}
                    onChange={(e) => setInputAddress(e.target.value)}
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="0x..."
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-300"
                >
                  Enter Chat Room
                </button>
              </form>
            </div>
          </div>
        ) : (
          <ChatRoom address={inputAddress} username={username} />
        )}
      </div>
    </div>
  )
}
