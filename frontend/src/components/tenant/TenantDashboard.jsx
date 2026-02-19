import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios'; 
import { 
    Home, 
    Wrench, 
    CreditCard, 
    LogOut,
    Bell, 
    User, 
    Loader, 
    AlertTriangle, 
    Calendar 
} from 'lucide-react';

const TenantDashboard = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // 👇 Helper for AI Priority Styling
    const getPriorityStyle = (priority) => {
        switch(priority) {
            case 'EMERGENCY': return 'bg-red-500/20 text-red-400 border-red-500/50 animate-pulse'; 
            case 'HIGH': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
            case 'MEDIUM': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
            default: return 'bg-gray-700 text-gray-400 border-gray-600';
        }
    };

    // 👇 Fetch real data from the 'me/' endpoint
    useEffect(() => {
        const fetchMyProfile = async () => {
            try {
                const res = await api.get('me/'); 
                setProfile(res.data);
            } catch (err) {
                console.error("Failed to load profile", err);
                setError("Could not load lease details.");
            } finally {
                setLoading(false);
            }
        };
        fetchMyProfile();
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    // 👇 Logic for the 7-day Cheque Warning Banner
    const isChequeUrgent = () => {
        if (!profile?.next_payment?.date) return false;
        const dueDate = new Date(profile.next_payment.date);
        const today = new Date();
        const diffTime = dueDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 7;
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center text-blue-500">
            <Loader className="animate-spin" size={48} />
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
            
            {/* Header */}
            <header className="bg-gray-800 border-b border-gray-700 p-6 flex justify-between items-center sticky top-0 z-10 shadow-lg">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-600 p-2 rounded-lg">
                        <Home className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white tracking-tight">PropOS <span className="text-blue-500">Resident</span></h1>
                        <p className="text-xs text-gray-400">
                            {profile?.unit ? `${profile.unit.property} • Unit ${profile.unit.number}` : 'No Active Unit'}
                        </p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button className="text-gray-400 hover:text-white relative">
                        <Bell size={24} />
                        <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-gray-800"></span>
                    </button>
                    <button onClick={handleLogout} className="text-red-400 hover:text-red-300">
                        <LogOut size={24} />
                    </button>
                </div>
            </header>

            <main className="p-6 max-w-lg mx-auto space-y-6">

                {/* 👇 7-Day Warning Banner */}
                {isChequeUrgent() && (
                    <div className="bg-red-900/40 border border-red-500 text-red-200 p-4 rounded-2xl flex items-center gap-3 animate-bounce">
                        <Calendar size={20} className="text-red-400" />
                        <p className="text-sm font-bold">Payment Due in less than 7 days!</p>
                    </div>
                )}
                
                {/* 1. Welcome Card */}
                <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-2xl p-6 shadow-xl border border-blue-700/50">
                    <h2 className="text-2xl font-bold mb-1">
                        Hello, {profile?.name ? profile.name.split(' ')[0] : 'Resident'}! 👋
                    </h2>
                    <p className="text-blue-200 text-sm mb-4">Here is your property overview.</p>
                    
                    <div className="bg-blue-950/50 rounded-xl p-4 flex items-center justify-between border border-blue-500/30">
                        <div>
                            <p className="text-xs text-blue-300 uppercase font-bold tracking-wider">Next Payment</p>
                            <p className="text-white font-bold text-lg">
                                AED {Number(profile?.next_payment?.amount || 0).toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-400">
                                Due: {profile?.next_payment?.date || 'All Paid'}
                            </p>
                        </div>
                        {profile?.next_payment?.amount > 0 && (
                            <button className="bg-white text-blue-900 px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-100 transition">
                                Pay Now
                            </button>
                        )}
                    </div>
                </div>

                {/* 2. Action Grid */}
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

                    <button className="bg-gray-800 hover:bg-gray-750 p-5 rounded-2xl border border-gray-700 flex flex-col items-center gap-3 transition group active:scale-95">
                        <div className="w-12 h-12 rounded-full bg-green-900/30 flex items-center justify-center group-hover:bg-green-600 transition">
                            <CreditCard className="text-green-400 group-hover:text-white" size={24} />
                        </div>
                        <span className="font-semibold text-sm">Payment History</span>
                    </button>
                </div>

                {/* 3. Maintenance AI Tracker List */}
                <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-sm">
                    <h3 className="font-bold text-white mb-4 flex items-center justify-between">
                        <span className="flex items-center gap-2"><Wrench size={18} className="text-orange-400"/> AI Support Tracking</span>
                        <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 uppercase tracking-tighter">Live Analysis</span>
                    </h3>
                    
                    <div className="space-y-4">
                        {profile?.maintenance_tickets?.length > 0 ? (
                            profile.maintenance_tickets.map((ticket) => (
                                <div key={ticket.id} className="p-3 bg-gray-900/50 rounded-xl border border-gray-700/50 flex justify-between items-center transition-all hover:border-gray-600">
                                    <div className="overflow-hidden">
                                        <p className="text-sm font-semibold text-gray-200 truncate">{ticket.title || "Untitled Issue"}</p>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">{ticket.ai_category || 'Triage in Progress...'}</p>
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

                {/* 4. Lease Details Card */}
                {profile?.lease ? (
                    <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-sm">
                        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                            <User size={18} className="text-gray-400"/> Lease Details
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Status</span>
                                <span className="text-green-400 font-bold bg-green-900/20 px-2 py-0.5 rounded border border-green-900/50 text-[10px] uppercase">Active</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Contract Period</span>
                                <span className="text-gray-200 text-xs">{profile.lease.start} — {profile.lease.end}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Yearly Rent</span>
                                <span className="text-gray-200 font-mono text-xs">
                                    AED {Number(profile.lease.rent).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-gray-800/50 rounded-2xl p-6 border border-yellow-500/30 flex items-center gap-3 text-yellow-500">
                        <AlertTriangle size={20} />
                        <span className="text-sm font-semibold">No Active Lease Found</span>
                    </div>
                )}

            </main>
        </div>
    );
};

export default TenantDashboard;