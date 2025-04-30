"use client"

import { useState, useEffect } from "react"
import { authService, type User } from "@/lib/auth-service"
import { LogOut, UserIcon, Settings } from "lucide-react"

export function UserProfile() {
  const [user, setUser] = useState<User | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = authService.onAuthStateChanged((currentUser) => {
      setUser(currentUser)
    })

    return unsubscribe
  }, [])

  const handleLogout = () => {
    authService.logout()
    setIsMenuOpen(false)
  }

  if (!user) return null

  return (
    <div className="relative">
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 rounded-full p-1 transition-colors"
      >
        <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
          <span className="text-white font-bold">{user.username.charAt(0).toUpperCase()}</span>
        </div>
      </button>

      {isMenuOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)}></div>
          <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-800 rounded-lg shadow-lg z-20">
            <div className="p-3 border-b border-gray-800">
              <p className="font-medium text-white">{user.username}</p>
              {user.email && <p className="text-xs text-gray-400 truncate">{user.email}</p>}
            </div>
            <div className="p-2">
              <button
                className="flex items-center w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <UserIcon size={16} className="mr-2" />
                Profile
              </button>
              <button
                className="flex items-center w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Settings size={16} className="mr-2" />
                Settings
              </button>
              <button
                className="flex items-center w-full px-3 py-2 text-sm text-red-400 hover:bg-gray-800 rounded-md transition-colors"
                onClick={handleLogout}
              >
                <LogOut size={16} className="mr-2" />
                Logout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
