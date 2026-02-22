import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Chatbot from '../Chatbot';
import {
    Building, Users, Wrench, Wallet, AlertTriangle, LogOut,
    Home, CheckCircle, Clock, AlertCircle, Save, FileText,
    ChevronDown, ChevronUp, User, TrendingUp, Shield
} from 'lucide-react';

const ManagerDashboard = () => {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('overview');
    const [rules, setRules] = useState('');
    const [savingRules, setSavingRules] = useState(false);
    const [rulesSaved, setRulesSaved] = useState(false);
    const [expandedTicket, setExpandedTicket] = useState(null);

    const fetchData = async () => {
        try {
            const res = await api.get('manager/stats/');
            setData(res.data);
            setRules(res.data.property.rules || '');
        } catch (err) {
            console.error("Failed to load manager data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSaveRules = async () => {
        if (!data) return;
        setSavingRules(true);
        try {
            await api.patch(`properties/${data.property.id}/rules/`, {
                rules_and_regulations: rules,
            });
            setRulesSaved(true);
            setTimeout(() => setRulesSaved(false), 3000);
        } catch (err) {
            console.error("Failed to save rules:", err);
            alert("Failed to save rules.");
        } finally {
            setSavingRules(false);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const getPriorityColor = (p) => {
        switch(p) {
            case 'EMERGENCY': return 'text-red-400 bg-red-500/10 border-red-500/40';
            case 'HIGH': return 'text-orange-400 bg-orange-500/10 border-orange-500/40';
            case 'MEDIUM': return 'text-blue-400 bg-blue-500/10 border-blue-500/40';
            default: return 'text-gray-400 bg-gray-700 border-gray-600';
        }
    };

    const getStatusColor = (s) => {
        switch(s) {
            case 'OPEN': return 'text-blue-400';
            case 'IN_PROGRESS': return 'text-yellow-400';
            case 'RESOLVED': return 'text-green-400';
            case 'CLOSED': return 'text-gray-500';
            default: return 'text-gray-400';
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center text-blue-500">
            <div className="animate-pulse text-lg">Loading Manager Dashboard...</div>
        </div>
    );

    if (!data) return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center text-gray-400">
            <div className="text-center">
                <Building size={48} className="mx-auto mb-4 text-gray-600" />
                <p className="text-lg font-bold">No Property Assigned</p>
                <p className="text-sm text-gray-500 mt-2">Ask your admin to assign you a property.</p>
            </div>
        </div>
    );

    const { property, stats, technicians, recent_tickets, units, tenants } = data;

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">

            {/* Header */}
            <header className="bg-gray-800 border-b border-gray-700 p-5 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-lg">
                            <Building className="text-white" size={22} />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white">PropOS <span className="text-blue-400">Manager</span></h1>
                            <p className="text-xs text-gray-400">{property.name} — {property.address}</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="text-gray-400 hover:text-red-400 p-2 transition">
                        <LogOut size={20} />
                    </button>
                </div>
            </header>

            {/* Tabs */}
            <div className="max-w-6xl mx-auto px-5 pt-4">
                <div className="flex gap-2 border-b border-gray-800 pb-2">
                    {[
                        { id: 'overview', label: 'Overview', icon: <TrendingUp size={14} /> },
                        { id: 'tickets', label: 'Maintenance', icon: <Wrench size={14} /> },
                        { id: 'units', label: 'Units', icon: <Home size={14} /> },
                        { id: 'tenants', label: 'Tenants', icon: <Users size={14} /> },
                        { id: 'rules', label: 'Rules & Policies', icon: <Shield size={14} /> },
                    ].map(t => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-t-lg text-sm font-bold transition ${
                                tab === t.id
                                    ? 'bg-gray-800 text-blue-400 border border-gray-700 border-b-0'
                                    : 'text-gray-500 hover:text-gray-300'
                            }`}
                        >
                            {t.icon} {t.label}
                        </button>
                    ))}
                </div>
            </div>

            <main className="max-w-6xl mx-auto p-5 space-y-5">

                {/* ═══ OVERVIEW TAB ═══ */}
                {tab === 'overview' && (
                    <>
                        {/* Emergency Banner */}
                        {stats.emergency > 0 && (
                            <div className="bg-red-900/30 border border-red-500 p-4 rounded-xl flex items-center gap-3 animate-pulse">
                                <AlertTriangle size={24} className="text-red-400 shrink-0" />
                                <p className="font-bold text-red-300">🚨 {stats.emergency} Emergency Ticket{stats.emergency > 1 ? 's' : ''} — Immediate action required!</p>
                            </div>
                        )}

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <StatCard label="Occupancy" value={`${stats.occupancy_rate}%`} sub={`${stats.occupied}/${stats.total_units} units`} color="blue" />
                            <StatCard label="Revenue" value={`AED ${stats.revenue.toLocaleString()}`} sub="Cleared" color="green" />
                            <StatCard label="Pending" value={`AED ${stats.pending.toLocaleString()}`} sub={`${stats.bounced} bounced`} color="yellow" />
                            <StatCard label="Open Tickets" value={stats.open_tickets + stats.in_progress} sub={`${stats.open_tickets} open, ${stats.in_progress} active`} color="orange" />
                        </div>

                        {/* Technician Workload */}
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
                            <h3 className="text-sm font-bold text-gray-400 uppercase mb-3">👷 Technician Workload</h3>
                            {technicians.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {technicians.map(t => (
                                        <div key={t.id} className="bg-gray-900 border border-gray-700 rounded-lg p-3">
                                            <p className="font-bold text-white text-sm">{t.name}</p>
                                            <p className="text-[10px] text-purple-400 font-bold">{t.specialty}</p>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-xs text-gray-400">Active: <span className="text-yellow-400 font-bold">{t.active_tickets}</span></span>
                                                <span className="text-xs text-gray-500">Total: {t.total_tickets}</span>
                                            </div>
                                            <div className="w-full bg-gray-700 h-1 rounded mt-2">
                                                <div 
                                                    className={`h-1 rounded ${t.active_tickets > 3 ? 'bg-red-500' : t.active_tickets > 1 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                                    style={{ width: `${Math.min(t.active_tickets * 25, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm">No technicians assigned to this organization.</p>
                            )}
                        </div>

                        {/* Recent Tickets */}
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
                            <h3 className="text-sm font-bold text-gray-400 uppercase mb-3">🔧 Recent Maintenance Tickets</h3>
                            <div className="space-y-2">
                                {recent_tickets.slice(0, 5).map(t => (
                                    <div key={t.id} className="flex items-center justify-between bg-gray-900 border border-gray-700 rounded-lg p-3">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-white truncate">{t.title}</p>
                                            <p className="text-xs text-gray-400">Unit {t.unit_number} • {t.created_at}</p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0 ml-3">
                                            {t.assigned_to && (
                                                <span className="text-[10px] text-gray-500 hidden md:block">{t.assigned_to}</span>
                                            )}
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getPriorityColor(t.priority)}`}>
                                                {t.priority}
                                            </span>
                                            <span className={`text-xs font-bold ${getStatusColor(t.status)}`}>
                                                {t.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {/* ═══ MAINTENANCE TAB ═══ */}
                {tab === 'tickets' && (
                    <div className="space-y-2">
                        <h3 className="text-lg font-bold text-white mb-3">All Maintenance Tickets — {property.name}</h3>
                        {recent_tickets.length > 0 ? recent_tickets.map(t => (
                            <div key={t.id} className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
                                <div 
                                    className="p-4 cursor-pointer flex items-center justify-between"
                                    onClick={() => setExpandedTicket(expandedTicket === t.id ? null : t.id)}
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-white text-sm">{t.title}</p>
                                        <p className="text-xs text-gray-400">Unit {t.unit_number} • {t.created_at}</p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0 ml-3">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getPriorityColor(t.priority)}`}>{t.priority}</span>
                                        <span className={`text-xs font-bold ${getStatusColor(t.status)}`}>{t.status.replace('_', ' ')}</span>
                                        {expandedTicket === t.id ? <ChevronUp size={14} className="text-gray-500" /> : <ChevronDown size={14} className="text-gray-500" />}
                                    </div>
                                </div>
                                {expandedTicket === t.id && (
                                    <div className="border-t border-gray-700 p-4 bg-gray-900/50 grid grid-cols-2 gap-3 text-sm">
                                        <div><span className="text-gray-500">Category:</span> <span className="text-purple-400 font-bold">{t.ai_category || 'GENERAL'}</span></div>
                                        <div><span className="text-gray-500">Assigned:</span> <span className="text-blue-400">{t.assigned_to || 'Unassigned'}</span></div>
                                    </div>
                                )}
                            </div>
                        )) : (
                            <div className="text-center py-16 text-gray-500">
                                <Wrench size={48} className="mx-auto mb-4 text-gray-700" />
                                <p>No maintenance tickets.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* ═══ UNITS TAB ═══ */}
                {tab === 'units' && (
                    <div>
                        <h3 className="text-lg font-bold text-white mb-3">Units — {property.name}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {units.map(u => (
                                <div key={u.id} className={`rounded-xl border p-4 ${
                                    u.status === 'OCCUPIED' ? 'bg-green-900/10 border-green-500/30' :
                                    u.status === 'MAINTENANCE' ? 'bg-yellow-900/10 border-yellow-500/30' :
                                    'bg-gray-800 border-gray-700'
                                }`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="font-bold text-white">{u.unit_number}</p>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                            u.status === 'OCCUPIED' ? 'bg-green-500/20 text-green-400' :
                                            u.status === 'VACANT' ? 'bg-gray-700 text-gray-400' :
                                            'bg-yellow-500/20 text-yellow-400'
                                        }`}>{u.status}</span>
                                    </div>
                                    <p className="text-xs text-gray-400">{u.unit_type}</p>
                                    <p className="text-sm font-bold text-blue-400 mt-1">AED {u.yearly_rent.toLocaleString()}/yr</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ═══ TENANTS TAB ═══ */}
                {tab === 'tenants' && (
                    <div>
                        <h3 className="text-lg font-bold text-white mb-3">Tenants — {property.name}</h3>
                        <div className="space-y-2">
                            {tenants.length > 0 ? tenants.map(t => (
                                <div key={t.id} className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                            {t.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white text-sm">{t.name}</p>
                                            <p className="text-xs text-gray-400">{t.email}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-blue-400">Unit {t.unit}</p>
                                        <p className="text-xs text-gray-500">{t.phone}</p>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-16 text-gray-500">
                                    <Users size={48} className="mx-auto mb-4 text-gray-700" />
                                    <p>No active tenants.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ═══ RULES TAB ═══ */}
                {tab === 'rules' && (
                    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-white">Building Rules & Regulations</h3>
                                <p className="text-xs text-gray-400 mt-1">These rules are shared with the AI chatbot. Tenants can ask questions about them.</p>
                            </div>
                            <Shield size={24} className="text-blue-400" />
                        </div>

                        <textarea
                            value={rules}
                            onChange={(e) => { setRules(e.target.value); setRulesSaved(false); }}
                            placeholder={`Enter building rules here. For example:\n\n🐾 Pet Policy:\n- Cats are allowed with AED 2,000 deposit\n- Dogs under 10kg allowed with approval\n- No exotic animals\n\n🅿️ Parking:\n- 1 parking spot per unit included\n- Visitor parking in basement B2\n- No overnight visitor parking\n\n🏊 Pool & Gym:\n- Pool hours: 7am - 10pm\n- Gym open 24/7 with access card\n- Children under 12 must be accompanied\n\n🔇 Noise Policy:\n- Quiet hours: 10pm - 8am\n- No construction work on Fridays\n\n📦 Move In/Out:\n- Must book service elevator 48hrs in advance\n- Moving hours: 9am - 5pm weekdays only`}
                            className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none leading-relaxed"
                            rows={16}
                        />

                        <div className="flex items-center justify-between mt-4">
                            <p className="text-xs text-gray-500">
                                {rules.length > 0 ? `${rules.length} characters` : 'No rules set yet'}
                            </p>
                            <button
                                onClick={handleSaveRules}
                                disabled={savingRules}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition ${
                                    rulesSaved
                                        ? 'bg-green-600 text-white'
                                        : 'bg-blue-600 hover:bg-blue-500 text-white'
                                } disabled:opacity-50`}
                            >
                                {rulesSaved ? <><CheckCircle size={16} /> Saved!</> : savingRules ? 'Saving...' : <><Save size={16} /> Save Rules</>}
                            </button>
                        </div>

                        {rules.length > 0 && (
                            <div className="mt-4 bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                                <p className="text-xs text-blue-400">
                                    💡 Tenants can now ask the AI chatbot questions like "Can I keep a cat?" or "What are the gym hours?" and it will answer using these rules.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </main>

            <Chatbot />
        </div>
    );
};

// Reusable stat card
const StatCard = ({ label, value, sub, color }) => {
    const colors = {
        blue: 'border-blue-500/30 text-blue-400',
        green: 'border-green-500/30 text-green-400',
        yellow: 'border-yellow-500/30 text-yellow-400',
        orange: 'border-orange-500/30 text-orange-400',
    };
    return (
        <div className={`bg-gray-800 rounded-xl border ${colors[color]} p-4`}>
            <p className="text-[10px] text-gray-400 uppercase font-bold">{label}</p>
            <p className={`text-xl font-bold mt-1 ${colors[color]?.split(' ')[1]}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-1">{sub}</p>
        </div>
    );
};

export default ManagerDashboard;