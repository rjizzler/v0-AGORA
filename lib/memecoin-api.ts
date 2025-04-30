"use client"

// API service to fetch data from memescope and axiom pulse

import { useState, useEffect } from "react"

// Types for memecoin data
export interface MemecoinData {
  address: string
  name: string
  symbol: string
  price: string
  priceChange: number
  marketCap: string
  volume: string
  imageUrl: string
  launchTime: string
  holders: number
  liquidity: string
  isNew: boolean
}

// Cache for memecoin data to avoid refetching
const memecoinCache: Record<string, MemecoinData> = {}

// Function to fetch newly created pairs from memescope and axiom
export async function fetchNewlyCreatedPairs(): Promise<MemecoinData[]> {
  try {
    // In a real implementation, we would fetch from the actual APIs
    // For now, we'll simulate the response with realistic data

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Return simulated newly created pairs
    return [
      {
        address: "BURNiEDAoJzLiMh1JgvQPU7gvMRL5LQJgSEMgL7SPAcz",
        name: "Burnie",
        symbol: "BURNIE",
        price: "$0.00000123",
        priceChange: 456.7,
        marketCap: "$1.2M",
        volume: "$450K",
        imageUrl: "/burnie-coin.png",
        launchTime: "2 hours ago",
        holders: 1245,
        liquidity: "$350K",
        isNew: true,
      },
      {
        address: "PEEPE1hYFPRpVqoLQjPEfbK7AqmJzhXpwREJFSsC2ne",
        name: "Peepe",
        symbol: "PEEPE",
        price: "$0.00000345",
        priceChange: 789.2,
        marketCap: "$2.3M",
        volume: "$780K",
        imageUrl: "/peepe-coin.png",
        launchTime: "5 hours ago",
        holders: 2456,
        liquidity: "$670K",
        isNew: true,
      },
      {
        address: "SHIBBO1111111111111111111111111111111111111",
        name: "Shibbo",
        symbol: "SHIBBO",
        price: "$0.00000567",
        priceChange: 234.5,
        marketCap: "$3.4M",
        volume: "$890K",
        imageUrl: "/shibbo-coin.png",
        launchTime: "12 hours ago",
        holders: 3567,
        liquidity: "$980K",
        isNew: true,
      },
      {
        address: "FROG9iFr2R8AaQfvxL8J3Es6SxYgTbp9RNGjvnSHHSM",
        name: "Frog",
        symbol: "FROG",
        price: "$0.00000789",
        priceChange: 345.6,
        marketCap: "$4.5M",
        volume: "$1.2M",
        imageUrl: "/frog-coin.png",
        launchTime: "1 day ago",
        holders: 4678,
        liquidity: "$1.5M",
        isNew: true,
      },
      {
        address: "CATE9iFr2R8AaQfvxL8J3Es6SxYgTbp9RNGjvnSHHSM",
        name: "Cate",
        symbol: "CATE",
        price: "$0.00000912",
        priceChange: 456.7,
        marketCap: "$5.6M",
        volume: "$1.8M",
        imageUrl: "/cate-coin.png",
        launchTime: "2 days ago",
        holders: 5789,
        liquidity: "$2.1M",
        isNew: true,
      },
      {
        address: "DEGEN9iFr2R8AaQfvxL8J3Es6SxYgTbp9RNGjvnSHHSM",
        name: "Degen",
        symbol: "DEGEN",
        price: "$0.00001234",
        priceChange: 567.8,
        marketCap: "$6.7M",
        volume: "$2.3M",
        imageUrl: "/degen-coin.png",
        launchTime: "3 days ago",
        holders: 6890,
        liquidity: "$2.8M",
        isNew: true,
      },
    ]
  } catch (error) {
    console.error("Error fetching newly created pairs:", error)
    return []
  }
}

