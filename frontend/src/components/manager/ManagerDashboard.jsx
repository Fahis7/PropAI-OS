import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Chatbot from '../Chatbot';
import NotificationBell from '../NotificationBell';
import {
    Building, Users, Wrench, Wallet, AlertTriangle, LogOut,
    Home, CheckCircle, Clock, AlertCircle, Save, FileText,
    ChevronDown, ChevronUp, User, TrendingUp, Shield,
    MessageSquare, Phone, ExternalLink, UserPlus, Copy, Check
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

    const [inquiries, setInquiries] = useState([]);
    const [loadingInquiries, setLoadingInquiries] = useState(false);

    const [onboardModal, setOnboardModal] = useState(null);
    const [onboarding, setOnboarding] = useState(false);
    const [onboardResult, setOnboardResult] = useState(null);
    const [onboardPassword, setOnboardPassword] = useState('tenant123');
    const [selectedUnitId, setSelectedUnitId] = useState('');
    const [copied, setCopied] = useState('');

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

    const fetchInquiries = async () => {
        setLoadingInquiries(true);
        try {
            const res = await api.get('manager/inquiries/');
            setInquiries(res.data);
        } catch (err) {
            console.error("Failed to load inquiries:", err);
        } finally {
            setLoadingInquiries(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (tab === 'inquiries') fetchInquiries();
    }, [tab]);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const handleSaveRules = async () => {
        setSavingRules(true);
        try {
            await api.patch('properties/' + data.property.id + '/rules/', { rules_and_regulations: rules });
            setRulesSaved(true);
        } catch (err) {
            alert("Failed to save rules");
        } finally {
            setSavingRules(false);
        }
    };

    const handleOnboard = async () => {
        if (!selectedUnitId) return alert('Please select a unit.');
        setOnboarding(true);
        try {
            const res = await api.post('manager/onboard-tenant/', {
                inquiry_id: onboardModal.id,
                unit_id: selectedUnitId,
                password: onboardPassword,
            });
            setOnboardResult(res.data);
            fetchInquiries();
            fetchData();
        } catch (err) {
            alert(err.response?.data?.error || 'Onboarding failed.');
        } finally {
            setOnboarding(false);
        }
    };

    const copyText = (text, key) => {
        navigator.clipboard.writeText(text);
        setCopied(key);
        setTimeout(() => setCopied(''), 2000);
    };

    const getPriorityColor = (p) => {
        switch(p) {
            case 'EMERGENCY': return 'bg-red-500/20 text-red-400 border-red-500/50';
            case 'HIGH': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
            case 'MEDIUM': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
            case 'LOW': return 'bg-green-500/20 text-green-400 border-green-500/50';
            default: return 'bg-gray-700 text-gray-400 border-gray-600';
        }
    };

    const getStatusColor = (s) => {
        switch(s) {
            case 'OPEN': return 'text-yellow-400';
            case 'IN_PROGRESS': return 'text-blue-400';
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
    const vacantUnits = units.filter(u => u.status === 'VACANT');
    const newInquiries = inquiries.filter(i => i.status === 'NEW').length;

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
            <header className="bg-gray-800 border-b border-gray-700 p-5 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-xl">
                            <Building size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white">{property.name}</h1>
                            <p className="text-xs text-gray-400">Property Manager Dashboard</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <NotificationBell />
                        <button onClick={handleLogout} className="text-gray-400 hover:text-red-400 transition p-2">
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-6xl mx-auto px-5 pt-4">
                <div className="flex gap-2 border-b border-gray-800 pb-2 overflow-x-auto">
                    {[
                        { id: 'overview', label: 'Overview', icon: TrendingUp },
                        { id: 'inquiries', label: 'Inquiries', icon: MessageSquare, badge: newInquiries },
                        { id: 'tickets', label: 'Maintenance', icon: Wrench },
                        { id: 'units', label: 'Units', icon: Home },
                        { id: 'tenants', label: 'Tenants', icon: Users },
                        { id: 'rules', label: 'Rules & Policies', icon: Shield },
                    ].map(t => {
                        const Icon = t.icon;
                        return (
                            <button
                                key={t.id}
                                onClick={() => setTab(t.id)}
                                className={'flex items-center gap-1.5 px-4 py-2 rounded-t-lg text-sm font-bold transition whitespace-nowrap ' + (
                                    tab === t.id
                                        ? 'bg-gray-800 text-blue-400 border border-gray-700 border-b-0'
                                        : 'text-gray-500 hover:text-gray-300'
                                )}
                            >
                                <Icon size={14} /> {t.label}
                                {t.badge > 0 && (
                                    <span className="bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 ml-1">{t.badge}</span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            <main className="max-w-6xl mx-auto p-5 space-y-5">

                {tab === 'overview' && (
                    <>
                        {stats.emergency > 0 && (
                            <div className="bg-red-900/30 border border-red-500 p-4 rounded-xl flex items-center gap-3 animate-pulse">
                                <AlertTriangle size={24} className="text-red-400 shrink-0" />
                                <p className="font-bold text-red-300">
                                    {'🚨 ' + stats.emergency + ' Emergency Ticket' + (stats.emergency > 1 ? 's' : '') + ' — Immediate action required!'}
                                </p>
                            </div>
                        )}

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <StatCard label="Occupancy" value={stats.occupancy_rate + '%'} sub={stats.occupied + '/' + stats.total_units + ' units'} color="blue" />
                            <StatCard label="Revenue" value={'AED ' + stats.revenue.toLocaleString()} sub="Cleared" color="green" />
                            <StatCard label="Pending" value={'AED ' + stats.pending.toLocaleString()} sub={stats.bounced + ' bounced'} color="yellow" />
                            <StatCard label="Open Tickets" value={stats.open_tickets + stats.in_progress} sub={stats.open_tickets + ' open, ' + stats.in_progress + ' active'} color="orange" />
                        </div>

                        {newInquiries > 0 && (
                            <div
                                onClick={() => setTab('inquiries')}
                                className="bg-green-900/20 border border-green-500/30 p-4 rounded-xl flex items-center justify-between cursor-pointer hover:bg-green-900/30 transition"
                            >
                                <div className="flex items-center gap-3">
                                    <MessageSquare size={20} className="text-green-400" />
                                    <p className="font-bold text-green-300">
                                        {'📩 ' + newInquiries + ' New Customer Inquiry' + (newInquiries > 1 ? 's' : '') + ' — Click to view and contact'}
                                    </p>
                                </div>
                                <ChevronDown size={16} className="text-green-500" />
                            </div>
                        )}

                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
                            <h3 className="text-sm font-bold text-gray-400 uppercase mb-3">Technician Workload</h3>
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
                                                    className={t.active_tickets > 3 ? 'h-1 rounded bg-red-500' : t.active_tickets > 1 ? 'h-1 rounded bg-yellow-500' : 'h-1 rounded bg-green-500'}
                                                    style={{ width: Math.min(t.active_tickets * 25, 100) + '%' }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm">No technicians assigned to this organization.</p>
                            )}
                        </div>

                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
                            <h3 className="text-sm font-bold text-gray-400 uppercase mb-3">Recent Maintenance Tickets</h3>
                            <div className="space-y-2">
                                {recent_tickets.slice(0, 5).map(t => (
                                    <div key={t.id} className="flex items-center justify-between bg-gray-900 border border-gray-700 rounded-lg p-3">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-white truncate">{t.title}</p>
                                            <p className="text-xs text-gray-400">{'Unit ' + t.unit_number + ' • ' + t.created_at}</p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0 ml-3">
                                            {t.assigned_to && <span className="text-[10px] text-gray-500 hidden md:block">{t.assigned_to}</span>}
                                            <span className={'px-2 py-0.5 rounded text-[10px] font-bold border ' + getPriorityColor(t.priority)}>{t.priority}</span>
                                            <span className={'text-xs font-bold ' + getStatusColor(t.status)}>{t.status.replace('_', ' ')}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {tab === 'inquiries' && (
                    <div>
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <MessageSquare size={20} className="text-green-400" />
                            {'Customer Inquiries — ' + property.name}
                        </h3>

                        {loadingInquiries ? (
                            <div className="text-center py-16 text-gray-500 animate-pulse">Loading inquiries...</div>
                        ) : inquiries.length > 0 ? (
                            <div className="space-y-3">
                                {inquiries.map(inq => (
                                    <div key={inq.id} className={'bg-gray-800 border rounded-xl overflow-hidden ' + (
                                        inq.status === 'NEW' ? 'border-green-500/40' :
                                        inq.status === 'ONBOARDED' ? 'border-blue-500/30' : 'border-gray-700'
                                    )}>
                                        <div className="p-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={'w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ' + (
                                                        inq.status === 'NEW' ? 'bg-green-600' :
                                                        inq.status === 'ONBOARDED' ? 'bg-blue-600' :
                                                        inq.status === 'CONTACTED' ? 'bg-yellow-600' : 'bg-gray-600'
                                                    )}>
                                                        {inq.customer_name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-white">{inq.customer_name}</p>
                                                        <p className="text-xs text-gray-400">{inq.customer_phone + ' • ' + inq.customer_email}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <span className={'text-[10px] font-bold px-2 py-0.5 rounded ' + (
                                                        inq.status === 'NEW' ? 'bg-green-500/20 text-green-400' :
                                                        inq.status === 'ONBOARDED' ? 'bg-blue-500/20 text-blue-400' :
                                                        inq.status === 'CONTACTED' ? 'bg-yellow-500/20 text-yellow-400' :
                                                        'bg-gray-700 text-gray-400'
                                                    )}>{inq.status}</span>
                                                    <p className="text-[10px] text-gray-500 mt-1">{inq.created_at}</p>
                                                </div>
                                            </div>

                                            <div className="mt-3 flex items-center gap-2 flex-wrap">
                                                {inq.unit_number && (
                                                    <span className="text-xs bg-blue-900/30 text-blue-400 border border-blue-500/20 rounded px-2 py-0.5">
                                                        {'Unit ' + inq.unit_number}
                                                    </span>
                                                )}
                                                {inq.message && (
                                                    <p className="text-xs text-gray-400 italic">{'"' + inq.message + '"'}</p>
                                                )}
                                            </div>

                                            <div className="mt-4 flex gap-2 flex-wrap">
                                                <a
                                                    href={inq.whatsapp_link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1.5 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition"
                                                >
                                                    <Phone size={14} /> WhatsApp
                                                </a>
                                                <a
                                                    href={'tel:' + inq.customer_phone}
                                                    className="flex items-center gap-1.5 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-xs font-bold transition"
                                                >
                                                    <Phone size={14} /> Call
                                                </a>
                                                {inq.status !== 'ONBOARDED' && vacantUnits.length > 0 && (
                                                    <button
                                                        onClick={() => {
                                                            setOnboardModal(inq);
                                                            setOnboardResult(null);
                                                            setSelectedUnitId(inq.unit_id || '');
                                                            setOnboardPassword('tenant123');
                                                        }}
                                                        className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition"
                                                    >
                                                        <UserPlus size={14} /> Onboard as Tenant
                                                    </button>
                                                )}
                                                {inq.status === 'ONBOARDED' && (
                                                    <span className="flex items-center gap-1 text-xs text-blue-400 font-bold px-3 py-2">
                                                        <CheckCircle size={14} /> Tenant Onboarded
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-gray-800/30 rounded-2xl border border-gray-700">
                                <MessageSquare size={48} className="text-gray-700 mx-auto mb-4" />
                                <p className="text-gray-500 font-bold">No Inquiries Yet</p>
                                <p className="text-gray-600 text-sm mt-1">When customers express interest from the public page, they will appear here.</p>
                            </div>
                        )}
                    </div>
                )}

                {tab === 'tickets' && (
                    <div className="space-y-2">
                        <h3 className="text-lg font-bold text-white mb-3">{'All Maintenance Tickets — ' + property.name}</h3>
                        {recent_tickets.length > 0 ? recent_tickets.map(t => (
                            <div key={t.id} className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
                                <div
                                    className="p-4 cursor-pointer flex items-center justify-between"
                                    onClick={() => setExpandedTicket(expandedTicket === t.id ? null : t.id)}
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-white text-sm">{t.title}</p>
                                        <p className="text-xs text-gray-400">{'Unit ' + t.unit_number + ' • ' + t.created_at}</p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0 ml-3">
                                        <span className={'px-2 py-0.5 rounded text-[10px] font-bold border ' + getPriorityColor(t.priority)}>{t.priority}</span>
                                        <span className={'text-xs font-bold ' + getStatusColor(t.status)}>{t.status.replace('_', ' ')}</span>
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

                {tab === 'units' && (
                    <div>
                        <h3 className="text-lg font-bold text-white mb-3">{'Units — ' + property.name}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {units.map(u => (
                                <div key={u.id} className={'rounded-xl border p-4 ' + (
                                    u.status === 'OCCUPIED' ? 'bg-green-900/10 border-green-500/20' :
                                    u.status === 'VACANT' ? 'bg-gray-800 border-gray-700' :
                                    'bg-yellow-900/10 border-yellow-500/20'
                                )}>
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="font-bold text-white">{u.unit_number}</p>
                                        <span className={'text-[10px] font-bold px-2 py-0.5 rounded ' + (
                                            u.status === 'OCCUPIED' ? 'bg-green-500/20 text-green-400' :
                                            u.status === 'VACANT' ? 'bg-gray-700 text-gray-400' :
                                            'bg-yellow-500/20 text-yellow-400'
                                        )}>{u.status}</span>
                                    </div>
                                    <p className="text-xs text-gray-400">{u.unit_type}</p>
                                    <p className="text-sm font-bold text-blue-400 mt-1">{'AED ' + u.yearly_rent.toLocaleString() + '/yr'}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {tab === 'tenants' && (
                    <div>
                        <h3 className="text-lg font-bold text-white mb-3">{'Tenants — ' + property.name}</h3>
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
                                        <p className="text-sm font-bold text-blue-400">{'Unit ' + t.unit}</p>
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

                {tab === 'rules' && (
                    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-white">Building Rules and Regulations</h3>
                                <p className="text-xs text-gray-400 mt-1">These rules are shared with the AI chatbot. Tenants can ask questions about them.</p>
                            </div>
                            <Shield size={24} className="text-blue-400" />
                        </div>
                        <textarea
                            value={rules}
                            onChange={(e) => { setRules(e.target.value); setRulesSaved(false); }}
                            placeholder="Enter building rules here..."
                            className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none leading-relaxed"
                            rows={16}
                        />
                        <div className="flex items-center justify-between mt-4">
                            <p className="text-xs text-gray-500">{rules.length > 0 ? rules.length + ' characters' : 'No rules set yet'}</p>
                            <button
                                onClick={handleSaveRules}
                                disabled={savingRules}
                                className={'flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition disabled:opacity-50 ' + (
                                    rulesSaved ? 'bg-green-600 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'
                                )}
                            >
                                {rulesSaved ? <><CheckCircle size={16} /> Saved!</> : savingRules ? 'Saving...' : <><Save size={16} /> Save Rules</>}
                            </button>
                        </div>
                        {rules.length > 0 && (
                            <div className="mt-4 bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                                <p className="text-xs text-blue-400">Tenants can now ask the AI chatbot questions like "Can I keep a cat?" or "What are the gym hours?" and it will answer using these rules.</p>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {onboardModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-md shadow-2xl overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-900/40 to-green-900/40 p-5 border-b border-gray-700">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <UserPlus size={20} /> Onboard Tenant
                            </h3>
                            <p className="text-sm text-gray-400 mt-1">{onboardModal.customer_name + ' • ' + onboardModal.customer_phone}</p>
                        </div>

                        <div className="p-5">
                            {onboardResult ? (
                                <div className="space-y-4">
                                    <div className="text-center">
                                        <CheckCircle size={48} className="text-green-400 mx-auto mb-2" />
                                        <p className="font-bold text-green-400 text-lg">Tenant Onboarded!</p>
                                    </div>

                                    <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-gray-400">Username</span>
                                            <div className="flex items-center gap-2">
                                                <code className="text-blue-400 text-sm font-bold">{onboardResult.username}</code>
                                                <button onClick={() => copyText(onboardResult.username, 'user')} className="text-gray-500 hover:text-white">
                                                    {copied === 'user' ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-gray-400">Password</span>
                                            <div className="flex items-center gap-2">
                                                <code className="text-green-400 text-sm font-bold">{onboardResult.password}</code>
                                                <button onClick={() => copyText(onboardResult.password, 'pass')} className="text-gray-500 hover:text-white">
                                                    {copied === 'pass' ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-gray-400">Unit</span>
                                            <span className="text-white text-sm font-bold">{onboardResult.unit}</span>
                                        </div>
                                    </div>

                                    <a
                                        href={onboardResult.whatsapp_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white py-3 rounded-xl font-bold text-sm transition"
                                    >
                                        <Phone size={16} /> Send Credentials via WhatsApp
                                    </a>

                                    <button
                                        onClick={() => setOnboardModal(null)}
                                        className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2.5 rounded-xl font-bold text-sm transition"
                                    >
                                        Close
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs text-gray-400 font-bold uppercase">Assign Unit</label>
                                        <select
                                            value={selectedUnitId}
                                            onChange={(e) => setSelectedUnitId(e.target.value)}
                                            className="w-full mt-1 bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Select a vacant unit...</option>
                                            {vacantUnits.map(u => (
                                                <option key={u.id} value={u.id}>
                                                    {u.unit_number + ' — ' + u.unit_type + ' — AED ' + u.yearly_rent.toLocaleString() + '/yr'}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 font-bold uppercase">Password</label>
                                        <input
                                            type="text"
                                            value={onboardPassword}
                                            onChange={(e) => setOnboardPassword(e.target.value)}
                                            className="w-full mt-1 bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <p className="text-[10px] text-gray-500 mt-1">This password will be sent to the customer via WhatsApp</p>
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setOnboardModal(null)}
                                            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl font-bold text-sm transition"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleOnboard}
                                            disabled={onboarding || !selectedUnitId}
                                            className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-3 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2"
                                        >
                                            {onboarding ? 'Creating...' : <><UserPlus size={16} /> Create Tenant</>}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <Chatbot />
        </div>
    );
};

const StatCard = ({ label, value, sub, color }) => {
    const colors = {
        blue: 'border-blue-500/30 text-blue-400',
        green: 'border-green-500/30 text-green-400',
        yellow: 'border-yellow-500/30 text-yellow-400',
        orange: 'border-orange-500/30 text-orange-400',
    };
    return (
        <div className={'bg-gray-800 rounded-xl border p-4 ' + colors[color]}>
            <p className="text-[10px] text-gray-400 uppercase font-bold">{label}</p>
            <p className={'text-xl font-bold mt-1 ' + (colors[color] ? colors[color].split(' ')[1] : '')}>{value}</p>
            <p className="text-xs text-gray-500 mt-1">{sub}</p>
        </div>
    );
};

export default ManagerDashboard;