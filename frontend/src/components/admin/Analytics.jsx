import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useTheme } from '../../context/ThemeContext';
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
    TrendingUp, AlertTriangle, Users, Wrench, Loader,
    Calendar, DollarSign, Building
} from 'lucide-react';

const COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];
const PIE_COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444'];

const Analytics = () => {
    const { c, isDark } = useTheme();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('analytics/').then(r => setData(r.data)).catch(e => console.error(e)).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="flex items-center justify-center h-96"><Loader className={'animate-spin ' + c.accent} size={48} /></div>;
    if (!data) return <div className={'text-center py-20 ' + c.textMut}>Failed to load analytics.</div>;

    const ttStyle = { background: isDark ? '#1f2937' : '#fff', border: '1px solid ' + (isDark ? '#374151' : '#e5e7eb'), borderRadius: '10px', color: isDark ? '#e5e7eb' : '#111' };
    const gridStroke = isDark ? '#1e293b' : '#e5e7eb';
    const axisStroke = isDark ? '#6b7280' : '#9ca3af';

    const paymentPieData = [
        { name: 'Cleared', value: data.payment_status.cleared },
        { name: 'Pending', value: data.payment_status.pending },
        { name: 'Deposited', value: data.payment_status.deposited },
        { name: 'Bounced', value: data.payment_status.bounced },
    ].filter(d => d.value > 0);

    const priorityData = [
        { name: 'Emergency', value: data.priority_data.emergency, color: '#ef4444' },
        { name: 'High', value: data.priority_data.high, color: '#f97316' },
        { name: 'Medium', value: data.priority_data.medium, color: '#3b82f6' },
        { name: 'Low', value: data.priority_data.low, color: '#6b7280' },
    ].filter(d => d.value > 0);

    const Card = ({ children, className: cn }) => <div className={'rounded-2xl border p-5 ' + c.card + ' ' + c.border + ' ' + c.shadow + ' ' + (cn || '')}>{children}</div>;
    const SectionTitle = ({ icon, label }) => (
        <div className="flex items-center justify-between mb-4">
            <h3 className={'text-[10px] font-bold uppercase tracking-wider ' + c.textMut}>{label}</h3>
            {icon}
        </div>
    );

    return (
        <div className="space-y-6 fade-in">
            <div>
                <h1 className={'text-2xl font-extrabold ' + c.heading}>Analytics & Insights</h1>
                <p className={c.textSec + ' text-sm mt-1'}>Real-time data across your portfolio</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <Card className="lg:col-span-2">
                    <SectionTitle label="Revenue Trend" icon={<DollarSign size={18} className={c.green} />} />
                    {data.revenue_chart.length > 0 ? (
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={data.revenue_chart}>
                                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                                <XAxis dataKey="month" stroke={axisStroke} fontSize={11} />
                                <YAxis stroke={axisStroke} fontSize={11} tickFormatter={(v) => (v/1000).toFixed(0) + 'K'} />
                                <Tooltip contentStyle={ttStyle} formatter={(v) => ['AED ' + v.toLocaleString(), 'Revenue']} />
                                <Bar dataKey="revenue" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : <div className={'flex items-center justify-center h-64 ' + c.textMut}>No revenue data yet</div>}
                </Card>

                <Card>
                    <SectionTitle label="Payment Status" icon={<TrendingUp size={18} className={c.blue} />} />
                    {paymentPieData.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart><Pie data={paymentPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                                    {paymentPieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                                </Pie><Tooltip contentStyle={ttStyle} /></PieChart>
                            </ResponsiveContainer>
                            <div className="flex flex-wrap justify-center gap-3 mt-2">
                                {paymentPieData.map((d, i) => (
                                    <div key={d.name} className="flex items-center gap-1.5 text-xs">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                                        <span className={c.textSec}>{d.name}: <span className={'font-bold ' + c.heading}>{d.value}</span></span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : <div className={'flex items-center justify-center h-48 ' + c.textMut}>No payment data</div>}
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <Card>
                    <SectionTitle label="Tickets Over Time" icon={<Wrench size={18} className={c.yellow} />} />
                    {data.tickets_chart.length > 0 ? (
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={data.tickets_chart}>
                                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                                <XAxis dataKey="month" stroke={axisStroke} fontSize={10} />
                                <YAxis stroke={axisStroke} fontSize={10} />
                                <Tooltip contentStyle={ttStyle} />
                                <Line type="monotone" dataKey="tickets" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : <div className={'flex items-center justify-center h-48 ' + c.textMut}>No ticket data</div>}
                </Card>

                <Card>
                    <SectionTitle label="By Category" icon={<Wrench size={18} className={c.purple} />} />
                    {data.maintenance_categories.length > 0 ? (
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={data.maintenance_categories} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                                <XAxis type="number" stroke={axisStroke} fontSize={10} />
                                <YAxis dataKey="category" type="category" stroke={axisStroke} fontSize={9} width={75} />
                                <Tooltip contentStyle={ttStyle} />
                                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                                    {data.maintenance_categories.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : <div className={'flex items-center justify-center h-48 ' + c.textMut}>No categories</div>}
                </Card>

                <Card>
                    <SectionTitle label="By Priority" icon={<AlertTriangle size={18} className={c.red} />} />
                    {priorityData.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={160}>
                                <PieChart><Pie data={priorityData} cx="50%" cy="50%" outerRadius={65} dataKey="value" paddingAngle={2}>
                                    {priorityData.map((d, i) => <Cell key={i} fill={d.color} />)}
                                </Pie><Tooltip contentStyle={ttStyle} /></PieChart>
                            </ResponsiveContainer>
                            <div className="flex flex-wrap justify-center gap-2 mt-1">
                                {priorityData.map(d => (
                                    <span key={d.name} className="text-[10px] px-2 py-0.5 rounded border" style={{ color: d.color, borderColor: d.color + '50' }}>{d.name}: {d.value}</span>
                                ))}
                            </div>
                        </>
                    ) : <div className={'flex items-center justify-center h-48 ' + c.textMut}>No tickets</div>}
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <Card>
                    <SectionTitle label="Revenue by Property" icon={<Building size={18} className={c.blue} />} />
                    <div className="space-y-3">
                        {data.property_revenue.map((p, i) => (
                            <div key={i} className={'rounded-xl p-3 border ' + c.bg + ' ' + c.border}>
                                <div className="flex justify-between items-start mb-2">
                                    <div><p className={'font-bold text-sm ' + c.heading}>{p.name}</p><p className={'text-xs ' + c.textMut}>{p.occupied}/{p.units} units ({p.occupancy}%)</p></div>
                                    <p className={'font-bold text-sm ' + c.green}>AED {p.revenue.toLocaleString()}</p>
                                </div>
                                <div className={'w-full h-1.5 rounded-full ' + (isDark ? 'bg-[#1e293b]' : 'bg-gray-200')}>
                                    <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: p.occupancy + '%' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card>
                    <SectionTitle label="Technician Performance" icon={<Users size={18} className={c.yellow} />} />
                    <div className="space-y-3">
                        {data.tech_performance.length > 0 ? data.tech_performance.map((t, i) => {
                            const rate = t.total > 0 ? Math.round((t.resolved / t.total) * 100) : 0;
                            return (
                                <div key={i} className={'rounded-xl p-3 border ' + c.bg + ' ' + c.border}>
                                    <div className="flex justify-between items-start mb-1">
                                        <div><p className={'font-bold text-sm ' + c.heading}>{t.name}</p><span className={'text-[10px] font-bold ' + c.purple}>{t.specialty}</span></div>
                                        <span className={'text-xs font-bold ' + (rate >= 70 ? c.green : rate >= 40 ? c.yellow : c.red)}>{rate}% resolved</span>
                                    </div>
                                    <div className={'flex items-center gap-4 mt-2 text-xs ' + c.textSec}>
                                        <span>Total: <span className={'font-bold ' + c.heading}>{t.total}</span></span>
                                        <span>Active: <span className={'font-bold ' + c.yellow}>{t.active}</span></span>
                                        <span>Done: <span className={'font-bold ' + c.green}>{t.resolved}</span></span>
                                    </div>
                                    <div className={'w-full h-1.5 rounded-full mt-2 ' + (isDark ? 'bg-[#1e293b]' : 'bg-gray-200')}>
                                        <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: rate + '%' }} />
                                    </div>
                                </div>
                            );
                        }) : <p className={c.textMut + ' text-sm'}>No technicians found.</p>}
                    </div>
                </Card>
            </div>

            {data.expiring_leases.length > 0 && (
                <Card className={'border-amber-500/30'}>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className={'text-[10px] font-bold uppercase tracking-wider ' + c.accent}>Expiring Leases (Next 90 Days)</h3>
                            <p className={'text-xs mt-1 ' + c.textMut}>{data.expiring_leases.length} lease{data.expiring_leases.length > 1 ? 's' : ''} expiring soon</p>
                        </div>
                        <Calendar size={18} className={c.accent} />
                    </div>
                    <div className="space-y-2">
                        {data.expiring_leases.map((l, i) => (
                            <div key={i} className={'flex items-center justify-between rounded-xl p-3 border ' + c.bg + ' ' + c.border}>
                                <div><p className={'font-bold text-sm ' + c.heading}>{l.tenant}</p><p className={'text-xs ' + c.textMut}>{l.property} — Unit {l.unit}</p></div>
                                <div className="text-right">
                                    <p className={'text-sm font-bold ' + (l.days_left <= 30 ? c.red : l.days_left <= 60 ? c.yellow : c.green)}>{l.days_left} days left</p>
                                    <p className={'text-xs ' + c.textMut}>AED {l.rent.toLocaleString()}/yr</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
};

export default Analytics;