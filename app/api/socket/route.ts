import { NextResponse } from "next/server"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

const rooms = new Map()

export async function GET(req: Request) {
  // This route is used to establish the WebSocket connection
  return new NextResponse("Socket route initialized", { status: 200 })
}

export async function POST(req: Request) {
  const { socketId, event, data, room } = await req.json()

  if (event === "join") {
    // Add user to room
    if (!rooms.has(room)) {
      rooms.set(room, new Set())
    }
    rooms.get(room).add(socketId)

    return NextResponse.json({
      success: true,
      message: `Joined room: ${room}`,
      users: Array.from(rooms.get(room)).length,
    })
  }

  if (event === "message" && room) {
    // Broadcast message to room
    return NextResponse.json({
      success: true,
      message: data.message,
      user: data.user,
      room,
      timestamp: new Date().toISOString(),
    })
  }

  if (event === "leave" && room) {
    // Remove user from room
    if (rooms.has(room)) {
      rooms.get(room).delete(socketId)
      if (rooms.get(room).size === 0) {
        rooms.delete(room)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Left room: ${room}`,
      users: rooms.has(room) ? Array.from(rooms.get(room)).length : 0,
    })
  }

  return NextResponse.json({ success: false, message: "Invalid event" })
}
