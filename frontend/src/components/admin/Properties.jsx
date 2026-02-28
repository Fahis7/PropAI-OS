import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import PropertyForm from './PropertyForm';
import { useTheme } from '../../context/ThemeContext';
import { Building2, MapPin, Plus, Trash2 } from 'lucide-react';

function Properties() {
    const { c } = useTheme();
    const [properties, setProperties] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchProperties = async () => {
        try { const res = await api.get('properties/'); setProperties(res.data); }
        catch (err) { console.error("Error loading properties:", err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchProperties(); }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure? All units and leases will also be deleted!")) {
            try { await api.delete('properties/' + id + '/'); setProperties(properties.filter(p => p.id !== id)); }
            catch (err) { alert("Could not delete property."); }
        }
    };

    return (
        <div className="fade-in">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className={'text-2xl font-extrabold ' + c.heading}>Properties</h1>
                    <p className={c.textSec + ' text-sm mt-1'}>Manage your buildings and units</p>
                </div>
                <button onClick={() => setShowModal(true)}
                    className={c.btn + ' flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-amber-500/20 transition hover:scale-[1.02]'}>
                    <Plus size={18} /> Add Property
                </button>
            </div>

            {loading ? (
                <div className={c.textSec}>Loading your portfolio...</div>
            ) : properties.length === 0 ? (
                <div className={'p-12 rounded-2xl border text-center ' + c.card + ' ' + c.border}>
                    <div className={'inline-block p-4 rounded-full mb-4 border ' + c.btn2}><Building2 size={48} className={c.textMut} /></div>
                    <h3 className={'text-xl font-bold mb-2 ' + c.heading}>No Properties Yet</h3>
                    <p className={c.textSec}>Add your first building to start managing units.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {properties.map(property => (
                        <div key={property.id} onClick={() => navigate('/properties/' + property.id)}
                            className={'cursor-pointer rounded-2xl overflow-hidden border transition group relative ' + c.card + ' ' + c.border + ' ' + c.cardHover + ' ' + c.shadow}>
                            <div className="h-48 relative overflow-hidden">
                                {property.image ? (
                                    <img src={property.image} alt={property.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                                ) : (
                                    <div className={'flex items-center justify-center h-full ' + c.bg}><Building2 size={64} className={c.textMut} /></div>
                                )}
                                <div className="absolute top-4 left-4 bg-black/60 px-2.5 py-1 rounded-lg text-xs text-white font-mono backdrop-blur-sm">{property.property_type}</div>
                                <button onClick={(e) => { e.stopPropagation(); handleDelete(property.id); }}
                                    className="absolute top-4 right-4 bg-rose-600/80 hover:bg-rose-600 text-white p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all shadow-lg backdrop-blur-sm hover:scale-110"
                                    title="Delete Property"><Trash2 size={16} /></button>
                            </div>
                            <div className="p-5">
                                <h3 className={'text-lg font-bold mb-1 ' + c.heading}>{property.name}</h3>
                                <div className={'flex items-center text-sm mb-4 ' + c.textSec}><MapPin size={14} className="mr-1" /> {property.city}</div>
                                <div className={'grid grid-cols-3 gap-2 border-t pt-4 text-center ' + c.border}>
                                    {[{label:'Total',val:property.total_units,color:c.heading},{label:'Occupied',val:property.occupied_units ?? (property.total_units - property.vacant_units),color:c.blue},{label:'Vacant',val:property.vacant_units,color:c.green}].map((s,i)=>(
                                        <div key={i}><p className={'text-[10px] uppercase tracking-wider ' + c.textMut}>{s.label}</p><p className={'text-lg font-bold ' + s.color}>{s.val}</p></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && <PropertyForm onSuccess={() => { setShowModal(false); fetchProperties(); }} onCancel={() => setShowModal(false)} />}
        </div>
    );
}

export default Properties;