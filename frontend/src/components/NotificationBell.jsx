import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { Bell, X, CheckCircle, Wrench, AlertTriangle, Clock, Check } from 'lucide-react';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [unread, setUnread] = useState(0);
    const [open, setOpen] = useState(false);
    const [toast, setToast] = useState(null);
    const lastCountRef = useRef(0);
    const panelRef = useRef(null);

    const fetchCount = async () => {
        try {
            const res = await api.get('notifications/count/');
            const newCount = res.data.unread;
            
            // Show toast if count increased
            if (newCount > lastCountRef.current && lastCountRef.current > 0) {
                showToast();
            }
            lastCountRef.current = newCount;
            setUnread(newCount);
        } catch (err) {
            // silently fail
        }
    };

    const fetchNotifications = async () => {
        try {
            const res = await api.get('notifications/');
            setNotifications(res.data);
        } catch (err) {
            console.error("Failed to fetch notifications:", err);
        }
    };

    const showToast = async () => {
        try {
            const res = await api.get('notifications/');
            const latest = res.data.find(n => !n.is_read);
            if (latest) {
                setToast(latest);
                setTimeout(() => setToast(null), 5000);
            }
        } catch (err) {}
    };

    const markRead = async (id) => {
        try {
            await api.post(`notifications/${id}/read/`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnread(prev => Math.max(0, prev - 1));
        } catch (err) {}
    };

    const markAllRead = async () => {
        const unreadItems = notifications.filter(n => !n.is_read);
        for (const n of unreadItems) {
            await api.post(`notifications/${n.id}/read/`);
        }
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnread(0);
    };

    const handleToggle = () => {
        if (!open) fetchNotifications();
        setOpen(!open);
    };

    // Poll every 15 seconds
    useEffect(() => {
        fetchCount();
        const interval = setInterval(fetchCount, 15000);
        return () => clearInterval(interval);
    }, []);

    // Close panel on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const getIcon = (type) => {
        switch (type) {
            case 'TICKET_EMERGENCY': return <AlertTriangle size={16} className="text-red-400" />;
            case 'TICKET_CREATED': return <Wrench size={16} className="text-blue-400" />;
            case 'TICKET_ASSIGNED': return <Wrench size={16} className="text-orange-400" />;
            case 'TICKET_RESOLVED': return <CheckCircle size={16} className="text-green-400" />;
            default: return <Bell size={16} className="text-gray-400" />;
        }
    };

    const getBg = (type) => {
        switch (type) {
            case 'TICKET_EMERGENCY': return 'border-red-500/30 bg-red-900/10';
            case 'TICKET_ASSIGNED': return 'border-orange-500/30 bg-orange-900/10';
            case 'TICKET_RESOLVED': return 'border-green-500/30 bg-green-900/10';
            default: return 'border-gray-700 bg-gray-800';
        }
    };

    return (
        <>
            {/* Bell Button */}
            <div className="relative" ref={panelRef}>
                <button
                    onClick={handleToggle}
                    className="relative p-2 rounded-lg hover:bg-gray-800 transition text-gray-400 hover:text-white"
                >
                    <Bell size={20} />
                    {unread > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full animate-pulse">
                            {unread > 9 ? '9+' : unread}
                        </span>
                    )}
                </button>

                {/* Dropdown Panel */}
                {open && (
                    <div className="absolute right-0 top-12 w-80 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between p-3 border-b border-gray-700">
                            <h3 className="text-sm font-bold text-white">Notifications</h3>
                            <div className="flex items-center gap-2">
                                {unread > 0 && (
                                    <button
                                        onClick={markAllRead}
                                        className="text-[10px] text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"
                                    >
                                        <Check size={10} /> Mark all read
                                    </button>
                                )}
                                <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-white">
                                    <X size={16} />
                                </button>
                            </div>
                        </div>

                        {/* List */}
                        <div className="max-h-80 overflow-y-auto">
                            {notifications.length > 0 ? (
                                notifications.map(n => (
                                    <div
                                        key={n.id}
                                        onClick={() => !n.is_read && markRead(n.id)}
                                        className={`p-3 border-b border-gray-700/50 cursor-pointer transition hover:bg-gray-700/30 ${
                                            !n.is_read ? 'bg-gray-750/50' : 'opacity-60'
                                        }`}
                                    >
                                        <div className="flex items-start gap-2.5">
                                            <div className="mt-0.5 shrink-0">{getIcon(n.type)}</div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <p className={`text-xs font-bold truncate ${!n.is_read ? 'text-white' : 'text-gray-400'}`}>
                                                        {n.title}
                                                    </p>
                                                    {!n.is_read && (
                                                        <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0 ml-2" />
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-2">{n.message}</p>
                                                <p className="text-[10px] text-gray-600 mt-1">{n.time_ago}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center">
                                    <Bell size={24} className="text-gray-700 mx-auto mb-2" />
                                    <p className="text-gray-500 text-xs">No notifications yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Toast Popup */}
            {toast && (
                <div className="fixed top-4 right-4 z-[100] animate-slide-in">
                    <div className={`flex items-start gap-3 p-4 rounded-xl border shadow-2xl max-w-sm ${getBg(toast.type)}`}>
                        <div className="shrink-0 mt-0.5">{getIcon(toast.type)}</div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white">{toast.title}</p>
                            <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{toast.message}</p>
                        </div>
                        <button onClick={() => setToast(null)} className="text-gray-500 hover:text-white shrink-0">
                            <X size={14} />
                        </button>
                    </div>
                </div>
            )}

            {/* Toast animation CSS */}
            <style>{`
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .animate-slide-in { animation: slideIn 0.3s ease-out; }
            `}</style>
        </>
    );
};

export default NotificationBell;