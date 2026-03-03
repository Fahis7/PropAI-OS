import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import { useTheme } from '../context/ThemeContext';
import {
    Building, MapPin, Search, Star,
    Shield, Wrench, MessageSquare, ChevronRight, Loader, Users
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/';

const PublicHome = () => {
    const { c, isDark } = useTheme();
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetch(API + '/public/properties/').then(r => r.json()).then(d => setProperties(d))
            .catch(e => console.error(e)).finally(() => setLoading(false));
    }, []);

    const filtered = properties.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.address.toLowerCase().includes(search.toLowerCase()) ||
        p.city.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className={"min-h-screen font-sans " + c.bg + " " + c.text}>

            {/* Navbar */}
            <nav className={(isDark ? "bg-[#0a0e1a]/80" : "bg-white/80") + " backdrop-blur-xl border-b " + c.border + " sticky top-0 z-50"}>
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-1.5 rounded-lg shadow-lg shadow-amber-500/20">
                            <Building className="text-white" size={18} />
                        </div>
                        <span className={"text-lg font-extrabold tracking-tight " + c.heading}>Prop<span className="text-amber-400">AI</span> OS</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <a href="#properties" className={c.textSec + " text-sm hover:text-amber-500 transition"}>Properties</a>
                        <a href="#features" className={c.textSec + " text-sm hover:text-amber-500 transition"}>Features</a>
                        <ThemeToggle />
                        <Link to="/login" className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white px-5 py-2 rounded-xl text-sm font-bold transition shadow-lg shadow-amber-500/20">
                            Tenant Login
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="relative overflow-hidden">
                <div className={"absolute inset-0 " + (isDark ? "bg-gradient-to-br from-amber-900/15 via-transparent to-purple-900/10" : "bg-gradient-to-br from-amber-50 via-white to-purple-50")} />
                <div className={"absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-3xl " + (isDark ? "bg-amber-500/5" : "bg-amber-200/20")} />
                <div className="relative max-w-6xl mx-auto px-6 py-24 text-center">
                    <div className={"inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 border " + c.accentBg}>
                        <Star size={14} className={c.accent} />
                        <span className={"text-xs font-bold tracking-wider " + c.accent}>AI-Powered Property Management</span>
                    </div>
                    <h1 className={"text-4xl md:text-6xl font-extrabold leading-tight tracking-tight " + c.heading}>
                        Find Your Perfect<br />
                        <span className="bg-gradient-to-r from-amber-500 to-yellow-400 bg-clip-text text-transparent">Home in Dubai</span>
                    </h1>
                    <p className={c.textSec + " text-lg mt-6 max-w-2xl mx-auto leading-relaxed"}>
                        Browse premium properties across Dubai. AI-powered maintenance, smart pricing, and 24/7 chatbot support.
                    </p>

                    <div className="mt-10 max-w-xl mx-auto relative">
                        <Search size={20} className={c.textMut + " absolute left-4 top-1/2 -translate-y-1/2"} />
                        <input type="text" placeholder="Search by property name, area, or city..."
                            value={search} onChange={(e) => setSearch(e.target.value)}
                            className={"w-full rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 backdrop-blur-sm " + c.input + " " + c.text} />
                    </div>

                    <div className="flex justify-center gap-10 mt-10 text-sm">
                        {[
                            { val: properties.length, label: 'Properties', color: c.accent },
                            { val: properties.reduce((s, p) => s + p.vacant_units, 0), label: 'Available Units', color: c.green },
                            { val: '24/7', label: 'AI Support', color: c.purple },
                        ].map((s, i) => (
                            <div key={i} className="text-center">
                                <p className={"text-2xl font-extrabold " + s.color}>{s.val}</p>
                                <p className={c.textMut}>{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Properties */}
            <section id="properties" className="max-w-6xl mx-auto px-6 py-16">
                <h2 className={"text-2xl font-extrabold mb-8 " + c.heading}>
                    Available Properties
                    <span className={"text-base font-normal ml-3 " + c.textMut}>{filtered.length} found</span>
                </h2>

                {loading ? (
                    <div className="flex justify-center py-20"><Loader className={"animate-spin " + c.accent} size={40} /></div>
                ) : filtered.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filtered.map(p => (
                            <Link key={p.id} to={'/property/' + p.id}
                                className={"group rounded-2xl overflow-hidden transition-all border " + c.card + " " + c.border + " " + c.cardHover + " " + c.shadow}>
                                <div className={(isDark ? "h-48 bg-gradient-to-br from-amber-900/20 to-[#0d1117]" : "h-48 bg-gradient-to-br from-amber-50 to-gray-100") + " flex items-center justify-center overflow-hidden"}>
                                    {p.image ? <img src={(import.meta.env.VITE_MEDIA_URL || '') + p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                                        : <Building size={48} className={c.textMut} />}
                                </div>
                                <div className="p-5">
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className={"font-bold text-lg group-hover:text-amber-500 transition " + c.heading}>{p.name}</h3>
                                        <span className={"text-[10px] font-bold rounded-full px-2.5 py-0.5 shrink-0 border " + c.accentBg}>{p.type}</span>
                                    </div>
                                    <p className={c.textSec + " text-sm flex items-center gap-1 mb-4"}><MapPin size={14} /> {p.address}</p>
                                    <div className={"flex items-center justify-between border-t pt-3 " + c.border}>
                                        <div className="flex items-center gap-4 text-xs">
                                            <span className={c.textSec}><span className={"font-bold " + c.heading}>{p.total_units}</span> Units</span>
                                            <span className={"font-bold " + (p.vacant_units > 0 ? c.green : c.red)}>
                                                {p.vacant_units > 0 ? p.vacant_units + ' Available' : 'Fully Occupied'}
                                            </span>
                                        </div>
                                        <ChevronRight size={16} className={c.textMut + " group-hover:text-amber-500 transition"} />
                                    </div>
                                    {p.min_rent > 0 && (
                                        <p className={"text-xs mt-2 " + c.textMut}>From <span className={c.green + " font-bold"}>AED {p.min_rent.toLocaleString()}</span>/year</p>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <Building size={48} className={c.textMut + " mx-auto mb-4"} />
                        <p className={c.textMut}>No properties found matching your search.</p>
                    </div>
                )}
            </section>

            {/* Features */}
            <section id="features" className={(isDark ? "bg-white/[0.02]" : "bg-gray-50") + " border-y " + c.border + " py-16"}>
                <div className="max-w-6xl mx-auto px-6">
                    <h2 className={"text-2xl font-extrabold text-center mb-12 " + c.heading}>Why Choose PropAI OS?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                        {[
                            { icon: <Wrench size={24} />, color: c.accent, title: 'AI Maintenance', desc: 'Upload a photo — AI detects the issue, sets priority, and assigns the right technician instantly.' },
                            { icon: <MessageSquare size={24} />, color: c.blue, title: '24/7 AI Chatbot', desc: 'Ask about payments, lease details, building rules — our AI assistant knows everything.' },
                            { icon: <Shield size={24} />, color: c.green, title: 'Smart Pricing', desc: 'AI analyzes Dubai market data to ensure fair, competitive rent for every unit.' },
                            { icon: <Users size={24} />, color: c.purple, title: 'Tenant Portal', desc: 'Track payments, view lease, submit requests, and get real-time notifications.' },
                        ].map((f, i) => (
                            <div key={i} className={"rounded-2xl p-5 text-center transition border " + c.card + " " + c.border + " " + c.cardHover}>
                                <div className={f.color + " mb-3 flex justify-center"}>{f.icon}</div>
                                <h3 className={"font-bold text-sm mb-2 " + c.heading}>{f.title}</h3>
                                <p className={"text-xs leading-relaxed " + c.textSec}>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className={c.card + " border-t " + c.border + " py-10"}>
                <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                        <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-1.5 rounded-lg"><Building className="text-white" size={16} /></div>
                        <span className={"font-bold " + c.heading}>PropAI OS</span>
                        <span className={"text-xs " + c.textMut}>— Dubai's Smart Property Platform</span>
                    </div>
                    <p className={"text-xs " + c.textMut}>Built with AI in Dubai 🇦🇪</p>
                </div>
            </footer>
        </div>
    );
};

export default PublicHome;