import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import TenantNav from './TenantNav';
import { useTheme } from '../../context/ThemeContext';
import {
    CreditCard, Loader, CheckCircle, Clock, AlertTriangle,
    Banknote, TrendingUp, ArrowDownCircle
} from 'lucide-react';

const PaymentHistory = () => {
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

    const getChequeStyle = (status) => {
        switch (status) {
            case 'CLEARED': return c.greenBg;
            case 'PENDING': return c.blueBg;
            case 'BOUNCED': return c.redBg;
            case 'DEPOSITED': return c.yellowBg;
            default: return isDark ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-500';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'CLEARED': return <CheckCircle size={18} className={c.green} />;
            case 'PENDING': return <Clock size={18} className={c.blue} />;
            case 'BOUNCED': return <AlertTriangle size={18} className={c.red} />;
            case 'DEPOSITED': return <ArrowDownCircle size={18} className={c.yellow} />;
            default: return <Clock size={18} className={c.textMut} />;
        }
    };

    if (loading) return (
        <div className={"min-h-screen flex items-center justify-center " + c.bg}>
            <Loader className={"animate-spin " + c.accent} size={48} />
        </div>
    );

    const cheques = profile?.cheques || [];
    const filtered = filter === 'ALL' ? cheques : cheques.filter(ch => ch.status === filter);
    const totalRent = cheques.reduce((sum, ch) => sum + ch.amount, 0);
    const totalPaid = cheques.filter(ch => ch.status === 'CLEARED').reduce((sum, ch) => sum + ch.amount, 0);
    const totalPending = cheques.filter(ch => ch.status === 'PENDING').reduce((sum, ch) => sum + ch.amount, 0);
    const notifCount = profile?.notifications?.length || 0;

    return (
        <div className={"min-h-screen font-sans pb-24 " + c.bg + " " + c.text}>

            <header className={"border-b p-5 sticky top-0 z-10 " + c.card + " " + c.border}>
                <h1 className={"text-lg font-bold flex items-center gap-2 " + c.heading}>
                    <CreditCard size={20} className={c.green} /> Payment History
                </h1>
                <p className={"text-xs mt-1 " + c.textMut}>
                    {profile?.unit ? `${profile.unit.property} • Unit ${profile.unit.number}` : ''}
                </p>
            </header>

            <main className="p-5 max-w-lg mx-auto space-y-5">

                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { icon: TrendingUp, label: 'Paid', value: totalPaid, color: c.green },
                        { icon: Clock, label: 'Pending', value: totalPending, color: c.blue },
                        { icon: Banknote, label: 'Total', value: totalRent, color: c.heading },
                    ].map((item, i) => (
                        <div key={i} className={"rounded-xl p-4 border text-center " + c.card + " " + c.border}>
                            <item.icon size={18} className={item.color + " mx-auto mb-2"} />
                            <p className={"text-[10px] uppercase font-bold " + c.textMut}>{item.label}</p>
                            <p className={"text-sm font-bold " + item.color}>AED {item.value.toLocaleString()}</p>
                        </div>
                    ))}
                </div>

                {/* Progress Bar */}
                <div className={"rounded-xl p-4 border " + c.card + " " + c.border}>
                    <div className="flex justify-between text-xs mb-2">
                        <span className={c.textMut}>Payment Progress</span>
                        <span className={c.green + " font-bold"}>
                            {totalRent > 0 ? Math.round((totalPaid / totalRent) * 100) : 0}%
                        </span>
                    </div>
                    <div className={"w-full h-2 rounded-full " + (isDark ? "bg-gray-700" : "bg-gray-200")}>
                        <div className="bg-emerald-500 h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${totalRent > 0 ? (totalPaid / totalRent) * 100 : 0}%` }} />
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {['ALL', 'PENDING', 'CLEARED', 'DEPOSITED', 'BOUNCED'].map((status) => {
                        const count = status === 'ALL' ? cheques.length : cheques.filter(ch => ch.status === status).length;
                        if (count === 0 && status !== 'ALL') return null;
                        return (
                            <button key={status} onClick={() => setFilter(status)}
                                className={"px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition border " +
                                    (filter === status ? c.btn : c.btn2)}>
                                {status} ({count})
                            </button>
                        );
                    })}
                </div>

                {/* Cheque List */}
                <div className="space-y-3">
                    {filtered.length > 0 ? (
                        filtered.map((cheque) => (
                            <div key={cheque.id} className={"p-4 rounded-xl border transition-all " + getChequeStyle(cheque.status)}>
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        {getStatusIcon(cheque.status)}
                                        <div>
                                            <p className={"font-bold " + c.heading}>AED {cheque.amount.toLocaleString()}</p>
                                            <p className={"text-[10px] " + c.textMut}>#{cheque.cheque_number}</p>
                                        </div>
                                    </div>
                                    <span className={"px-2 py-1 rounded-md text-[10px] font-bold border " + getChequeStyle(cheque.status)}>
                                        {cheque.status}
                                    </span>
                                </div>
                                <div className={"flex justify-between text-xs pt-2 border-t " + c.textMut + " " + (isDark ? "border-white/5" : "border-gray-200")}>
                                    <span>Due: {new Date(cheque.cheque_date).toLocaleDateString('en-AE', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                    <span>{cheque.bank_name}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className={"text-center py-10 border-2 border-dashed rounded-xl " + c.border}>
                            <CreditCard size={32} className={c.textMut + " mx-auto mb-3"} />
                            <p className={c.textMut}>No payments found.</p>
                        </div>
                    )}
                </div>
            </main>
            <TenantNav notificationCount={notifCount} />
        </div>
    );
};

export default PaymentHistory;