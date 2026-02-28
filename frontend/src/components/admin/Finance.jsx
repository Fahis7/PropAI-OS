import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useTheme } from '../../context/ThemeContext';
import { CheckCircle, Clock } from 'lucide-react';
import ChequeActionForm from './ChequeActionForm';

function Finance() {
    const { c, isDark } = useTheme();
    const [cheques, setCheques] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const [selectedCheque, setSelectedCheque] = useState(null);

    const fetchCheques = async () => {
        try { const res = await api.get('cheques/'); setCheques(res.data); }
        catch (err) { console.error("Error:", err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchCheques(); }, []);

    const totalPending = cheques.filter(ch => ch.status === 'PENDING').reduce((s, ch) => s + parseFloat(ch.amount), 0);
    const totalCollected = cheques.filter(ch => ch.status === 'CLEARED').reduce((s, ch) => s + parseFloat(ch.amount), 0);
    const filtered = filter === 'ALL' ? cheques : cheques.filter(ch => ch.status === filter);

    const getStatusStyle = (s) => { switch(s) { case 'PENDING': return c.yellowBg; case 'DEPOSITED': return c.blueBg; case 'CLEARED': return c.greenBg; case 'BOUNCED': return c.redBg; default: return c.btn2; }};

    return (
        <div className="fade-in">
            <h1 className={'text-2xl font-extrabold mb-1 ' + c.heading}>Finance</h1>
            <p className={c.textSec + ' text-sm mb-8'}>Track rent cheques and cash flow</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className={'flex items-center p-5 rounded-2xl border ' + c.card + ' ' + c.border + ' ' + c.shadow}>
                    <div className={'p-3 rounded-xl mr-4 border ' + c.yellowBg}><Clock size={28} /></div>
                    <div><p className={'text-[10px] uppercase font-bold ' + c.textMut}>Pending Collections</p><p className={'text-2xl font-extrabold ' + c.heading}>AED {totalPending.toLocaleString()}</p></div>
                </div>
                <div className={'flex items-center p-5 rounded-2xl border ' + c.card + ' ' + c.border + ' ' + c.shadow}>
                    <div className={'p-3 rounded-xl mr-4 border ' + c.greenBg}><CheckCircle size={28} /></div>
                    <div><p className={'text-[10px] uppercase font-bold ' + c.textMut}>Total Cleared</p><p className={'text-2xl font-extrabold ' + c.heading}>AED {totalCollected.toLocaleString()}</p></div>
                </div>
            </div>

            <div className="flex gap-2 mb-6 overflow-x-auto">
                {['ALL','PENDING','DEPOSITED','CLEARED','BOUNCED'].map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                        className={'px-4 py-2 rounded-xl text-sm font-bold transition border ' + (filter === f ? c.btn : c.btn2)}>{f}</button>
                ))}
            </div>

            <div className={'rounded-2xl border overflow-hidden ' + c.card + ' ' + c.border + ' ' + c.shadow}>
                <table className={'w-full text-left text-sm ' + c.text}>
                    <thead className={c.bg}><tr>
                        {['Due Date','Tenant','Unit','Amount','Status','Cheque #','Actions'].map(h =>
                            <th key={h} className={'px-6 py-3 text-[10px] uppercase font-bold tracking-wider ' + c.textMut + (h==='Actions'?' text-right':'')}>{h}</th>)}
                    </tr></thead>
                    <tbody className={'divide-y ' + c.border}>
                        {loading ? <tr><td colSpan="7" className="px-6 py-4 text-center">Loading...</td></tr>
                        : filtered.length === 0 ? <tr><td colSpan="7" className={'px-6 py-8 text-center ' + c.textMut}>No cheques found.</td></tr>
                        : filtered.map(ch => (
                            <tr key={ch.id} className={'transition ' + (isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-gray-50')}>
                                <td className={'px-6 py-4 font-mono ' + c.heading}>{ch.cheque_date}</td>
                                <td className={'px-6 py-4 font-bold ' + c.heading}>{ch.tenant_name}</td>
                                <td className={'px-6 py-4 ' + c.accent}>{ch.unit_number || '-'}</td>
                                <td className={'px-6 py-4 font-mono text-base font-bold ' + c.heading}>AED {parseFloat(ch.amount).toLocaleString()}</td>
                                <td className="px-6 py-4"><span className={'px-2 py-1 rounded-md text-[10px] font-bold border ' + getStatusStyle(ch.status)}>{ch.status}</span></td>
                                <td className={'px-6 py-4 font-mono text-xs ' + c.textMut}>{ch.cheque_number}</td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => setSelectedCheque(ch)}
                                        className={'px-3 py-1.5 rounded-lg text-xs font-bold transition border ' + c.accentBg}>Manage</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedCheque && <ChequeActionForm cheque={selectedCheque} onSuccess={() => { setSelectedCheque(null); fetchCheques(); }} onCancel={() => setSelectedCheque(null)} />}
        </div>
    );
}

export default Finance;