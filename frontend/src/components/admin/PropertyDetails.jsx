import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import AddUnitForm from './AddUnitForm';
import LeaseForm from './LeaseForm';
import { useTheme } from '../../context/ThemeContext';
import { ArrowLeft, Home, Plus, Trash2 } from 'lucide-react';

function PropertyDetails() {
    const { c, isDark } = useTheme();
    const { id } = useParams();
    const navigate = useNavigate();
    const [property, setProperty] = useState(null);
    const [units, setUnits] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [editingUnit, setEditingUnit] = useState(null);
    const [leasingUnit, setLeasingUnit] = useState(null);

    const fetchData = async () => {
        try {
            const [propRes, unitsRes] = await Promise.all([
                api.get('properties/' + id + '/'),
                api.get('units/?property_id=' + id)
            ]);
            setProperty(propRes.data);
            setUnits(unitsRes.data);
        } catch (err) { console.error("Error:", err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, [id]);

    const handleEdit = (unit) => { setEditingUnit(unit); setShowModal(true); };
    const handleDelete = async (unitId) => {
        if (window.confirm("Delete this unit?")) {
            try { await api.delete('units/' + unitId + '/'); setUnits(units.filter(u => u.id !== unitId)); fetchData(); }
            catch { alert("Could not delete unit."); }
        }
    };
    const handleCloseModal = () => { setShowModal(false); setEditingUnit(null); };

    if (loading) return <div className={c.textSec + ' p-6'}>Loading Building Details...</div>;
    if (!property) return <div className="p-6 text-rose-500">Property not found</div>;

    const getStatus = (s) => { switch(s) { case 'VACANT': return c.greenBg; case 'OCCUPIED': return c.redBg; default: return c.yellowBg; }};

    return (
        <div className="fade-in">
            <button onClick={() => navigate('/properties')} className={'flex items-center mb-6 transition text-sm ' + c.textSec}>
                <ArrowLeft size={18} className="mr-2" /> Back to Properties
            </button>
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className={'text-2xl font-extrabold mb-2 ' + c.heading}>{property.name}</h1>
                    <p className={c.textSec}>{property.address}, {property.city}</p>
                </div>
                <div className={'p-4 rounded-2xl border text-center ' + c.card + ' ' + c.border}>
                    <p className={'text-[10px] uppercase font-bold ' + c.textMut}>Occupancy</p>
                    <p className={'text-2xl font-extrabold ' + c.green}>{property.occupied_units} / {property.total_units}</p>
                </div>
            </div>

            <div className={'rounded-2xl border overflow-hidden ' + c.card + ' ' + c.border + ' ' + c.shadow}>
                <div className={'p-4 border-b flex justify-between items-center ' + c.border + ' ' + c.bg}>
                    <h3 className={'text-base font-bold flex items-center ' + c.heading}><Home size={18} className={'mr-2 ' + c.accent} /> Units</h3>
                    <button onClick={() => setShowModal(true)}
                        className={c.btn + ' px-3 py-1.5 rounded-lg text-sm font-bold flex items-center shadow-lg shadow-amber-500/20'}>
                        <Plus size={16} className="mr-1" /> Add Unit
                    </button>
                </div>

                {units.length === 0 ? (
                    <div className={'p-8 text-center ' + c.textMut}>No units added yet.</div>
                ) : (
                    <table className={'w-full text-left text-sm ' + c.text}>
                        <thead className={c.bg}><tr>
                            {['Unit #','Type','Rent (Yearly)','Status','Actions'].map(h =>
                                <th key={h} className={'px-6 py-3 text-[10px] uppercase font-bold tracking-wider ' + c.textMut + (h==='Actions'?' text-right':'')}>{h}</th>)}
                        </tr></thead>
                        <tbody className={'divide-y ' + c.border}>
                            {units.map(unit => (
                                <tr key={unit.id} className={'transition ' + (isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-gray-50')}>
                                    <td className={'px-6 py-4 font-bold ' + c.heading}>{unit.unit_number}</td>
                                    <td className={'px-6 py-4 ' + c.textSec}>{unit.unit_type}</td>
                                    <td className={'px-6 py-4 font-mono font-bold ' + c.green}>AED {unit.yearly_rent}</td>
                                    <td className="px-6 py-4">
                                        <span className={'px-2 py-1 rounded-md text-[10px] font-bold border ' + getStatus(unit.status)}>{unit.status}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                                        {unit.status === 'VACANT' && (
                                            <button onClick={() => setLeasingUnit(unit)}
                                                className={'px-3 py-1 rounded-lg text-xs font-bold transition border ' + c.greenBg}>Rent</button>
                                        )}
                                        <button onClick={() => handleEdit(unit)}
                                            className={'px-3 py-1 rounded-lg text-xs font-bold transition border ' + c.accentBg}>Edit</button>
                                        <button onClick={() => handleDelete(unit.id)}
                                            className={'p-1 rounded-lg transition border ' + c.redBg} title="Delete"><Trash2 size={16} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {showModal && <AddUnitForm propertyId={id} initialData={editingUnit} onSuccess={() => { handleCloseModal(); fetchData(); }} onCancel={handleCloseModal} />}
            {leasingUnit && <LeaseForm unit={leasingUnit} onSuccess={() => { setLeasingUnit(null); fetchData(); }} onCancel={() => setLeasingUnit(null)} />}
        </div>
    );
}

export default PropertyDetails;