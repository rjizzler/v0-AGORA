import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { address: string } }) {
  const address = params.address

  // Database of known coins
  const knownCoins: Record<string, any> = {
    BURNiEDAoJzLiMh1JgvQPU7gvMRL5LQJgSEMgL7SPAcz: {
      name: "Burnie",
      symbol: "BURNIE",
      imageUrl: "/burnie-coin.png",
      exists: true,
    },
    "48mUFsfz8UzeDgujFVehRWPPgKG71jDbJmta2TXxpump": {
      name: "Sphere",
      symbol: "SPHR",
      imageUrl: "/sphere-token.png",
      exists: true,
    },
    PEEPE1hYFPRpVqoLQjPEfbK7AqmJzhXpwREJFSsC2ne: {
      name: "Peepe",
      symbol: "PEEPE",
      imageUrl: "/peepe-coin.png",
      exists: true,
    },
    H6NPb6yNWrSrQoYT5FWoe4zpd4TA28igjxxpAJt1oJ6G: {
      name: "Mog Coin",
      symbol: "MOG",
      imageUrl: "/mog-coin.png",
      exists: true,
    },
    "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R": {
      name: "Bonk",
      symbol: "BONK",
      imageUrl: "/bonk-dog-solana-meme.png",
      exists: true,
    },
    GAMBLE123456789abcdefghijklmnopqrstuvwxyz: {
      name: "Gamblecoin",
      symbol: "GAMBLE",
      imageUrl: "/gamblecoin.png",
      exists: true,
    },
  }

  // Check if we have data for this address (case-insensitive)
  const normalizedAddress = address.toLowerCase()
  const knownAddress = Object.keys(knownCoins).find((addr) => addr.toLowerCase() === normalizedAddress)

  if (knownAddress) {
    return NextResponse.json({
      address,
      ...knownCoins[knownAddress],
    })
  }

  // For unknown addresses, generate a name and symbol based on the address
  const shortAddress = address.substring(0, 6)
  return NextResponse.json({
    address,
    name: `${shortAddress} Token`,
    symbol: shortAddress.toUpperCase(),
    imageUrl: `/placeholder.svg?height=100&width=100&query=${shortAddress}%20token`,
    exists: Math.random() > 0.3, // Randomly decide if it exists or not for demo purposes
  })
}
