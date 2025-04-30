const { createServer } = require("http")
const { parse } = require("url")
const next = require("next")
const WebSocket = require("ws")

const dev = process.env.NODE_ENV !== "production"
const app = next({ dev })
const handle = app.getRequestHandler()

// Store active connections and rooms
const clients = new Map()
const rooms = new Map()

app.prepare().then(() => {
  // Create HTTP server
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  })

  // Create WebSocket server attached to the same HTTP server
  const wss = new WebSocket.Server({
    server,
    // Remove path restriction to make connections easier
    // path: '/api/ws'
  })

  console.log("WebSocket server initialized")

  // Handle new WebSocket connections
  wss.on("connection", (ws) => {
    const clientId = Math.random().toString(36).substring(2, 15)
    clients.set(clientId, { ws })

    console.log(`Client connected: ${clientId}`)

    // Send immediate confirmation to client
    ws.send(
      JSON.stringify({
        type: "connected",
        clientId,
        message: "Successfully connected to chat server",
      }),
    )

    // Handle incoming messages
    ws.on("message", (data) => {
      try {
        const message = JSON.parse(data.toString())
        console.log(`Received ${message.type || "unknown"} from ${clientId}`)

        if (message.type === "join") {
          // Add client to room
          const { roomId, username } = message
          if (!rooms.has(roomId)) {
            rooms.set(roomId, new Set())
          }
          rooms.get(roomId).add(clientId)

          // Update client info
          clients.set(clientId, {
            ws,
            username,
            roomId,
          })

          console.log(`Client ${clientId} (${username}) joined room ${roomId}`)
          console.log(`Room ${roomId} now has ${rooms.get(roomId).size} clients`)

          // Notify client they've joined successfully
          ws.send(
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
        } else if (message.type === "message") {
          // Broadcast message to all clients in the room
          const { roomId } = message
          broadcastToRoom(roomId, clientId, message)
        } else if (message.type === "ping") {
          // Respond with pong to keep connection alive
          ws.send(JSON.stringify({ type: "pong", timestamp: Date.now() }))
        }
      } catch (error) {
        console.error("Error processing message:", error)
        // Send error back to client
        ws.send(
          JSON.stringify({
            type: "error",
            message: "Failed to process message",
          }),
        )
      }
    })

    // Handle disconnections
    ws.on("close", () => {
      console.log(`Client disconnected: ${clientId}`)

      // Get client info before removing
      const client = clients.get(clientId)

      // Remove client from room and notify others
      if (client && client.roomId) {
        const { roomId, username } = client

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

      // Remove client
      clients.delete(clientId)
    })

    // Handle errors
    ws.on("error", (error) => {
      console.error(`WebSocket error for client ${clientId}:`, error)
    })
  })

  // Broadcast message to all clients in a room except the sender
  function broadcastToRoom(roomId, senderId, message) {
    if (!rooms.has(roomId)) return

    const room = rooms.get(roomId)
    console.log(`Broadcasting to room ${roomId} (${room.size} clients)`)

    room.forEach((clientId) => {
      if (senderId === null || clientId !== senderId) {
        const client = clients.get(clientId)
        if (client && client.ws && client.ws.readyState === WebSocket.OPEN) {
          client.ws.send(JSON.stringify(message))
        }
      }
    })
  }

  // Ping all clients periodically to keep connections alive
  setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "ping", timestamp: Date.now() }))
      }
    })
  }, 30000) // Every 30 seconds

  // Start the server
  const PORT = process.env.PORT || 3000
  server.listen(PORT, (err) => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${PORT}`)
    console.log(`> WebSocket server running on ws://localhost:${PORT}`)
  })
})
