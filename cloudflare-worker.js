// Cloudflare Worker script for handling WebSocket connections with authentication

// Store active connections
const clients = new Map()
const rooms = new Map()
const userTokens = new Map() // Map to store user tokens for authentication

// Handle WebSocket connections
addEventListener("fetch", (event) => {
  const request = event.request
  const url = new URL(request.url)

  // Handle WebSocket upgrade
  if (request.headers.get("Upgrade") === "websocket") {
    event.respondWith(handleWebSocket(event))
    return
  }

  // Handle HTTP requests
  event.respondWith(new Response("This is a WebSocket server for Saino chat", { status: 200 }))
})

async function handleWebSocket(event) {
  // Accept the WebSocket connection
  const webSocketPair = new WebSocketPair()
  const [client, server] = Object.values(webSocketPair)

  // Generate a unique client ID
  const clientId = generateId()
  clients.set(clientId, { ws: server })

  console.log(`Client connected: ${clientId}`)

  // Set up event handlers for the WebSocket
  server.accept()

  // Send welcome message
  server.send(
    JSON.stringify({
      type: "connected",
      clientId,
      message: "Connected to Saino chat server",
    }),
  )

  // Handle messages from the client
  server.addEventListener("message", async (event) => {
    try {
      const message = JSON.parse(event.data)
      console.log(`Received ${message.type || "unknown"} from ${clientId}`)

      if (message.type === "join") {
        // Verify authentication if token is provided
        if (message.authToken && message.userId) {
          // In a real implementation, this would verify the token with a database or JWT
          // For this demo, we'll just store the token
          userTokens.set(clientId, {
            userId: message.userId,
            username: message.username,
            authToken: message.authToken,
          })
        }

        // Add client to room
        const { roomId, username } = message
        if (!rooms.has(roomId)) {
          rooms.set(roomId, new Set())
        }
        rooms.get(roomId).add(clientId)

        // Update client info
        clients.set(clientId, {
          ws: server,
          username,
          roomId,
          userId: message.userId,
        })

        console.log(`Client ${clientId} (${username}) joined room ${roomId}`)
        console.log(`Room ${roomId} now has ${rooms.get(roomId).size} clients`)

        // Notify client they've joined successfully
        server.send(
          JSON.stringify({
            type: "joined",
            roomId,
            username,
            onlineCount: rooms.get(roomId).size,
          }),
        )

        // Notify other clients in the room
        broadcastToRoom(roomId, clientId, {
          type: "message",
          roomId,
          message: {
            id: `system-join-${Date.now()}`,
            sender: "System",
            content: `${username} joined the chat`,
            timestamp: new Date().toISOString(),
            isSystem: true,
          },
        })

        // Also broadcast updated user count
        broadcastToRoom(roomId, null, {
          type: "userCount",
          roomId,
          count: rooms.get(roomId).size,
        })
      } else if (message.type === "leave") {
        // Handle client leaving a room
        handleClientLeave(clientId, message.roomId, message.username)
      } else if (message.type === "message") {
        // Verify authentication for messages
        const userToken = userTokens.get(clientId)
        if (!userToken || userToken.authToken !== message.authToken) {
          // Authentication failed
          server.send(
            JSON.stringify({
              type: "auth_error",
              code: "invalid_token",
              message: "Authentication failed. Please login again.",
            }),
          )
          return
        }

        // Broadcast message to all clients in the room
        broadcastToRoom(message.roomId, clientId, message)
      } else if (message.type === "typing") {
        // Verify authentication for typing indicators
        const userToken = userTokens.get(clientId)
        if (!userToken || userToken.authToken !== message.authToken) {
          // Authentication failed, but we'll just ignore typing indicators
          return
        }

        // Broadcast typing status to all clients in the room
        broadcastToRoom(message.roomId, clientId, message)
      } else if (message.type === "ping") {
        // Respond with pong to keep connection alive
        server.send(JSON.stringify({ type: "pong", timestamp: Date.now() }))
      }
    } catch (error) {
      console.error("Error processing message:", error)
      server.send(
        JSON.stringify({
          type: "error",
          message: "Failed to process message",
        }),
      )
    }
  })

  // Handle WebSocket closing
  server.addEventListener("close", (event) => {
    console.log(`Client disconnected: ${clientId}`)

    // Get client info before removing
    const client = clients.get(clientId)

    // Remove client from room and notify others
    if (client && client.roomId) {
      handleClientLeave(clientId, client.roomId, client.username)
    }

    // Remove client
    clients.delete(clientId)
    userTokens.delete(clientId)
  })

  // Handle WebSocket errors
  server.addEventListener("error", (event) => {
    console.error(`WebSocket error for client ${clientId}:`, event)
  })

  return new Response(null, {
    status: 101,
    webSocket: client,
  })
}

function handleClientLeave(clientId, roomId, username) {
  if (!roomId) return

  if (rooms.has(roomId)) {
    rooms.get(roomId).delete(clientId)

    // Notify others in the room
    if (username) {
      broadcastToRoom(roomId, clientId, {
        type: "message",
        roomId,
        message: {
          id: `system-leave-${Date.now()}`,
          sender: "System",
          content: `${username} left the chat`,
          timestamp: new Date().toISOString(),
          isSystem: true,
        },
      })

      // Also broadcast updated user count
      broadcastToRoom(roomId, null, {
        type: "userCount",
        roomId,
        count: rooms.get(roomId).size,
      })
    }
  }
}

function broadcastToRoom(roomId, senderId, message) {
  if (!rooms.has(roomId)) return

  const room = rooms.get(roomId)
  console.log(`Broadcasting to room ${roomId} (${room.size} clients)`)

  room.forEach((clientId) => {
    if (senderId === null || clientId !== senderId) {
      const client = clients.get(clientId)
      if (client && client.ws) {
        try {
          client.ws.send(JSON.stringify(message))
        } catch (error) {
          console.error(`Error sending to client ${clientId}:`, error)
        }
      }
    }
  })
}

function generateId() {
  return Math.random().toString(36).substring(2, 15)
}
