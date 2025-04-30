import { NextResponse } from "next/server"
import { WebSocketServer } from "ws"

// Store active connections
const clients = new Map()
const rooms = new Map()

// This is a workaround since Next.js App Router doesn't directly support WebSockets
// In a production app, you would use a proper WebSocket service like Pusher, Socket.io, or a custom server
export async function GET(request: Request) {
  // This is just a placeholder response
  // In a real implementation, you would handle the WebSocket upgrade here
  return NextResponse.json({
    message: "WebSocket endpoint - use a WebSocket client to connect",
    status: "running",
    timestamp: new Date().toISOString(),
  })
}

// Initialize WebSocket server (this would normally be done in a custom server.js file)
if (typeof window === "undefined" && !global.wsServer) {
  try {
    const wss = new WebSocketServer({ port: 3001 })
    console.log("WebSocket server started on port 3001")

    wss.on("connection", (ws) => {
      const clientId = Math.random().toString(36).substring(2, 15)
      clients.set(clientId, ws)

      console.log(`Client connected: ${clientId}`)

      ws.on("message", (data) => {
        try {
          const message = JSON.parse(data.toString())
          console.log("Received message:", message)

          if (message.type === "join") {
            // Add client to room
            if (!rooms.has(message.roomId)) {
              rooms.set(message.roomId, new Set())
            }
            rooms.get(message.roomId).add(clientId)

            // Associate client with username
            clients.set(clientId, {
              ws,
              username: message.username,
              roomId: message.roomId,
            })

            console.log(`Client ${clientId} (${message.username}) joined room ${message.roomId}`)

            // Send confirmation back to client
            ws.send(
              JSON.stringify({
                type: "joined",
                roomId: message.roomId,
                clientId,
                timestamp: new Date().toISOString(),
              }),
            )
          } else if (message.type === "leave") {
            // Remove client from room
            if (rooms.has(message.roomId)) {
              rooms.get(message.roomId).delete(clientId)
            }

            console.log(`Client ${clientId} (${message.username}) left room ${message.roomId}`)
          } else if (message.type === "message") {
            // Broadcast message to all clients in the room
            if (rooms.has(message.roomId)) {
              const room = rooms.get(message.roomId)

              room.forEach((id) => {
                if (id !== clientId && clients.has(id)) {
                  const client = clients.get(id)
                  if (client.ws.readyState === 1) {
                    // OPEN
                    client.ws.send(
                      JSON.stringify({
                        type: "message",
                        roomId: message.roomId,
                        message: message.message,
                      }),
                    )
                  }
                }
              })
            }
          } else if (message.type === "ping") {
            // Respond with pong to keep connection alive
            ws.send(
              JSON.stringify({
                type: "pong",
                timestamp: new Date().toISOString(),
              }),
            )
          }
        } catch (error) {
          console.error("Error processing message:", error)
          // Send error back to client
          try {
            ws.send(
              JSON.stringify({
                type: "error",
                message: "Failed to process message",
                timestamp: new Date().toISOString(),
              }),
            )
          } catch (e) {
            console.error("Failed to send error message:", e)
          }
        }
      })

      ws.on("close", () => {
        console.log(`Client disconnected: ${clientId}`)

        // Remove client from all rooms
        for (const [roomId, room] of rooms.entries()) {
          if (room.has(clientId)) {
            room.delete(clientId)

            // Get client info
            const client = clients.get(clientId)
            if (client && client.username) {
              // Notify others in the room
              room.forEach((id) => {
                if (clients.has(id)) {
                  const otherClient = clients.get(id)
                  if (otherClient.ws.readyState === 1) {
                    // OPEN
                    otherClient.ws.send(
                      JSON.stringify({
                        type: "message",
                        roomId,
                        message: {
                          id: `system-leave-${Date.now()}`,
                          sender: "System",
                          content: `${client.username} left the chat`,
                          timestamp: new Date().toISOString(),
                          isSystem: true,
                        },
                      }),
                    )
                  }
                }
              })
            }
          }
        }

        // Remove client
        clients.delete(clientId)
      })

      ws.on("error", (error) => {
        console.error(`WebSocket error for client ${clientId}:`, error)
      })
    })

    wss.on("error", (error) => {
      console.error("WebSocket server error:", error)
    })

    global.wsServer = wss
  } catch (error) {
    console.error("Failed to start WebSocket server:", error)
  }
}
