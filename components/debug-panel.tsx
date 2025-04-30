"use client"

import { useState, useEffect } from "react"

interface DebugPanelProps {
  contractAddress: string
}

export function DebugPanel({ contractAddress }: DebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [storageData, setStorageData] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!isOpen) return

    // Get all localStorage data related to this contract
    const updateStorageData = () => {
      const data: Record<string, string> = {}

      // Get all keys from localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.includes(contractAddress)) {
          try {
            const value = localStorage.getItem(key)
            data[key] = value || ""
          } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error)
          }
        }
      }

      setStorageData(data)
    }

    updateStorageData()

    // Update every second
    const interval = setInterval(updateStorageData, 1000)

    return () => clearInterval(interval)
  }, [isOpen, contractAddress])

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white px-3 py-1 rounded-md text-xs"
      >
        Debug
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 border border-gray-700 rounded-md p-4 w-96 max-h-96 overflow-auto">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium">Debug Panel</h3>
        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
          ×
        </button>
      </div>

      <div className="text-xs">
        <div className="mb-2">
          <strong>Contract Address:</strong> {contractAddress}
        </div>

        <div className="mb-2">
          <strong>localStorage Data:</strong>
        </div>

        {Object.entries(storageData).map(([key, value]) => (
          <div key={key} className="mb-2 border-t border-gray-800 pt-2">
            <div className="font-mono text-gray-400">{key}</div>
            <div className="font-mono text-gray-300 break-all max-h-20 overflow-auto">
              {value.length > 100 ? `${value.substring(0, 100)}...` : value}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
