import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useTheme } from '../context/ThemeContext';
import { MessageSquare, X, Send, Bot, User, Loader, Sparkles, ArrowRight } from 'lucide-react';

function Chatbot() {
    const { c, isDark } = useTheme();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hello! I'm PropAI Assistant. I can answer questions about your property, payments, maintenance — or anything else! How can I help?", sender: "bot" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
    useEffect(() => { if (isOpen && inputRef.current) inputRef.current.focus(); }, [isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;
        const userMessage = { text: input, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        setInput('');
        setLoading(true);
        try {
            const res = await api.post('chat/', { message: currentInput, history: messages.slice(-10) });
            setMessages(prev => [...prev, { text: res.data.response, sender: 'bot', action: res.data.action || null }]);
        } catch {
            setMessages(prev => [...prev, { text: "Sorry, I couldn't process that right now. Please try again.", sender: 'bot' }]);
        } finally { setLoading(false); }
    };

    const handleAction = (action) => { if (action?.route) { navigate(action.route); setIsOpen(false); } };

    const quickQuestions = ["When is my next payment?", "How many vacant units?", "Show maintenance tickets"];

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {!isOpen && (
                <button onClick={() => setIsOpen(true)}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white p-4 rounded-2xl shadow-xl shadow-amber-500/30 transition-all hover:scale-110">
                    <div className="relative">
                        <MessageSquare size={24} />
                        <Sparkles size={10} className="absolute -top-1 -right-1 text-white animate-pulse" />
                    </div>
                </button>
            )}

            {isOpen && (
                <div className={'w-[360px] md:w-[400px] rounded-2xl overflow-hidden flex flex-col border ' + c.card + ' ' + c.border + ' ' + c.shadow} style={{ height: '520px' }}>
                    <div className="bg-gradient-to-r from-amber-600 to-amber-500 p-4 flex justify-between items-center">
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                                <Bot size={18} className="text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-sm">PropAI Assistant</h3>
                                <p className="text-[10px] text-amber-100">AI-powered property support</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white p-1"><X size={18} /></button>
                    </div>

                    <div className={'flex-1 overflow-y-auto p-4 space-y-3 ' + c.bg}>
                        {messages.map((msg, i) => (
                            <div key={i}>
                                <div className={'flex ' + (msg.sender === 'user' ? 'justify-end' : 'justify-start')}>
                                    <div className={'flex items-start gap-2 max-w-[85%] ' + (msg.sender === 'user' ? 'flex-row-reverse' : '')}>
                                        <div className={'w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1 ' + (msg.sender === 'user' ? 'bg-amber-500' : (isDark ? 'bg-slate-700' : 'bg-gray-200'))}>
                                            {msg.sender === 'user' ? <User size={12} className="text-white" /> : <Bot size={12} className={c.accent} />}
                                        </div>
                                        <div className={(msg.sender === 'user'
                                            ? 'bg-amber-500 text-white rounded-2xl rounded-tr-sm'
                                            : 'rounded-2xl rounded-tl-sm border ' + c.card + ' ' + c.border + ' ' + c.text
                                        ) + ' p-3 text-sm leading-relaxed whitespace-pre-wrap'}>
                                            {msg.text}
                                        </div>
                                    </div>
                                </div>
                                {msg.action && (
                                    <div className="flex justify-start ml-8 mt-2">
                                        <button onClick={() => handleAction(msg.action)}
                                            className={'px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition border ' + c.accentBg + ' hover:opacity-80'}>
                                            {msg.action.label} <ArrowRight size={12} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="flex items-center gap-2">
                                    <div className={'w-6 h-6 rounded-full flex items-center justify-center ' + (isDark ? 'bg-slate-700' : 'bg-gray-200')}>
                                        <Bot size={12} className={c.accent} />
                                    </div>
                                    <div className={'p-3 rounded-2xl rounded-tl-sm border ' + c.card + ' ' + c.border}>
                                        <div className="flex gap-1">
                                            <span className={'w-2 h-2 rounded-full animate-bounce ' + (isDark ? 'bg-gray-500' : 'bg-gray-400')} style={{ animationDelay: '0ms' }} />
                                            <span className={'w-2 h-2 rounded-full animate-bounce ' + (isDark ? 'bg-gray-500' : 'bg-gray-400')} style={{ animationDelay: '150ms' }} />
                                            <span className={'w-2 h-2 rounded-full animate-bounce ' + (isDark ? 'bg-gray-500' : 'bg-gray-400')} style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {messages.length <= 1 && (
                        <div className={'px-4 py-2 border-t flex gap-2 overflow-x-auto ' + c.border + ' ' + c.card}>
                            {quickQuestions.map((q, i) => (
                                <button key={i} onClick={() => setInput(q)}
                                    className={'text-[11px] px-3 py-1.5 rounded-full whitespace-nowrap transition border ' + c.btn2}>
                                    {q}
                                </button>
                            ))}
                        </div>
                    )}

                    <form onSubmit={handleSend} className={'p-3 border-t flex gap-2 ' + c.border + ' ' + c.card}>
                        <input ref={inputRef} type="text" placeholder="Ask me anything..." value={input}
                            onChange={(e) => setInput(e.target.value)} disabled={loading}
                            className={'flex-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 border disabled:opacity-50 ' + c.input + ' ' + c.text} />
                        <button type="submit" disabled={loading || !input.trim()}
                            className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-white p-2.5 rounded-xl transition">
                            {loading ? <Loader size={18} className="animate-spin" /> : <Send size={18} />}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}

export default Chatbot;