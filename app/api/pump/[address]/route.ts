import { NextResponse } from "next/server"

// Function to extract token name and symbol from HTML title
function extractTokenInfo(html: string): { name: string; symbol: string } | null {
  try {
    console.log("Extracting token info from HTML...")

    // Try different patterns to extract the title
    // Pattern 1: "Name (SYMBOL) | pump.fun"
    const titleMatch = html.match(/<title>(.*?)\s*$$(.*?)$$\s*\|.*?<\/title>/i)

    if (titleMatch && titleMatch[1] && titleMatch[2]) {
      console.log(`Found title match: ${titleMatch[1]} (${titleMatch[2]})`)
      return {
        name: titleMatch[1].trim(),
        symbol: titleMatch[2].trim(),
      }
    }

    // Pattern 2: Try to find name and symbol separately in the HTML
    const nameMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/i)
    const symbolMatch = html.match(/<span[^>]*class="[^"]*symbol[^"]*"[^>]*>(.*?)<\/span>/i)

    if (nameMatch && nameMatch[1] && symbolMatch && symbolMatch[1]) {
      console.log(`Found separate name and symbol: ${nameMatch[1]} (${symbolMatch[1]})`)
      return {
        name: nameMatch[1].trim(),
        symbol: symbolMatch[1].trim(),
      }
    }

    // Pattern 3: Extract from meta tags
    const metaTitle = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i)
    if (metaTitle && metaTitle[1]) {
      const parts = metaTitle[1]
        .split("|")[0]
        .trim()
        .match(/(.*?)\s*$$(.*?)$$/)
      if (parts && parts[1] && parts[2]) {
        console.log(`Found meta title: ${parts[1]} (${parts[2]})`)
        return {
          name: parts[1].trim(),
          symbol: parts[2].trim(),
        }
      }
    }

    // If we can't extract both name and symbol, use the page title as name
    const pageTitle = html.match(/<title>(.*?)<\/title>/i)
    if (pageTitle && pageTitle[1]) {
      const cleanTitle = pageTitle[1].split("|")[0].trim()
      console.log(`Using page title as fallback: ${cleanTitle}`)
      return {
        name: cleanTitle,
        symbol: cleanTitle.substring(0, 5).toUpperCase(),
      }
    }

    console.log("Could not extract token info from HTML")
    return null
  } catch (error) {
    console.error("Error extracting token info:", error)
    return null
  }
}

// Function to extract token image URL from HTML
function extractTokenImage(html: string): string | null {
  try {
    console.log("Extracting token image from HTML...")

    // Look for specific token image elements first
    const tokenImagePatterns = [
      // Look for specific token image elements with classes
      /<img[^>]+class="[^"]*(?:token-image|coin-image|token-logo|coin-logo)[^"]*"[^>]+src="([^"]+)"/i,

      // Look for image inside token header
      /<div[^>]+class="[^"]*(?:token-header|coin-header)[^"]*"[^>]*>(?:.*?)<img[^>]+src="([^"]+)"/is,

      // Look for the og:image meta tag
      /<meta\s+property="og:image"\s+content="([^"]+)"/i,

      // Look for any image with token or coin in the URL
      /<img[^>]+src="([^"]*(?:token|coin)[^"]*)"/i,
    ]

    // Try each pattern until we find a match
    for (const pattern of tokenImagePatterns) {
      const match = html.match(pattern)
      if (match && match[1]) {
        console.log(`Found token image: ${match[1]}`)
        return match[1]
      }
    }

    console.log("Could not extract token image from HTML")
    return null
  } catch (error) {
    console.error("Error extracting token image:", error)
    return null
  }
}

export async function GET(request: Request, { params }: { params: { address: string } }) {
  const address = params.address

  try {
    console.log(`Fetching data for ${address} from pump.fun...`)

    // Fetch the HTML from pump.fun
    const response = await fetch(`https://pump.fun/coin/${address}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    })

    if (!response.ok) {
      if (response.status === 404) {
        console.log(`Token ${address} not found on pump.fun (404)`)
        // Coin doesn't exist on pump.fun
        return NextResponse.json(
          {
            address,
            name: `Unknown Token`,
            symbol: address.substring(0, 6).toUpperCase(),
            exists: false,
            imageUrl: `/placeholder.svg?height=100&width=100&query=unknown%20token`,
          },
          { status: 200 },
        )
      }

      throw new Error(`Failed to fetch coin data: ${response.status}`)
    }

    const html = await response.text()

    // For debugging, log a small sample of the HTML
    console.log(`Received HTML (first 200 chars): ${html.substring(0, 200)}...`)

    // Extract token info from HTML
    const tokenInfo = extractTokenInfo(html)
    const imageUrl = extractTokenImage(html)

    if (!tokenInfo) {
      console.log("Failed to extract token info, using fallback data")
      // Use fallback data if we can't extract token info
      return NextResponse.json(
        {
          address,
          name: address.substring(0, 6) + " Token",
          symbol: address.substring(0, 6).toUpperCase(),
          exists: true, // We got a valid page, just couldn't parse it
          imageUrl: imageUrl || `/placeholder.svg?height=100&width=100&query=${address.substring(0, 6)}%20token`,
        },
        { status: 200 },
      )
    }

    // Return the parsed data
    return NextResponse.json({
      address,
      name: tokenInfo.name,
      symbol: tokenInfo.symbol,
      imageUrl: imageUrl || `/placeholder.svg?height=100&width=100&query=${tokenInfo.name}%20token`,
      exists: true,
    })
  } catch (error) {
    console.error("Error in API route:", error)

    // Fallback to mock data if API fails
    return NextResponse.json(
      {
        address,
        name: address.substring(0, 6) + " Token",
        symbol: address.substring(0, 6).toUpperCase(),
        exists: false,
        imageUrl: `/placeholder.svg?height=100&width=100&query=unknown%20token`,
      },
      { status: 200 },
    )
  }
}
