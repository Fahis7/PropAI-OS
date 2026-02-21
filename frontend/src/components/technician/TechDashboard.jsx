import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Chatbot from '../Chatbot';
import { 
    Wrench, Loader, CheckCircle, Clock, AlertCircle, AlertTriangle,
    Phone, MapPin, Building, User, LogOut, ChevronDown, ChevronUp,
    Play, CheckCheck, MessageSquare
} from 'lucide-react';

const TechDashboard = () => {
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const [expandedTicket, setExpandedTicket] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);
    const [notes, setNotes] = useState('');

    const fetchData = async () => {
        try {
            const [ticketsRes, statsRes] = await Promise.all([
                api.get('maintenance/'),
                api.get('technician/stats/'),
            ]);
            setTickets(ticketsRes.data);
            setStats(statsRes.data);
        } catch (err) {
            console.error("Failed to load data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleStatusUpdate = async (ticketId, newStatus) => {
        setUpdatingId(ticketId);
        try {
            const payload = { status: newStatus };
            if (notes.trim()) payload.resolution_notes = notes;
            
            await api.patch(`maintenance/${ticketId}/`, payload);
            setNotes('');
            setExpandedTicket(null);
            fetchData();
        } catch (err) {
            console.error("Update failed:", err);
            alert("Failed to update ticket.");
        } finally {
            setUpdatingId(null);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const getPriorityStyle = (priority) => {
        switch(priority) {
            case 'EMERGENCY': return { bg: 'bg-red-500/10 border-red-500/40', text: 'text-red-400', badge: 'bg-red-500/20 text-red-400 border-red-500/50 animate-pulse' };
            case 'HIGH': return { bg: 'bg-orange-500/10 border-orange-500/40', text: 'text-orange-400', badge: 'bg-orange-500/20 text-orange-400 border-orange-500/50' };
            case 'MEDIUM': return { bg: 'bg-blue-500/10 border-blue-500/40', text: 'text-blue-400', badge: 'bg-blue-500/20 text-blue-400 border-blue-500/50' };
            default: return { bg: 'bg-gray-800 border-gray-700', text: 'text-gray-400', badge: 'bg-gray-700 text-gray-400 border-gray-600' };
        }
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case 'RESOLVED': case 'CLOSED': return <CheckCircle size={16} className="text-green-400" />;
            case 'IN_PROGRESS': return <Clock size={16} className="text-yellow-400" />;
            case 'OPEN': return <AlertCircle size={16} className="text-blue-400" />;
            default: return <Clock size={16} className="text-gray-400" />;
        }
    };

    const filtered = filter === 'ALL' ? tickets : tickets.filter(t => t.status === filter);

    if (loading) return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center text-blue-500">
            <Loader className="animate-spin" size={48} />
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
            
            {/* Header */}
            <header className="bg-gray-800 border-b border-gray-700 p-5 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-orange-600 p-2 rounded-lg">
                            <Wrench className="text-white" size={22} />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white">PropOS <span className="text-orange-400">Technician</span></h1>
                            <p className="text-xs text-gray-400">Maintenance Portal</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="text-gray-400 hover:text-red-400 p-2 transition">
                        <LogOut size={20} />
                    </button>
                </div>
            </header>

            <main className="max-w-4xl mx-auto p-5 space-y-5">

                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-4 gap-3">
                        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 text-center">
                            <p className="text-2xl font-bold text-blue-400">{stats.open}</p>
                            <p className="text-[10px] text-gray-400 uppercase font-bold">Open</p>
                        </div>
                        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 text-center">
                            <p className="text-2xl font-bold text-yellow-400">{stats.in_progress}</p>
                            <p className="text-[10px] text-gray-400 uppercase font-bold">In Progress</p>
                        </div>
                        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 text-center">
                            <p className="text-2xl font-bold text-green-400">{stats.resolved}</p>
                            <p className="text-[10px] text-gray-400 uppercase font-bold">Resolved</p>
                        </div>
                        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 text-center">
                            <p className="text-2xl font-bold text-red-400">{stats.emergency + stats.high}</p>
                            <p className="text-[10px] text-gray-400 uppercase font-bold">Urgent</p>
                        </div>
                    </div>
                )}

                {/* Emergency Banner */}
                {stats && stats.emergency > 0 && (
                    <div className="bg-red-900/30 border border-red-500 p-4 rounded-xl flex items-center gap-3 animate-pulse">
                        <AlertTriangle size={24} className="text-red-400 shrink-0" />
                        <div>
                            <p className="font-bold text-red-300">🚨 {stats.emergency} Emergency Ticket{stats.emergency > 1 ? 's' : ''} — Needs Immediate Attention!</p>
                        </div>
                    </div>
                )}

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
                                        ? 'bg-orange-600 text-white' 
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
                        filtered.map((ticket) => {
                            const style = getPriorityStyle(ticket.priority);
                            const isExpanded = expandedTicket === ticket.id;

                            return (
                                <div key={ticket.id} className={`rounded-xl border ${style.bg} overflow-hidden transition-all`}>
                                    {/* Ticket Header — always visible */}
                                    <div 
                                        className="p-4 cursor-pointer"
                                        onClick={() => setExpandedTicket(isExpanded ? null : ticket.id)}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                {getStatusIcon(ticket.status)}
                                                <h3 className="font-semibold text-sm text-white truncate">{ticket.title}</h3>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0 ml-3">
                                                <span className={`px-2 py-1 rounded-md text-[10px] font-bold border ${style.badge}`}>
                                                    {ticket.priority}
                                                </span>
                                                {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-gray-400">
                                            <span className="flex items-center gap-1">
                                                <Building size={12} /> {ticket.property_name} — Unit {ticket.unit_number}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock size={12} /> {new Date(ticket.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Expanded Details */}
                                    {isExpanded && (
                                        <div className="border-t border-gray-700/50 p-4 space-y-4 bg-gray-900/30">
                                            
                                            {/* Description */}
                                            <div>
                                                <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Description</p>
                                                <p className="text-sm text-gray-300">{ticket.description}</p>
                                            </div>

                                            {/* Location & Contact */}
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                                                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Location</p>
                                                    <p className="text-sm text-gray-200 flex items-center gap-1">
                                                        <MapPin size={12} className="text-blue-400" />
                                                        {ticket.property_name}
                                                    </p>
                                                    <p className="text-xs text-gray-400 ml-4">Unit {ticket.unit_number}</p>
                                                    {ticket.property_address && (
                                                        <p className="text-xs text-gray-500 ml-4 mt-1">{ticket.property_address}</p>
                                                    )}
                                                </div>
                                                <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                                                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Tenant Contact</p>
                                                    <p className="text-sm text-gray-200 flex items-center gap-1">
                                                        <User size={12} className="text-green-400" />
                                                        {ticket.tenant_name || 'N/A'}
                                                    </p>
                                                    {ticket.tenant_phone && (
                                                        <a href={`tel:${ticket.tenant_phone}`} className="text-xs text-blue-400 ml-4 flex items-center gap-1 mt-1 hover:text-blue-300">
                                                            <Phone size={10} /> {ticket.tenant_phone}
                                                        </a>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Image */}
                                            {ticket.image && (
                                                <div>
                                                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Photo Evidence</p>
                                                    <img 
                                                        src={`http://localhost:8000${ticket.image}`} 
                                                        alt="Issue" 
                                                        className="w-full max-h-48 object-cover rounded-lg border border-gray-700"
                                                    />
                                                </div>
                                            )}

                                            {/* Category & Source */}
                                            <div className="flex gap-2">
                                                {ticket.ai_category && ticket.ai_category !== 'GENERAL' && (
                                                    <span className="bg-purple-500/10 text-purple-400 border border-purple-500/30 px-2 py-1 rounded text-[10px] font-bold">
                                                        🔧 {ticket.ai_category}
                                                    </span>
                                                )}
                                                {ticket.source === 'SYSTEM' && (
                                                    <span className="bg-purple-500/10 text-purple-400 border border-purple-500/30 px-2 py-1 rounded text-[10px] font-bold">
                                                        🤖 AI Triaged
                                                    </span>
                                                )}
                                            </div>

                                            {/* Resolution Notes */}
                                            {ticket.resolution_notes && (
                                                <div className="bg-green-900/20 border border-green-500/30 p-3 rounded-lg">
                                                    <p className="text-[10px] text-green-400 uppercase font-bold mb-1">Resolution Notes</p>
                                                    <p className="text-sm text-gray-300">{ticket.resolution_notes}</p>
                                                </div>
                                            )}

                                            {/* Action Buttons */}
                                            {ticket.status !== 'CLOSED' && ticket.status !== 'RESOLVED' && (
                                                <div className="space-y-3 pt-2">
                                                    {/* Notes input */}
                                                    <textarea
                                                        placeholder="Add notes (optional)..."
                                                        value={expandedTicket === ticket.id ? notes : ''}
                                                        onChange={(e) => setNotes(e.target.value)}
                                                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                                                        rows={2}
                                                    />

                                                    <div className="flex gap-2">
                                                        {ticket.status === 'OPEN' && (
                                                            <button
                                                                onClick={() => handleStatusUpdate(ticket.id, 'IN_PROGRESS')}
                                                                disabled={updatingId === ticket.id}
                                                                className="flex-1 bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 text-white py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition text-sm"
                                                            >
                                                                <Play size={14} /> Start Working
                                                            </button>
                                                        )}
                                                        {(ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS') && (
                                                            <button
                                                                onClick={() => handleStatusUpdate(ticket.id, 'RESOLVED')}
                                                                disabled={updatingId === ticket.id}
                                                                className="flex-1 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition text-sm"
                                                            >
                                                                <CheckCheck size={14} /> Mark Resolved
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Already resolved indicator */}
                                            {(ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') && (
                                                <div className="bg-green-900/20 border border-green-500/30 p-3 rounded-lg text-center">
                                                    <CheckCircle size={20} className="text-green-400 mx-auto mb-1" />
                                                    <p className="text-green-400 font-bold text-sm">
                                                        {ticket.status === 'CLOSED' ? 'Ticket Closed' : 'Resolved'}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-16 border-2 border-dashed border-gray-700 rounded-xl">
                            <Wrench size={48} className="text-gray-700 mx-auto mb-4" />
                            <p className="text-gray-500 font-medium">No tickets found.</p>
                            <p className="text-xs text-gray-600 mt-1">You're all caught up!</p>
                        </div>
                    )}
                </div>
            </main>

            <Chatbot />
        </div>
    );
};

export default TechDashboard;