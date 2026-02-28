import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useTheme } from '../../context/ThemeContext';
import { Building2, Users, Wallet, AlertCircle, TrendingUp, Key, AlertTriangle, Wrench } from 'lucide-react';

function AdminDashboard() {
    const { c } = useTheme();
    const [stats, setStats] = useState({
        total_properties: 0, total_units: 0, occupied_units: 0, vacant_units: 0,
        occupancy_rate: 0, active_tenants: 0, pending_cheques: 0, total_pending_amount: 0,
        total_revenue: 0, bounced_cheques: 0, bounced_amount: 0
    });
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState('Admin');
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('username');
        if (storedUser) setUsername(storedUser);
        const fetchStats = async () => {
            try {
                const res = await api.get('dashboard/stats/');
                setStats(res.data);
            } catch (error) {
                console.error("Failed to load dashboard stats:", error);
            } finally { setLoading(false); }
        };
        fetchStats();
    }, []);

    if (loading) return (
        <div className={'flex h-96 items-center justify-center ' + c.textSec}>
            <div className="animate-pulse text-lg">Loading Dashboard...</div>
        </div>
    );

    return (
        <div className="fade-in">
            <div className="mb-8">
                <h1 className={'text-2xl font-extrabold ' + c.heading}>Admin Dashboard</h1>
                <p className={c.textSec + ' text-sm mt-1'}>Overview for <span className={c.accent + ' capitalize font-semibold'}>{username}</span></p>
            </div>

            {stats.bounced_cheques > 0 && (
                <div onClick={() => navigate('/finance')}
                    className={'p-5 rounded-2xl mb-6 flex items-center justify-between cursor-pointer transition border ' + c.redBg + ' hover:opacity-90'}>
                    <div className="flex items-center gap-4">
                        <div className={'p-2.5 rounded-xl border ' + c.redBg}><AlertTriangle size={22} /></div>
                        <div>
                            <h3 className={'font-bold text-base ' + c.red}>Action Required: Payment Failed</h3>
                            <p className={'text-sm ' + c.textSec}>{stats.bounced_cheques} Tenant Cheque(s) have bounced.</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className={'text-[10px] uppercase font-bold ' + c.red}>Amount at Risk</p>
                        <p className={'text-xl font-extrabold ' + c.red}>AED {stats.bounced_amount.toLocaleString()}</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard c={c} label="Total Revenue" value={'AED ' + (stats.total_revenue || 0).toLocaleString()}
                    icon={<TrendingUp size={22} />} color="green" sub="Cleared Funds"
                    onClick={() => navigate('/finance')} />
                <StatCard c={c} label="Pending Rent" value={'AED ' + (stats.total_pending_amount || 0).toLocaleString()}
                    icon={<Wallet size={22} />} color="yellow" sub={stats.pending_cheques + ' Cheques to Deposit'}
                    onClick={() => navigate('/finance')} />
                <StatCard c={c} label="Occupancy" value={stats.occupancy_rate + '%'}
                    icon={<Users size={22} />} color="blue"
                    sub={stats.occupied_units + ' / ' + stats.total_units + ' Units'}
                    bar={stats.occupancy_rate} onClick={() => navigate('/tenants')} />
                <StatCard c={c} label="Portfolio" value={stats.total_properties}
                    icon={<Building2 size={22} />} color="purple" sub={stats.vacant_units + ' Units Available'}
                    onClick={() => navigate('/properties')} />
            </div>

            <h2 className={'text-lg font-bold mb-4 ' + c.heading}>Quick Actions</h2>
            <div className="flex flex-wrap gap-3">
                <button onClick={() => navigate('/properties')}
                    className={c.btn + ' flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm shadow-lg shadow-amber-500/20 transition hover:scale-[1.02]'}>
                    <Key size={18} /> View Properties
                </button>
                <button onClick={() => navigate('/tenants')}
                    className={c.btn2 + ' flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition'}>
                    <Users size={18} /> Manage Tenants
                </button>
                <button onClick={() => navigate('/finance')}
                    className={c.btn2 + ' flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition'}>
                    <Wallet size={18} /> Process Payments
                </button>
                <button onClick={() => navigate('/maintenance')}
                    className={c.btn2 + ' flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition'}>
                    <Wrench size={18} /> Maintenance
                </button>
            </div>
        </div>
    );
}

function StatCard({ c, label, value, icon, color, sub, bar, onClick }) {
    const colors = {
        green: { bg: c.greenBg, text: c.green },
        yellow: { bg: c.yellowBg, text: c.yellow },
        blue: { bg: c.blueBg, text: c.blue },
        purple: { bg: c.purpleBg, text: c.purple },
    };
    const cl = colors[color] || colors.blue;
    return (
        <div onClick={onClick}
            className={'rounded-2xl border p-5 cursor-pointer transition hover:scale-[1.02] ' + c.card + ' ' + c.border + ' ' + c.shadow + ' ' + c.cardHover}>
            <div className="flex justify-between items-start mb-3">
                <div>
                    <p className={'text-[10px] uppercase font-bold tracking-wider ' + c.textMut}>{label}</p>
                    <h3 className={'text-2xl font-extrabold mt-1 ' + c.heading}>{value}</h3>
                </div>
                <div className={'p-2.5 rounded-xl border ' + cl.bg}>{icon}</div>
            </div>
            {bar !== undefined && (
                <div className={'w-full h-1.5 rounded-full mt-2 ' + (c.border === 'border-[#1e293b]' ? 'bg-[#1e293b]' : 'bg-gray-200')}>
                    <div className="bg-amber-500 h-1.5 rounded-full transition-all duration-1000" style={{ width: bar + '%' }} />
                </div>
            )}
            <p className={'text-xs mt-2 ' + c.textSec}>{sub}</p>
        </div>
    );
}

export default AdminDashboard;