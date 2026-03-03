import { useState, useEffect } from 'react';
import api from '../../api/axios';
import MaintenanceForm from './MaintenanceForm';
import { useTheme } from '../../context/ThemeContext';
import { Wrench, Plus, User, Trash2 } from 'lucide-react';

function Maintenance() {
    const { c } = useTheme();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const fetchTickets = async () => {
        try { const res = await api.get('maintenance/'); setTickets(res.data); }
        catch (err) { console.error("Error:", err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchTickets(); }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this ticket?")) return;
        try { await api.delete('maintenance/' + id + '/'); fetchTickets(); }
        catch { alert("Failed to delete ticket"); }
    };

    const getPriority = (p) => { switch(p) { case 'EMERGENCY': return c.redBg; case 'HIGH': return c.yellowBg; case 'MEDIUM': return c.blueBg; default: return c.btn2; }};
    const getStatusBar = (s) => { switch(s) { case 'RESOLVED': return 'bg-emerald-500'; case 'IN_PROGRESS': return 'bg-amber-500'; default: return 'bg-gray-500'; }};

    return (
        <div className="fade-in">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className={'text-2xl font-extrabold ' + c.heading}>Maintenance</h1>
                    <p className={c.textSec + ' text-sm mt-1'}>Track repairs and complaints</p>
                </div>
                <button onClick={() => setShowModal(true)}
                    className={c.btn + ' flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-amber-500/20 transition hover:scale-[1.02]'}>
                    <Plus size={18} /> Report Issue
                </button>
            </div>

            {loading ? <div className={c.textSec}>Loading tickets...</div>
            : tickets.length === 0 ? (
                <div className={'p-12 rounded-2xl border text-center ' + c.card + ' ' + c.border}>
                    <div className={'inline-block p-4 rounded-full mb-4 border ' + c.btn2}><Wrench size={48} className={c.textMut} /></div>
                    <h3 className={'text-xl font-bold mb-2 ' + c.heading}>No Issues Reported</h3>
                    <p className={c.textSec}>Everything is running smoothly!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {tickets.map(t => (
                        <div key={t.id} className={'rounded-2xl border p-5 relative overflow-hidden transition group ' + c.card + ' ' + c.border + ' ' + c.shadow + ' ' + c.cardHover}>
                            <button onClick={() => handleDelete(t.id)} className={'absolute top-4 right-4 transition z-10 ' + c.textMut + ' hover:' + c.red} title="Delete"><Trash2 size={18} /></button>
                            <div className={'absolute top-0 left-0 w-1.5 h-full ' + getStatusBar(t.status)} />
                            <div className="pl-3">
                                <span className={'text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wide ' + getPriority(t.priority)}>{t.priority}</span>
                                <span className={'block text-xs font-mono mt-2 ' + c.textMut}>{new Date(t.created_at).toLocaleDateString()}</span>
                                <h3 className={'text-base font-bold mt-1 mb-1 ' + c.heading}>{t.title}</h3>
                                <p className={'text-sm mb-4 line-clamp-2 ' + c.textSec}>{t.description}</p>
                                {t.image && <img src={(import.meta.env.VITE_MEDIA_URL || '') + t.image} alt="Evidence" className={'h-20 w-full object-cover rounded-lg border mb-4 ' + c.border} />}
                                <div className={'flex items-center justify-between mt-4 pt-4 border-t ' + c.border}>
                                    <div><span className={'block text-[10px] uppercase ' + c.textMut}>Location</span><span className={c.heading + ' text-sm'}>Unit {t.unit_number}</span></div>
                                    <div className="flex items-center gap-2">
                                        {t.source === 'SYSTEM' && <User size={14} className={c.accent} />}
                                        <span className={'text-xs font-bold uppercase ' + c.textSec}>{t.status.replace('_', ' ')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && <MaintenanceForm onSuccess={() => { setShowModal(false); fetchTickets(); }} onCancel={() => setShowModal(false)} />}
        </div>
    );
}

export default Maintenance;