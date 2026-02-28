import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import { useTheme } from '../context/ThemeContext';
import {
    Building, MapPin, Home, Bed, Bath, Maximize, ArrowLeft,
    Phone, Send, CheckCircle, Loader, Users
} from 'lucide-react';

const API = 'http://localhost:8000/api';

const PropertyPublic = () => {
    const { c, isDark } = useTheme();
    const { propertyId } = useParams();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({ customer_name: '', customer_email: '', customer_phone: '', message: '' });

    useEffect(() => {
        fetch(API + '/public/properties/' + propertyId + '/').then(r => { if (!r.ok) throw new Error(); return r.json(); })
            .then(d => setProperty(d)).catch(e => console.error(e)).finally(() => setLoading(false));
    }, [propertyId]);

    const handleInquiry = async (e) => {
        e.preventDefault();
        if (!form.customer_name || !form.customer_phone) return;
        setSubmitting(true);
        try {
            const res = await fetch(API + '/public/inquiries/', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, property_id: property.id, unit_id: selectedUnit?.id || null }),
            });
            if (!res.ok) throw new Error();
            setSubmitted(true);
        } catch { alert('Failed to submit.'); }
        finally { setSubmitting(false); }
    };

    const openInquiry = (unit) => {
        setSelectedUnit(unit); setShowForm(true); setSubmitted(false);
        setForm({ customer_name: '', customer_email: '', customer_phone: '', message: '' });
    };

    if (loading) return <div className={"min-h-screen flex items-center justify-center " + c.bg}><Loader className={"animate-spin " + c.accent} size={48} /></div>;

    if (!property) return (
        <div className={"min-h-screen flex items-center justify-center text-center px-4 " + c.bg}>
            <div><Building size={48} className={c.textMut + " mx-auto mb-4"} /><p className={"text-lg font-bold " + c.heading}>Property Not Found</p>
                <Link to="/" className={c.accent + " text-sm mt-2 inline-block"}>← Back to Properties</Link></div>
        </div>
    );

    return (
        <div className={"min-h-screen font-sans " + c.bg + " " + c.text}>
            {/* Navbar */}
            <nav className={(isDark ? "bg-[#0a0e1a]/80" : "bg-white/80") + " backdrop-blur-xl border-b " + c.border + " sticky top-0 z-50"}>
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2.5">
                        <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-1.5 rounded-lg shadow-lg shadow-amber-500/20"><Building className="text-white" size={18} /></div>
                        <span className={"text-lg font-extrabold tracking-tight " + c.heading}>Prop<span className="text-amber-400">AI</span> OS</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        <Link to="/login" className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white px-5 py-2 rounded-xl text-sm font-bold transition shadow-lg shadow-amber-500/20">
                            Tenant Login
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto px-6 py-8">
                <Link to="/" className={"text-sm flex items-center gap-1 mb-6 transition " + c.textSec + " hover:text-amber-500"}>
                    <ArrowLeft size={16} /> Back to Properties
                </Link>

                {/* Property Header */}
                <div className={"rounded-2xl overflow-hidden mb-8 border " + c.card + " " + c.border}>
                    <div className={(isDark ? "h-56 bg-gradient-to-br from-amber-900/20 to-[#0d1117]" : "h-56 bg-gradient-to-br from-amber-50 to-gray-100") + " flex items-center justify-center overflow-hidden"}>
                        {property.image ? <img src={'http://localhost:8000' + property.image} alt={property.name} className="w-full h-full object-cover" />
                            : <Building size={64} className={c.textMut} />}
                    </div>
                    <div className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <h1 className={"text-2xl font-extrabold " + c.heading}>{property.name}</h1>
                                <p className={c.textSec + " flex items-center gap-1 mt-1"}><MapPin size={16} /> {property.address}, {property.city}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                {[
                                    { val: property.total_units, label: 'Total', color: c.accent },
                                    { val: property.vacant_units, label: 'Available', color: c.green },
                                    { val: property.occupied_units, label: 'Occupied', color: c.yellow },
                                ].map((s, i) => (
                                    <div key={i} className={"text-center px-4 py-2 rounded-xl border " + c.bg + " " + c.border}>
                                        <p className={"text-xl font-extrabold " + s.color}>{s.val}</p>
                                        <p className={"text-[10px] uppercase " + c.textMut}>{s.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {property.description && <p className={"text-sm mt-4 leading-relaxed " + c.textSec}>{property.description}</p>}
                        {property.manager && (
                            <div className={"mt-4 flex items-center gap-3 rounded-xl p-3 border " + c.accentBg}>
                                <Users size={18} className={c.accent} />
                                <span className={"text-sm " + c.textSec}>Managed by <span className={"font-bold " + c.heading}>{property.manager.name}</span></span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Available Units */}
                <h2 className={"text-xl font-extrabold mb-5 flex items-center gap-2 " + c.heading}>
                    <Home size={20} className={c.green} /> Available Units
                    <span className={"text-sm font-normal " + c.textMut}>({property.units.length} vacant)</span>
                </h2>

                {property.units.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {property.units.map(unit => (
                            <div key={unit.id} className={"rounded-2xl overflow-hidden transition border " + c.card + " " + c.border + " " + c.cardHover}>
                                <div className={(isDark ? "bg-gradient-to-r from-emerald-900/10 to-transparent" : "bg-gradient-to-r from-emerald-50 to-transparent") + " p-4 border-b " + c.border}>
                                    <div className="flex justify-between items-center">
                                        <h3 className={"font-bold text-lg " + c.heading}>{unit.unit_number}</h3>
                                        <span className={"text-[10px] font-bold rounded-full px-3 py-0.5 border " + c.greenBg}>Available</span>
                                    </div>
                                    <p className={"text-xs mt-1 " + c.textSec}>{unit.unit_type}</p>
                                </div>
                                <div className="p-4 space-y-3">
                                    <div className="grid grid-cols-3 gap-2 text-center">
                                        {[
                                            { icon: <Bed size={16} />, val: unit.bedrooms, label: 'Beds' },
                                            { icon: <Bath size={16} />, val: unit.bathrooms, label: 'Baths' },
                                            { icon: <Maximize size={16} />, val: unit.square_feet || '-', label: 'Sq Ft' },
                                        ].map((s, i) => (
                                            <div key={i} className={"rounded-xl p-2 " + c.bg}>
                                                <div className={c.accent + " flex justify-center mb-1"}>{s.icon}</div>
                                                <p className={"font-bold text-sm " + c.heading}>{s.val}</p>
                                                <p className={"text-[10px] " + c.textMut}>{s.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className={"rounded-xl p-3 text-center border " + c.bg + " " + c.border}>
                                        <p className={"text-[10px] uppercase " + c.textMut}>Yearly Rent</p>
                                        <p className={"text-xl font-extrabold " + c.green}>AED {unit.yearly_rent.toLocaleString()}</p>
                                        <p className={"text-xs " + c.textMut}>≈ AED {unit.monthly_rent.toLocaleString()}/month</p>
                                    </div>
                                    <button onClick={() => openInquiry(unit)}
                                        className={c.btn + " w-full py-3 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"}>
                                        <Phone size={16} /> I'm Interested
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={"text-center py-16 rounded-2xl border " + c.card + " " + c.border}>
                        <Home size={48} className={c.textMut + " mx-auto mb-4"} />
                        <p className={c.textMut + " font-bold"}>No Vacant Units</p>
                        <p className={"text-sm mt-1 " + c.textMut}>All units are currently occupied.</p>
                        <button onClick={() => openInquiry(null)}
                            className={c.btn + " mt-4 px-6 py-2 rounded-xl text-sm font-bold transition shadow-lg shadow-amber-500/20"}>
                            Join Waiting List
                        </button>
                    </div>
                )}

                {property.rules && (
                    <div className={"mt-8 rounded-2xl p-6 border " + c.card + " " + c.border}>
                        <h3 className={"text-[10px] font-bold uppercase tracking-wider mb-3 " + c.textMut}>📋 Building Rules & Regulations</h3>
                        <pre className={"text-sm whitespace-pre-wrap leading-relaxed font-sans " + c.textSec}>{property.rules}</pre>
                    </div>
                )}
            </main>

            {/* Inquiry Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className={"rounded-2xl border w-full max-w-md overflow-hidden " + c.card + " " + c.border + " " + c.shadow}>
                        <div className="bg-gradient-to-r from-amber-600/20 to-emerald-600/20 p-5 border-b" style={{ borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.08)' }}>
                            <h3 className={"text-lg font-bold " + c.heading}>
                                {selectedUnit ? 'Interested in Unit ' + selectedUnit.unit_number : 'Contact ' + property.name}
                            </h3>
                            {selectedUnit && <p className={"text-sm mt-1 " + c.textSec}>{selectedUnit.unit_type + ' • AED ' + selectedUnit.yearly_rent.toLocaleString() + '/year'}</p>}
                        </div>
                        <div className="p-5">
                            {submitted ? (
                                <div className="text-center py-8">
                                    <CheckCircle size={48} className={c.green + " mx-auto mb-3"} />
                                    <p className={c.green + " font-bold text-lg"}>Inquiry Submitted!</p>
                                    <p className={"text-sm mt-2 " + c.textSec}>Our property manager will contact you shortly via WhatsApp.</p>
                                    <button onClick={() => setShowForm(false)}
                                        className={"mt-6 px-6 py-2 rounded-xl text-sm font-bold transition border " + c.btn2}>Close</button>
                                </div>
                            ) : (
                                <form onSubmit={handleInquiry} className="space-y-4">
                                    {[
                                        { label: 'Full Name *', key: 'customer_name', placeholder: 'Ahmed Al Rashid', type: 'text', required: true },
                                        { label: 'Phone (WhatsApp) *', key: 'customer_phone', placeholder: '+971-50-123-4567', type: 'tel', required: true },
                                        { label: 'Email', key: 'customer_email', placeholder: 'ahmed@email.com', type: 'email' },
                                    ].map(f => (
                                        <div key={f.key}>
                                            <label className={"text-xs font-bold uppercase " + c.textMut}>{f.label}</label>
                                            <input type={f.type} value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                                                placeholder={f.placeholder} required={f.required}
                                                className={"w-full mt-1 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 " + c.input + " " + c.text} />
                                        </div>
                                    ))}
                                    <div>
                                        <label className={"text-xs font-bold uppercase " + c.textMut}>Message (Optional)</label>
                                        <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                                            placeholder="I'd like to schedule a viewing..." rows={3}
                                            className={"w-full mt-1 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none " + c.input + " " + c.text} />
                                    </div>
                                    <div className="flex gap-3">
                                        <button type="button" onClick={() => setShowForm(false)}
                                            className={"flex-1 py-3 rounded-xl font-bold text-sm transition border " + c.btn2}>Cancel</button>
                                        <button type="submit" disabled={submitting}
                                            className={c.btn + " flex-1 py-3 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-amber-500/20"}>
                                            {submitting ? 'Sending...' : <><Send size={16} /> Submit Inquiry</>}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer className={c.card + " border-t " + c.border + " py-8 mt-16"}>
                <p className={"text-center text-xs " + c.textMut}>PropAI OS — Dubai's Smart Property Platform 🇦🇪</p>
            </footer>
        </div>
    );
};

export default PropertyPublic;