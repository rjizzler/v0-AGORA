// This is a mock API service that simulates fetching data from Raydium launchpad

// Specific token data for known contract addresses with CORRECT contract addresses from Raydium
const specificTokens = {
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
  },
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
  },
}

// Updated mock data for Raydium new launches with CORRECT contract addresses
const raydiumNewLaunches = [
  {
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
  },
  {
    address: "SHIBZ3pjtVxBZSMTJLm6Vc5JqhG7kZwUYHpvtVvZ8zb",
    name: "Shibarium",
    symbol: "SHIBZ",
    price: "$0.00000123",
    priceChange: 456.7,
    marketCap: "$5.6M",
    volume: "$2.3M",
    imageUrl: "/shibarium-coin.png",
    launchTime: "1 day ago",
    holders: 3456,
    liquidity: "$1.2M",
  },
  {
    address: "FLARE9D5YPYRxYTAklrWzCtTGVe9FS7Ldr6QGo7RaNj",
    name: "Flare",
    symbol: "FLARE",
    price: "$0.00000456",
    priceChange: 789.0,
    marketCap: "$8.9M",
    volume: "$3.4M",
    imageUrl: "/flare-coin.png",
    launchTime: "3 days ago",
    holders: 4567,
    liquidity: "$2.3M",
  },
  {
    address: "PIXEL3gZK8vQUPVtCuQZvdSQM8Y3QbVEXXNNYzBD8q3W",
    name: "Pixel",
    symbol: "PIXEL",
    price: "$0.00000345",
    priceChange: 234.5,
    marketCap: "$7.8M",
    volume: "$2.8M",
    imageUrl: "/pixel-coin.png",
    launchTime: "4 days ago",
    holders: 3456,
    liquidity: "$1.9M",
  },
  {
    address: "LUNA9GxgCnxBGgkCCDxPJE6ge6UJXNgpwKKhBEfzJQQk",
    name: "Luna Sol",
    symbol: "LUNAS",
    price: "$0.00000567",
    priceChange: 345.6,
    marketCap: "$9.0M",
    volume: "$3.2M",
    imageUrl: "/luna-sol-coin.png",
    launchTime: "5 days ago",
    holders: 5678,
    liquidity: "$2.5M",
  },
  {
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
  },
  {
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
  },
]

// Get trending coins based on platform
export async function getTrendingCoins(platform: "pump" | "raydium") {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  return raydiumNewLaunches
}

// Fetch token info based on contract address and platform
export async function fetchTokenInfo(contractAddress: string, platform: "pump" | "raydium") {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Check if we have specific data for this contract address
  if (specificTokens[contractAddress]) {
    return {
      ...specificTokens[contractAddress],
      isPositive: specificTokens[contractAddress].priceChange >= 0,
      change: Math.abs(specificTokens[contractAddress].priceChange).toFixed(2),
      platform,
    }
  }

  // Try to find the token in our mock data
  const foundToken = raydiumNewLaunches.find((token) => token.address === contractAddress)

  if (foundToken) {
    return {
      ...foundToken,
      isPositive: foundToken.priceChange >= 0,
      change: Math.abs(foundToken.priceChange).toFixed(2),
      platform,
    }
  }

  // If not found, generate random token info for a new launch
  const hash = contractAddress.slice(-6)
  const isPositive = true // New launches are typically positive
  const changeValue = (Math.random() * 500 + 100).toFixed(2) // High percentage for new launches

  // Generate token name and symbol based on contract address
  // This ensures the same contract address always gets the same name
  const contractSum = contractAddress.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0)
  const nameIndex = contractSum % 10
  const names = [
    "Solana Moon",
    "Sol Rocket",
    "Sol Pepe",
    "Solana Doge",
    "Sol Cat",
    "Solana Shib",
    "Sol Floki",
    "Solana Ape",
    "Sol Elon",
    "Solana Wojak",
  ]
  const symbols = ["SMOON", "SRKT", "SPEPE", "SDOGE", "SCAT", "SSHIB", "SFLOKI", "SAPE", "SELON", "SWJK"]

  const name = names[nameIndex]
  const symbol = symbols[nameIndex]
  const launchTimes = ["Just launched", "5 minutes ago", "15 minutes ago", "30 minutes ago", "1 hour ago"]
  const randomLaunchTime = launchTimes[Math.floor(Math.random() * launchTimes.length)]

  return {
    name,
    symbol,
    address: contractAddress,
    price: `$${(Math.random() * 0.0001).toFixed(8)}`,
    change: changeValue,
    isPositive,
    marketCap: `$${(Math.random() * 100 + 10).toFixed(1)}K`, // Lower market cap for new launches
    volume: `$${(Math.random() * 50 + 5).toFixed(1)}K`,
    imageUrl: `/placeholder.svg?height=100&width=100&query=${name.replace(" ", "%20")}%20meme%20coin`,
    platform,
    launchTime: randomLaunchTime,
    holders: Math.floor(Math.random() * 100) + 10, // Fewer holders for new launches
    liquidity: `$${(Math.random() * 50 + 5).toFixed(1)}K`,
  }
}

// Get token price history
export async function getTokenPriceHistory(
  contractAddress: string,
  platform: "pump" | "raydium",
  timeframe: "1h" | "24h" | "7d" | "30d",
) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Generate random price data based on timeframe
  const dataPoints = timeframe === "1h" ? 60 : timeframe === "24h" ? 24 : timeframe === "7d" ? 7 : 30
  const basePrice = Math.random() * 0.001
  const volatility = 0.05

  const data = []
  let currentPrice = basePrice

  for (let i = 0; i < dataPoints; i++) {
    // Random price movement
    const change = currentPrice * volatility * (Math.random() - 0.5)
    currentPrice += change

    // Ensure price is positive
    if (currentPrice <= 0) {
      currentPrice = basePrice * 0.1
    }

    // Format time label based on timeframe
    let timeLabel
    if (timeframe === "1h") {
      timeLabel = `${59 - i}m`
    } else if (timeframe === "24h") {
      timeLabel = `${23 - i}h`
    } else if (timeframe === "7d") {
      timeLabel = `${6 - i}d`
    } else {
      timeLabel = `${29 - i}d`
    }

    data.push({
      time: timeLabel,
      price: currentPrice,
    })
  }

  // Reverse to show oldest to newest
  return data.reverse()
}
