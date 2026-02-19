import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
// 👇 Added 'Wrench' to imports
import { Building2, Users, Wallet, AlertCircle, TrendingUp, Key, AlertTriangle, Wrench } from 'lucide-react';

function AdminDashboard() {
    const [stats, setStats] = useState({
        total_properties: 0,
        total_units: 0,
        occupied_units: 0,
        vacant_units: 0,
        occupancy_rate: 0,
        active_tenants: 0,
        pending_cheques: 0,
        total_pending_amount: 0,
        total_revenue: 0,
        bounced_cheques: 0,
        bounced_amount: 0
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
                console.log("🔥 Backend Stats Received:", res.data);
                setStats(res.data);
            } catch (error) {
                console.error("❌ Failed to load dashboard stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return (
        <div className="p-6 flex h-screen items-center justify-center text-gray-400">
            <div className="animate-pulse">Loading Live Data...</div>
        </div>
    );

    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-gray-400">Overview for <span className="text-blue-400 capitalize">{username}</span></p>
            </div>

            {/* CRITICAL ALERT BANNER (Only shows if there are bounced cheques) */}
            {stats.bounced_cheques > 0 && (
                <div 
                    onClick={() => navigate('/finance')} 
                    className="bg-red-900/20 border border-red-500/50 text-red-400 p-4 rounded-lg mb-8 flex items-center justify-between cursor-pointer hover:bg-red-900/30 transition group"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-red-500/20 rounded-full group-hover:bg-red-500/30 transition">
                            <AlertTriangle size={24} className="text-red-500" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-red-200">Action Required: Payment Failed</h3>
                            <p className="text-sm text-red-400">
                                {stats.bounced_cheques} Tenant Cheque(s) have bounced.
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs uppercase font-bold text-red-500">Amount at Risk</p>
                        <p className="text-2xl font-bold font-mono text-red-200">AED {stats.bounced_amount.toLocaleString()}</p>
                    </div>
                </div>
            )}

            {/* --- STATS GRID --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                
                {/* 1. Total Revenue */}
                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-gray-400 text-sm uppercase font-bold">Total Revenue</p>
                            <h3 className="text-2xl font-bold text-white mt-1">
                                AED {(stats.total_revenue || 0).toLocaleString()}
                            </h3>
                        </div>
                        <div className="p-2 bg-green-900/30 rounded-lg">
                            <TrendingUp className="text-green-400" size={24} />
                        </div>
                    </div>
                    <p className="text-xs text-green-400 flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        Cleared Funds
                    </p>
                </div>

                {/* 2. Pending Rent */}
                <div 
                    onClick={() => navigate('/finance')}
                    className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg cursor-pointer hover:border-yellow-500 transition group"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-gray-400 text-sm uppercase font-bold group-hover:text-yellow-400 transition">Pending Rent</p>
                            <h3 className="text-2xl font-bold text-white mt-1">
                                AED {(stats.total_pending_amount || 0).toLocaleString()}
                            </h3>
                        </div>
                        <div className="p-2 bg-yellow-900/30 rounded-lg">
                            <Wallet className="text-yellow-400" size={24} />
                        </div>
                    </div>
                    <p className="text-xs text-yellow-400 flex items-center">
                        <AlertCircle size={12} className="mr-1" />
                        {stats.pending_cheques} Cheques to Deposit
                    </p>
                </div>

                {/* 3. Occupancy Rate */}
                <div 
                    onClick={() => navigate('/tenants')}
                    className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg cursor-pointer hover:border-blue-500 transition group"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-gray-400 text-sm uppercase font-bold group-hover:text-blue-400 transition">Occupancy</p>
                            <h3 className="text-2xl font-bold text-white mt-1">
                                {stats.occupancy_rate}%
                            </h3>
                        </div>
                        <div className="p-2 bg-blue-900/30 rounded-lg">
                            <Users className="text-blue-400" size={24} />
                        </div>
                    </div>
                    <div className="w-full bg-gray-700 h-1.5 rounded-full mt-2">
                        <div 
                            className="bg-blue-500 h-1.5 rounded-full transition-all duration-1000" 
                            style={{ width: `${stats.occupancy_rate}%` }}
                        ></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                        {stats.occupied_units} Occupied / {stats.total_units} Total
                    </p>
                </div>

                {/* 4. Portfolio Size */}
                <div 
                    onClick={() => navigate('/properties')}
                    className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg cursor-pointer hover:border-purple-500 transition group"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-gray-400 text-sm uppercase font-bold group-hover:text-purple-400 transition">Portfolio</p>
                            <h3 className="text-2xl font-bold text-white mt-1">
                                {stats.total_properties}
                            </h3>
                        </div>
                        <div className="p-2 bg-purple-900/30 rounded-lg">
                            <Building2 className="text-purple-400" size={24} />
                        </div>
                    </div>
                    <p className="text-xs text-purple-400 flex items-center">
                        <Key size={12} className="mr-1" />
                        {stats.vacant_units} Units Available
                    </p>
                </div>
            </div>

            {/* Quick Actions */}
            <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
            <div className="flex flex-wrap gap-4">
                <button 
                    onClick={() => navigate('/properties')}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 rounded-lg font-bold transition shadow-lg hover:shadow-blue-500/20"
                >
                    <Key size={20} /> View Properties
                </button>
                <button 
                    onClick={() => navigate('/tenants')}
                    className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-5 py-3 rounded-lg font-bold transition border border-gray-600"
                >
                    <Users size={20} /> Manage Tenants
                </button>
                <button 
                    onClick={() => navigate('/finance')}
                    className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-5 py-3 rounded-lg font-bold transition border border-gray-600"
                >
                    <Wallet size={20} /> Process Payments
                </button>
                
                {/* 👇 NEW MAINTENANCE BUTTON ADDED HERE */}
                <button 
                    onClick={() => navigate('/maintenance')}
                    className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-5 py-3 rounded-lg font-bold transition shadow-lg hover:shadow-orange-500/20"
                >
                    <Wrench size={20} /> Maintenance
                </button>
            </div>
        </div>
    );
}

export default AdminDashboard;