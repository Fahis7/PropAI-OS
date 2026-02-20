import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import TenantNav from './TenantNav';
import { 
    CreditCard, Loader, CheckCircle, Clock, AlertTriangle, 
    Banknote, TrendingUp, ArrowDownCircle
} from 'lucide-react';

const PaymentHistory = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('me/');
                setProfile(res.data);
            } catch (err) {
                console.error("Failed to load profile", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const getChequeStyle = (status) => {
        switch(status) {
            case 'CLEARED': return { bg: 'bg-green-500/10 border-green-500/30', text: 'text-green-400', badge: 'bg-green-500/20 text-green-400 border-green-500/50' };
            case 'PENDING': return { bg: 'bg-blue-500/10 border-blue-500/30', text: 'text-blue-400', badge: 'bg-blue-500/20 text-blue-400 border-blue-500/50' };
            case 'BOUNCED': return { bg: 'bg-red-500/10 border-red-500/30', text: 'text-red-400', badge: 'bg-red-500/20 text-red-400 border-red-500/50' };
            case 'DEPOSITED': return { bg: 'bg-yellow-500/10 border-yellow-500/30', text: 'text-yellow-400', badge: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' };
            default: return { bg: 'bg-gray-800 border-gray-700', text: 'text-gray-400', badge: 'bg-gray-700 text-gray-400 border-gray-600' };
        }
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case 'CLEARED': return <CheckCircle size={18} className="text-green-400" />;
            case 'PENDING': return <Clock size={18} className="text-blue-400" />;
            case 'BOUNCED': return <AlertTriangle size={18} className="text-red-400" />;
            case 'DEPOSITED': return <ArrowDownCircle size={18} className="text-yellow-400" />;
            default: return <Clock size={18} className="text-gray-400" />;
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center text-blue-500">
            <Loader className="animate-spin" size={48} />
        </div>
    );

    const cheques = profile?.cheques || [];
    const filtered = filter === 'ALL' ? cheques : cheques.filter(c => c.status === filter);
    
    const totalRent = cheques.reduce((sum, c) => sum + c.amount, 0);
    const totalPaid = cheques.filter(c => c.status === 'CLEARED').reduce((sum, c) => sum + c.amount, 0);
    const totalPending = cheques.filter(c => c.status === 'PENDING').reduce((sum, c) => sum + c.amount, 0);
    const notifCount = profile?.notifications?.length || 0;

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 font-sans pb-24">
            
            {/* Header */}
            <header className="bg-gray-800 border-b border-gray-700 p-5 sticky top-0 z-10">
                <h1 className="text-lg font-bold text-white flex items-center gap-2">
                    <CreditCard size={20} className="text-green-400" /> Payment History
                </h1>
                <p className="text-xs text-gray-400 mt-1">
                    {profile?.unit ? `${profile.unit.property} • Unit ${profile.unit.number}` : ''}
                </p>
            </header>

            <main className="p-5 max-w-lg mx-auto space-y-5">

                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 text-center">
                        <TrendingUp size={18} className="text-green-400 mx-auto mb-2" />
                        <p className="text-[10px] text-gray-400 uppercase font-bold">Paid</p>
                        <p className="text-sm font-bold text-green-400">AED {totalPaid.toLocaleString()}</p>
                    </div>
                    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 text-center">
                        <Clock size={18} className="text-blue-400 mx-auto mb-2" />
                        <p className="text-[10px] text-gray-400 uppercase font-bold">Pending</p>
                        <p className="text-sm font-bold text-blue-400">AED {totalPending.toLocaleString()}</p>
                    </div>
                    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 text-center">
                        <Banknote size={18} className="text-white mx-auto mb-2" />
                        <p className="text-[10px] text-gray-400 uppercase font-bold">Total</p>
                        <p className="text-sm font-bold text-white">AED {totalRent.toLocaleString()}</p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                    <div className="flex justify-between text-xs mb-2">
                        <span className="text-gray-400">Payment Progress</span>
                        <span className="text-green-400 font-bold">
                            {totalRent > 0 ? Math.round((totalPaid / totalRent) * 100) : 0}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-700 h-2 rounded-full">
                        <div 
                            className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${totalRent > 0 ? (totalPaid / totalRent) * 100 : 0}%` }}
                        />
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {['ALL', 'PENDING', 'CLEARED', 'DEPOSITED', 'BOUNCED'].map((status) => {
                        const count = status === 'ALL' ? cheques.length : cheques.filter(c => c.status === status).length;
                        if (count === 0 && status !== 'ALL') return null;
                        return (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                                    filter === status 
                                        ? 'bg-blue-600 text-white' 
                                        : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600'
                                }`}
                            >
                                {status} ({count})
                            </button>
                        );
                    })}
                </div>

                {/* Cheque List */}
                <div className="space-y-3">
                    {filtered.length > 0 ? (
                        filtered.map((cheque) => {
                            const style = getChequeStyle(cheque.status);
                            return (
                                <div key={cheque.id} className={`p-4 rounded-xl border ${style.bg} transition-all`}>
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            {getStatusIcon(cheque.status)}
                                            <div>
                                                <p className="text-white font-bold">AED {cheque.amount.toLocaleString()}</p>
                                                <p className="text-[10px] text-gray-400">#{cheque.cheque_number}</p>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold border ${style.badge}`}>
                                            {cheque.status}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-400 border-t border-gray-700/50 pt-2">
                                        <span>Due: {new Date(cheque.cheque_date).toLocaleDateString('en-AE', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                        <span>{cheque.bank_name}</span>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-10 border-2 border-dashed border-gray-700 rounded-xl">
                            <CreditCard size={32} className="text-gray-600 mx-auto mb-3" />
                            <p className="text-gray-500">No payments found.</p>
                        </div>
                    )}
                </div>
            </main>

            <TenantNav notificationCount={notifCount} />
        </div>
    );
};

export default PaymentHistory;