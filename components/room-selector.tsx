"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface RoomSelectorProps {
  onJoinRoom: (room: string, username: string) => void
}

const POPULAR_COINS = [
  { name: "Bitcoin", address: "BTC" },
  { name: "Ethereum", address: "ETH" },
  { name: "Solana", address: "SOL" },
  { name: "Dogecoin", address: "DOGE" },
]

export default function RoomSelector({ onJoinRoom }: RoomSelectorProps) {
  const [room, setRoom] = useState("")
  const [username, setUsername] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (room.trim() && username.trim()) {
      onJoinRoom(room.trim(), username.trim())
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-center">Join a Crypto Chat Room</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium">
              Your Username
            </label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="room" className="text-sm font-medium">
              Coin Address / Room Name
            </label>
            <Input
              id="room"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="Enter coin address or room name"
              required
            />
          </div>
        </form>
        <div className="mt-4">
          <p className="text-sm font-medium mb-2">Popular Coins:</p>
          <div className="flex flex-wrap gap-2">
            {POPULAR_COINS.map((coin) => (
              <Button key={coin.address} variant="outline" size="sm" onClick={() => setRoom(coin.address)}>
                {coin.name}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleSubmit} disabled={!room.trim() || !username.trim()}>
          Join Chat Room
        </Button>
      </CardFooter>
    </Card>
  )
}
