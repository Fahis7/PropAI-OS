import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios'; 
import TenantNav from './TenantNav';
import Chatbot from '../Chatbot';
import { 
    Home, Wrench, CreditCard, LogOut, Bell, User, 
    Loader, AlertTriangle, Calendar, ChevronRight
} from 'lucide-react';

const TenantDashboard = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null); 
    const [loading, setLoading] = useState(true);

    const getPriorityStyle = (priority) => {
        switch(priority) {
            case 'EMERGENCY': return 'bg-red-500/20 text-red-400 border-red-500/50 animate-pulse'; 
            case 'HIGH': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
            case 'MEDIUM': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
            default: return 'bg-gray-700 text-gray-400 border-gray-600';
        }
    };

    const getStatusStyle = (status) => {
        switch(status) {
            case 'RESOLVED': case 'CLOSED': return 'text-green-400';
            case 'IN_PROGRESS': return 'text-yellow-400';
            default: return 'text-gray-400';
        }
    };

    const getChequeStyle = (status) => {
        switch(status) {
            case 'CLEARED': return 'bg-green-500/20 text-green-400 border-green-500/50';
            case 'PENDING': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
            case 'BOUNCED': return 'bg-red-500/20 text-red-400 border-red-500/50';
            case 'DEPOSITED': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
            default: return 'bg-gray-700 text-gray-400 border-gray-600';
        }
    };

    useEffect(() => {
        const fetchMyProfile = async () => {
            try {
                const res = await api.get('me/'); 
                setProfile(res.data);
            } catch (err) {
                console.error("Failed to load profile", err);
            } finally {
                setLoading(false);
            }
        };
        fetchMyProfile();
    }, []);

    const isChequeUrgent = () => {
        if (!profile?.next_payment?.date || profile?.next_payment?.date === "No Pending Payments") return false;
        const dueDate = new Date(profile.next_payment.date);
        const today = new Date();
        const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 7;
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center text-blue-500">
            <Loader className="animate-spin" size={48} />
        </div>
    );

    const notifCount = profile?.notifications?.length || 0;

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 font-sans pb-24">
            
            {/* Header */}
            <header className="bg-gray-800 border-b border-gray-700 p-5 flex justify-between items-center sticky top-0 z-10 shadow-lg">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-600 p-2 rounded-lg">
                        <Home className="text-white" size={22} />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-white tracking-tight">PropOS <span className="text-blue-500">Resident</span></h1>
                        <p className="text-xs text-gray-400">
                            {profile?.unit ? `${profile.unit.property} • Unit ${profile.unit.number}` : 'No Active Unit'}
                        </p>
                    </div>
                </div>
                <button 
                    onClick={() => navigate('/tenant/profile')}
                    className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold border border-blue-500"
                >
                    {profile?.name?.charAt(0) || 'T'}
                </button>
            </header>

            <main className="p-5 max-w-lg mx-auto space-y-5">

                {/* 7-Day Warning Banner */}
                {isChequeUrgent() && (
                    <div 
                        onClick={() => navigate('/tenant/payments')}
                        className="bg-red-900/40 border border-red-500 text-red-200 p-4 rounded-2xl flex items-center gap-3 cursor-pointer hover:bg-red-900/50 transition"
                    >
                        <Calendar size={20} className="text-red-400 shrink-0" />
                        <div className="flex-1">
                            <p className="text-sm font-bold">Payment Due Soon!</p>
                            <p className="text-xs text-red-300">AED {Number(profile?.next_payment?.amount || 0).toLocaleString()} — Tap to view</p>
                        </div>
                        <ChevronRight size={18} className="text-red-400" />
                    </div>
                )}

                {/* Bounced Alert */}
                {profile?.cheques?.some(c => c.status === 'BOUNCED') && (
                    <div 
                        onClick={() => navigate('/tenant/payments')}
                        className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-2xl flex items-center gap-3 cursor-pointer animate-pulse"
                    >
                        <AlertTriangle size={20} className="text-red-400 shrink-0" />
                        <div className="flex-1">
                            <p className="text-sm font-bold">Cheque Bounced — Contact Management</p>
                        </div>
                    </div>
                )}
                
                {/* Welcome Card with Next Payment */}
                <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-2xl p-5 shadow-xl border border-blue-700/50">
                    <h2 className="text-2xl font-bold mb-1">
                        Hello, {profile?.name ? profile.name.split(' ')[0] : 'Resident'}! 👋
                    </h2>
                    <p className="text-blue-200 text-sm mb-4">Here is your property overview.</p>
                    
                    <div 
                        onClick={() => navigate('/tenant/payments')}
                        className="bg-blue-950/50 rounded-xl p-4 flex items-center justify-between border border-blue-500/30 cursor-pointer hover:bg-blue-950/70 transition"
                    >
                        <div>
                            <p className="text-xs text-blue-300 uppercase font-bold tracking-wider">Next Payment</p>
                            <p className="text-white font-bold text-lg">
                                AED {Number(profile?.next_payment?.amount || 0).toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-400">
                                Due: {profile?.next_payment?.date || 'All Paid'}
                            </p>
                        </div>
                        <ChevronRight size={20} className="text-blue-300" />
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-4">
                    <button 
                        onClick={() => navigate('/tenant/maintenance')}
                        className="bg-gray-800 hover:bg-gray-750 p-5 rounded-2xl border border-gray-700 flex flex-col items-center gap-3 transition group active:scale-95"
                    >
                        <div className="w-12 h-12 rounded-full bg-orange-900/30 flex items-center justify-center group-hover:bg-orange-600 transition">
                            <Wrench className="text-orange-400 group-hover:text-white" size={24} />
                        </div>
                        <span className="font-semibold text-sm">Report Issue</span>
                    </button>

                    <button 
                        onClick={() => navigate('/tenant/payments')}
                        className="bg-gray-800 hover:bg-gray-750 p-5 rounded-2xl border border-gray-700 flex flex-col items-center gap-3 transition group active:scale-95"
                    >
                        <div className="w-12 h-12 rounded-full bg-green-900/30 flex items-center justify-center group-hover:bg-green-600 transition">
                            <CreditCard className="text-green-400 group-hover:text-white" size={24} />
                        </div>
                        <span className="font-semibold text-sm">Payment History</span>
                    </button>
                </div>

                {/* Recent Cheques Summary */}
                {profile?.cheques?.length > 0 && (
                    <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <CreditCard size={16} className="text-green-400"/> Payment Schedule
                            </h3>
                            <button 
                                onClick={() => navigate('/tenant/payments')}
                                className="text-xs text-blue-400 hover:text-blue-300"
                            >
                                View All →
                            </button>
                        </div>
                        <div className="space-y-2">
                            {profile.cheques.slice(0, 3).map((cheque) => (
                                <div key={cheque.id} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-xl border border-gray-700/50">
                                    <div>
                                        <p className="text-sm text-white font-medium">AED {cheque.amount.toLocaleString()}</p>
                                        <p className="text-[10px] text-gray-500">{cheque.cheque_date}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold border ${getChequeStyle(cheque.status)}`}>
                                        {cheque.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* AI Support Tracking */}
                <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <Wrench size={16} className="text-orange-400"/> AI Support Tracking
                        </h3>
                        <button 
                            onClick={() => navigate('/tenant/maintenance/history')}
                            className="text-xs text-blue-400 hover:text-blue-300"
                        >
                            View All →
                        </button>
                    </div>
                    
                    <div className="space-y-3">
                        {profile?.maintenance_tickets?.length > 0 ? (
                            profile.maintenance_tickets.slice(0, 3).map((ticket) => (
                                <div key={ticket.id} className="p-3 bg-gray-900/50 rounded-xl border border-gray-700/50 flex justify-between items-center">
                                    <div className="overflow-hidden">
                                        <p className="text-sm font-semibold text-gray-200 truncate">{ticket.title}</p>
                                        <p className={`text-[10px] uppercase tracking-wider ${getStatusStyle(ticket.status)}`}>
                                            {ticket.status?.replace('_', ' ')}
                                        </p>
                                    </div>
                                    <span className={`px-2 py-1 rounded-md text-[10px] font-black border shrink-0 ml-4 ${getPriorityStyle(ticket.priority)}`}>
                                        {ticket.priority}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-4 border-2 border-dashed border-gray-700 rounded-xl">
                                <p className="text-sm text-gray-500">No active maintenance issues.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Lease Details */}
                {profile?.lease ? (
                    <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
                        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                            <User size={16} className="text-gray-400"/> Lease Details
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Status</span>
                                <span className="text-green-400 font-bold bg-green-900/20 px-2 py-0.5 rounded border border-green-900/50 text-[10px] uppercase">Active</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Period</span>
                                <span className="text-gray-200 text-xs">{profile.lease.start} — {profile.lease.end}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Yearly Rent</span>
                                <span className="text-gray-200 font-mono text-xs">AED {Number(profile.lease.rent).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Payment Plan</span>
                                <span className="text-gray-200 text-xs">{profile.lease.frequency}</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-gray-800/50 rounded-2xl p-5 border border-yellow-500/30 flex items-center gap-3 text-yellow-500">
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