/**
 * Image processing service to extract clean token images
 */

// Cache for processed images
const processedImageCache: Record<string, string> = {}

/**
 * Processes an image URL to extract just the token image
 * This function will be used to clean up images from pump.fun and other sources
 */
export async function processTokenImage(imageUrl: string): Promise<string> {
  // Check cache first
  if (processedImageCache[imageUrl]) {
    return processedImageCache[imageUrl]
  }

  // If it's a local image, return as is
  if (imageUrl.startsWith("/")) {
    return imageUrl
  }

  // For external images, we would ideally use a server-side API to process the image
  // For now, we'll use a client-side approach to extract just the token part

  try {
    // For pump.fun URLs, try to extract just the token image
    if (imageUrl.includes("pump.fun")) {
      // We would call our API to process the image
      const response = await fetch(`/api/process-image?url=${encodeURIComponent(imageUrl)}`)

      if (response.ok) {
        const data = await response.json()
        if (data.processedUrl) {
          processedImageCache[imageUrl] = data.processedUrl
          return data.processedUrl
        }
      }
    }

    // If we can't process it, return the original URL
    return imageUrl
  } catch (error) {
    console.error("Error processing token image:", error)
    return imageUrl
  }
}

/**
 * Gets a fallback image for a token
 */
export function getTokenFallbackImage(symbol: string): string {
  return `/placeholder.svg?height=100&width=100&query=${symbol}%20token`
}
