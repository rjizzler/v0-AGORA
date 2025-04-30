"use client"

import { useState } from "react"
import { X, ZoomIn, ZoomOut } from "lucide-react"
import Image from "next/image"

interface TokenImageModalProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string
  tokenName: string
  tokenSymbol: string
}

export default function TokenImageModal({ isOpen, onClose, imageUrl, tokenName, tokenSymbol }: TokenImageModalProps) {
  const [hasError, setHasError] = useState(false)
  const [scale, setScale] = useState(1)
  const [isLoading, setIsLoading] = useState(true)

  if (!isOpen) return null

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 3))
  }

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.25, 0.5))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={onClose}>
      <div
        className="bg-gray-900 border border-gray-800 rounded-lg p-4 max-w-sm w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">
            {tokenName} <span className="text-gray-400">({tokenSymbol})</span>
          </h3>
          <div className="flex items-center space-x-2">
            <button onClick={zoomOut} className="text-gray-400 hover:text-white p-1">
              <ZoomOut size={18} />
            </button>
            <button onClick={zoomIn} className="text-gray-400 hover:text-white p-1">
              <ZoomIn size={18} />
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 flex items-center justify-center overflow-hidden">
          {hasError ? (
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <span className="text-2xl font-bold">{tokenSymbol.charAt(0)}</span>
            </div>
          ) : (
            <div className="relative w-full h-48 flex items-center justify-center overflow-hidden">
              <div
                className="relative w-full h-full flex items-center justify-center"
                style={{ transform: `scale(${scale})`, transition: "transform 200ms" }}
              >
                <Image
                  src={imageUrl || "/placeholder.svg"}
                  alt={`${tokenName} (${tokenSymbol})`}
                  width={200}
                  height={200}
                  className="max-w-full max-h-full object-contain"
                  onError={() => setHasError(true)}
                  onLoad={() => setIsLoading(false)}
                  unoptimized // Use this to ensure external images load properly
                />
              </div>
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-4 text-center text-sm text-gray-400">Click outside to close</div>
      </div>
    </div>
  )
}
