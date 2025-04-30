"use client"

// API service to fetch data from pump.fun

export interface CoinData {
  address: string
  name: string
  symbol: string
  imageUrl?: string
  exists: boolean // Flag to indicate if the coin exists on pump.fun
}

// Cache for coin data to avoid refetching
const coinCache: Record<string, CoinData> = {}

// Function to get pump.fun URL for a coin
export function getPumpFunUrl(address: string): string {
  return `https://pump.fun/coin/${address}`
}

// Function to fetch coin data
export async function fetchCoinData(address: string): Promise<CoinData | null> {
  try {
    // Normalize the address to handle case sensitivity
    const normalizedAddress = address.trim()

    // Check cache first
    if (coinCache[normalizedAddress]) {
      return coinCache[normalizedAddress]
    }

    console.log(`Fetching data for ${normalizedAddress} from API...`)

    try {
      // Call our API route to fetch and parse the data from pump.fun
      const response = await fetch(`/api/pump/${normalizedAddress}`)

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`)
      }

      const data = await response.json()
      console.log(`API returned data:`, data)

      // Ensure the image URL is properly formatted
      if (data.imageUrl && !data.imageUrl.startsWith("http") && !data.imageUrl.startsWith("/")) {
        data.imageUrl = `/${data.imageUrl}`
      }

      // Cache the result
      coinCache[normalizedAddress] = data

      return data
    } catch (error) {
      console.error("Error fetching from API:", error)

      // Fallback to mock data if API fails
      console.log("Using mock data as fallback")
      const mockData = await getMockCoinData(normalizedAddress)
      if (mockData) {
        coinCache[normalizedAddress] = mockData
      }
      return mockData
    }
  } catch (error) {
    console.error("Error in fetchCoinData:", error)
    return null
  }
}

// Function to get mock coin data
async function getMockCoinData(address: string): Promise<CoinData | null> {
  // Database of known coins with EXACT contract addresses
  const knownCoins: Record<string, CoinData> = {
    BURNiEDAoJzLiMh1JgvQPU7gvMRL5LQJgSEMgL7SPAcz: {
      address: "BURNiEDAoJzLiMh1JgvQPU7gvMRL5LQJgSEMgL7SPAcz",
      name: "Burnie",
      symbol: "BURNIE",
      imageUrl: "/burnie-coin.png",
      exists: true,
    },
    "48mUFsfz8UzeDgujFVehRWPPgKG71jDbJmta2TXxpump": {
      address: "48mUFsfz8UzeDgujFVehRWPPgKG71jDbJmta2TXxpump",
      name: "Sphere",
      symbol: "SPHR",
      imageUrl: "/sphere-token.png",
      exists: true,
    },
    PEEPE1hYFPRpVqoLQjPEfbK7AqmJzhXpwREJFSsC2ne: {
      address: "PEEPE1hYFPRpVqoLQjPEfbK7AqmJzhXpwREJFSsC2ne",
      name: "Peepe",
      symbol: "PEEPE",
      imageUrl: "/peepe-coin.png",
      exists: true,
    },
    H6NPb6yNWrSrQoYT5FWoe4zpd4TA28igjxxpAJt1oJ6G: {
      address: "H6NPb6yNWrSrQoYT5FWoe4zpd4TA28igjxxpAJt1oJ6G",
      name: "Mog Coin",
      symbol: "MOG",
      imageUrl: "/mog-coin.png",
      exists: true,
    },
    "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R": {
      address: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
      name: "Bonk",
      symbol: "BONK",
      imageUrl: "/bonk-dog-solana-meme.png",
      exists: true,
    },
    // Add more known coins here as fallbacks
  }

  // Check if we have data for this address (case-insensitive)
  const knownAddressesLowerCase = Object.keys(knownCoins).map((addr) => addr.toLowerCase())
  const addressLowerCase = address.toLowerCase()

  const matchIndex = knownAddressesLowerCase.findIndex((addr) => addr === addressLowerCase)
  if (matchIndex !== -1) {
    const originalKey = Object.keys(knownCoins)[matchIndex]
    return knownCoins[originalKey]
  }

  // For unknown addresses, generate a name and symbol based on the address
  const shortAddress = address.substring(0, 6)
  const name = `${shortAddress} Token`
  const symbol = shortAddress.toUpperCase()

  return {
    address,
    name,
    symbol,
    imageUrl: `/placeholder.svg?height=100&width=100&query=${symbol}%20token`,
    exists: false,
  }
}
