import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="container mx-auto max-w-4xl p-4 flex items-center justify-center min-h-screen">
      <Card className="w-full shadow-lg">
        <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
          <CardTitle className="text-2xl">Crypto Chat App</CardTitle>
          <CardDescription className="text-white/80">Real-time chat for crypto communities</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <p>Welcome to the Crypto Chat App! Connect with other crypto enthusiasts in real-time.</p>
            <div className="flex justify-center">
              <Link href="/chat">
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                  Start Chatting
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-gray-50 text-xs text-gray-500 justify-center">
          Powered by Socket.IO and Next.js
        </CardFooter>
      </Card>
    </div>
  )
}
