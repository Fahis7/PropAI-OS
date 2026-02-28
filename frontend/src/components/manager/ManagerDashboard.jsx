import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Chatbot from '../Chatbot';
import NotificationBell from '../NotificationBell';
import ThemeToggle from '../ThemeToggle';
import { useTheme } from '../../context/ThemeContext';
import {
    Building, Users, Wrench, AlertTriangle, LogOut,
    Home, CheckCircle, Clock, Save,
    ChevronDown, ChevronUp, User, TrendingUp, Shield,
    MessageSquare, Phone, UserPlus, Copy, Check
} from 'lucide-react';

const ManagerDashboard = () => {
    const { c, isDark } = useTheme();
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
        } catch (err) { console.error("Failed:", err); }
        finally { setLoading(false); }
    };

    const fetchInquiries = async () => {
        setLoadingInquiries(true);
        try { const res = await api.get('manager/inquiries/'); setInquiries(res.data); }
        catch (err) { console.error("Failed:", err); }
        finally { setLoadingInquiries(false); }
    };

    useEffect(() => { fetchData(); }, []);
    useEffect(() => { if (tab === 'inquiries') fetchInquiries(); }, [tab]);

    const handleLogout = () => { localStorage.clear(); navigate('/login'); };

    const handleSaveRules = async () => {
        setSavingRules(true);
        try { await api.patch('properties/' + data.property.id + '/rules/', { rules_and_regulations: rules }); setRulesSaved(true); }
        catch { alert("Failed to save rules"); }
        finally { setSavingRules(false); }
    };

    const handleOnboard = async () => {
        if (!selectedUnitId) return alert('Please select a unit.');
        setOnboarding(true);
        try {
            const res = await api.post('manager/onboard-tenant/', { inquiry_id: onboardModal.id, unit_id: selectedUnitId, password: onboardPassword });
            setOnboardResult(res.data);
            fetchInquiries(); fetchData();
        } catch (err) { alert(err.response?.data?.error || 'Onboarding failed.'); }
        finally { setOnboarding(false); }
    };

    const copyText = (text, key) => { navigator.clipboard.writeText(text); setCopied(key); setTimeout(() => setCopied(''), 2000); };

    const getPriorityColor = (p) => { switch(p) { case 'EMERGENCY': return c.redBg; case 'HIGH': return c.yellowBg; case 'MEDIUM': return c.blueBg; case 'LOW': return c.greenBg; default: return c.btn2; }};
    const getStatusColor = (s) => { switch(s) { case 'OPEN': return c.yellow; case 'IN_PROGRESS': return c.blue; case 'RESOLVED': return c.green; case 'CLOSED': return c.textMut; default: return c.textSec; }};

    if (loading) return (
        <div className={"min-h-screen flex items-center justify-center " + c.bg}>
            <div className={"animate-pulse text-lg " + c.accent}>Loading Manager Dashboard...</div>
        </div>
    );

    if (!data) return (
        <div className={"min-h-screen flex items-center justify-center " + c.bg}>
            <div className="text-center">
                <Building size={48} className={c.textMut + " mx-auto mb-4"} />
                <p className={"text-lg font-bold " + c.heading}>No Property Assigned</p>
                <p className={"text-sm mt-2 " + c.textMut}>Ask your admin to assign you a property.</p>
            </div>
        </div>
    );

    const { property, stats, technicians, recent_tickets, units, tenants } = data;
    const vacantUnits = units.filter(u => u.status === 'VACANT');
    const newInquiries = inquiries.filter(i => i.status === 'NEW').length;

    return (
        <div className={"min-h-screen font-sans " + c.bg + " " + c.text}>
            {/* Header */}
            <header className={"border-b p-5 sticky top-0 z-10 " + c.card + " " + c.border}>
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-2 rounded-xl shadow-lg shadow-amber-500/20">
                            <Building size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className={"text-lg font-bold " + c.heading}>{property.name}</h1>
                            <p className={"text-xs " + c.textMut}>Property Manager Dashboard</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <NotificationBell />
                        <button onClick={handleLogout} className={c.textMut + " hover:text-rose-400 transition p-2"}>
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Tabs */}
            <div className="max-w-6xl mx-auto px-5 pt-4">
                <div className={"flex gap-2 border-b pb-2 overflow-x-auto " + c.border}>
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
                            <button key={t.id} onClick={() => setTab(t.id)}
                                className={"flex items-center gap-1.5 px-4 py-2 rounded-t-lg text-sm font-bold transition whitespace-nowrap " + (
                                    tab === t.id
                                        ? c.card + " " + c.accent + " border " + c.border + " border-b-0"
                                        : c.textMut + " hover:opacity-80"
                                )}>
                                <Icon size={14} /> {t.label}
                                {t.badge > 0 && <span className="bg-rose-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 ml-1">{t.badge}</span>}
                            </button>
                        );
                    })}
                </div>
            </div>

            <main className="max-w-6xl mx-auto p-5 space-y-5 fade-in">

                {/* ══════ OVERVIEW TAB ══════ */}
                {tab === 'overview' && (
                    <>
                        {stats.emergency > 0 && (
                            <div className={"p-4 rounded-2xl flex items-center gap-3 animate-pulse border " + c.redBg}>
                                <AlertTriangle size={24} className={c.red + " shrink-0"} />
                                <p className={"font-bold " + c.heading}>
                                    {"🚨 " + stats.emergency + " Emergency Ticket" + (stats.emergency > 1 ? "s" : "") + " — Immediate action required!"}
                                </p>
                            </div>
                        )}

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                                { label: 'Occupancy', value: stats.occupancy_rate + '%', sub: stats.occupied + '/' + stats.total_units + ' units', color: c.blue },
                                { label: 'Revenue', value: 'AED ' + stats.revenue.toLocaleString(), sub: 'Cleared', color: c.green },
                                { label: 'Pending', value: 'AED ' + stats.pending.toLocaleString(), sub: stats.bounced + ' bounced', color: c.yellow },
                                { label: 'Open Tickets', value: stats.open_tickets + stats.in_progress, sub: stats.open_tickets + ' open, ' + stats.in_progress + ' active', color: c.accent },
                            ].map((s, i) => (
                                <div key={i} className={"rounded-xl border p-4 " + c.card + " " + c.border}>
                                    <p className={"text-[10px] uppercase font-bold " + c.textMut}>{s.label}</p>
                                    <p className={"text-xl font-extrabold mt-1 " + s.color}>{s.value}</p>
                                    <p className={"text-xs mt-1 " + c.textMut}>{s.sub}</p>
                                </div>
                            ))}
                        </div>

                        {newInquiries > 0 && (
                            <div onClick={() => setTab('inquiries')}
                                className={"p-4 rounded-2xl flex items-center justify-between cursor-pointer transition border " + c.greenBg}>
                                <div className="flex items-center gap-3">
                                    <MessageSquare size={20} className={c.green} />
                                    <p className={"font-bold " + c.heading}>
                                        {"📩 " + newInquiries + " New Customer Inquiry" + (newInquiries > 1 ? "s" : "") + " — Click to view and contact"}
                                    </p>
                                </div>
                                <ChevronDown size={16} className={c.green} />
                            </div>
                        )}

                        <div className={"rounded-2xl border p-5 " + c.card + " " + c.border}>
                            <h3 className={"text-[10px] font-bold uppercase tracking-wider mb-3 " + c.textMut}>Technician Workload</h3>
                            {technicians.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {technicians.map(t => (
                                        <div key={t.id} className={"rounded-xl border p-3 " + c.bg + " " + c.border}>
                                            <p className={"font-bold text-sm " + c.heading}>{t.name}</p>
                                            <p className={"text-[10px] font-bold " + c.purple}>{t.specialty}</p>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className={"text-xs " + c.textSec}>Active: <span className={"font-bold " + c.yellow}>{t.active_tickets}</span></span>
                                                <span className={"text-xs " + c.textMut}>Total: {t.total_tickets}</span>
                                            </div>
                                            <div className={"w-full h-1 rounded mt-2 " + (isDark ? "bg-gray-700" : "bg-gray-200")}>
                                                <div className={t.active_tickets > 3 ? "h-1 rounded bg-rose-500" : t.active_tickets > 1 ? "h-1 rounded bg-amber-500" : "h-1 rounded bg-emerald-500"}
                                                    style={{ width: Math.min(t.active_tickets * 25, 100) + '%' }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : <p className={c.textMut + " text-sm"}>No technicians assigned.</p>}
                        </div>

                        <div className={"rounded-2xl border p-5 " + c.card + " " + c.border}>
                            <h3 className={"text-[10px] font-bold uppercase tracking-wider mb-3 " + c.textMut}>Recent Maintenance Tickets</h3>
                            <div className="space-y-2">
                                {recent_tickets.slice(0, 5).map(t => (
                                    <div key={t.id} className={"flex items-center justify-between rounded-xl border p-3 " + c.bg + " " + c.border}>
                                        <div className="flex-1 min-w-0">
                                            <p className={"text-sm font-semibold truncate " + c.heading}>{t.title}</p>
                                            <p className={"text-xs " + c.textMut}>{"Unit " + t.unit_number + " • " + t.created_at}</p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0 ml-3">
                                            {t.assigned_to && <span className={"text-[10px] hidden md:block " + c.textMut}>{t.assigned_to}</span>}
                                            <span className={"px-2 py-0.5 rounded text-[10px] font-bold border " + getPriorityColor(t.priority)}>{t.priority}</span>
                                            <span className={"text-xs font-bold " + getStatusColor(t.status)}>{t.status.replace('_', ' ')}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {/* ══════ INQUIRIES TAB ══════ */}
                {tab === 'inquiries' && (
                    <div>
                        <h3 className={"text-lg font-bold mb-4 flex items-center gap-2 " + c.heading}>
                            <MessageSquare size={20} className={c.green} /> {"Customer Inquiries — " + property.name}
                        </h3>
                        {loadingInquiries ? (
                            <div className={"text-center py-16 animate-pulse " + c.textMut}>Loading inquiries...</div>
                        ) : inquiries.length > 0 ? (
                            <div className="space-y-3">
                                {inquiries.map(inq => (
                                    <div key={inq.id} className={"border rounded-2xl overflow-hidden " + c.card + " " + (
                                        inq.status === 'NEW' ? 'border-emerald-500/40' : inq.status === 'ONBOARDED' ? 'border-blue-500/30' : c.border
                                    )}>
                                        <div className="p-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={"w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm " + (
                                                        inq.status === 'NEW' ? 'bg-emerald-600' : inq.status === 'ONBOARDED' ? 'bg-blue-600' : inq.status === 'CONTACTED' ? 'bg-amber-600' : 'bg-gray-600'
                                                    )}>{inq.customer_name.charAt(0)}</div>
                                                    <div>
                                                        <p className={"font-bold " + c.heading}>{inq.customer_name}</p>
                                                        <p className={"text-xs " + c.textMut}>{inq.customer_phone + " • " + inq.customer_email}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <span className={"text-[10px] font-bold px-2 py-0.5 rounded border " + (
                                                        inq.status === 'NEW' ? c.greenBg : inq.status === 'ONBOARDED' ? c.blueBg : inq.status === 'CONTACTED' ? c.yellowBg : c.btn2
                                                    )}>{inq.status}</span>
                                                    <p className={"text-[10px] mt-1 " + c.textMut}>{inq.created_at}</p>
                                                </div>
                                            </div>

                                            <div className="mt-3 flex items-center gap-2 flex-wrap">
                                                {inq.unit_number && <span className={"text-xs rounded px-2 py-0.5 border " + c.blueBg}>{"Unit " + inq.unit_number}</span>}
                                                {inq.message && <p className={"text-xs italic " + c.textSec}>{'"' + inq.message + '"'}</p>}
                                            </div>

                                            <div className="mt-4 flex gap-2 flex-wrap">
                                                <a href={inq.whatsapp_link} target="_blank" rel="noopener noreferrer"
                                                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-500/20">
                                                    <Phone size={14} /> WhatsApp
                                                </a>
                                                <a href={"tel:" + inq.customer_phone}
                                                    className={"flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition border " + c.btn2}>
                                                    <Phone size={14} /> Call
                                                </a>
                                                {inq.status !== 'ONBOARDED' && vacantUnits.length > 0 && (
                                                    <button onClick={() => { setOnboardModal(inq); setOnboardResult(null); setSelectedUnitId(inq.unit_id || ''); setOnboardPassword('tenant123'); }}
                                                        className={c.btn + " flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-amber-500/20"}>
                                                        <UserPlus size={14} /> Onboard as Tenant
                                                    </button>
                                                )}
                                                {inq.status === 'ONBOARDED' && (
                                                    <span className={"flex items-center gap-1 text-xs font-bold px-3 py-2 " + c.blue}>
                                                        <CheckCircle size={14} /> Tenant Onboarded
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className={"text-center py-16 rounded-2xl border " + c.card + " " + c.border}>
                                <MessageSquare size={48} className={c.textMut + " mx-auto mb-4"} />
                                <p className={c.textMut + " font-bold"}>No Inquiries Yet</p>
                                <p className={"text-sm mt-1 " + c.textMut}>When customers express interest from the public page, they appear here.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* ══════ TICKETS TAB ══════ */}
                {tab === 'tickets' && (
                    <div className="space-y-2">
                        <h3 className={"text-lg font-bold mb-3 " + c.heading}>{"All Maintenance Tickets — " + property.name}</h3>
                        {recent_tickets.length > 0 ? recent_tickets.map(t => (
                            <div key={t.id} className={"border rounded-xl overflow-hidden " + c.card + " " + c.border}>
                                <div className="p-4 cursor-pointer flex items-center justify-between"
                                    onClick={() => setExpandedTicket(expandedTicket === t.id ? null : t.id)}>
                                    <div className="flex-1 min-w-0">
                                        <p className={"font-semibold text-sm " + c.heading}>{t.title}</p>
                                        <p className={"text-xs " + c.textMut}>{"Unit " + t.unit_number + " • " + t.created_at}</p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0 ml-3">
                                        <span className={"px-2 py-0.5 rounded text-[10px] font-bold border " + getPriorityColor(t.priority)}>{t.priority}</span>
                                        <span className={"text-xs font-bold " + getStatusColor(t.status)}>{t.status.replace('_', ' ')}</span>
                                        {expandedTicket === t.id ? <ChevronUp size={14} className={c.textMut} /> : <ChevronDown size={14} className={c.textMut} />}
                                    </div>
                                </div>
                                {expandedTicket === t.id && (
                                    <div className={"border-t p-4 grid grid-cols-2 gap-3 text-sm " + c.border + " " + (isDark ? "bg-black/20" : "bg-gray-50/50")}>
                                        <div><span className={c.textMut}>Category:</span> <span className={"font-bold " + c.purple}>{t.ai_category || 'GENERAL'}</span></div>
                                        <div><span className={c.textMut}>Assigned:</span> <span className={c.accent}>{t.assigned_to || 'Unassigned'}</span></div>
                                    </div>
                                )}
                            </div>
                        )) : (
                            <div className={"text-center py-16 " + c.textMut}>
                                <Wrench size={48} className={c.textMut + " mx-auto mb-4"} /><p>No maintenance tickets.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* ══════ UNITS TAB ══════ */}
                {tab === 'units' && (
                    <div>
                        <h3 className={"text-lg font-bold mb-3 " + c.heading}>{"Units — " + property.name}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {units.map(u => (
                                <div key={u.id} className={"rounded-xl border p-4 " + (
                                    u.status === 'OCCUPIED' ? c.greenBg : u.status === 'VACANT' ? c.card + " " + c.border : c.yellowBg
                                )}>
                                    <div className="flex justify-between items-start mb-2">
                                        <p className={"font-bold " + c.heading}>{u.unit_number}</p>
                                        <span className={"text-[10px] font-bold px-2 py-0.5 rounded border " + (
                                            u.status === 'OCCUPIED' ? c.greenBg : u.status === 'VACANT' ? c.btn2 : c.yellowBg
                                        )}>{u.status}</span>
                                    </div>
                                    <p className={"text-xs " + c.textSec}>{u.unit_type}</p>
                                    <p className={"text-sm font-bold mt-1 " + c.accent}>{"AED " + u.yearly_rent.toLocaleString() + "/yr"}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ══════ TENANTS TAB ══════ */}
                {tab === 'tenants' && (
                    <div>
                        <h3 className={"text-lg font-bold mb-3 " + c.heading}>{"Tenants — " + property.name}</h3>
                        <div className="space-y-2">
                            {tenants.length > 0 ? tenants.map(t => (
                                <div key={t.id} className={"border rounded-xl p-4 flex items-center justify-between " + c.card + " " + c.border}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow">
                                            {t.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className={"font-bold text-sm " + c.heading}>{t.name}</p>
                                            <p className={"text-xs " + c.textMut}>{t.email}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={"text-sm font-bold " + c.accent}>{"Unit " + t.unit}</p>
                                        <p className={"text-xs " + c.textMut}>{t.phone}</p>
                                    </div>
                                </div>
                            )) : (
                                <div className={"text-center py-16 " + c.textMut}>
                                    <Users size={48} className={c.textMut + " mx-auto mb-4"} /><p>No active tenants.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ══════ RULES TAB ══════ */}
                {tab === 'rules' && (
                    <div className={"rounded-2xl border p-6 " + c.card + " " + c.border}>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className={"text-lg font-bold " + c.heading}>Building Rules and Regulations</h3>
                                <p className={"text-xs mt-1 " + c.textMut}>These rules are shared with the AI chatbot. Tenants can ask questions about them.</p>
                            </div>
                            <Shield size={24} className={c.accent} />
                        </div>
                        <textarea value={rules} onChange={(e) => { setRules(e.target.value); setRulesSaved(false); }}
                            placeholder="Enter building rules here..."
                            className={"w-full border rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none leading-relaxed " + c.input + " " + c.text}
                            rows={16} />
                        <div className="flex items-center justify-between mt-4">
                            <p className={"text-xs " + c.textMut}>{rules.length > 0 ? rules.length + " characters" : "No rules set yet"}</p>
                            <button onClick={handleSaveRules} disabled={savingRules}
                                className={"flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition disabled:opacity-50 shadow-lg " + (
                                    rulesSaved ? "bg-emerald-600 text-white shadow-emerald-500/20" : c.btn + " shadow-amber-500/20"
                                )}>
                                {rulesSaved ? <><CheckCircle size={16} /> Saved!</> : savingRules ? 'Saving...' : <><Save size={16} /> Save Rules</>}
                            </button>
                        </div>
                        {rules.length > 0 && (
                            <div className={"mt-4 rounded-xl p-3 border " + c.blueBg}>
                                <p className={"text-xs " + c.blue}>Tenants can now ask the AI chatbot questions like "Can I keep a cat?" and it will answer using these rules.</p>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* ══════ ONBOARD MODAL ══════ */}
            {onboardModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className={"rounded-2xl border w-full max-w-md overflow-hidden " + c.card + " " + c.border + " " + c.shadow}>
                        <div className="bg-gradient-to-r from-amber-600/20 to-emerald-600/20 p-5 border-b" style={{ borderColor: isDark ? '#374151' : '#e5e7eb' }}>
                            <h3 className={"text-lg font-bold flex items-center gap-2 " + c.heading}><UserPlus size={20} /> Onboard Tenant</h3>
                            <p className={"text-sm mt-1 " + c.textSec}>{onboardModal.customer_name + " • " + onboardModal.customer_phone}</p>
                        </div>
                        <div className="p-5">
                            {onboardResult ? (
                                <div className="space-y-4">
                                    <div className="text-center">
                                        <CheckCircle size={48} className={c.green + " mx-auto mb-2"} />
                                        <p className={c.green + " font-bold text-lg"}>Tenant Onboarded!</p>
                                    </div>
                                    <div className={"rounded-xl border p-4 space-y-3 " + c.bg + " " + c.border}>
                                        {[
                                            { label: 'Username', val: onboardResult.username, key: 'user', color: c.accent },
                                            { label: 'Password', val: onboardResult.password, key: 'pass', color: c.green },
                                        ].map(r => (
                                            <div key={r.key} className="flex justify-between items-center">
                                                <span className={"text-xs " + c.textMut}>{r.label}</span>
                                                <div className="flex items-center gap-2">
                                                    <code className={"text-sm font-bold " + r.color}>{r.val}</code>
                                                    <button onClick={() => copyText(r.val, r.key)} className={c.textMut + " hover:opacity-70"}>
                                                        {copied === r.key ? <Check size={14} className={c.green} /> : <Copy size={14} />}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="flex justify-between items-center">
                                            <span className={"text-xs " + c.textMut}>Unit</span>
                                            <span className={"text-sm font-bold " + c.heading}>{onboardResult.unit}</span>
                                        </div>
                                    </div>
                                    <a href={onboardResult.whatsapp_link} target="_blank" rel="noopener noreferrer"
                                        className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold text-sm transition shadow-lg shadow-emerald-500/20">
                                        <Phone size={16} /> Send Credentials via WhatsApp
                                    </a>
                                    <button onClick={() => setOnboardModal(null)}
                                        className={"w-full py-2.5 rounded-xl font-bold text-sm transition border " + c.btn2}>Close</button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <label className={"text-xs font-bold uppercase " + c.textMut}>Assign Unit</label>
                                        <select value={selectedUnitId} onChange={(e) => setSelectedUnitId(e.target.value)}
                                            className={"w-full mt-1 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 " + c.input + " " + c.text}>
                                            <option value="">Select a vacant unit...</option>
                                            {vacantUnits.map(u => <option key={u.id} value={u.id}>{u.unit_number + " — " + u.unit_type + " — AED " + u.yearly_rent.toLocaleString() + "/yr"}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={"text-xs font-bold uppercase " + c.textMut}>Password</label>
                                        <input type="text" value={onboardPassword} onChange={(e) => setOnboardPassword(e.target.value)}
                                            className={"w-full mt-1 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 " + c.input + " " + c.text} />
                                        <p className={"text-[10px] mt-1 " + c.textMut}>This password will be sent to the customer via WhatsApp</p>
                                    </div>
                                    <div className="flex gap-3">
                                        <button onClick={() => setOnboardModal(null)}
                                            className={"flex-1 py-3 rounded-xl font-bold text-sm transition border " + c.btn2}>Cancel</button>
                                        <button onClick={handleOnboard} disabled={onboarding || !selectedUnitId}
                                            className={c.btn + " flex-1 py-3 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-amber-500/20"}>
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

export default ManagerDashboard;