"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

interface TokenImageProps {
  src?: string
  alt: string
  symbol: string
  size?: "sm" | "md" | "lg"
  className?: string
}

export default function TokenImage({ src, alt, symbol, size = "md", className = "" }: TokenImageProps) {
  const [hasError, setHasError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  // Size mappings
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-16 h-16",
  }

  const sizeClass = sizeClasses[size]
  const placeholderSize = size === "sm" ? 32 : size === "md" ? 40 : 64

  // Reset error state when src changes
  useEffect(() => {
    setHasError(false)
    setImageLoaded(false)
  }, [src])

  // Fallback to placeholder or gradient with symbol
  const fallbackSrc = `/placeholder.svg?height=${placeholderSize}&width=${placeholderSize}&query=${symbol}`

  if (!src || hasError) {
    return (
      <div
        className={`${sizeClass} rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg ${className}`}
      >
        <span className={`font-bold ${size === "lg" ? "text-xl" : size === "md" ? "text-base" : "text-sm"}`}>
          {symbol.charAt(0)}
        </span>
      </div>
    )
  }

  // Use next/image for better image handling
  return (
    <div
      className={`relative ${sizeClass} rounded-full overflow-hidden shadow-lg border border-gray-700 bg-gray-800 flex items-center justify-center ${className}`}
    >
      {/* Show loading spinner until image loads */}
      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="w-1/3 h-1/3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* The actual image with proper styling */}
      <div className="relative w-full h-full">
        <Image
          src={src || "/placeholder.svg"}
          alt={alt}
          fill
          className={`transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
          style={{
            objectFit: "cover",
            objectPosition: "center",
          }}
          onError={() => setHasError(true)}
          onLoad={() => setImageLoaded(true)}
          unoptimized // Use this to ensure external images load properly
        />
      </div>
    </div>
  )
}
