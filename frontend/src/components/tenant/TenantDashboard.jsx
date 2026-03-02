import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import TenantNav from './TenantNav';
import Chatbot from '../Chatbot';
import ThemeToggle from '../ThemeToggle';
import { useTheme } from '../../context/ThemeContext';
import {
    Home, Wrench, CreditCard, LogOut, Bell, User,
    Loader, AlertTriangle, Calendar, ChevronRight
} from 'lucide-react';

const TenantDashboard = () => {
    const { c, isDark } = useTheme();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const getPriorityStyle = (priority) => {
        switch (priority) {
            case 'EMERGENCY': return c.redBg + ' animate-pulse';
            case 'HIGH': return c.yellowBg;
            case 'MEDIUM': return c.blueBg;
            default: return isDark ? 'bg-gray-700 text-gray-400 border-gray-600' : 'bg-gray-100 text-gray-500 border-gray-200';
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'RESOLVED': case 'CLOSED': return c.green;
            case 'IN_PROGRESS': return c.yellow;
            default: return c.textMut;
        }
    };

    const getChequeStyle = (status) => {
        switch (status) {
            case 'CLEARED': return c.greenBg;
            case 'PENDING': return c.blueBg;
            case 'BOUNCED': return c.redBg;
            case 'DEPOSITED': return c.yellowBg;
            default: return isDark ? 'bg-gray-700 text-gray-400 border-gray-600' : 'bg-gray-100 text-gray-500 border-gray-200';
        }
    };

    useEffect(() => {
        const fetchMyProfile = async () => {
            try { const res = await api.get('me/'); setProfile(res.data); }
            catch (err) { console.error("Failed to load profile", err); }
            finally { setLoading(false); }
        };
        fetchMyProfile();
    }, []);

    const isChequeUrgent = () => {
        if (!profile?.next_payment?.date || profile?.next_payment?.date === "No Pending Payments") return false;
        const dueDate = new Date(profile.next_payment.date);
        const diffDays = Math.ceil((dueDate - new Date()) / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 7;
    };

    if (loading) return (
        <div className={"min-h-screen flex items-center justify-center " + c.bg}>
            <Loader className={"animate-spin " + c.accent} size={48} />
        </div>
    );

    const notifCount = profile?.notifications?.length || 0;

    return (
        <div className={"min-h-screen font-sans pb-24 " + c.bg + " " + c.text}>

            {/* Header */}
            <header className={"border-b p-5 flex justify-between items-center sticky top-0 z-10 " + c.card + " " + c.border + " " + c.shadow}>
                <div className="flex items-center gap-3">
                    <div className="bg-amber-500 p-2 rounded-lg">
                        <Home className="text-white" size={22} />
                    </div>
                    <div>
                        <h1 className={"text-lg font-bold tracking-tight " + c.heading}>PropAI <span className={c.accent}>Resident</span></h1>
                        <p className={"text-xs " + c.textMut}>
                            {profile?.unit ? `${profile.unit.property} • Unit ${profile.unit.number}` : 'No Active Unit'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <ThemeToggle />
                    <button onClick={() => navigate('/tenant/profile')}
                        className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center text-sm font-bold text-white border border-amber-400">
                        {profile?.name?.charAt(0) || 'T'}
                    </button>
                </div>
            </header>

            <main className="p-5 max-w-lg mx-auto space-y-5">

                {/* 7-Day Warning Banner */}
                {isChequeUrgent() && (
                    <div onClick={() => navigate('/tenant/payments')}
                        className={"p-4 rounded-2xl flex items-center gap-3 cursor-pointer transition border " + c.redBg}>
                        <Calendar size={20} className={c.red + " shrink-0"} />
                        <div className="flex-1">
                            <p className="text-sm font-bold">Payment Due Soon!</p>
                            <p className="text-xs opacity-80">AED {Number(profile?.next_payment?.amount || 0).toLocaleString()} — Tap to view</p>
                        </div>
                        <ChevronRight size={18} />
                    </div>
                )}

                {/* Bounced Alert */}
                {profile?.cheques?.some(ch => ch.status === 'BOUNCED') && (
                    <div onClick={() => navigate('/tenant/payments')}
                        className={"p-4 rounded-2xl flex items-center gap-3 cursor-pointer animate-pulse border " + c.redBg}>
                        <AlertTriangle size={20} className={c.red + " shrink-0"} />
                        <div className="flex-1">
                            <p className="text-sm font-bold">Cheque Bounced — Contact Management</p>
                        </div>
                    </div>
                )}

                {/* Welcome Card with Next Payment */}
                <div className="bg-gradient-to-br from-amber-600 to-amber-500 rounded-2xl p-5 shadow-xl text-white">
                    <h2 className="text-2xl font-bold mb-1">
                        Hello, {profile?.name ? profile.name.split(' ')[0] : 'Resident'}!
                    </h2>
                    <p className="text-amber-100 text-sm mb-4">Here is your property overview.</p>

                    <div onClick={() => navigate('/tenant/payments')}
                        className="bg-black/20 rounded-xl p-4 flex items-center justify-between border border-white/10 cursor-pointer hover:bg-black/30 transition">
                        <div>
                            <p className="text-xs text-amber-200 uppercase font-bold tracking-wider">Next Payment</p>
                            <p className="text-white font-bold text-lg">
                                AED {Number(profile?.next_payment?.amount || 0).toLocaleString()}
                            </p>
                            <p className="text-xs text-amber-200/70">Due: {profile?.next_payment?.date || 'No Pending Payments'}</p>
                        </div>
                        <ChevronRight size={20} className="text-amber-200" />
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => navigate('/tenant/maintenance')}
                        className={"p-5 rounded-2xl border flex flex-col items-center gap-3 transition group active:scale-95 " + c.card + " " + c.border + " " + c.hover}>
                        <div className={"w-12 h-12 rounded-full flex items-center justify-center transition " + (isDark ? "bg-amber-900/30 group-hover:bg-amber-600" : "bg-amber-50 group-hover:bg-amber-500")}>
                            <Wrench className={(isDark ? "text-amber-400" : "text-amber-600") + " group-hover:text-white"} size={24} />
                        </div>
                        <span className={"font-semibold text-sm " + c.heading}>Report Issue</span>
                    </button>

                    <button onClick={() => navigate('/tenant/payments')}
                        className={"p-5 rounded-2xl border flex flex-col items-center gap-3 transition group active:scale-95 " + c.card + " " + c.border + " " + c.hover}>
                        <div className={"w-12 h-12 rounded-full flex items-center justify-center transition " + (isDark ? "bg-emerald-900/30 group-hover:bg-emerald-600" : "bg-emerald-50 group-hover:bg-emerald-500")}>
                            <CreditCard className={(isDark ? "text-emerald-400" : "text-emerald-600") + " group-hover:text-white"} size={24} />
                        </div>
                        <span className={"font-semibold text-sm " + c.heading}>Payment History</span>
                    </button>
                </div>

                {/* Recent Cheques Summary */}
                {profile?.cheques?.length > 0 && (
                    <div className={"rounded-2xl p-5 border " + c.card + " " + c.border}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className={"font-bold flex items-center gap-2 " + c.heading}>
                                <CreditCard size={16} className={c.green} /> Payment Schedule
                            </h3>
                            <button onClick={() => navigate('/tenant/payments')} className={"text-xs " + c.accent + " hover:opacity-80"}>View All →</button>
                        </div>
                        <div className="space-y-2">
                            {profile.cheques.slice(0, 3).map((cheque) => (
                                <div key={cheque.id} className={"flex items-center justify-between p-3 rounded-xl border " + (isDark ? "bg-black/20 border-white/5" : "bg-gray-50 border-gray-100")}>
                                    <div>
                                        <p className={"text-sm font-medium " + c.heading}>AED {cheque.amount.toLocaleString()}</p>
                                        <p className={"text-[10px] " + c.textMut}>{cheque.cheque_date}</p>
                                    </div>
                                    <span className={"px-2 py-1 rounded-md text-[10px] font-bold border " + getChequeStyle(cheque.status)}>
                                        {cheque.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* AI Support Tracking */}
                <div className={"rounded-2xl p-5 border " + c.card + " " + c.border}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className={"font-bold flex items-center gap-2 " + c.heading}>
                            <Wrench size={16} className={c.accent} /> AI Support Tracking
                        </h3>
                        <button onClick={() => navigate('/tenant/maintenance/history')} className={"text-xs " + c.accent + " hover:opacity-80"}>View All →</button>
                    </div>
                    <div className="space-y-3">
                        {profile?.maintenance_tickets?.length > 0 ? (
                            profile.maintenance_tickets.slice(0, 3).map((ticket) => (
                                <div key={ticket.id} className={"p-3 rounded-xl border flex justify-between items-center " + (isDark ? "bg-black/20 border-white/5" : "bg-gray-50 border-gray-100")}>
                                    <div className="overflow-hidden">
                                        <p className={"text-sm font-semibold truncate " + c.heading}>{ticket.title}</p>
                                        <p className={"text-[10px] uppercase tracking-wider " + getStatusStyle(ticket.status)}>
                                            {ticket.status?.replace('_', ' ')}
                                        </p>
                                    </div>
                                    <span className={"px-2 py-1 rounded-md text-[10px] font-black border shrink-0 ml-4 " + getPriorityStyle(ticket.priority)}>
                                        {ticket.priority}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className={"text-center py-4 border-2 border-dashed rounded-xl " + c.border}>
                                <p className={"text-sm " + c.textMut}>No active maintenance issues.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Lease Details */}
                {profile?.lease ? (
                    <div className={"rounded-2xl p-5 border " + c.card + " " + c.border}>
                        <h3 className={"font-bold mb-4 flex items-center gap-2 " + c.heading}>
                            <User size={16} className={c.textMut} /> Lease Details
                        </h3>
                        <div className="space-y-3">
                            {[
                                ['Status', <span className={"font-bold px-2 py-0.5 rounded text-[10px] uppercase border " + c.greenBg}>Active</span>],
                                ['Period', <span className={"text-xs " + c.textSec}>{profile.lease.start} — {profile.lease.end}</span>],
                                ['Yearly Rent', <span className={"font-mono text-xs " + c.heading}>AED {Number(profile.lease.rent).toLocaleString()}</span>],
                                ['Payment Plan', <span className={"text-xs " + c.textSec}>{profile.lease.frequency}</span>],
                            ].map(([label, value], i) => (
                                <div key={i} className="flex justify-between text-sm">
                                    <span className={c.textMut}>{label}</span>
                                    {value}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className={"rounded-2xl p-5 flex items-center gap-3 border " + c.yellowBg}>
                        <AlertTriangle size={20} />
                        <span className="text-sm font-semibold">No Active Lease Found</span>
                    </div>
                )}
            </main>
            <Chatbot />
            <TenantNav notificationCount={notifCount} />
        </div>
    );
};

export default TenantDashboard;