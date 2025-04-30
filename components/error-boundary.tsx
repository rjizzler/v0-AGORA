"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw } from "lucide-react"

interface ErrorBoundaryProps {
  children: React.ReactNode
}

export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const errorHandler = (error: ErrorEvent) => {
      console.error("Caught error:", error)
      setError(error.error || new Error("Unknown error occurred"))
      setHasError(true)
    }

    window.addEventListener("error", errorHandler)

    return () => {
      window.removeEventListener("error", errorHandler)
    }
  }, [])

  if (hasError) {
    return (
      <div className="container mx-auto max-w-4xl p-4 flex items-center justify-center min-h-screen bg-black">
        <Alert variant="destructive" className="w-full bg-[#1E1E1E] border-red-600">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <p>{error?.message || "An unexpected error occurred while loading the application."}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="self-start mt-2 border-red-600 text-red-500 hover:bg-red-900/20"
            >
              <RefreshCw className="h-3 w-3 mr-1" /> Reload Page
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return <>{children}</>
}
