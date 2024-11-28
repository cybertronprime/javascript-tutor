import ChatWindow from '@/components/ChatWindow'
import { Code2 } from 'lucide-react'

export default function Home() {
  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 flex-shrink-0">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Code2 className="w-8 h-8 text-purple-600" />
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text">
                  JavaScript Tutor
                </h1>
                <p className="text-xs text-gray-500">Your AI Coding Assistant</p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content - Using flex-grow to take remaining height */}
      <main className="flex-grow flex flex-col overflow-hidden">
        <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 h-full flex flex-col">
          {/* Welcome Section with reduced padding */}
          <div className="text-center py-6 flex-shrink-0">
           
          </div>

          {/* Chat Window - Takes remaining height */}
          <div className="flex-grow overflow-hidden pb-6">
            <ChatWindow />
          </div>
        </div>
      </main>
    </div>
  )
}