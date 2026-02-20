import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { MessageSquare, X, Send, Bot, User, Loader, Sparkles, ArrowRight } from 'lucide-react';

function Chatbot() {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hello! I'm PropOS AI 🤖 I can answer questions about your property, payments, maintenance — or anything else! How can I help?", sender: "bot" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = { text: input, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        setInput('');
        setLoading(true);

        try {
            const res = await api.post('chat/', { 
                message: currentInput,
                history: messages.slice(-10),
            });

            const botMessage = { 
                text: res.data.response, 
                sender: 'bot',
                action: res.data.action || null,
            };
            setMessages(prev => [...prev, botMessage]);

        } catch (err) {
            console.error("Chat error:", err);
            setMessages(prev => [...prev, { 
                text: "Sorry, I couldn't process that right now. Please try again.", 
                sender: 'bot' 
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = (action) => {
        if (action?.route) {
            navigate(action.route);
            setIsOpen(false);
        }
    };

    const quickQuestions = [
        "When is my next payment?",
        "How many vacant units?",
        "Show me maintenance tickets",
    ];

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Floating Button */}
            {!isOpen && (
                <button 
                    onClick={() => setIsOpen(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white p-4 rounded-full shadow-xl transition-all hover:scale-110 group"
                >
                    <div className="relative">
                        <MessageSquare size={26} />
                        <Sparkles size={12} className="absolute -top-1 -right-1 text-yellow-300 animate-pulse" />
                    </div>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="bg-gray-800 border border-gray-700 w-[350px] md:w-[400px] rounded-2xl shadow-2xl flex flex-col overflow-hidden" style={{ height: '520px' }}>
                    
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-700 to-purple-700 p-4 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                <Bot size={18} className="text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-sm">PropOS AI</h3>
                                <p className="text-[10px] text-blue-200">Property assistant • Always online</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white p-1">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-900">
                        {messages.map((msg, index) => (
                            <div key={index}>
                                <div className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`flex items-start gap-2 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                                        {/* Avatar */}
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                                            msg.sender === 'user' 
                                                ? 'bg-blue-600' 
                                                : 'bg-purple-600'
                                        }`}>
                                            {msg.sender === 'user' 
                                                ? <User size={12} className="text-white" /> 
                                                : <Bot size={12} className="text-white" />
                                            }
                                        </div>
                                        {/* Bubble */}
                                        <div className={`p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                                            msg.sender === 'user' 
                                                ? 'bg-blue-600 text-white rounded-tr-sm' 
                                                : 'bg-gray-800 text-gray-200 rounded-tl-sm border border-gray-700'
                                        }`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                </div>
                                {/* Action Button */}
                                {msg.action && (
                                    <div className="flex justify-start ml-8 mt-2">
                                        <button
                                            onClick={() => handleAction(msg.action)}
                                            className="bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition"
                                        >
                                            {msg.action.label} <ArrowRight size={12} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Typing Indicator */}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center">
                                        <Bot size={12} className="text-white" />
                                    </div>
                                    <div className="bg-gray-800 border border-gray-700 p-3 rounded-2xl rounded-tl-sm">
                                        <div className="flex gap-1">
                                            <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Questions (only show at start) */}
                    {messages.length <= 1 && (
                        <div className="px-4 py-2 bg-gray-850 border-t border-gray-700 flex gap-2 overflow-x-auto">
                            {quickQuestions.map((q, i) => (
                                <button
                                    key={i}
                                    onClick={() => { setInput(q); }}
                                    className="bg-gray-700 hover:bg-gray-600 text-gray-300 text-[11px] px-3 py-1.5 rounded-full whitespace-nowrap transition border border-gray-600"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    <form onSubmit={handleSend} className="p-3 bg-gray-800 border-t border-gray-700 flex gap-2">
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Ask me anything..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={loading}
                            className="flex-1 bg-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600 disabled:opacity-50"
                        />
                        <button 
                            type="submit" 
                            disabled={loading || !input.trim()}
                            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white p-2.5 rounded-xl transition"
                        >
                            {loading ? <Loader size={18} className="animate-spin" /> : <Send size={18} />}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}

export default Chatbot;