import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Building, MapPin, Home, Users, Search, Star,
    ArrowRight, Shield, Wrench, MessageSquare, ChevronRight, Loader
} from 'lucide-react';

const API = 'http://localhost:8000/api';

const PublicHome = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const res = await fetch(`${API}/public/properties/`);
                const data = await res.json();
                setProperties(data);
            } catch (err) {
                console.error("Failed to load properties:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProperties();
    }, []);

    const filtered = properties.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.address.toLowerCase().includes(search.toLowerCase()) ||
        p.city.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 font-sans">

            {/* ═══ NAVBAR ═══ */}
            <nav className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-600 p-1.5 rounded-lg">
                            <Building className="text-white" size={18} />
                        </div>
                        <span className="text-lg font-bold text-white">Prop<span className="text-blue-400">AI</span> OS</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <a href="#properties" className="text-sm text-gray-400 hover:text-white transition">Properties</a>
                        <a href="#features" className="text-sm text-gray-400 hover:text-white transition">Features</a>
                        <Link to="/login" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition">
                            Tenant Login
                        </Link>
                    </div>
                </div>
            </nav>

            {/* ═══ HERO SECTION ═══ */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-gray-950 to-purple-900/20" />
                <div className="relative max-w-6xl mx-auto px-6 py-24 text-center">
                    <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-full px-4 py-1.5 mb-6">
                        <Star size={14} className="text-blue-400" />
                        <span className="text-xs text-blue-300 font-bold">AI-Powered Property Management</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
                        Find Your Perfect<br />
                        <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Home in Dubai</span>
                    </h1>
                    <p className="text-gray-400 text-lg mt-6 max-w-2xl mx-auto">
                        Browse premium properties across Dubai. AI-powered maintenance, smart pricing, and 24/7 chatbot support for every tenant.
                    </p>

                    {/* Search Bar */}
                    <div className="mt-10 max-w-xl mx-auto relative">
                        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search by property name, area, or city..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-gray-800/80 border border-gray-700 text-white rounded-xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm"
                        />
                    </div>

                    <div className="flex justify-center gap-8 mt-10 text-sm">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-blue-400">{properties.length}</p>
                            <p className="text-gray-500">Properties</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-green-400">
                                {properties.reduce((sum, p) => sum + p.vacant_units, 0)}
                            </p>
                            <p className="text-gray-500">Available Units</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-purple-400">24/7</p>
                            <p className="text-gray-500">AI Support</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ PROPERTIES ═══ */}
            <section id="properties" className="max-w-6xl mx-auto px-6 py-16">
                <h2 className="text-2xl font-bold text-white mb-8">
                    Available Properties
                    <span className="text-gray-500 text-base font-normal ml-3">{filtered.length} found</span>
                </h2>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader className="animate-spin text-blue-500" size={40} />
                    </div>
                ) : filtered.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filtered.map(p => (
                            <Link
                                key={p.id}
                                to={`/property/${p.id}`}
                                className="group bg-gray-800/50 border border-gray-700 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all hover:shadow-xl hover:shadow-blue-900/10"
                            >
                                {/* Image */}
                                <div className="h-48 bg-gradient-to-br from-blue-900/40 to-gray-800 flex items-center justify-center">
                                    {p.image ? (
                                        <img src={`http://localhost:8000${p.image}`} alt={p.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <Building size={48} className="text-gray-600" />
                                    )}
                                </div>

                                {/* Info */}
                                <div className="p-5">
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="font-bold text-white text-lg group-hover:text-blue-400 transition">{p.name}</h3>
                                        <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-full px-2 py-0.5 shrink-0">
                                            {p.type}
                                        </span>
                                    </div>

                                    <p className="text-sm text-gray-400 flex items-center gap-1 mb-4">
                                        <MapPin size={14} /> {p.address}
                                    </p>

                                    <div className="flex items-center justify-between border-t border-gray-700 pt-3">
                                        <div className="flex items-center gap-4 text-xs">
                                            <span className="text-gray-400">
                                                <span className="text-white font-bold">{p.total_units}</span> Units
                                            </span>
                                            <span className={`font-bold ${p.vacant_units > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                {p.vacant_units > 0 ? `${p.vacant_units} Available` : 'Fully Occupied'}
                                            </span>
                                        </div>
                                        <ChevronRight size={16} className="text-gray-600 group-hover:text-blue-400 transition" />
                                    </div>

                                    {p.min_rent > 0 && (
                                        <p className="text-xs text-gray-500 mt-2">
                                            From <span className="text-green-400 font-bold">AED {p.min_rent.toLocaleString()}</span>/year
                                        </p>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <Building size={48} className="text-gray-700 mx-auto mb-4" />
                        <p className="text-gray-500">No properties found matching your search.</p>
                    </div>
                )}
            </section>

            {/* ═══ FEATURES ═══ */}
            <section id="features" className="bg-gray-900/50 border-y border-gray-800 py-16">
                <div className="max-w-6xl mx-auto px-6">
                    <h2 className="text-2xl font-bold text-white text-center mb-12">Why Choose PropAI OS?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[
                            { icon: <Wrench size={24} />, color: 'text-orange-400', title: 'AI Maintenance', desc: 'Upload a photo — AI detects the issue, sets priority, and assigns the right technician instantly.' },
                            { icon: <MessageSquare size={24} />, color: 'text-blue-400', title: '24/7 AI Chatbot', desc: 'Ask about payments, lease details, building rules — our AI assistant knows everything about your property.' },
                            { icon: <Shield size={24} />, color: 'text-green-400', title: 'Smart Pricing', desc: 'AI analyzes Dubai market data to ensure fair, competitive rent for every unit.' },
                            { icon: <Users size={24} />, color: 'text-purple-400', title: 'Tenant Portal', desc: 'Track payments, view lease, submit requests, and get real-time notifications — all in one place.' },
                        ].map((f, i) => (
                            <div key={i} className="bg-gray-800/50 border border-gray-700 rounded-xl p-5 text-center">
                                <div className={`${f.color} mb-3 flex justify-center`}>{f.icon}</div>
                                <h3 className="font-bold text-white text-sm mb-2">{f.title}</h3>
                                <p className="text-xs text-gray-400 leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ FOOTER ═══ */}
            <footer className="bg-gray-900 border-t border-gray-800 py-10">
                <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-600 p-1.5 rounded-lg">
                            <Building className="text-white" size={16} />
                        </div>
                        <span className="font-bold text-white">PropAI OS</span>
                        <span className="text-xs text-gray-500">— Dubai's Smart Property Platform</span>
                    </div>
                    <p className="text-xs text-gray-600">Built with AI in Dubai 🇦🇪</p>
                </div>
            </footer>
        </div>
    );
};

export default PublicHome;