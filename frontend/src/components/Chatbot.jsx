import { useState } from 'react'
import axios from 'axios'
import { MessageSquare, X, Send } from 'lucide-react' // Icons

function Chatbot() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState([
        { text: "Hello! I am PropOS AI. Ask me about your properties.", sender: "bot" }
    ])
    const [input, setInput] = useState("")

    const toggleChat = () => setIsOpen(!isOpen)

    const handleSend = async (e) => {
        e.preventDefault()
        if (!input.trim()) return

        // 1. Add User Message
        const userMessage = { text: input, sender: "user" }
        setMessages((prev) => [...prev, userMessage])
        setInput("")

        try {
            // 2. Send to Django (We will build this backend part next)
            // For now, it will just echo back
            const response = await axios.post('http://localhost:8000/api/chat/', { query: input })
            
            const botMessage = { text: response.data.response, sender: "bot" }
            setMessages((prev) => [...prev, botMessage])

        } catch (error) {
            console.error("Chat Error:", error)
            // Fallback for now if backend isn't ready
            setMessages((prev) => [...prev, { text: "I'm not connected to the brain yet! (Backend API missing)", sender: "bot" }])
        }
    }

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Chat Bubble Button */}
            {!isOpen && (
                <button 
                    onClick={toggleChat}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all hover:scale-110"
                >
                    <MessageSquare size={28} />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="bg-gray-800 border border-gray-700 w-80 md:w-96 rounded-lg shadow-2xl flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="bg-blue-700 p-4 flex justify-between items-center text-white">
                        <h3 className="font-bold flex items-center gap-2">🤖 PropOS AI</h3>
                        <button onClick={toggleChat} className="hover:text-gray-300">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="h-80 overflow-y-auto p-4 space-y-3 bg-gray-900">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-lg text-sm ${
                                    msg.sender === 'user' 
                                    ? 'bg-blue-600 text-white rounded-br-none' 
                                    : 'bg-gray-700 text-gray-200 rounded-bl-none'
                                }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} className="p-3 bg-gray-800 border-t border-gray-700 flex gap-2">
                        <input
                            type="text"
                            placeholder="Ask about properties..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="flex-1 bg-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 border border-transparent"
                        />
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded transition">
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            )}
        </div>
    )
}

export default Chatbot