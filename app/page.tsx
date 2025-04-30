"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { ArrowRight } from "lucide-react"
import ChatRoom from "@/components/chat-room"
import { isValidContractAddress, normalizeContractAddress } from "@/lib/utils"
import { XLogo } from "@/components/x-logo"
import { AuthModal } from "@/components/auth/auth-modal"
import { authService } from "@/lib/auth-service"
import { UserProfile } from "@/components/user-profile"

export default function Home() {
  const [contractAddress, setContractAddress] = useState("")
  const [isHovering, setIsHovering] = useState(false)
  const [floatingCoins, setFloatingCoins] = useState<
    { id: number; x: number; y: number; size: number; speed: number; rotation: number }[]
  >([])
  const [activeChatRoom, setActiveChatRoom] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Create floating coins in the background
    const coins = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 20 + 10,
      speed: Math.random() * 0.5 + 0.2,
      rotation: Math.random() * 360,
    }))
    setFloatingCoins(coins)
  }, [])

  // Subscribe to auth state changes
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user)
    })

    return unsubscribe
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!contractAddress.trim()) {
      setError("Please enter a contract address")
      return
    }

    setIsLoading(true)

    try {
      // Normalize the contract address
      const normalizedAddress = normalizeContractAddress(contractAddress)

      // Validate the contract address
      const isValid = isValidContractAddress(normalizedAddress)

      if (isValid) {
        // Simulate loading the chat room
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setActiveChatRoom(normalizedAddress)
      } else {
        setError("Invalid contract address. Please try again.")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToHome = () => {
    setActiveChatRoom(null)
    setContractAddress("")
  }

  if (activeChatRoom) {
    return <ChatRoom contractAddress={activeChatRoom} onBack={handleBackToHome} />
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center relative bg-black overflow-hidden">
      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {/* Enhanced gradient glow effect at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[500px] bg-gradient-radial from-purple-600/80 via-indigo-500/30 to-transparent rounded-full blur-3xl transform scale-[2.5] animate-pulse-slow"></div>

      {/* Floating coins in background */}
      {floatingCoins.map((coin) => (
        <div
          key={coin.id}
          className="absolute opacity-10 animate-float"
          style={{
            left: `${coin.x}%`,
            top: `${coin.y}%`,
            transform: `rotate(${coin.rotation}deg)`,
            animation: `float ${coin.speed * 10}s infinite ease-in-out, spin ${coin.speed * 20}s infinite linear`,
            zIndex: 0,
          }}
        >
          <div className="text-indigo-400" style={{ fontSize: `${coin.size}px` }}>
            🪙
          </div>
        </div>
      ))}

      {/* Header with auth */}
      <div className="absolute top-4 right-4 z-10">
        {isAuthenticated ? (
          <UserProfile />
        ) : (
          <button
            onClick={() => setShowAuthModal(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Login / Register
          </button>
        )}
      </div>

      {/* Chat bubble icon with pulse animation */}
      <div className="absolute top-10 w-full flex justify-center">
        <div className="w-10 h-10 animate-pulse-subtle cursor-pointer hover:scale-110 transition-transform">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 13.5997 2.37562 15.1116 3.04346 16.4525C3.22094 16.8088 3.28001 17.2161 3.17712 17.6006L2.58151 19.8267C2.32295 20.793 3.20701 21.677 4.17335 21.4185L6.39939 20.8229C6.78393 20.72 7.19121 20.7791 7.54753 20.9565C8.88837 21.6244 10.4003 22 12 22Z"
              fill="url(#paint0_linear)"
              className="drop-shadow-glow"
            />
            <defs>
              <linearGradient id="paint0_linear" x1="2" y1="12" x2="22" y2="12" gradientUnits="userSpaceOnUse">
                <stop stopColor="#8B5CF6" />
                <stop offset="1" stopColor="#3B82F6" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Main content - centered */}
      <div className="flex flex-col items-center justify-center text-center z-10 px-4 mb-0">
        <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-text animate-text-glow">Saino</h1>
        <p className="text-gray-400 mb-6">Enter a contract address to join or create a chat room</p>

        {/* Form with error handling */}
        <form onSubmit={handleSubmit} className="w-full max-w-md">
          {/* Enhanced input field with glow effect on focus */}
          <div
            className={`relative w-full transition-all duration-300 ${isHovering ? "transform scale-[1.02]" : ""}`}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <input
              type="text"
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
              placeholder="Enter contract address"
              className="w-full bg-transparent border-b border-gray-700 py-3 px-0 text-gray-300 focus:outline-none focus:border-indigo-500 transition-colors placeholder-gray-600 focus:shadow-input"
              disabled={isLoading}
            />
            <button
              type="submit"
              className={`absolute right-0 top-1/2 -translate-y-1/2 text-white hover:text-indigo-400 transition-all duration-300 ${
                isHovering ? "text-indigo-400 transform scale-125" : ""
              }`}
              aria-label="Submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <ArrowRight size={20} className="drop-shadow-glow" />
              )}
            </button>
          </div>

          {/* Error message */}
          {error && <div className="mt-2 text-red-500 text-sm">{error}</div>}
        </form>

        {/* "To the moon" button */}
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="mt-8 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white font-bold py-2 px-6 rounded-full transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-purple-500/50 group disabled:opacity-70"
        >
          <span className="flex items-center">
            {isLoading ? "Connecting..." : "Launch"}
            <span className="ml-2 group-hover:translate-x-1 transition-transform">🚀</span>
          </span>
        </button>
      </div>

      {/* Footer with pump.fun link */}
      <div className="absolute bottom-6 w-full text-center text-gray-500 text-sm">
        <p>
          Powered by{" "}
          <a
            href="https://pump.fun"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            pump.fun
          </a>
        </p>
      </div>

      {/* X (Twitter) logo in bottom right corner */}
      <div className="absolute bottom-6 right-6 z-10">
        <a
          href="https://twitter.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-10 h-10 bg-gray-900/50 rounded-full hover:bg-gray-800/50 transition-colors text-gray-400 hover:text-white"
          aria-label="Twitter"
        >
          <XLogo size={18} />
        </a>
      </div>
    </main>
  )
}
