"use client"

import { useState, useEffect } from "react"
import { Line, LineChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

interface TokenChartProps {
  contractAddress: string
}

export default function TokenChart({ contractAddress }: TokenChartProps) {
  const [priceData, setPriceData] = useState<any[]>([])
  const [timeframe, setTimeframe] = useState<"1h" | "24h" | "7d" | "30d">("1h") // Default to 1h for new launches
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPriceData = async () => {
      setIsLoading(true)
      try {
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

        // For new launches, we want to show a dramatic upward trend
        const chartData = data.map((point, index) => ({
          ...point,
          // Increase the price exponentially for new launches to show dramatic growth
          price: point.price * Math.pow(1.1, index),
        }))

        setPriceData(chartData.reverse())
      } catch (error) {
        console.error("Error fetching price data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPriceData()
  }, [contractAddress, timeframe])

  if (isLoading) {
    return (
      <div className="h-64 bg-gray-900/30 rounded-lg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="bg-gray-900/30 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm font-medium">Price Chart (Since Launch)</div>
        <div className="flex space-x-2">
          {(["1h", "24h", "7d", "30d"] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2 py-1 text-xs rounded ${
                timeframe === tf ? "bg-indigo-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={priceData}>
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10, fill: "#9ca3af" }}
              axisLine={{ stroke: "#374151" }}
              tickLine={{ stroke: "#374151" }}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#9ca3af" }}
              axisLine={{ stroke: "#374151" }}
              tickLine={{ stroke: "#374151" }}
              domain={["dataMin", "dataMax"]}
            />
            <Tooltip
              contentStyle={{ backgroundColor: "#111827", borderColor: "#374151" }}
              itemStyle={{ color: "#e5e7eb" }}
              labelStyle={{ color: "#9ca3af" }}
              formatter={(value: any) => [`$${value.toFixed(8)}`, "Price"]}
            />
            <Line type="monotone" dataKey="price" stroke="url(#colorPrice)" dot={false} strokeWidth={2} />
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>
            </defs>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
