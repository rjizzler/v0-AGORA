import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const imageUrl = searchParams.get("url")

  if (!imageUrl) {
    return NextResponse.json({ error: "No image URL provided" }, { status: 400 })
  }

  try {
    // In a real implementation, we would:
    // 1. Fetch the image
    // 2. Use image processing to extract just the token part
    // 3. Return the processed image URL

    // For now, we'll just return a modified URL that indicates it's been processed
    // In a real implementation, this would be a URL to the processed image

    // Check if it's a pump.fun image
    if (imageUrl.includes("pump.fun")) {
      // Extract just the filename
      const filename = imageUrl.split("/").pop()

      // Return a URL to our processed version
      // In a real implementation, this would be a URL to the processed image
      return NextResponse.json({
        originalUrl: imageUrl,
        processedUrl: `/processed-tokens/${filename || "token.png"}`,
      })
    }

    // If we can't process it, return the original URL
    return NextResponse.json({
      originalUrl: imageUrl,
      processedUrl: imageUrl,
    })
  } catch (error) {
    console.error("Error processing image:", error)
    return NextResponse.json({ error: "Failed to process image" }, { status: 500 })
  }
}
