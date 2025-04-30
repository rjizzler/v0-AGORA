export default function Agora() {
  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full bg-black/70 backdrop-blur-md z-50 border-b border-red-600 p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-red-500">AGORA</h1>
        <div className="space-x-4">
          <a href="#features" className="hover:underline text-white">
            Features
          </a>
          <a href="#how" className="hover:underline text-white">
            How It Works
          </a>
          <a href="/chat" className="hover:underline text-white">
            Join
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        className="h-screen flex flex-col justify-center items-center text-center px-4"
        style={{ background: "linear-gradient(to bottom right, #1E1E1E, #000)" }}
      >
        <h2 className="text-5xl md:text-7xl font-extrabold text-red-500 mb-4">Welcome to AGORA</h2>
        <p className="text-lg md:text-xl max-w-xl mb-6 text-gray-300">
          Where conversation meets code. Enter a decentralized chatroom by address and speak freely.
        </p>
        <a href="/chat">
          <button className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-full transition duration-300">
            Enter the Chat
          </button>
        </a>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-[#121212] text-center">
        <h3 className="text-4xl font-bold text-red-500 mb-12">Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-[#1E1E1E] p-6 rounded-2xl shadow-md hover:shadow-red-500 transition">
            <div className="text-3xl mb-4">🔐</div>
            <h4 className="text-xl font-semibold">Secure by Design</h4>
            <p className="text-gray-400 mt-2">Chats are tied to addresses, ensuring privacy and decentralization.</p>
          </div>
          <div className="bg-[#1E1E1E] p-6 rounded-2xl shadow-md hover:shadow-red-500 transition">
            <div className="text-3xl mb-4">🔄</div>
            <h4 className="text-xl font-semibold">Real-time Communication</h4>
            <p className="text-gray-400 mt-2">Messages appear instantly, connecting communities worldwide.</p>
          </div>
          <div className="bg-[#1E1E1E] p-6 rounded-2xl shadow-md hover:shadow-red-500 transition">
            <div className="text-3xl mb-4">🌍</div>
            <h4 className="text-xl font-semibold">Community Driven</h4>
            <p className="text-gray-400 mt-2">Anyone can create or join chatrooms by contract or coin address.</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="py-20 px-4 bg-black text-center">
        <h3 className="text-4xl font-bold text-red-500 mb-12">How It Works</h3>
        <div className="flex flex-col md:flex-row justify-center gap-8 max-w-5xl mx-auto">
          <div className="bg-[#1E1E1E] p-6 rounded-xl">
            <div className="text-3xl mb-2">1️⃣</div>
            <p>Enter a Coin or Contract Address</p>
          </div>
          <div className="bg-[#1E1E1E] p-6 rounded-xl">
            <div className="text-3xl mb-2">2️⃣</div>
            <p>Open or Join a Room</p>
          </div>
          <div className="bg-[#1E1E1E] p-6 rounded-xl">
            <div className="text-3xl mb-2">3️⃣</div>
            <p>Start Chatting Live with Others</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 bg-[#121212] text-center text-gray-500">
        &copy; 2025 AGORA. Built for open communication.
      </footer>
    </div>
  )
}
