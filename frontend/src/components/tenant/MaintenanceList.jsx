import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import TenantNav from './TenantNav';
import { useTheme } from '../../context/ThemeContext';
import { Wrench, Loader, CheckCircle, Clock, AlertCircle, AlertTriangle, Plus } from 'lucide-react';

const MaintenanceList = () => {
    const { c, isDark } = useTheme();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        const fetchProfile = async () => {
            try { const res = await api.get('me/'); setProfile(res.data); }
            catch (err) { console.error("Failed to load profile", err); }
            finally { setLoading(false); }
        };
        fetchProfile();
    }, []);

    const getPriorityStyle = (p) => {
        if (p === 'EMERGENCY') return c.redBg; if (p === 'HIGH') return c.yellowBg;
        if (p === 'MEDIUM') return c.blueBg; return isDark ? 'bg-gray-700 text-gray-400 border-gray-600' : 'bg-gray-100 text-gray-500 border-gray-200';
    };
    const getStatusIcon = (s) => {
        if (s === 'RESOLVED' || s === 'CLOSED') return <CheckCircle size={18} className={c.green} />;
        if (s === 'IN_PROGRESS') return <Clock size={18} className={c.yellow} />;
        if (s === 'OPEN') return <AlertCircle size={18} className={c.blue} />;
        return <Clock size={18} className={c.textMut} />;
    };
    const getStatusColor = (s) => {
        if (s === 'RESOLVED' || s === 'CLOSED') return c.green; if (s === 'IN_PROGRESS') return c.yellow;
        if (s === 'OPEN') return c.blue; return c.textMut;
    };

    if (loading) return (<div className={"min-h-screen flex items-center justify-center " + c.bg}><Loader className={"animate-spin " + c.accent} size={48} /></div>);

    const tickets = profile?.maintenance_tickets || [];
    const filtered = filter === 'ALL' ? tickets : tickets.filter(t => t.status === filter);
    const notifCount = profile?.notifications?.length || 0;

    return (
        <div className={"min-h-screen font-sans pb-24 " + c.bg + " " + c.text}>
            <header className={"border-b p-5 sticky top-0 z-10 " + c.card + " " + c.border}>
                <div className="flex items-center justify-between">
                    <h1 className={"text-lg font-bold flex items-center gap-2 " + c.heading}>
                        <Wrench size={20} className={c.accent} /> AI Support Tracking
                    </h1>
                    <button onClick={() => navigate('/tenant/maintenance')}
                        className={c.btn + " px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition"}>
                        <Plus size={14} /> New Request
                    </button>
                </div>
            </header>

            <main className="p-5 max-w-lg mx-auto space-y-4">
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: 'Open', count: tickets.filter(t => t.status === 'OPEN').length, color: c.blue },
                        { label: 'In Progress', count: tickets.filter(t => t.status === 'IN_PROGRESS').length, color: c.yellow },
                        { label: 'Resolved', count: tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length, color: c.green },
                    ].map((item, i) => (
                        <div key={i} className={"rounded-xl p-3 border text-center " + c.card + " " + c.border}>
                            <p className={"text-lg font-bold " + item.color}>{item.count}</p>
                            <p className={"text-[10px] uppercase font-bold " + c.textMut}>{item.label}</p>
                        </div>
                    ))}
                </div>

                <div className="flex gap-2 overflow-x-auto pb-1">
                    {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((status) => {
                        const count = status === 'ALL' ? tickets.length : tickets.filter(t => t.status === status).length;
                        if (count === 0 && status !== 'ALL') return null;
                        return (
                            <button key={status} onClick={() => setFilter(status)}
                                className={"px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition border " +
                                    (filter === status ? c.btn : c.btn2)}>
                                {status.replace('_', ' ')} ({count})
                            </button>
                        );
                    })}
                </div>

                <div className="space-y-3">
                    {filtered.length > 0 ? filtered.map((ticket) => (
                        <div key={ticket.id} className={"p-4 rounded-xl border transition-all " + c.card + " " + c.border + " hover:border-amber-500/30"}>
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    {getStatusIcon(ticket.status)}
                                    <h3 className={"font-semibold text-sm truncate " + c.heading}>{ticket.title}</h3>
                                </div>
                                <span className={"px-2 py-1 rounded-md text-[10px] font-bold border shrink-0 ml-3 " + getPriorityStyle(ticket.priority)}>
                                    {ticket.priority}
                                </span>
                            </div>
                            <p className={"text-xs mb-3 line-clamp-2 ml-7 " + c.textMut}>{ticket.description}</p>
                            <div className="flex justify-between items-center text-xs ml-7">
                                <span className={"font-medium " + getStatusColor(ticket.status)}>{ticket.status.replace('_', ' ')}</span>
                                <div className={"flex items-center gap-3 " + c.textMut}>
                                    {ticket.source === 'SYSTEM' && (
                                        <span className={"px-1.5 py-0.5 rounded text-[9px] font-bold border " + c.accentBg}>AI Triaged</span>
                                    )}
                                    <span>{ticket.date}</span>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className={"text-center py-12 border-2 border-dashed rounded-xl " + c.border}>
                            <Wrench size={36} className={c.textMut + " mx-auto mb-3"} />
                            <p className={c.textMut + " font-medium"}>No tickets found.</p>
                            <button onClick={() => navigate('/tenant/maintenance')}
                                className={c.btn + " mt-4 px-4 py-2 rounded-lg text-sm font-bold transition"}>Report an Issue</button>
                        </div>
                    )}
                </div>
            </main>
            <TenantNav notificationCount={notifCount} />
        </div>
    );
};

export default MaintenanceList;