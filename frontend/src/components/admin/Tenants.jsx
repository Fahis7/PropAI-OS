import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import TenantForm from './TenantForm';
import { useTheme } from '../../context/ThemeContext';
import { Users, Search, Plus, ArrowLeft, Home, Calendar, MapPin, Trash2 } from 'lucide-react';

function Tenants() {
    const { c, isDark } = useTheme();
    const navigate = useNavigate();
    const [tenants, setTenants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingTenant, setEditingTenant] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchTenants = async () => {
        try { const res = await api.get('tenants/'); setTenants(res.data); }
        catch (err) { console.error("Error:", err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchTenants(); }, []);

    const handleEdit = (t) => { setEditingTenant(t); setShowModal(true); };
    const handleDelete = async (id) => {
        if (window.confirm("Delete this tenant? This cannot be undone.")) {
            try { await api.delete('tenants/' + id + '/'); setTenants(tenants.filter(t => t.id !== id)); }
            catch { alert("Could not delete. Active leases may exist."); }
        }
    };
    const handleClose = () => { setShowModal(false); setEditingTenant(null); };
    const filtered = tenants.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.email.toLowerCase().includes(searchTerm.toLowerCase()) || t.phone.includes(searchTerm));

    return (
        <div className="fade-in">
            <button onClick={() => navigate('/dashboard')} className={'flex items-center mb-6 transition text-sm ' + c.textSec}>
                <ArrowLeft size={18} className="mr-2" /> Back to Dashboard
            </button>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className={'text-2xl font-extrabold flex items-center gap-3 ' + c.heading}><Users className={c.accent} /> Tenants Directory</h1>
                    <p className={c.textSec + ' text-sm mt-1'}>Manage residents and view lease status</p>
                </div>
                <button onClick={() => setShowModal(true)}
                    className={c.btn + ' flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-amber-500/20 transition hover:scale-[1.02]'}>
                    <Plus size={18} /> Onboard Tenant
                </button>
            </div>
            <div className="mb-6 relative max-w-md">
                <Search className={'absolute left-3 top-2.5 ' + c.textMut} size={20} />
                <input type="text" placeholder="Search name, unit, or phone..."
                    className={'w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 ' + c.input + ' ' + c.text}
                    onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className={'rounded-2xl border overflow-hidden ' + c.card + ' ' + c.border + ' ' + c.shadow}>
                <table className={'w-full text-left text-sm ' + c.text}>
                    <thead className={c.bg}><tr>
                        {['Tenant','Residence Info','Contact','Documents','Actions'].map(h =>
                            <th key={h} className={'px-6 py-4 text-[10px] uppercase font-bold tracking-wider ' + c.textMut + (h==='Actions'?' text-right':'')}>{h}</th>)}
                    </tr></thead>
                    <tbody className={'divide-y ' + c.border}>
                        {loading ? <tr><td colSpan="5" className="px-6 py-8 text-center animate-pulse">Loading...</td></tr>
                        : filtered.length === 0 ? <tr><td colSpan="5" className={'px-6 py-12 text-center ' + c.textMut}>No tenants found.</td></tr>
                        : filtered.map(t => (
                            <tr key={t.id} className={'transition ' + (isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-gray-50')}>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-bold shadow">{t.name.charAt(0)}</div>
                                        <div><div className={'font-bold ' + c.heading}>{t.name}</div><div className={'text-xs ' + c.textMut}>ID: #{t.id}</div></div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">{t.active_lease ? (
                                    <div className="space-y-1">
                                        <div className={'flex items-center gap-2 text-xs uppercase font-bold tracking-wider ' + c.textSec}><MapPin size={12} className={c.accent} />{t.active_lease.unit_details?.property_details?.name || 'Property'}</div>
                                        <div className={'flex items-center gap-2 font-bold text-base ' + c.heading}><Home size={16} className={c.green} />Unit {t.active_lease.unit_details?.unit_number}</div>
                                        <div className={'flex items-center gap-1 text-xs ' + c.textMut}><Calendar size={12} />Ends: {t.active_lease.end_date}</div>
                                    </div>
                                ) : <span className={'px-2.5 py-1 rounded-md text-xs font-medium border ' + c.btn2}>No Active Lease</span>}</td>
                                <td className="px-6 py-4"><div className="space-y-1"><span className={c.heading}>{t.email}</span><span className={'block text-xs font-mono ' + c.accent}>{t.phone}</span></div></td>
                                <td className="px-6 py-4"><div className={'text-xs space-y-1 ' + c.textSec}><div>Nat: <span className={c.heading}>{t.nationality||'-'}</span></div><div>Pass: <span className={'font-mono ' + c.heading}>{t.passport_number||'-'}</span></div></div></td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => handleEdit(t)} className={c.btn2 + ' px-3 py-1.5 rounded-lg text-xs font-bold transition'}>Edit</button>
                                        <button onClick={() => handleDelete(t.id)} className={'p-1.5 rounded-lg transition border ' + c.redBg} title="Delete"><Trash2 size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {showModal && <TenantForm initialData={editingTenant} onSuccess={() => { handleClose(); fetchTenants(); }} onCancel={handleClose} />}
        </div>
    );
}

export default Tenants;