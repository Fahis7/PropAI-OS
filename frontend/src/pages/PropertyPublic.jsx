import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    Building, MapPin, Home, Bed, Bath, Maximize, ArrowLeft,
    Phone, Send, CheckCircle, Loader, Users, ChevronDown, ChevronUp
} from 'lucide-react';

const API = 'http://localhost:8000/api';

const PropertyPublic = () => {
    const { propertyId } = useParams();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({ customer_name: '', customer_email: '', customer_phone: '', message: '' });

    useEffect(() => {
        const fetchProperty = async () => {
            try {
                const res = await fetch(`${API}/public/properties/${propertyId}/`);
                if (!res.ok) throw new Error('Not found');
                const data = await res.json();
                setProperty(data);
            } catch (err) {
                console.error("Failed to load property:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProperty();
    }, [propertyId]);

    const handleInquiry = async (e) => {
        e.preventDefault();
        if (!form.customer_name || !form.customer_phone) return;
        setSubmitting(true);
        try {
            const res = await fetch(`${API}/public/inquiries/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    property_id: property.id,
                    unit_id: selectedUnit?.id || null,
                }),
            });
            if (!res.ok) throw new Error('Failed');
            setSubmitted(true);
        } catch (err) {
            alert('Failed to submit. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const openInquiry = (unit) => {
        setSelectedUnit(unit);
        setShowForm(true);
        setSubmitted(false);
        setForm({ customer_name: '', customer_email: '', customer_phone: '', message: '' });
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
            <Loader className="animate-spin text-blue-500" size={48} />
        </div>
    );

    if (!property) return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center text-center px-4">
            <div>
                <Building size={48} className="text-gray-600 mx-auto mb-4" />
                <p className="text-white text-lg font-bold">Property Not Found</p>
                <Link to="/" className="text-blue-400 text-sm mt-2 inline-block">← Back to Properties</Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 font-sans">

            {/* Navbar */}
            <nav className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="bg-blue-600 p-1.5 rounded-lg">
                            <Building className="text-white" size={18} />
                        </div>
                        <span className="text-lg font-bold text-white">Prop<span className="text-blue-400">AI</span> OS</span>
                    </Link>
                    <Link to="/login" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition">
                        Tenant Login
                    </Link>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto px-6 py-8">

                {/* Back */}
                <Link to="/" className="text-sm text-gray-400 hover:text-blue-400 flex items-center gap-1 mb-6 transition">
                    <ArrowLeft size={16} /> Back to Properties
                </Link>

                {/* Property Header */}
                <div className="bg-gray-800/50 border border-gray-700 rounded-2xl overflow-hidden mb-8">
                    <div className="h-56 bg-gradient-to-br from-blue-900/40 to-gray-800 flex items-center justify-center">
                        {property.image ? (
                            <img src={`http://localhost:8000${property.image}`} alt={property.name} className="w-full h-full object-cover" />
                        ) : (
                            <Building size={64} className="text-gray-600" />
                        )}
                    </div>
                    <div className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-white">{property.name}</h1>
                                <p className="text-gray-400 flex items-center gap-1 mt-1">
                                    <MapPin size={16} /> {property.address}, {property.city}
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-center px-4 py-2 bg-gray-900 rounded-xl border border-gray-700">
                                    <p className="text-xl font-bold text-blue-400">{property.total_units}</p>
                                    <p className="text-[10px] text-gray-500 uppercase">Total Units</p>
                                </div>
                                <div className="text-center px-4 py-2 bg-gray-900 rounded-xl border border-green-500/30">
                                    <p className="text-xl font-bold text-green-400">{property.vacant_units}</p>
                                    <p className="text-[10px] text-gray-500 uppercase">Available</p>
                                </div>
                                <div className="text-center px-4 py-2 bg-gray-900 rounded-xl border border-gray-700">
                                    <p className="text-xl font-bold text-yellow-400">{property.occupied_units}</p>
                                    <p className="text-[10px] text-gray-500 uppercase">Occupied</p>
                                </div>
                            </div>
                        </div>
                        {property.description && (
                            <p className="text-sm text-gray-400 mt-4 leading-relaxed">{property.description}</p>
                        )}
                        {property.manager && (
                            <div className="mt-4 flex items-center gap-3 bg-blue-900/20 border border-blue-500/20 rounded-lg p-3">
                                <Users size={18} className="text-blue-400" />
                                <span className="text-sm text-gray-300">
                                    Managed by <span className="text-white font-bold">{property.manager.name}</span>
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Available Units */}
                <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
                    <Home size={20} className="text-green-400" />
                    Available Units
                    <span className="text-gray-500 text-sm font-normal">({property.units.length} vacant)</span>
                </h2>

                {property.units.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {property.units.map(unit => (
                            <div key={unit.id} className="bg-gray-800/50 border border-gray-700 rounded-2xl overflow-hidden hover:border-green-500/30 transition">
                                {/* Unit Header */}
                                <div className="bg-gradient-to-r from-green-900/20 to-gray-800 p-4 border-b border-gray-700">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-bold text-white text-lg">{unit.unit_number}</h3>
                                        <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/30 rounded-full px-3 py-0.5 font-bold">
                                            Available
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">{unit.unit_type}</p>
                                </div>

                                {/* Unit Details */}
                                <div className="p-4 space-y-3">
                                    <div className="grid grid-cols-3 gap-2 text-center">
                                        <div className="bg-gray-900 rounded-lg p-2">
                                            <Bed size={16} className="text-blue-400 mx-auto mb-1" />
                                            <p className="text-white font-bold text-sm">{unit.bedrooms}</p>
                                            <p className="text-[10px] text-gray-500">Beds</p>
                                        </div>
                                        <div className="bg-gray-900 rounded-lg p-2">
                                            <Bath size={16} className="text-blue-400 mx-auto mb-1" />
                                            <p className="text-white font-bold text-sm">{unit.bathrooms}</p>
                                            <p className="text-[10px] text-gray-500">Baths</p>
                                        </div>
                                        <div className="bg-gray-900 rounded-lg p-2">
                                            <Maximize size={16} className="text-blue-400 mx-auto mb-1" />
                                            <p className="text-white font-bold text-sm">{unit.square_feet || '-'}</p>
                                            <p className="text-[10px] text-gray-500">Sq Ft</p>
                                        </div>
                                    </div>

                                    {/* Pricing */}
                                    <div className="bg-gray-900 rounded-xl p-3 text-center border border-gray-700">
                                        <p className="text-[10px] text-gray-500 uppercase">Yearly Rent</p>
                                        <p className="text-xl font-bold text-green-400">AED {unit.yearly_rent.toLocaleString()}</p>
                                        <p className="text-xs text-gray-500">≈ AED {unit.monthly_rent.toLocaleString()}/month</p>
                                    </div>

                                    {/* CTA */}
                                    <button
                                        onClick={() => openInquiry(unit)}
                                        className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 text-white py-3 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2"
                                    >
                                        <Phone size={16} /> I'm Interested
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-gray-800/30 rounded-2xl border border-gray-700">
                        <Home size={48} className="text-gray-700 mx-auto mb-4" />
                        <p className="text-gray-500 font-bold">No Vacant Units</p>
                        <p className="text-gray-600 text-sm mt-1">All units are currently occupied. Check back later!</p>
                        <button
                            onClick={() => openInquiry(null)}
                            className="mt-4 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg text-sm font-bold transition"
                        >
                            Join Waiting List
                        </button>
                    </div>
                )}

                {/* Building Rules */}
                {property.rules && (
                    <div className="mt-8 bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
                        <h3 className="text-sm font-bold text-gray-400 uppercase mb-3">📋 Building Rules & Regulations</h3>
                        <pre className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed font-sans">{property.rules}</pre>
                    </div>
                )}
            </main>

            {/* ═══ INQUIRY MODAL ═══ */}
            {showForm && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-md shadow-2xl overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-green-900/40 to-blue-900/40 p-5 border-b border-gray-700">
                            <h3 className="text-lg font-bold text-white">
                                {selectedUnit ? `Interested in Unit ${selectedUnit.unit_number}` : `Contact ${property.name}`}
                            </h3>
                            {selectedUnit && (
                                <p className="text-sm text-gray-400 mt-1">
                                    {selectedUnit.unit_type} • AED {selectedUnit.yearly_rent.toLocaleString()}/year
                                </p>
                            )}
                        </div>

                        <div className="p-5">
                            {submitted ? (
                                <div className="text-center py-8">
                                    <CheckCircle size={48} className="text-green-400 mx-auto mb-3" />
                                    <p className="font-bold text-green-400 text-lg">Inquiry Submitted!</p>
                                    <p className="text-sm text-gray-400 mt-2">Our property manager will contact you shortly via WhatsApp or phone.</p>
                                    <button
                                        onClick={() => setShowForm(false)}
                                        className="mt-6 bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg text-sm font-bold transition"
                                    >
                                        Close
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleInquiry} className="space-y-4">
                                    <div>
                                        <label className="text-xs text-gray-400 font-bold uppercase">Full Name *</label>
                                        <input
                                            type="text"
                                            value={form.customer_name}
                                            onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                                            placeholder="Ahmed Al Rashid"
                                            className="w-full mt-1 bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 font-bold uppercase">Phone (WhatsApp) *</label>
                                        <input
                                            type="tel"
                                            value={form.customer_phone}
                                            onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
                                            placeholder="+971-50-123-4567"
                                            className="w-full mt-1 bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 font-bold uppercase">Email</label>
                                        <input
                                            type="email"
                                            value={form.customer_email}
                                            onChange={(e) => setForm({ ...form, customer_email: e.target.value })}
                                            placeholder="ahmed@email.com"
                                            className="w-full mt-1 bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 font-bold uppercase">Message (Optional)</label>
                                        <textarea
                                            value={form.message}
                                            onChange={(e) => setForm({ ...form, message: e.target.value })}
                                            placeholder="I'd like to schedule a viewing..."
                                            rows={3}
                                            className="w-full mt-1 bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setShowForm(false)}
                                            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl font-bold text-sm transition"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 disabled:opacity-50 text-white py-3 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2"
                                        >
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
            <footer className="bg-gray-900 border-t border-gray-800 py-8 mt-16">
                <p className="text-center text-xs text-gray-600">PropAI OS — Dubai's Smart Property Platform 🇦🇪</p>
            </footer>
        </div>
    );
};

export default PropertyPublic;