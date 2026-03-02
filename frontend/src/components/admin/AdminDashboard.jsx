import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useTheme } from '../../context/ThemeContext';
import { Building2, Users, Wallet, AlertCircle, TrendingUp, Key, AlertTriangle, Wrench } from 'lucide-react';

function AdminDashboard() {
    const { c, isDark } = useTheme();
    const [stats, setStats] = useState({
        total_properties: 0, total_units: 0, occupied_units: 0, vacant_units: 0,
        occupancy_rate: 0, active_tenants: 0, pending_cheques: 0,
        total_pending_amount: 0, total_revenue: 0, bounced_cheques: 0, bounced_amount: 0
    });
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState('Admin');
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('username');
        if (storedUser) setUsername(storedUser);
        const fetchStats = async () => {
            try { const res = await api.get('dashboard/stats/'); setStats(res.data); }
            catch (error) { console.error("Failed to load dashboard stats:", error); }
            finally { setLoading(false); }
        };
        fetchStats();
    }, []);

    if (loading) return (
        <div className="p-6 flex h-screen items-center justify-center">
            <div className={"animate-pulse " + c.textMut}>Loading Live Data...</div>
        </div>
    );

    const StatCard = ({ label, value, icon: Icon, iconBg, iconColor, sub, subColor, onClick, hoverBorder }) => (
        <div onClick={onClick}
            className={"p-6 rounded-2xl border transition " + c.card + " " + c.border + " " + c.shadow +
                (onClick ? " cursor-pointer hover:border-amber-500/30" : "")}>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className={"text-sm uppercase font-bold " + c.textMut}>{label}</p>
                    <h3 className={"text-2xl font-bold mt-1 " + c.heading}>{value}</h3>
                </div>
                <div className={"p-2 rounded-lg " + iconBg}><Icon className={iconColor} size={24} /></div>
            </div>
            {sub && <p className={"text-xs flex items-center " + (subColor || c.textMut)}>{sub}</p>}
        </div>
    );

    return (
        <div>
            <div className="mb-8">
                <h1 className={"text-3xl font-bold " + c.heading}>Admin Dashboard</h1>
                <p className={c.textSec}>Overview for <span className={c.accent + " capitalize"}>{username}</span></p>
            </div>

            {/* Bounced Alert */}
            {stats.bounced_cheques > 0 && (
                <div onClick={() => navigate('/finance')}
                    className={"p-4 rounded-2xl mb-8 flex items-center justify-between cursor-pointer transition border " + c.redBg + " hover:opacity-90"}>
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-rose-500/20 rounded-full"><AlertTriangle size={24} className={c.red} /></div>
                        <div>
                            <h3 className={"font-bold text-lg " + c.heading}>Action Required: Payment Failed</h3>
                            <p className={"text-sm " + c.red}>{stats.bounced_cheques} Tenant Cheque(s) have bounced.</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className={"text-xs uppercase font-bold " + c.red}>Amount at Risk</p>
                        <p className={"text-2xl font-bold font-mono " + c.heading}>AED {stats.bounced_amount.toLocaleString()}</p>
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard label="Total Revenue" value={`AED ${(stats.total_revenue || 0).toLocaleString()}`}
                    icon={TrendingUp} iconBg={isDark ? "bg-emerald-900/30" : "bg-emerald-50"} iconColor={c.green}
                    sub={<><span className="w-2 h-2 bg-emerald-500 rounded-full mr-2" />Cleared Funds</>} subColor={c.green} />

                <StatCard label="Pending Rent" value={`AED ${(stats.total_pending_amount || 0).toLocaleString()}`}
                    icon={Wallet} iconBg={isDark ? "bg-amber-900/30" : "bg-amber-50"} iconColor={c.yellow}
                    sub={<><AlertCircle size={12} className="mr-1" />{stats.pending_cheques} Cheques to Deposit</>} subColor={c.yellow}
                    onClick={() => navigate('/finance')} />

                <div onClick={() => navigate('/tenants')}
                    className={"p-6 rounded-2xl border cursor-pointer transition hover:border-amber-500/30 " + c.card + " " + c.border + " " + c.shadow}>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className={"text-sm uppercase font-bold " + c.textMut}>Occupancy</p>
                            <h3 className={"text-2xl font-bold mt-1 " + c.heading}>{stats.occupancy_rate}%</h3>
                        </div>
                        <div className={"p-2 rounded-lg " + (isDark ? "bg-sky-900/30" : "bg-sky-50")}><Users className={c.blue} size={24} /></div>
                    </div>
                    <div className={"w-full h-1.5 rounded-full mt-2 " + (isDark ? "bg-gray-700" : "bg-gray-200")}>
                        <div className="bg-sky-500 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${stats.occupancy_rate}%` }} />
                    </div>
                    <p className={"text-xs mt-2 " + c.textMut}>{stats.occupied_units} Occupied / {stats.total_units} Total</p>
                </div>

                <StatCard label="Portfolio" value={stats.total_properties}
                    icon={Building2} iconBg={isDark ? "bg-purple-900/30" : "bg-purple-50"} iconColor="text-purple-400"
                    sub={<><Key size={12} className="mr-1" />{stats.vacant_units} Units Available</>} subColor="text-purple-400"
                    onClick={() => navigate('/properties')} />
            </div>

            {/* Quick Actions */}
            <h2 className={"text-xl font-bold mb-4 " + c.heading}>Quick Actions</h2>
            <div className="flex flex-wrap gap-4">
                <button onClick={() => navigate('/properties')}
                    className={c.btn + " flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition shadow-lg shadow-amber-500/20"}>
                    <Key size={20} /> View Properties
                </button>
                <button onClick={() => navigate('/tenants')}
                    className={"flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition border " + c.btn2}>
                    <Users size={20} /> Manage Tenants
                </button>
                <button onClick={() => navigate('/finance')}
                    className={"flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition border " + c.btn2}>
                    <Wallet size={20} /> Process Payments
                </button>
                <button onClick={() => navigate('/maintenance')}
                    className={"flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition border " + c.btn2}>
                    <Wrench size={20} /> Maintenance
                </button>
            </div>
        </div>
    );
}

export default AdminDashboard;