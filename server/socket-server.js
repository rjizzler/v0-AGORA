import { createServer } from "http"
import { Server } from "socket.io"
import express from "express"
import cors from "cors"

const app = express()
app.use(cors())

const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
})

// Store active rooms and their users
const rooms = new Map()

io.on("connection", (socket) => {
  const { room, username } = socket.handshake.query
  const roomId = String(room)
  const user = String(username)

  // Join the room
  socket.join(roomId)

  // Initialize room if it doesn't exist
  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Set())
  }

  // Add user to room
  rooms.get(roomId).add(user)

  // Notify others that user joined
  socket.to(roomId).emit("userJoined", user)

  // Send current users in room to the new user
  io.to(socket.id).emit("roomUsers", [...rooms.get(roomId)])

  // Handle messages
  socket.on("sendMessage", (message) => {
    io.to(roomId).emit("message", message)
  })

  // Handle disconnection
  socket.on("disconnect", () => {
    if (rooms.has(roomId)) {
      rooms.get(roomId).delete(user)

      // If room is empty, delete it
      if (rooms.get(roomId).size === 0) {
        rooms.delete(roomId)
      } else {
        // Notify others that user left
        socket.to(roomId).emit("userLeft", user)
      }
    }
  })
})

const PORT = process.env.PORT || 3001
server.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`)
})

export default server
