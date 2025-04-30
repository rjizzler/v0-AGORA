import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generate a random username
export function generateRandomUsername(): string {
  const adjectives = ["Happy", "Lucky", "Sunny", "Clever", "Brave", "Mighty", "Gentle", "Swift", "Wise", "Calm"]
  const nouns = ["Trader", "Whale", "Rocket", "Moon", "Diamond", "Hodler", "Bull", "Bear", "Coin", "Token"]

  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)]
  const randomNumber = Math.floor(Math.random() * 1000)

  return `${randomAdjective}${randomNoun}${randomNumber}`
}

// Normalize contract address to ensure consistent storage and lookup
export function normalizeContractAddress(address: string): string {
  return address.trim()
}

// Simple validation for contract addresses
export function isValidContractAddress(address: string): boolean {
  // Basic validation for Solana addresses - more lenient now
  // Accept any string that's at least 32 characters long and contains valid base58 characters
  const isValidSolAddress = /^[1-9A-HJ-NP-Za-km-z]{32,}$/.test(address)

  // Known example addresses
  const knownAddresses = [
    "H6NPb6yNWrSrQoYT5FWoe4zpd4TA28igjxxpAJt1oJ6G", // MOG
    "BURNiEDAoJzLiMh1JgvQPU7gvMRL5LQJgSEMgL7SPAcz", // BURNIE
    "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R", // BONK
    "PEEPE1hYFPRpVqoLQjPEfbK7AqmJzhXpwREJFSsC2ne", // PEEPE
    "SHIBBO1111111111111111111111111111111111111", // SHIBBO
    "48mUFsfz8UzeDgujFVehRWPPgKG71jDbJmta2TXxpump", // SPHR (Sphere)
    "404TEST111111111111111111111111111111111111", // Test 404 case
  ]

  if (knownAddresses.includes(address)) {
    return true
  }

  // For demo purposes, accept any input that looks like a Solana address
  return isValidSolAddress
}
