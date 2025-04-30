/**
 * Utility functions for image processing
 */

/**
 * Determines if a URL is likely to be a token image
 * This helps filter out website UI elements from pump.fun
 */
export function isLikelyTokenImage(url: string): boolean {
  // Check if the URL contains common image paths
  const tokenImagePatterns = [
    "/token/",
    "/tokens/",
    "/coin/",
    "/coins/",
    "/logo/",
    "/logos/",
    "/icon/",
    "/icons/",
    ".png",
    ".jpg",
    ".jpeg",
    ".svg",
    ".webp",
  ]

  return tokenImagePatterns.some((pattern) => url.toLowerCase().includes(pattern))
}

/**
 * Gets a clean token image URL
 * If the URL is from pump.fun or similar sites, try to extract just the token image
 */
export function getCleanTokenImageUrl(url: string): string {
  // If it's a placeholder, return as is
  if (url.includes("/placeholder.svg")) {
    return url
  }

  // If it's a local image, return as is
  if (url.startsWith("/")) {
    return url
  }

  // For pump.fun URLs, try to extract just the token image
  if (url.includes("pump.fun")) {
    // Try to extract token image from pump.fun URL
    const tokenImageMatch = url.match(/\/images\/tokens\/([^/]+)/)
    if (tokenImageMatch && tokenImageMatch[1]) {
      return `/token-images/${tokenImageMatch[1]}`
    }
  }

  return url
}

/**
 * Generates a fallback image URL for a token
 */
export function getTokenFallbackImage(symbol: string, size = 100): string {
  return `/placeholder.svg?height=${size}&width=${size}&query=${symbol}%20token`
}
