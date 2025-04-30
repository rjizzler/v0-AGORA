"use client"

import type React from "react"

import { useState } from "react"
import { authService } from "@/lib/auth-service"

interface LoginFormProps {
  onSuccess?: () => void
  onRegisterClick?: () => void
}

export function LoginForm({ onSuccess, onRegisterClick }: LoginFormProps) {
  const [username, setUsername] = useState("")
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
      await authService.login(username)
      if (onSuccess) onSuccess()
    } catch (err) {
      setError((err as Error).message || "Failed to login")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

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
            placeholder="Enter your username"
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-lg py-2 px-4 hover:from-purple-700 hover:to-blue-600 transition-colors disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>

      <div className="mt-4 text-center text-sm text-gray-400">
        Don't have an account?{" "}
        <button onClick={onRegisterClick} className="text-indigo-400 hover:text-indigo-300 transition-colors">
          Register
        </button>
      </div>
    </div>
  )
}