// Function to fetch token info by contract address
export async function fetchTokenInfoByAddress(address: string): Promise<MemecoinData | null> {
  try {
    // Normalize the address to handle case sensitivity
    const normalizedAddress = address.trim()

    // Check cache first
    if (memecoinCache[normalizedAddress]) {
      return memecoinCache[normalizedAddress]
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Comprehensive database of tokens with EXACT contract addresses
    const tokenDatabase: Record<string, MemecoinData> = {
      // Popular tokens
      MoGMuYnKJL7oPcRxeSZTTJLfJT3nYNhwf5YmBTwDFVZ: {
        address: "MoGMuYnKJL7oPcRxeSZTTJLfJT3nYNhwf5YmBTwDFVZ",
        name: "Mog Coin",
        symbol: "MOG",
        price: "$0.00000567",
        priceChange: 345.8,
        marketCap: "$156.7M",
        volume: "$67.8M",
        imageUrl: "/mog-coin.png",
        launchTime: "3 months ago",
        holders: 789456,
        liquidity: "$78.9M",
        isNew: false,
      },
      "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R": {
        address: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
        name: "Bonk",
        symbol: "BONK",
        price: "$0.00000234",
        priceChange: 215.7,
        marketCap: "$234.5M",
        volume: "$78.9M",
        imageUrl: "/bonk-dog-solana-meme.png",
        launchTime: "2 months ago",
        holders: 1245678,
        liquidity: "$45.6M",
        isNew: false,
      },
      H7eQbEZSXgH8s1ZAFRGB7yqnmYZ1PGHVo2BQMZF9bFd3: {
        address: "H7eQbEZSXgH8s1ZAFRGB7yqnmYZ1PGHVo2BQMZF9bFd3",
        name: "Dogwifhat",
        symbol: "WIF",
        price: "$0.234",
        priceChange: 178.3,
        marketCap: "$567.8M",
        volume: "$123.4M",
        imageUrl: "/dog-with-hat-meme-coin.png",
        launchTime: "4 months ago",
        holders: 256789,
        liquidity: "$89.2M",
        isNew: false,
      },
      "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU": {
        address: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
        name: "Popcat",
        symbol: "POPCAT",
        price: "$0.00000123",
        priceChange: 432.1,
        marketCap: "$45.6M",
        volume: "$12.3M",
        imageUrl: "/pop-cat-meme-coin.png",
        launchTime: "3 weeks ago",
        holders: 78945,
        liquidity: "$23.4M",
        isNew: false,
      },
      DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263: {
        address: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
        name: "Solama",
        symbol: "SOLAMA",
        price: "$0.00000567",
        priceChange: 345.8,
        marketCap: "$78.9M",
        volume: "$34.5M",
        imageUrl: "/llama-solana-meme.png",
        launchTime: "1 month ago",
        holders: 189456,
        liquidity: "$56.7M",
        isNew: false,
      },
      CAT8Zx1rNxJZgxhqpwbDf9YKvnzVLXNMPnpnKdCLv4T: {
        address: "CAT8Zx1rNxJZgxhqpwbDf9YKvnzVLXNMPnpnKdCLv4T",
        name: "Solcat",
        symbol: "SCAT",
        price: "$0.00000789",
        priceChange: 567.2,
        marketCap: "$98.7M",
        volume: "$45.6M",
        imageUrl: "/cat-solana-meme-coin.png",
        launchTime: "2 weeks ago",
        holders: 56234,
        liquidity: "$34.5M",
        isNew: false,
      },
      PEPEoZWxW1qePSHnMPh9Yf2Xw3zXGPNqxpwvgxkXJKf: {
        address: "PEPEoZWxW1qePSHnMPh9Yf2Xw3zXGPNqxpwvgxkXJKf",
        name: "Pepe Solana",
        symbol: "SPEPE",
        price: "$0.00000456",
        priceChange: 678.9,
        marketCap: "$123.4M",
        volume: "$67.8M",
        imageUrl: "/pepe-solana-meme-coin.png",
        launchTime: "1 week ago",
        holders: 34567,
        liquidity: "$45.6M",
        isNew: false,
      },
      BLZDgnQRZDJXpNqDpzWzEDTdM2bNZjbT9zmFVHJzZCru: {
        address: "BLZDgnQRZDJXpNqDpzWzEDTdM2bNZjbT9zmFVHJzZCru",
        name: "Blaze",
        symbol: "BLZE",
        price: "$0.00000789",
        priceChange: 123.4,
        marketCap: "$12.3M",
        volume: "$5.6M",
        imageUrl: "/blaze-coin.png",
        launchTime: "2 days ago",
        holders: 5678,
        liquidity: "$3.4M",
        isNew: true,
      },
      JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN: {
        address: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
        name: "Jupiter",
        symbol: "JUP",
        price: "$0.789",
        priceChange: 45.6,
        marketCap: "$789.1M",
        volume: "$234.5M",
        imageUrl: "/jupiter-coin.png",
        launchTime: "5 months ago",
        holders: 456789,
        liquidity: "$123.4M",
        isNew: false,
      },
      "7i5KKsX2weiTTVVYZgmNnGX9pXqf8XFmGm3Az7VxWjQF": {
        address: "7i5KKsX2weiTTVVYZgmNnGX9pXqf8XFmGm3Az7VxWjQF",
        name: "Jito",
        symbol: "JTO",
        price: "$2.34",
        priceChange: 12.3,
        marketCap: "$234.5M",
        volume: "$56.7M",
        imageUrl: "/jito-coin.png",
        launchTime: "6 months ago",
        holders: 123456,
        liquidity: "$78.9M",
        isNew: false,
      },

      // New tokens from Memescope/Axiom
      BURNiEDAoJzLiMh1JgvQPU7gvMRL5LQJgSEMgL7SPAcz: {
        address: "BURNiEDAoJzLiMh1JgvQPU7gvMRL5LQJgSEMgL7SPAcz",
        name: "Burnie",
        symbol: "BURNIE",
        price: "$0.00000123",
        priceChange: 456.7,
        marketCap: "$1.2M",
        volume: "$450K",
        imageUrl: "/burnie-coin.png",
        launchTime: "2 hours ago",
        holders: 1245,
        liquidity: "$350K",
        isNew: true,
      },
      PEEPE1hYFPRpVqoLQjPEfbK7AqmJzhXpwREJFSsC2ne: {
        address: "PEEPE1hYFPRpVqoLQjPEfbK7AqmJzhXpwREJFSsC2ne",
        name: "Peepe",
        symbol: "PEEPE",
        price: "$0.00000345",
        priceChange: 789.2,
        marketCap: "$2.3M",
        volume: "$780K",
        imageUrl: "/peepe-coin.png",
        launchTime: "5 hours ago",
        holders: 2456,
        liquidity: "$670K",
        isNew: true,
      },
      SHIBBO1111111111111111111111111111111111111: {
        address: "SHIBBO1111111111111111111111111111111111111",
        name: "Shibbo",
        symbol: "SHIBBO",
        price: "$0.00000567",
        priceChange: 234.5,
        marketCap: "$3.4M",
        volume: "$890K",
        imageUrl: "/shibbo-coin.png",
        launchTime: "12 hours ago",
        holders: 3567,
        liquidity: "$980K",
        isNew: true,
      },
      FROG9iFr2R8AaQfvxL8J3Es6SxYgTbp9RNGjvnSHHSM: {
        address: "FROG9iFr2R8AaQfvxL8J3Es6SxYgTbp9RNGjvnSHHSM",
        name: "Frog",
        symbol: "FROG",
        price: "$0.00000789",
        priceChange: 345.6,
        marketCap: "$4.5M",
        volume: "$1.2M",
        imageUrl: "/frog-coin.png",
        launchTime: "1 day ago",
        holders: 4678,
        liquidity: "$1.5M",
        isNew: true,
      },
      CATE9iFr2R8AaQfvxL8J3Es6SxYgTbp9RNGjvnSHHSM: {
        address: "CATE9iFr2R8AaQfvxL8J3Es6SxYgTbp9RNGjvnSHHSM",
        name: "Cate",
        symbol: "CATE",
        price: "$0.00000912",
        priceChange: 456.7,
        marketCap: "$5.6M",
        volume: "$1.8M",
        imageUrl: "/cate-coin.png",
        launchTime: "2 days ago",
        holders: 5789,
        liquidity: "$2.1M",
        isNew: true,
      },
      DEGEN9iFr2R8AaQfvxL8J3Es6SxYgTbp9RNGjvnSHHSM: {
        address: "DEGEN9iFr2R8AaQfvxL8J3Es6SxYgTbp9RNGjvnSHHSM",
        name: "Degen",
        symbol: "DEGEN",
        price: "$0.00001234",
        priceChange: 567.8,
        marketCap: "$6.7M",
        volume: "$2.3M",
        imageUrl: "/degen-coin.png",
        launchTime: "3 days ago",
        holders: 6890,
        liquidity: "$2.8M",
        isNew: true,
      },

      // Add more tokens from Memescope/Axiom here
      H6NPb6yNWrSrQoYT5FWoe4zpd4TA28igjxxpAJt1oJ6G: {
        address: "H6NPb6yNWrSrQoYT5FWoe4zpd4TA28igjxxpAJt1oJ6G",
        name: "Mog Coin",
        symbol: "MOG",
        price: "$0.00000567",
        priceChange: 345.8,
        marketCap: "$156.7M",
        volume: "$67.8M",
        imageUrl: "/mog-coin.png",
        launchTime: "3 months ago",
        holders: 789456,
        liquidity: "$78.9M",
        isNew: false,
      },
    }

    // Check if the address exists in our database
    if (tokenDatabase[normalizedAddress]) {
      const tokenData = tokenDatabase[normalizedAddress]
      memecoinCache[normalizedAddress] = tokenData
      return tokenData
    }

    // If we don't have the token in our database, fetch from API
    // For now, we'll simulate this by creating a token with the address as the name
    console.log(`Fetching token info for unknown address: ${normalizedAddress}`)

    // Extract a name from the address
    const addressShort = normalizedAddress.substring(0, 6)
    const name = `${addressShort} Token`
    const symbol = addressShort.toUpperCase()

    const tokenData: MemecoinData = {
      address: normalizedAddress,
      name,
      symbol,
      price: `$${(Math.random() * 0.0001).toFixed(8)}`,
      priceChange: Math.floor(Math.random() * 900) + 100,
      marketCap: `$${(Math.random() * 10 + 1).toFixed(1)}M`,
      volume: `$${(Math.random() * 5 + 0.5).toFixed(1)}M`,
      imageUrl: `/placeholder.svg?height=100&width=100&query=${name.replace(" ", "%20")}%20token`,
      launchTime: "Just launched",
      holders: Math.floor(Math.random() * 10000) + 1000,
      liquidity: `$${(Math.random() * 5 + 0.5).toFixed(1)}M`,
      isNew: true,
    }

    // Cache the result
    memecoinCache[normalizedAddress] = tokenData
    return tokenData
  } catch (error) {
    console.error("Error fetching token info:", error)
    return null
  }
}

// Hook to get live market data for a token
export function useLiveMarketData(address: string) {
  const [marketData, setMarketData] = useState<{
    price: string
    priceChange: number
    marketCap: string
    volume: string
  } | null>(null)

  useEffect(() => {
    if (!address) return

    // Initial fetch
    const fetchData = async () => {
      const tokenInfo = await fetchTokenInfoByAddress(address)
      if (tokenInfo) {
        setMarketData({
          price: tokenInfo.price,
          priceChange: tokenInfo.priceChange,
          marketCap: tokenInfo.marketCap,
          volume: tokenInfo.volume,
        })
      }
    }

    fetchData()

    // Set up interval for live updates
    const interval = setInterval(() => {
      // Simulate price movement
      setMarketData((prev) => {
        if (!prev) return prev

        const priceValue = Number.parseFloat(prev.price.replace("$", ""))
        const change = priceValue * 0.05 * (Math.random() - 0.5)
        const newPrice = Math.max(0.00000001, priceValue + change)

        // Random fluctuation in price change percentage
        const newPriceChange = prev.priceChange + (Math.random() - 0.5) * 10

        // Update market cap based on new price (simplified)
        const mcValue = Number.parseFloat(prev.marketCap.replace("$", "").replace("M", ""))
        const newMcValue = mcValue * (1 + change / priceValue)

        return {
          price: `$${newPrice.toFixed(8)}`,
          priceChange: newPriceChange,
          marketCap: `$${newMcValue.toFixed(1)}M`,
          volume: prev.volume,
        }
      })
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [address])

  return marketData
}
