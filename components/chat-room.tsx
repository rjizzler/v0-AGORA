"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { ArrowLeft, Send, AlertTriangle, Info, Wifi, WifiOff } from "lucide-react"
import type { Message } from "@/lib/message-store"
import { fetchCoinData, getPumpFunUrl, type CoinData } from "@/lib/pump-api"
import TokenImage from "@/components/token-image"
import TokenImageModal from "@/components/token-image-modal"
import { WebSocketChatService } from "@/lib/websocket-chat-service"
import { PumpIcon, PhotonIcon, AxiomIcon, DexscreenerIcon } from "@/components/platform-icons"
import { TypingIndicator } from "@/components/typing-indicator"
import { v4 as uuidv4 } from "uuid"
import { AuthModal } from "@/components/auth/auth-modal"
import { authService } from "@/lib/auth-service"
import { UserProfile } from "@/components/user-profile"

interface ChatRoomProps {
  contractAddress: string
  onBack: () => void
}

export default function ChatRoom({ contractAddress, onBack }: ChatRoomProps) {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [coinData, setCoinData] = useState<CoinData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showTokenImageModal, setShowTokenImageModal] = useState(false)
  const [showInfoBanner, setShowInfoBanner] = useState(true)
  const [newMessageAlert, setNewMessageAlert] = useState(false)
  const [onlineUserCount, setOnlineUserCount] = useState(1) // Default to 1 (self)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [chatService] = useState(() => WebSocketChatService.getInstance())
  const hasScrolledToBottom = useRef(true)
  const messageContainerRef = useRef<HTMLDivElement>(null)
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "connecting" | "disconnected">("disconnected")
  const [isFallbackMode, setIsFallbackMode] = useState(false)
  const [isReconnecting, setIsReconnecting] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null)

  // Get pump.fun URL for this coin
  const pumpFunUrl = getPumpFunUrl(contractAddress)

  // Handle scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      if (!messageContainerRef.current) return

      const { scrollTop, scrollHeight, clientHeight } = messageContainerRef.current
      // Consider "at bottom" if within 50px of the bottom
      hasScrolledToBottom.current = scrollHeight - scrollTop - clientHeight < 50
    }

    const container = messageContainerRef.current
    if (container) {
      container.addEventListener("scroll", handleScroll)
      return () => container.removeEventListener("scroll", handleScroll)
    }
  }, [])

  // Subscribe to auth state changes
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user)

      // If user just logged in and we're in a room, join the room
      if (user && contractAddress) {
        chatService.joinRoom(contractAddress)
      }
    })

    return unsubscribe
  }, [contractAddress, chatService])

  // Subscribe to connection status changes
  useEffect(() => {
    const unsubscribe = chatService.onStatusChange((status) => {
      setConnectionStatus(status)
      setIsFallbackMode(chatService.isFallbackMode())

      // Show appropriate message when connection status changes
      if (status === "connected" && !chatService.isFallbackMode()) {
        console.log("Connected to WebSocket server")
      } else if (status === "connecting") {
        console.log("Connecting to WebSocket server...")
      } else if (status === "disconnected") {
        console.log("Disconnected from WebSocket server")
      }

      if (chatService.isFallbackMode()) {
        console.log("Using local storage mode - messages will only be visible on this device")
      }
    })

    return unsubscribe
  }, [chatService])

  // Subscribe to user count changes
  useEffect(() => {
    const unsubscribe = chatService.onUserCountChange((count) => {
      setOnlineUserCount(count)
    })

    return () => unsubscribe()
  }, [chatService])

  // Load coin data and messages
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Fetch coin data from pump.fun via our API
        console.log(`Fetching data for contract: ${contractAddress}`)
        let data = await fetchCoinData(contractAddress)

        // If the main API fails, try the mock API
        if (!data) {
          console.log("Main API failed, trying mock API...")
          try {
            const mockResponse = await fetch(`/api/mock-pump/${contractAddress}`)
            if (mockResponse.ok) {
              data = await mockResponse.json()
              console.log("Using data from mock API:", data)
            }
          } catch (mockError) {
            console.error("Mock API also failed:", mockError)
          }
        }

        if (data) {
          console.log(`Received coin data:`, data)
          setCoinData(data)

          // Add welcome messages if no messages exist
          const welcomeMessages = [
            {
              id: `system-1-${uuidv4()}`,
              sender: "System",
              content: `Welcome to the ${data.name} (${data.symbol}) chat room!`,
              timestamp: new Date().toISOString(),
              isSystem: true,
            },
            {
              id: `system-2-${uuidv4()}`,
              sender: "System",
              content: `View on pump.fun: ${pumpFunUrl}`,
              timestamp: new Date().toISOString(),
              isSystem: true,
            },
            {
              id: `system-4-${uuidv4()}`,
              sender: "System",
              content: "Chat with traders from around the world in real-time!",
              timestamp: new Date().toISOString(),
              isSystem: true,
            },
          ]

          // Add a warning message if the coin doesn't exist on pump.fun
          if (!data.exists) {
            welcomeMessages.push({
              id: `system-warning-${uuidv4()}`,
              sender: "System",
              content: `Note: This token may not exist on pump.fun yet.`,
              timestamp: new Date().toISOString(),
              isSystem: true,
            })
          } else {
            welcomeMessages.push({
              id: `system-3-${uuidv4()}`,
              sender: "System",
              content: "Discuss trading strategies with other traders.",
              timestamp: new Date().toISOString(),
              isSystem: true,
            })
          }

          setMessages(welcomeMessages)
        } else {
          throw new Error("Failed to fetch coin data")
        }
      } catch (error) {
        console.error("Error loading data:", error)
        setError("Failed to load token data. Using fallback information.")

        // Set default data if an error occurs
        setCoinData({
          address: contractAddress,
          name: contractAddress.substring(0, 6) + " Token",
          symbol: contractAddress.substring(0, 6).toUpperCase(),
          exists: false,
          imageUrl: `/placeholder.svg?height=100&width=100&query=unknown%20token`,
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()

    // Subscribe to message updates
    const messageUnsubscribe = chatService.onMessage(contractAddress, (newMessage) => {
      console.log("Received new message:", newMessage)

      // Show new message alert if not at bottom
      if (!hasScrolledToBottom.current && !newMessage.isSystem) {
        setNewMessageAlert(true)
      }

      setMessages((prev) => {
        // Check if we already have this message
        if (prev.some((msg) => msg.id === newMessage.id)) {
          return prev
        }
        return [...prev, newMessage]
      })
    })

    // Join the room if authenticated
    if (isAuthenticated) {
      chatService.joinRoom(contractAddress)
    }

    // Cleanup subscription
    return () => {
      messageUnsubscribe()
      chatService.leaveRoom()
    }
  }, [contractAddress, pumpFunUrl, isAuthenticated, chatService])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (hasScrolledToBottom.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()

    if (!message.trim()) return

    // Check if user is authenticated
    if (!isAuthenticated) {
      setShowAuthModal(true)
      return
    }

    chatService.sendMessage(contractAddress, message)
    setMessage("")

    // Always scroll to bottom when sending a message
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
      hasScrolledToBottom.current = true
    }, 100)
  }

  // Handle typing indicator
  const handleTyping = () => {
    // Check if user is authenticated
    if (!isAuthenticated) return

    // Send typing indicator
    chatService.setTyping(contractAddress, true)

    // Clear previous timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout)
    }

    // Set timeout to clear typing indicator after 3 seconds
    const timeout = setTimeout(() => {
      chatService.setTyping(contractAddress, false)
    }, 3000)

    setTypingTimeout(timeout)
  }

  // Handle clicking on new message alert
  const handleNewMessageAlertClick = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    hasScrolledToBottom.current = true
    setNewMessageAlert(false)
  }

  // Handle manual reconnection
  const handleReconnect = () => {
    setIsReconnecting(true)
    console.log("Attempting to reconnect to WebSocket server...")

    chatService.forceReconnect()

    // Reset after a short delay
    setTimeout(() => {
      setIsReconnecting(false)

      // Check if reconnection was successful
      if (connectionStatus === "connected" && !chatService.isFallbackMode()) {
        console.log("Successfully reconnected to WebSocket server")
      } else {
        console.log("Failed to reconnect to WebSocket server, using fallback mode")
      }
    }, 3000)
  }

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {/* Token Image Modal */}
      {coinData && (
        <TokenImageModal
          isOpen={showTokenImageModal}
          onClose={() => setShowTokenImageModal(false)}
          imageUrl={coinData?.imageUrl}
          tokenName={coinData?.name}
          tokenSymbol={coinData?.symbol}
        />
      )}

      {/* Header - With prominent pump.fun link and coin data */}
      <header className="flex items-center justify-between p-4 border-b border-gray-800 bg-gradient-to-r from-purple-900/30 to-indigo-900/30">
        <div className="flex items-center">
          <button onClick={onBack} className="mr-4 text-gray-400 hover:text-white transition-colors" aria-label="Back">
            <ArrowLeft size={20} />
          </button>

          {isLoading ? (
            <div className="h-6 w-24 bg-gray-800 animate-pulse rounded"></div>
          ) : (
            <div className="flex items-center">
              {/* Make token image clickable to show larger version */}
              <div
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setShowTokenImageModal(true)}
                title="Click to view larger image"
              >
                <TokenImage
                  src={coinData?.imageUrl}
                  alt={coinData?.name || "Token"}
                  symbol={coinData?.symbol || "?"}
                  size="md"
                  className="mr-3 flex-shrink-0"
                />
              </div>
              <div>
                <div className="flex items-center">
                  <h1 className="font-bold">{coinData?.name}</h1>
                  {!coinData?.exists && (
                    <span className="ml-2 text-yellow-500 flex items-center text-xs">
                      <AlertTriangle size={12} className="mr-1" />
                      Not found
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-400">{coinData?.symbol}</div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {/* Connection status indicator with reconnect button */}
          <div
            className={`px-2 py-1 rounded-full text-xs flex items-center ${
              connectionStatus === "connected" && !isFallbackMode
                ? "bg-green-900/30 text-green-400"
                : connectionStatus === "connecting" || isReconnecting
                  ? "bg-yellow-900/30 text-yellow-400"
                  : "bg-red-900/30 text-red-400"
            }`}
          >
            {connectionStatus === "connected" && !isFallbackMode ? (
              <>
                <Wifi size={14} className="mr-1" />
                Online
              </>
            ) : connectionStatus === "connecting" || isReconnecting ? (
              <>
                <div className="w-3 h-3 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mr-1"></div>
                {isReconnecting ? "Reconnecting" : "Connecting"}
              </>
            ) : (
              <>
                <WifiOff size={14} className="mr-1" />
                {isFallbackMode ? "Local Mode" : "Offline"}
                {!isReconnecting && (
                  <button
                    onClick={handleReconnect}
                    className="ml-2 text-xs bg-gray-800 hover:bg-gray-700 px-1 rounded"
                    title="Try to reconnect"
                  >
                    Retry
                  </button>
                )}
              </>
            )}
          </div>

          {/* Online users count */}
          <div className="flex items-center text-xs text-gray-400">
            <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
            <span>{onlineUserCount} online</span>
          </div>

          {/* Platform icons */}
          <div className="flex items-center space-x-2">
            <PumpIcon address={contractAddress} className="hover:scale-110 transition-transform" />
            <PhotonIcon address={contractAddress} className="hover:scale-110 transition-transform" />
            <AxiomIcon address={contractAddress} className="hover:scale-110 transition-transform" />
            <DexscreenerIcon address={contractAddress} className="hover:scale-110 transition-transform" />
          </div>

          {/* User profile */}
          <UserProfile />
        </div>
      </header>

      {/* Fallback mode warning */}
      {isFallbackMode && (
        <div className="bg-yellow-900/30 border border-yellow-800/50 px-4 py-2 text-sm flex items-center justify-between">
          <div className="flex items-center">
            <AlertTriangle size={16} className="mr-2 text-yellow-400" />
            <span>
              Using local storage mode. Messages will only be visible on this device and browser.
              <span className="ml-1 text-yellow-400">This is normal in preview environments.</span>
            </span>
          </div>
          <button
            onClick={() => setShowInfoBanner(false)}
            className="text-gray-400 hover:text-white ml-2"
            aria-label="Close"
          >
            ×
          </button>
        </div>
      )}

      {/* Info banner */}
      {showInfoBanner && !isFallbackMode && (
        <div className="bg-indigo-900/30 border border-indigo-800/50 px-4 py-2 text-sm flex items-center justify-between">
          <div className="flex items-center">
            <Info size={16} className="mr-2 text-indigo-400" />
            <span>
              Live chat is active! When others join with the same contract address, you'll see their messages here.
            </span>
          </div>
          <button
            onClick={() => setShowInfoBanner(false)}
            className="text-gray-400 hover:text-white ml-2"
            aria-label="Close"
          >
            ×
          </button>
        </div>
      )}

      {/* Authentication banner */}
      {!isAuthenticated && (
        <div className="bg-purple-900/30 border border-purple-800/50 px-4 py-2 text-sm flex items-center justify-between">
          <div className="flex items-center">
            <Info size={16} className="mr-2 text-purple-400" />
            <span>You need to be logged in to send messages.</span>
          </div>
          <button
            onClick={() => setShowAuthModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-md text-sm transition-colors"
          >
            Login / Register
          </button>
        </div>
      )}

      {/* New message alert */}
      {newMessageAlert && (
        <div
          className="bg-indigo-600 text-white px-4 py-2 text-sm text-center cursor-pointer hover:bg-indigo-700 transition-colors"
          onClick={handleNewMessageAlertClick}
        >
          ↓ New messages received! Click to scroll down ↓
        </div>
      )}

      {/* Error message */}
      {error && <div className="bg-red-900/20 border border-red-800 text-red-300 px-4 py-2 text-sm">{error}</div>}

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={messageContainerRef}>
        {isLoading ? (
          // Loading skeleton
          <>
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start animate-pulse">
                <div className="w-8 h-8 rounded-full bg-gray-800 mr-2"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-800 rounded w-24 mb-2"></div>
                  <div className="h-10 bg-gray-800 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </>
        ) : (
          // Messages
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start ${msg.isSystem ? "justify-center" : ""} ${
                !msg.isSystem && !msg.isUser ? "animate-pulse-once" : ""
              }`}
            >
              {!msg.isSystem && (
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                    msg.isUser
                      ? "bg-gradient-to-br from-purple-500 to-blue-500"
                      : msg.sender === "System"
                        ? "bg-gray-700"
                        : "bg-gradient-to-br from-gray-700 to-gray-800"
                  }`}
                >
                  {msg.sender.charAt(0).toUpperCase()}
                </div>
              )}

              <div className={`${msg.isSystem ? "text-center text-gray-500 text-sm" : "flex-1"}`}>
                {!msg.isSystem && (
                  <div className="flex items-center">
                    <span
                      className={`font-semibold ${
                        msg.isUser ? "text-indigo-400" : msg.sender === "System" ? "text-gray-400" : "text-gray-300"
                      }`}
                    >
                      {msg.sender}
                      {msg.isUser && <span className="ml-1 text-xs text-gray-500">(you)</span>}
                    </span>
                    <span className="text-gray-500 text-xs ml-2">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                )}
                <div
                  className={`${
                    msg.isSystem
                      ? msg.content.includes("Note: This token may not exist")
                        ? "text-yellow-500"
                        : msg.content.includes("joined the chat")
                          ? "text-indigo-400"
                          : ""
                      : msg.isUser
                        ? "bg-indigo-900/30 border border-indigo-800/50 rounded-lg p-2 mt-1 break-words"
                        : "bg-gray-900 rounded-lg p-2 mt-1 break-words"
                  }`}
                >
                  {msg.content.includes("pump.fun") ? (
                    <span>
                      {msg.content.split(pumpFunUrl)[0]}
                      <a
                        href={pumpFunUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-400 hover:text-indigo-300 underline"
                      >
                        {pumpFunUrl}
                      </a>
                      {msg.content.split(pumpFunUrl)[1]}
                    </span>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing indicator */}
      <TypingIndicator contractAddress={contractAddress} />

      {/* Message input */}
      <div className="p-4 border-t border-gray-800 bg-black">
        <form onSubmit={handleSendMessage} className="flex items-center">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleTyping}
            placeholder={isAuthenticated ? "Type a message..." : "Login to send messages..."}
            className="flex-1 bg-gray-900 border border-gray-800 rounded-l-lg py-2 px-4 focus:outline-none focus:border-indigo-500 transition-colors"
            disabled={isLoading || !isAuthenticated}
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-r-lg px-4 py-2 hover:from-purple-700 hover:to-blue-600 transition-colors disabled:opacity-50"
            disabled={isLoading || !message.trim() || !isAuthenticated}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  )
}
