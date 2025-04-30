"use client"

import type React from "react"

import { useState } from "react"
import { authService } from "@/lib/auth-service"

interface RegisterFormProps {
  onSuccess?: () => void
  onLoginClick?: () => void
}

export function RegisterForm({ onSuccess, onLoginClick }: RegisterFormProps) {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!username.trim()) {
      setError("Username is required")
      return
    }

    setIsLoading(true)

    try {
      await authService.register(username, email)
      if (onSuccess) onSuccess()
    } catch (err) {
      setError((err as Error).message || "Failed to register")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>

      {error && (
        <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-2 rounded-md mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
            Username
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
            placeholder="Choose a username"
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
            Email (optional)
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
            placeholder="Enter your email"
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-lg py-2 px-4 hover:from-purple-700 hover:to-blue-600 transition-colors disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? "Registering..." : "Register"}
        </button>
      </form>

      <div className="mt-4 text-center text-sm text-gray-400">
        Already have an account?{" "}
        <button onClick={onLoginClick} className="text-indigo-400 hover:text-indigo-300 transition-colors">
          Login
        </button>
      </div>
    </div>
  )
}
