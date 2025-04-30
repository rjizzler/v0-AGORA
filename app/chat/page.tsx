"use client"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Loader2, Send, LogIn, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ErrorBoundary } from "@/components/error-boundary"

// Socket.io will be imported dynamically to prevent SSR issues
let io: any = null
let socket: any = null

export default function ChatApp() {
  const [coinAddress, setCoinAddress] = useState("")
  const [joined, setJoined] = useState(false)
  const [messages, setMessages] = useState([])
  const [message, setMessage] = useState("")
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [typingUsers, setTypingUsers] = useState([])
  const [username, setUsername] = useState(`User${Math.floor(Math.random() * 10000)}`)
  const [socketLoaded, setSocketLoaded] = useState(false)
  const messagesEndRef = useRef(null)
  const { toast } = useToast()

  // Dynamically import socket.io-client to avoid SSR issues
  useEffect(() => {
    const loadSocketIO = async () => {
      try {
        const socketIO = await import("socket.io-client")
        io = socketIO.default || socketIO.io
        setSocketLoaded(true)
      } catch (error) {
        console.error("Failed to load socket.io-client:", error)
        setConnectionError("Failed to load chat dependencies. Please try again later.")
      }
    }

    loadSocketIO()
  }, [])

  // Function to initialize socket with proper error handling
  const initializeSocket = () => {
    if (!io) {
      setConnectionError("Chat dependencies not loaded yet. Please wait or refresh the page.")
      return
    }

    // Clean up existing socket if it exists
    if (socket) {
      socket.disconnect()
      socket.off()
    }

    setIsConnecting(true)
    setConnectionError(null)

    try {
      // Get the socket URL with a fallback
      const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin

      // Initialize with explicit timeout and reconnection options
      socket = io(socketUrl, {
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000, // 10 seconds timeout
        transports: ["websocket", "polling"], // Try WebSocket first, then fallback to polling
      })

      socket.on("connect", () => {
        setIsConnected(true)
        setIsConnecting(false)
        setConnectionError(null)

        toast({
          title: "Connected to server",
          description: "You are now connected to the chat server",
        })

        // Rejoin room if we were previously in one
        if (joined && coinAddress) {
          socket.emit("join", { room: coinAddress, username })
        }
      })

      socket.on("disconnect", () => {
        setIsConnected(false)

        toast({
          title: "Disconnected from server",
          description: "Connection to the chat server was lost",
          variant: "destructive",
        })
      })

      socket.on("connect_error", (err) => {
        console.error("Connection error:", err.message)
        setIsConnecting(false)
        setIsConnected(false)
        setConnectionError(`Failed to connect: ${err.message}`)

        toast({
          title: "Connection error",
          description: `Failed to connect to the chat server: ${err.message}`,
          variant: "destructive",
        })
      })

      socket.on("connect_timeout", () => {
        setIsConnecting(false)
        setIsConnected(false)
        setConnectionError("Connection timeout - server might be unavailable")

        toast({
          title: "Connection timeout",
          description: "Connection to the chat server timed out",
          variant: "destructive",
        })
      })

      // Message handler
      socket.on("message", (msg) => {
        setMessages((prev) => [...prev, msg])
      })

      // Typing indicator handler
      socket.on("typing", ({ username, isTyping }) => {
        if (isTyping) {
          setTypingUsers((users) => (users.includes(username) ? users : [...users, username]))
        } else {
          setTypingUsers((users) => users.filter((user) => user !== username))
        }
      })
    } catch (error) {
      console.error("Error initializing socket:", error)
      setIsConnecting(false)
      setConnectionError(`Failed to initialize chat: ${error.message}`)
    }
  }

  // Initialize socket when socketLoaded becomes true
  useEffect(() => {
    if (socketLoaded) {
      initializeSocket()
    }

    // Cleanup on component unmount
    return () => {
      if (socket) {
        socket.disconnect()
        socket.off()
        socket = null
      }
    }
  }, [socketLoaded]) // Dependency on socketLoaded

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleRetryConnection = () => {
    initializeSocket()
  }

  const joinRoom = () => {
    if (coinAddress.trim() === "") {
      toast({
        title: "Error",
        description: "Please enter a valid coin address",
        variant: "destructive",
      })
      return
    }

    if (!isConnected) {
      toast({
        title: "Not connected",
        description: "Please wait for connection to be established or retry connecting",
        variant: "destructive",
      })
      return
    }

    socket.emit("join", { room: coinAddress, username })
    setJoined(true)
    setMessages([])

    toast({
      title: "Joined room",
      description: `You've joined the ${coinAddress} chat room`,
    })
  }

  const sendMessage = (e) => {
    e?.preventDefault()

    if (message.trim() === "" || !isConnected) return

    const messageData = {
      room: coinAddress,
      text: message,
      username,
      timestamp: new Date().toISOString(),
    }

    socket.emit("message", messageData)

    // Add own message to chat immediately for better UX
    setMessages((prev) => [
      ...prev,
      {
        ...messageData,
        isOwnMessage: true,
      },
    ])

    setMessage("")

    // Clear typing indicator
    socket.emit("typing", { room: coinAddress, username, isTyping: false })
  }

  const handleTyping = () => {
    if (isConnected) {
      socket.emit("typing", { room: coinAddress, username, isTyping: message.length > 0 })
    }
  }

  const getInitials = (name) => {
    return name.substring(0, 2).toUpperCase()
  }

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return ""
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Display connection status
  const renderConnectionStatus = () => {
    if (!socketLoaded) {
      return (
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading chat dependencies...</span>
        </div>
      )
    }

    if (isConnecting) {
      return (
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Connecting...</span>
        </div>
      )
    }

    if (connectionError) {
      return (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription>
            {connectionError}
            <Button variant="outline" size="sm" onClick={handleRetryConnection} className="ml-2">
              <RefreshCw className="h-3 w-3 mr-1" /> Retry
            </Button>
          </AlertDescription>
        </Alert>
      )
    }

    return null
  }

  return (
    <ErrorBoundary>
      <div className="container mx-auto max-w-4xl p-4">
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
            <CardTitle className="flex items-center justify-between">
              {!joined ? "Join a Crypto Chat Room" : `Chatroom: ${coinAddress}`}
              {isConnected ? (
                <Badge variant="outline" className="bg-green-600 text-white border-green-400">
                  Connected
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-red-600 text-white border-red-400">
                  Disconnected
                </Badge>
              )}
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6">
            {renderConnectionStatus()}

            {!joined ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="username" className="text-sm font-medium">
                    Your Display Name
                  </label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your display name"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="coinAddress" className="text-sm font-medium">
                    Coin Address / Chat Room
                  </label>
                  <div className="flex space-x-2">
                    <Input
                      id="coinAddress"
                      type="text"
                      placeholder="Enter coin address (e.g., BTC, ETH, SOL)"
                      value={coinAddress}
                      onChange={(e) => setCoinAddress(e.target.value)}
                    />
                    <Button onClick={joinRoom} disabled={!isConnected || isConnecting} className="whitespace-nowrap">
                      {isConnecting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <LogIn className="mr-2 h-4 w-4" />
                      )}
                      Join Room
                    </Button>
                  </div>
                </div>

                {!isConnected && !connectionError && socketLoaded && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Connection Status</AlertTitle>
                    <AlertDescription>
                      Waiting for connection to the chat server...
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRetryConnection}
                        className="ml-2"
                        disabled={isConnecting}
                      >
                        {isConnecting ? (
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        ) : (
                          <RefreshCw className="h-3 w-3 mr-1" />
                        )}
                        {isConnecting ? "Connecting..." : "Retry"}
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ) : (
              <>
                <div className="h-[400px] overflow-y-auto border rounded-md p-4 mb-4 bg-gray-50">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      No messages yet. Start the conversation!
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.isOwnMessage ? "justify-end" : "justify-start"}`}>
                          <div className={`flex max-w-[80%] ${msg.isOwnMessage ? "flex-row-reverse" : "flex-row"}`}>
                            <Avatar className={`h-8 w-8 ${msg.isOwnMessage ? "ml-2" : "mr-2"}`}>
                              <AvatarFallback className="bg-teal-600 text-white">
                                {getInitials(msg.username || "User")}
                              </AvatarFallback>
                            </Avatar>

                            <div>
                              <div
                                className={`rounded-lg px-3 py-2 ${
                                  msg.isOwnMessage ? "bg-teal-600 text-white" : "bg-gray-200 text-gray-800"
                                }`}
                              >
                                <p className="text-sm font-medium">{msg.username || "User"}</p>
                                <p>{msg.text}</p>
                              </div>
                              <p
                                className={`text-xs mt-1 ${msg.isOwnMessage ? "text-right" : "text-left"} text-gray-500`}
                              >
                                {formatTimestamp(msg.timestamp)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                {typingUsers.length > 0 && (
                  <div className="text-sm text-gray-500 italic mb-2 flex items-center">
                    <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                    {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
                  </div>
                )}

                <form onSubmit={sendMessage} className="flex space-x-2">
                  <Input
                    type="text"
                    placeholder="Type a message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyUp={handleTyping}
                    disabled={!isConnected}
                  />
                  <Button type="submit" disabled={!isConnected || message.trim() === ""}>
                    <Send className="h-4 w-4 mr-2" />
                    Send
                  </Button>
                </form>
              </>
            )}
          </CardContent>

          <CardFooter className="bg-gray-50 text-xs text-gray-500 justify-between">
            <span>Powered by Socket.IO and Next.js</span>
            <span>
              {!socketLoaded
                ? "Loading..."
                : isConnecting
                  ? "Connecting..."
                  : isConnected
                    ? "Connected to server"
                    : connectionError
                      ? "Connection failed"
                      : "Disconnected"}
            </span>
          </CardFooter>
        </Card>
      </div>
    </ErrorBoundary>
  )
}
