import { useState, useEffect } from 'react';
import api from '../../api/axios';
import TenantNav from './TenantNav';
import { useTheme } from '../../context/ThemeContext';
import { CreditCard, Loader, CheckCircle, Clock, AlertTriangle, Banknote, TrendingUp, ArrowDownCircle } from 'lucide-react';

const PaymentHistory = () => {
    const { c, isDark } = useTheme();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        api.get('me/').then(res => setProfile(res.data)).catch(err => console.error(err)).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className={'min-h-screen flex items-center justify-center ' + c.bg}><Loader className={'animate-spin ' + c.accent} size={48} /></div>;

    const cheques = profile?.cheques || [];
    const filtered = filter === 'ALL' ? cheques : cheques.filter(ch => ch.status === filter);
    const totalRent = cheques.reduce((s, ch) => s + ch.amount, 0);
    const totalPaid = cheques.filter(ch => ch.status === 'CLEARED').reduce((s, ch) => s + ch.amount, 0);
    const totalPending = cheques.filter(ch => ch.status === 'PENDING').reduce((s, ch) => s + ch.amount, 0);

    const getIcon = (s) => {
        switch(s) { case 'CLEARED': return <CheckCircle size={18} className={c.green} />; case 'PENDING': return <Clock size={18} className={c.blue} />;
            case 'BOUNCED': return <AlertTriangle size={18} className={c.red} />; case 'DEPOSITED': return <ArrowDownCircle size={18} className={c.yellow} />;
            default: return <Clock size={18} className={c.textMut} />; }
    };
    const getStyle = (s) => {
        switch(s) { case 'CLEARED': return c.greenBg; case 'PENDING': return c.blueBg; case 'BOUNCED': return c.redBg; case 'DEPOSITED': return c.yellowBg;
            default: return isDark ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-gray-100 border-gray-200 text-gray-500'; }
    };

    return (
        <div className={'min-h-screen font-sans pb-24 ' + c.bg + ' ' + c.text}>
            <header className={'border-b p-5 sticky top-0 z-10 ' + c.card + ' ' + c.border}>
                <h1 className={'text-lg font-bold flex items-center gap-2 ' + c.heading}><CreditCard size={20} className={c.green} /> Payment History</h1>
                <p className={'text-xs mt-1 ' + c.textMut}>{profile?.unit ? profile.unit.property + ' • Unit ' + profile.unit.number : ''}</p>
            </header>
            <main className="p-5 max-w-lg mx-auto space-y-5 fade-in">
                <div className="grid grid-cols-3 gap-3">
                    {[{icon:<TrendingUp size={18} className={c.green}/>,label:'Paid',val:totalPaid,color:c.green},
                      {icon:<Clock size={18} className={c.blue}/>,label:'Pending',val:totalPending,color:c.blue},
                      {icon:<Banknote size={18} className={c.heading}/>,label:'Total',val:totalRent,color:c.heading}].map((s,i) => (
                        <div key={i} className={'rounded-xl p-4 border text-center ' + c.card + ' ' + c.border}>
                            <div className="flex justify-center mb-2">{s.icon}</div>
                            <p className={'text-[10px] uppercase font-bold ' + c.textMut}>{s.label}</p>
                            <p className={'text-sm font-bold ' + s.color}>{'AED ' + s.val.toLocaleString()}</p>
                        </div>
                    ))}
                </div>
                <div className={'rounded-xl p-4 border ' + c.card + ' ' + c.border}>
                    <div className="flex justify-between text-xs mb-2">
                        <span className={c.textSec}>Payment Progress</span>
                        <span className={c.green + ' font-bold'}>{totalRent > 0 ? Math.round((totalPaid / totalRent) * 100) : 0}%</span>
                    </div>
                    <div className={'w-full h-2 rounded-full ' + (isDark ? 'bg-[#1e293b]' : 'bg-gray-200')}>
                        <div className="bg-amber-500 h-2 rounded-full transition-all duration-1000" style={{ width: (totalRent > 0 ? (totalPaid / totalRent) * 100 : 0) + '%' }} />
                    </div>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {['ALL','PENDING','CLEARED','DEPOSITED','BOUNCED'].map(s => {
                        const cnt = s === 'ALL' ? cheques.length : cheques.filter(ch => ch.status === s).length;
                        if (cnt === 0 && s !== 'ALL') return null;
                        return (
                            <button key={s} onClick={() => setFilter(s)}
                                className={'px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition border ' + (filter === s ? c.btn : c.btn2)}>
                                {s + ' (' + cnt + ')'}
                            </button>
                        );
                    })}
                </div>
                <div className="space-y-3">
                    {filtered.length > 0 ? filtered.map(ch => (
                        <div key={ch.id} className={'p-4 rounded-xl border transition-all ' + c.card + ' ' + c.border}>
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">{getIcon(ch.status)}
                                    <div><p className={'font-bold ' + c.heading}>{'AED ' + ch.amount.toLocaleString()}</p><p className={'text-[10px] ' + c.textMut}>{'#' + ch.cheque_number}</p></div>
                                </div>
                                <span className={'px-2 py-1 rounded-md text-[10px] font-bold border ' + getStyle(ch.status)}>{ch.status}</span>
                            </div>
                            <div className={'flex justify-between text-xs border-t pt-2 ' + c.border + ' ' + c.textSec}>
                                <span>{'Due: ' + new Date(ch.cheque_date).toLocaleDateString('en-AE',{year:'numeric',month:'short',day:'numeric'})}</span>
                                <span>{ch.bank_name}</span>
                            </div>
                        </div>
                    )) : (
                        <div className={'text-center py-10 border-2 border-dashed rounded-xl ' + c.border}>
                            <CreditCard size={32} className={c.textMut + ' mx-auto mb-3'} /><p className={c.textMut}>No payments found.</p>
                        </div>
                    )}
                </div>
            </main>
            <TenantNav notificationCount={profile?.notifications?.length || 0} />
        </div>
    );
};

export default PaymentHistory;