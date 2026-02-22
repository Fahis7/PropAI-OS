import { useState, useEffect } from 'react';
import api from '../../api/axios';
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
    TrendingUp, AlertTriangle, Users, Wrench, Loader,
    Calendar, DollarSign, Building, Clock
} from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];
const PIE_COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444'];

const Analytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await api.get('analytics/');
                setData(res.data);
            } catch (err) {
                console.error("Failed to load analytics:", err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center h-96 text-blue-500">
            <Loader className="animate-spin" size={48} />
        </div>
    );

    if (!data) return <div className="text-gray-500 text-center py-20">Failed to load analytics.</div>;

    const paymentPieData = [
        { name: 'Cleared', value: data.payment_status.cleared },
        { name: 'Pending', value: data.payment_status.pending },
        { name: 'Deposited', value: data.payment_status.deposited },
        { name: 'Bounced', value: data.payment_status.bounced },
    ].filter(d => d.value > 0);

    const ticketStatusData = [
        { name: 'Open', value: data.ticket_status.open, color: '#3b82f6' },
        { name: 'In Progress', value: data.ticket_status.in_progress, color: '#f59e0b' },
        { name: 'Resolved', value: data.ticket_status.resolved, color: '#10b981' },
        { name: 'Closed', value: data.ticket_status.closed, color: '#6b7280' },
    ].filter(d => d.value > 0);

    const priorityData = [
        { name: 'Emergency', value: data.priority_data.emergency, color: '#ef4444' },
        { name: 'High', value: data.priority_data.high, color: '#f97316' },
        { name: 'Medium', value: data.priority_data.medium, color: '#3b82f6' },
        { name: 'Low', value: data.priority_data.low, color: '#6b7280' },
    ].filter(d => d.value > 0);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Analytics & Insights</h1>
                <p className="text-gray-400 text-sm mt-1">Real-time data across your portfolio</p>
            </div>

            {/* ═══ ROW 1: Revenue Chart + Payment Breakdown ═══ */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                
                {/* Revenue Trend — Large */}
                <div className="lg:col-span-2 bg-gray-800 rounded-xl border border-gray-700 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-sm font-bold text-gray-400 uppercase">Revenue Trend</h3>
                            <p className="text-xs text-gray-500 mt-1">Monthly cleared payments</p>
                        </div>
                        <DollarSign size={20} className="text-green-400" />
                    </div>
                    {data.revenue_chart.length > 0 ? (
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={data.revenue_chart}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="month" stroke="#6b7280" fontSize={11} />
                                <YAxis stroke="#6b7280" fontSize={11} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
                                <Tooltip
                                    contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                                    labelStyle={{ color: '#9ca3af' }}
                                    formatter={(value) => [`AED ${value.toLocaleString()}`, 'Revenue']}
                                />
                                <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-64 text-gray-600">No revenue data yet</div>
                    )}
                </div>

                {/* Payment Status Pie */}
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-gray-400 uppercase">Payment Status</h3>
                        <TrendingUp size={18} className="text-blue-400" />
                    </div>
                    {paymentPieData.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={paymentPieData}
                                        cx="50%" cy="50%"
                                        innerRadius={50} outerRadius={80}
                                        paddingAngle={3}
                                        dataKey="value"
                                    >
                                        {paymentPieData.map((_, i) => (
                                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex flex-wrap justify-center gap-3 mt-2">
                                {paymentPieData.map((d, i) => (
                                    <div key={d.name} className="flex items-center gap-1.5 text-xs">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                                        <span className="text-gray-400">{d.name}: <span className="text-white font-bold">{d.value}</span></span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-48 text-gray-600">No payment data</div>
                    )}
                </div>
            </div>

            {/* ═══ ROW 2: Maintenance Charts ═══ */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                {/* Tickets Over Time */}
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-gray-400 uppercase">Tickets Over Time</h3>
                        <Wrench size={18} className="text-orange-400" />
                    </div>
                    {data.tickets_chart.length > 0 ? (
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={data.tickets_chart}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="month" stroke="#6b7280" fontSize={10} />
                                <YAxis stroke="#6b7280" fontSize={10} />
                                <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                                <Line type="monotone" dataKey="tickets" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-48 text-gray-600">No ticket data</div>
                    )}
                </div>

                {/* Maintenance by Category */}
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-gray-400 uppercase">By Category</h3>
                        <Wrench size={18} className="text-purple-400" />
                    </div>
                    {data.maintenance_categories.length > 0 ? (
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={data.maintenance_categories} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis type="number" stroke="#6b7280" fontSize={10} />
                                <YAxis dataKey="category" type="category" stroke="#6b7280" fontSize={9} width={75} />
                                <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                                    {data.maintenance_categories.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-48 text-gray-600">No categories</div>
                    )}
                </div>

                {/* Priority & Status */}
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-gray-400 uppercase">By Priority</h3>
                        <AlertTriangle size={18} className="text-red-400" />
                    </div>
                    {priorityData.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={160}>
                                <PieChart>
                                    <Pie data={priorityData} cx="50%" cy="50%" outerRadius={65} dataKey="value" paddingAngle={2}>
                                        {priorityData.map((d, i) => (
                                            <Cell key={i} fill={d.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex flex-wrap justify-center gap-2 mt-1">
                                {priorityData.map(d => (
                                    <span key={d.name} className="text-[10px] px-2 py-0.5 rounded border" style={{ color: d.color, borderColor: d.color + '50' }}>
                                        {d.name}: {d.value}
                                    </span>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-48 text-gray-600">No tickets</div>
                    )}
                </div>
            </div>

            {/* ═══ ROW 3: Property Revenue + Technician Performance ═══ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                {/* Revenue by Property */}
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-gray-400 uppercase">Revenue by Property</h3>
                        <Building size={18} className="text-blue-400" />
                    </div>
                    <div className="space-y-3">
                        {data.property_revenue.map((p, i) => (
                            <div key={i} className="bg-gray-900 border border-gray-700 rounded-lg p-3">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="font-bold text-white text-sm">{p.name}</p>
                                        <p className="text-xs text-gray-500">{p.occupied}/{p.units} units occupied ({p.occupancy}%)</p>
                                    </div>
                                    <p className="text-green-400 font-bold text-sm">AED {p.revenue.toLocaleString()}</p>
                                </div>
                                <div className="w-full bg-gray-700 h-1.5 rounded-full">
                                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${p.occupancy}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Technician Performance */}
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-gray-400 uppercase">Technician Performance</h3>
                        <Users size={18} className="text-orange-400" />
                    </div>
                    <div className="space-y-3">
                        {data.tech_performance.length > 0 ? data.tech_performance.map((t, i) => {
                            const resolveRate = t.total > 0 ? Math.round((t.resolved / t.total) * 100) : 0;
                            return (
                                <div key={i} className="bg-gray-900 border border-gray-700 rounded-lg p-3">
                                    <div className="flex justify-between items-start mb-1">
                                        <div>
                                            <p className="font-bold text-white text-sm">{t.name}</p>
                                            <span className="text-[10px] text-purple-400 font-bold">{t.specialty}</span>
                                        </div>
                                        <span className={`text-xs font-bold ${resolveRate >= 70 ? 'text-green-400' : resolveRate >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                                            {resolveRate}% resolved
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                                        <span>Total: <span className="text-white font-bold">{t.total}</span></span>
                                        <span>Active: <span className="text-yellow-400 font-bold">{t.active}</span></span>
                                        <span>Done: <span className="text-green-400 font-bold">{t.resolved}</span></span>
                                    </div>
                                    <div className="w-full bg-gray-700 h-1.5 rounded-full mt-2">
                                        <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${resolveRate}%` }} />
                                    </div>
                                </div>
                            );
                        }) : (
                            <p className="text-gray-500 text-sm">No technicians found.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* ═══ ROW 4: Expiring Leases ═══ */}
            {data.expiring_leases.length > 0 && (
                <div className="bg-gray-800 rounded-xl border border-yellow-500/30 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-sm font-bold text-yellow-400 uppercase">⏰ Expiring Leases (Next 90 Days)</h3>
                            <p className="text-xs text-gray-500 mt-1">{data.expiring_leases.length} lease{data.expiring_leases.length > 1 ? 's' : ''} expiring soon</p>
                        </div>
                        <Calendar size={18} className="text-yellow-400" />
                    </div>
                    <div className="space-y-2">
                        {data.expiring_leases.map((l, i) => (
                            <div key={i} className="flex items-center justify-between bg-gray-900 border border-gray-700 rounded-lg p-3">
                                <div>
                                    <p className="font-bold text-white text-sm">{l.tenant}</p>
                                    <p className="text-xs text-gray-400">{l.property} — Unit {l.unit}</p>
                                </div>
                                <div className="text-right">
                                    <p className={`text-sm font-bold ${l.days_left <= 30 ? 'text-red-400' : l.days_left <= 60 ? 'text-yellow-400' : 'text-green-400'}`}>
                                        {l.days_left} days left
                                    </p>
                                    <p className="text-xs text-gray-500">AED {l.rent.toLocaleString()}/yr</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Analytics;