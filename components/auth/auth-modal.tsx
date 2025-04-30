"use client"

import { useState } from "react"
import { LoginForm } from "./login-form"
import { RegisterForm } from "./register-form"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">("login")

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 w-full max-w-md">
        {mode === "login" ? (
          <LoginForm onSuccess={onClose} onRegisterClick={() => setMode("register")} />
        ) : (
          <RegisterForm onSuccess={onClose} onLoginClick={() => setMode("login")} />
        )}
      </div>
    </div>
  )
}
