"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { generateRandomUsername } from "@/lib/utils"

interface UsernameModalProps {
  onSubmit: (username: string) => void
  initialUsername?: string
}

export default function UsernameModal({ onSubmit, initialUsername }: UsernameModalProps) {
  const [username, setUsername] = useState(initialUsername || "")
  const [isRandom, setIsRandom] = useState(!initialUsername)

  useEffect(() => {
    if (isRandom) {
      setUsername(generateRandomUsername())
    }
  }, [isRandom])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (username.trim()) {
      onSubmit(username.trim())
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Choose Your Username</h2>
        <p className="text-gray-400 mb-6">Select a username to use in this chat room</p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                setIsRandom(false)
              }}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter username"
            />
          </div>

          <div className="flex items-center mb-6">
            <input
              type="checkbox"
              id="random"
              checked={isRandom}
              onChange={() => setIsRandom(!isRandom)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-700 rounded"
            />
            <label htmlFor="random" className="ml-2 block text-sm text-gray-300">
              Use random username
            </label>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Join Chat
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
