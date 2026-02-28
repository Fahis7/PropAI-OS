import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import TenantNav from './TenantNav';
import Chatbot from '../Chatbot';
import ThemeToggle from '../ThemeToggle';
import { useTheme } from '../../context/ThemeContext';
import { Home, Wrench, CreditCard, LogOut, Bell, User, Loader, AlertTriangle, Calendar, ChevronRight } from 'lucide-react';

const TenantDashboard = () => {
    const { c, isDark } = useTheme();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const getPriorityStyle = (p) => {
        switch(p) {
            case 'EMERGENCY': return c.redBg + ' animate-pulse';
            case 'HIGH': return c.yellowBg;
            case 'MEDIUM': return c.blueBg;
            default: return isDark ? 'bg-gray-700 text-gray-400 border-gray-600' : 'bg-gray-100 text-gray-500 border-gray-200';
        }
    };

    const getStatusStyle = (s) => {
        switch(s) {
            case 'RESOLVED': case 'CLOSED': return c.green;
            case 'IN_PROGRESS': return c.yellow;
            default: return c.textSec;
        }
    };

    const getChequeStyle = (s) => {
        switch(s) {
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
        const diff = Math.ceil((new Date(profile.next_payment.date) - new Date()) / (1000 * 60 * 60 * 24));
        return diff >= 0 && diff <= 7;
    };

    if (loading) return (
        <div className={'min-h-screen flex items-center justify-center ' + c.bg}><Loader className={'animate-spin ' + c.accent} size={48} /></div>
    );

    const notifCount = profile?.notifications?.length || 0;

    return (
        <div className={'min-h-screen font-sans pb-24 ' + c.bg + ' ' + c.text}>
            <header className={'border-b p-5 flex justify-between items-center sticky top-0 z-10 ' + c.card + ' ' + c.border}>
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-2 rounded-xl shadow-lg shadow-amber-500/20">
                        <Home className="text-white" size={20} />
                    </div>
                    <div>
                        <h1 className={'text-lg font-bold tracking-tight ' + c.heading}>PropAI <span className={c.accent}>Resident</span></h1>
                        <p className={'text-xs ' + c.textMut}>
                            {profile?.unit ? profile.unit.property + ' • Unit ' + profile.unit.number : 'No Active Unit'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <button onClick={() => navigate('/tenant/profile')}
                        className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-sm font-bold text-white">
                        {profile?.name?.charAt(0) || 'T'}
                    </button>
                </div>
            </header>

            <main className="p-5 max-w-lg mx-auto space-y-5 fade-in">
                {isChequeUrgent() && (
                    <div onClick={() => navigate('/tenant/payments')}
                        className={'p-4 rounded-2xl flex items-center gap-3 cursor-pointer transition border ' + c.redBg}>
                        <Calendar size={20} className={c.red} />
                        <div className="flex-1">
                            <p className={'text-sm font-bold ' + c.heading}>Payment Due Soon!</p>
                            <p className={'text-xs ' + c.textSec}>{'AED ' + Number(profile?.next_payment?.amount || 0).toLocaleString() + ' — Tap to view'}</p>
                        </div>
                        <ChevronRight size={18} className={c.textMut} />
                    </div>
                )}

                {profile?.cheques?.some(ch => ch.status === 'BOUNCED') && (
                    <div onClick={() => navigate('/tenant/payments')}
                        className={'p-4 rounded-2xl flex items-center gap-3 cursor-pointer animate-pulse border ' + c.redBg}>
                        <AlertTriangle size={20} className={c.red} />
                        <p className={'text-sm font-bold ' + c.heading}>Cheque Bounced — Contact Management</p>
                    </div>
                )}

                <div className="bg-gradient-to-br from-amber-600 to-amber-500 rounded-2xl p-5 shadow-xl text-white">
                    <h2 className="text-2xl font-extrabold mb-1">{'Hello, ' + (profile?.name ? profile.name.split(' ')[0] : 'Resident') + '!'}</h2>
                    <p className="text-amber-100 text-sm mb-4">Here is your property overview.</p>
                    <div onClick={() => navigate('/tenant/payments')}
                        className="bg-black/20 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-black/30 transition">
                        <div>
                            <p className="text-xs text-amber-200 uppercase font-bold tracking-wider">Next Payment</p>
                            <p className="text-white font-extrabold text-lg">{'AED ' + Number(profile?.next_payment?.amount || 0).toLocaleString()}</p>
                            <p className="text-xs text-amber-200">{'Due: ' + (profile?.next_payment?.date || 'All Paid')}</p>
                        </div>
                        <ChevronRight size={20} className="text-amber-200" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => navigate('/tenant/maintenance')}
                        className={'p-5 rounded-2xl border flex flex-col items-center gap-3 transition group active:scale-95 ' + c.card + ' ' + c.border + ' ' + c.cardHover}>
                        <div className={'w-12 h-12 rounded-full flex items-center justify-center transition border ' + c.yellowBg}><Wrench size={24} /></div>
                        <span className={'font-semibold text-sm ' + c.heading}>Report Issue</span>
                    </button>
                    <button onClick={() => navigate('/tenant/payments')}
                        className={'p-5 rounded-2xl border flex flex-col items-center gap-3 transition group active:scale-95 ' + c.card + ' ' + c.border + ' ' + c.cardHover}>
                        <div className={'w-12 h-12 rounded-full flex items-center justify-center transition border ' + c.greenBg}><CreditCard size={24} /></div>
                        <span className={'font-semibold text-sm ' + c.heading}>Payment History</span>
                    </button>
                </div>

                {profile?.cheques?.length > 0 && (
                    <div className={'rounded-2xl p-5 border ' + c.card + ' ' + c.border}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className={'font-bold flex items-center gap-2 ' + c.heading}><CreditCard size={16} className={c.green} /> Payment Schedule</h3>
                            <button onClick={() => navigate('/tenant/payments')} className={'text-xs font-semibold ' + c.accent}>View All</button>
                        </div>
                        <div className="space-y-2">
                            {profile.cheques.slice(0, 3).map((cheque) => (
                                <div key={cheque.id} className={'flex items-center justify-between p-3 rounded-xl border ' + c.bg + ' ' + c.border}>
                                    <div>
                                        <p className={'text-sm font-bold ' + c.heading}>{'AED ' + cheque.amount.toLocaleString()}</p>
                                        <p className={'text-[10px] ' + c.textMut}>{cheque.cheque_date}</p>
                                    </div>
                                    <span className={'px-2 py-1 rounded-md text-[10px] font-bold border ' + getChequeStyle(cheque.status)}>{cheque.status}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className={'rounded-2xl p-5 border ' + c.card + ' ' + c.border}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className={'font-bold flex items-center gap-2 ' + c.heading}><Wrench size={16} className={c.yellow} /> AI Support Tracking</h3>
                        <button onClick={() => navigate('/tenant/maintenance/history')} className={'text-xs font-semibold ' + c.accent}>View All</button>
                    </div>
                    <div className="space-y-3">
                        {profile?.maintenance_tickets?.length > 0 ? profile.maintenance_tickets.slice(0, 3).map((ticket) => (
                            <div key={ticket.id} className={'p-3 rounded-xl border flex justify-between items-center ' + c.bg + ' ' + c.border}>
                                <div className="overflow-hidden">
                                    <p className={'text-sm font-semibold truncate ' + c.heading}>{ticket.title}</p>
                                    <p className={'text-[10px] uppercase tracking-wider ' + getStatusStyle(ticket.status)}>{ticket.status?.replace('_', ' ')}</p>
                                </div>
                                <span className={'px-2 py-1 rounded-md text-[10px] font-black border shrink-0 ml-4 ' + getPriorityStyle(ticket.priority)}>{ticket.priority}</span>
                            </div>
                        )) : (
                            <div className={'text-center py-4 border-2 border-dashed rounded-xl ' + c.border}>
                                <p className={'text-sm ' + c.textMut}>No active maintenance issues.</p>
                            </div>
                        )}
                    </div>
                </div>

                {profile?.lease ? (
                    <div className={'rounded-2xl p-5 border ' + c.card + ' ' + c.border}>
                        <h3 className={'font-bold mb-4 flex items-center gap-2 ' + c.heading}><User size={16} className={c.textSec} /> Lease Details</h3>
                        <div className="space-y-3">
                            {[
                                ['Status', 'Active', c.greenBg],
                                ['Period', profile.lease.start + ' — ' + profile.lease.end],
                                ['Yearly Rent', 'AED ' + Number(profile.lease.rent).toLocaleString()],
                                ['Payment Plan', profile.lease.frequency],
                            ].map(([label, val, badge], i) => (
                                <div key={i} className="flex justify-between text-sm">
                                    <span className={c.textSec}>{label}</span>
                                    {badge ? <span className={'px-2 py-0.5 rounded text-[10px] uppercase font-bold border ' + badge}>{val}</span>
                                        : <span className={'text-xs font-medium ' + c.heading}>{val}</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className={'rounded-2xl p-5 border flex items-center gap-3 ' + c.yellowBg}>
                        <AlertTriangle size={20} /><span className="text-sm font-semibold">No Active Lease Found</span>
                    </div>
                )}
            </main>
            <Chatbot />
            <TenantNav notificationCount={notifCount} />
        </div>
    );
};

export default TenantDashboard;