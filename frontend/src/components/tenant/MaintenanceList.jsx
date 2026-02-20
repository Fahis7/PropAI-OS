import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import TenantNav from './TenantNav';
import { 
    Wrench, Loader, CheckCircle, Clock, AlertCircle, 
    AlertTriangle, Plus, Filter
} from 'lucide-react';

const MaintenanceList = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('me/');
                setProfile(res.data);
            } catch (err) {
                console.error("Failed to load profile", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const getPriorityStyle = (priority) => {
        switch(priority) {
            case 'EMERGENCY': return 'bg-red-500/20 text-red-400 border-red-500/50';
            case 'HIGH': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
            case 'MEDIUM': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
            default: return 'bg-gray-700 text-gray-400 border-gray-600';
        }
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case 'RESOLVED': case 'CLOSED': return <CheckCircle size={18} className="text-green-400" />;
            case 'IN_PROGRESS': return <Clock size={18} className="text-yellow-400" />;
            case 'OPEN': return <AlertCircle size={18} className="text-blue-400" />;
            default: return <Clock size={18} className="text-gray-400" />;
        }
    };

    const getStatusStyle = (status) => {
        switch(status) {
            case 'RESOLVED': case 'CLOSED': return 'text-green-400';
            case 'IN_PROGRESS': return 'text-yellow-400';
            case 'OPEN': return 'text-blue-400';
            default: return 'text-gray-400';
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center text-blue-500">
            <Loader className="animate-spin" size={48} />
        </div>
    );

    const tickets = profile?.maintenance_tickets || [];
    const filtered = filter === 'ALL' ? tickets : tickets.filter(t => t.status === filter);
    const notifCount = profile?.notifications?.length || 0;

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 font-sans pb-24">
            
            {/* Header */}
            <header className="bg-gray-800 border-b border-gray-700 p-5 sticky top-0 z-10">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-bold text-white flex items-center gap-2">
                        <Wrench size={20} className="text-orange-400" /> AI Support Tracking
                    </h1>
                    <button 
                        onClick={() => navigate('/tenant/maintenance')}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition"
                    >
                        <Plus size={14} /> New Request
                    </button>
                </div>
            </header>

            <main className="p-5 max-w-lg mx-auto space-y-4">

                {/* Summary */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gray-800 rounded-xl p-3 border border-gray-700 text-center">
                        <p className="text-lg font-bold text-blue-400">{tickets.filter(t => t.status === 'OPEN').length}</p>
                        <p className="text-[10px] text-gray-400 uppercase font-bold">Open</p>
                    </div>
                    <div className="bg-gray-800 rounded-xl p-3 border border-gray-700 text-center">
                        <p className="text-lg font-bold text-yellow-400">{tickets.filter(t => t.status === 'IN_PROGRESS').length}</p>
                        <p className="text-[10px] text-gray-400 uppercase font-bold">In Progress</p>
                    </div>
                    <div className="bg-gray-800 rounded-xl p-3 border border-gray-700 text-center">
                        <p className="text-lg font-bold text-green-400">{tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length}</p>
                        <p className="text-[10px] text-gray-400 uppercase font-bold">Resolved</p>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((status) => {
                        const count = status === 'ALL' ? tickets.length : tickets.filter(t => t.status === status).length;
                        if (count === 0 && status !== 'ALL') return null;
                        return (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                                    filter === status 
                                        ? 'bg-blue-600 text-white' 
                                        : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600'
                                }`}
                            >
                                {status.replace('_', ' ')} ({count})
                            </button>
                        );
                    })}
                </div>

                {/* Ticket List */}
                <div className="space-y-3">
                    {filtered.length > 0 ? (
                        filtered.map((ticket) => (
                            <div key={ticket.id} className="bg-gray-800 p-4 rounded-xl border border-gray-700 transition-all hover:border-gray-600">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        {getStatusIcon(ticket.status)}
                                        <h3 className="font-semibold text-sm text-white truncate">{ticket.title}</h3>
                                    </div>
                                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold border shrink-0 ml-3 ${getPriorityStyle(ticket.priority)}`}>
                                        {ticket.priority}
                                    </span>
                                </div>
                                <p className="text-gray-400 text-xs mb-3 line-clamp-2 ml-7">{ticket.description}</p>
                                <div className="flex justify-between items-center text-xs ml-7">
                                    <span className={`font-medium ${getStatusStyle(ticket.status)}`}>
                                        {ticket.status.replace('_', ' ')}
                                    </span>
                                    <div className="flex items-center gap-3 text-gray-500">
                                        {ticket.source === 'SYSTEM' && (
                                            <span className="bg-purple-500/10 text-purple-400 border border-purple-500/30 px-1.5 py-0.5 rounded text-[9px] font-bold">
                                                AI Triaged
                                            </span>
                                        )}
                                        <span>{ticket.date}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 border-2 border-dashed border-gray-700 rounded-xl">
                            <Wrench size={36} className="text-gray-700 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">No tickets found.</p>
                            <button 
                                onClick={() => navigate('/tenant/maintenance')}
                                className="mt-4 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition"
                            >
                                Report an Issue
                            </button>
                        </div>
                    )}
                </div>
            </main>

            <TenantNav notificationCount={notifCount} />
        </div>
    );
};

export default MaintenanceList;