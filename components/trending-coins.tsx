"use client"

import { useState, useEffect } from "react"
import { fetchNewlyCreatedPairs, type MemecoinData } from "@/lib/memecoin-api"

interface TrendingCoinsProps {
  onSelectCoin: (address: string) => void
}

export default function TrendingCoins({ onSelectCoin }: TrendingCoinsProps) {
  const [coins, setCoins] = useState<MemecoinData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortBy, setSortBy] = useState<"newest" | "marketCap" | "volume">("newest")
  const [dataSource, setDataSource] = useState<"memescope" | "axiom">("memescope")

  useEffect(() => {
    const fetchCoins = async () => {
      setIsLoading(true)
      try {
        const newlyCreatedPairs = await fetchNewlyCreatedPairs()
        setCoins(newlyCreatedPairs)
      } catch (error) {
        console.error("Error fetching newly created pairs:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCoins()
  }, [dataSource])

  const toggleDataSource = () => {
    setDataSource(dataSource === "memescope" ? "axiom" : "memescope")
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-gray-900/50 rounded-lg p-4 animate-pulse">
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 bg-gray-800 rounded-full mr-3"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-800 rounded w-20 mb-2"></div>
                <div className="h-3 bg-gray-800 rounded w-12"></div>
              </div>
            </div>
            <div className="h-3 bg-gray-800 rounded w-full mt-3"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <div className="text-sm text-gray-400">Data source:</div>
          <button onClick={toggleDataSource} className="px-3 py-1 text-xs rounded bg-indigo-600 text-white">
            {dataSource === "memescope" ? "Memescope" : "Axiom Pulse"}
          </button>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setSortBy("newest")}
            className={`px-2 py-1 text-xs rounded ${
              sortBy === "newest" ? "bg-indigo-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            Newest
          </button>
          <button
            onClick={() => setSortBy("marketCap")}
            className={`px-2 py-1 text-xs rounded ${
              sortBy === "marketCap" ? "bg-indigo-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            Market Cap
          </button>
          <button
            onClick={() => setSortBy("volume")}
            className={`px-2 py-1 text-xs rounded ${
              sortBy === "volume" ? "bg-indigo-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            Volume
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {coins.map((coin) => (
          <div
            key={coin.address}
            className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 hover:bg-gray-800/50 transition-colors cursor-pointer"
            onClick={() => onSelectCoin(coin.address)}
          >
            <div className="flex items-center mb-3">
              <img
                src={coin.imageUrl || "/placeholder.svg"}
                alt={coin.name}
                className="w-10 h-10 rounded-full object-cover mr-3"
              />
              <div>
                <h3 className="font-medium text-white">{coin.name}</h3>
                <div className="flex items-center text-sm">
                  <span className="text-gray-400 mr-2">{coin.symbol}</span>
                  <span className="text-green-500">+{coin.priceChange.toFixed(1)}%</span>
                </div>
              </div>
              <div className="ml-auto bg-indigo-900/30 text-indigo-300 text-xs px-2 py-1 rounded">
                {coin.launchTime}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs mt-3">
              <div className="bg-gray-800/50 rounded p-2">
                <div className="text-gray-400">Price</div>
                <div className="text-white font-medium">{coin.price}</div>
              </div>
              <div className="bg-gray-800/50 rounded p-2">
                <div className="text-gray-400">Market Cap</div>
                <div className="text-white font-medium">{coin.marketCap}</div>
              </div>
              <div className="bg-gray-800/50 rounded p-2">
                <div className="text-gray-400">Liquidity</div>
                <div className="text-white font-medium">{coin.liquidity}</div>
              </div>
              <div className="bg-gray-800/50 rounded p-2">
                <div className="text-gray-400">Holders</div>
                <div className="text-white font-medium">{coin.holders}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
