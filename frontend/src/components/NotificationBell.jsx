import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { useTheme } from '../context/ThemeContext';
import { Bell, X, CheckCircle, Wrench, AlertTriangle, Clock, Check } from 'lucide-react';

const NotificationBell = () => {
    const { c, isDark } = useTheme();
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
            if (newCount > lastCountRef.current && lastCountRef.current > 0) showToast();
            lastCountRef.current = newCount;
            setUnread(newCount);
        } catch (err) {}
    };

    const fetchNotifications = async () => {
        try { const res = await api.get('notifications/'); setNotifications(res.data); }
        catch (err) { console.error("Failed:", err); }
    };

    const showToast = async () => {
        try {
            const res = await api.get('notifications/');
            const latest = res.data.find(n => !n.is_read);
            if (latest) { setToast(latest); setTimeout(() => setToast(null), 5000); }
        } catch (err) {}
    };

    const markRead = async (id) => {
        try {
            await api.post('notifications/' + id + '/read/');
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnread(prev => Math.max(0, prev - 1));
        } catch (err) {}
    };

    const markAllRead = async () => {
        for (const n of notifications.filter(n => !n.is_read)) await api.post('notifications/' + n.id + '/read/');
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnread(0);
    };

    const handleToggle = () => { if (!open) fetchNotifications(); setOpen(!open); };

    useEffect(() => { fetchCount(); const i = setInterval(fetchCount, 15000); return () => clearInterval(i); }, []);
    useEffect(() => {
        const h = (e) => { if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    const getIcon = (type) => {
        switch (type) {
            case 'TICKET_EMERGENCY': return <AlertTriangle size={16} className={c.red} />;
            case 'TICKET_CREATED': return <Wrench size={16} className={c.blue} />;
            case 'TICKET_ASSIGNED': return <Wrench size={16} className={c.accent} />;
            case 'TICKET_RESOLVED': return <CheckCircle size={16} className={c.green} />;
            default: return <Bell size={16} className={c.textMut} />;
        }
    };

    const getBg = (type) => {
        switch (type) {
            case 'TICKET_EMERGENCY': return c.redBg;
            case 'TICKET_ASSIGNED': return c.yellowBg;
            case 'TICKET_RESOLVED': return c.greenBg;
            default: return c.card + ' ' + c.border;
        }
    };

    return (
        <>
            <div className="relative" ref={panelRef}>
                <button onClick={handleToggle}
                    className={"relative p-2 rounded-xl transition " + (isDark ? "hover:bg-white/5" : "hover:bg-gray-100") + " " + c.textSec}>
                    <Bell size={20} />
                    {unread > 0 && (
                        <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full animate-pulse">
                            {unread > 9 ? '9+' : unread}
                        </span>
                    )}
                </button>

                {open && (
                    <div className={"absolute right-0 top-12 w-80 rounded-2xl border overflow-hidden z-50 " + c.card + " " + c.border + " " + c.shadow}>
                        <div className={"flex items-center justify-between p-3 border-b " + c.border}>
                            <h3 className={"text-sm font-bold " + c.heading}>Notifications</h3>
                            <div className="flex items-center gap-2">
                                {unread > 0 && (
                                    <button onClick={markAllRead} className={"text-[10px] font-bold flex items-center gap-1 " + c.accent}>
                                        <Check size={10} /> Mark all read
                                    </button>
                                )}
                                <button onClick={() => setOpen(false)} className={c.textMut + " hover:opacity-70"}><X size={16} /></button>
                            </div>
                        </div>

                        <div className="max-h-80 overflow-y-auto">
                            {notifications.length > 0 ? notifications.map(n => (
                                <div key={n.id} onClick={() => !n.is_read && markRead(n.id)}
                                    className={"p-3 border-b cursor-pointer transition " + c.border + " " +
                                        (isDark ? "hover:bg-white/[0.02]" : "hover:bg-gray-50") + " " +
                                        (!n.is_read ? "" : "opacity-50")}>
                                    <div className="flex items-start gap-2.5">
                                        <div className="mt-0.5 shrink-0">{getIcon(n.type)}</div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <p className={"text-xs font-bold truncate " + (!n.is_read ? c.heading : c.textMut)}>{n.title}</p>
                                                {!n.is_read && <span className="w-2 h-2 bg-amber-500 rounded-full shrink-0 ml-2" />}
                                            </div>
                                            <p className={"text-[11px] mt-0.5 line-clamp-2 " + c.textSec}>{n.message}</p>
                                            <p className={"text-[10px] mt-1 " + c.textMut}>{n.time_ago}</p>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="p-8 text-center">
                                    <Bell size={24} className={c.textMut + " mx-auto mb-2"} />
                                    <p className={"text-xs " + c.textMut}>No notifications yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {toast && (
                <div className="fixed top-4 right-4 z-[100] animate-slide-in">
                    <div className={"flex items-start gap-3 p-4 rounded-2xl border max-w-sm " + getBg(toast.type) + " " + c.shadow}>
                        <div className="shrink-0 mt-0.5">{getIcon(toast.type)}</div>
                        <div className="flex-1 min-w-0">
                            <p className={"text-sm font-bold " + c.heading}>{toast.title}</p>
                            <p className={"text-xs mt-0.5 line-clamp-2 " + c.textSec}>{toast.message}</p>
                        </div>
                        <button onClick={() => setToast(null)} className={c.textMut + " hover:opacity-70 shrink-0"}><X size={14} /></button>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
                .animate-slide-in { animation: slideIn 0.3s ease-out; }
            `}</style>
        </>
    );
};

export default NotificationBell;