import { NextResponse } from "next/server"

export async function GET() {
  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001"

  try {
    const response = await fetch(`${socketUrl}/status`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (response.ok) {
      return NextResponse.json({ status: "online" })
    } else {
      return NextResponse.json({ status: "offline" }, { status: 200 })
    }
  } catch (error) {
    return NextResponse.json({ status: "offline", error: "Could not connect to socket server" }, { status: 200 })
  }
}
