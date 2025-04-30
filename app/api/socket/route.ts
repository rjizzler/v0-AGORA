import { NextResponse } from "next/server"

// This is a placeholder API route for WebSocket connections
// The actual WebSocket server is running in server.js
export async function GET(request: Request) {
  return NextResponse.json({
    message: "WebSocket server is running. Connect directly to the root WebSocket endpoint.",
    status: "ok",
  })
}

// Use the correct dynamic export for App Router
export const dynamic = "force-dynamic"
