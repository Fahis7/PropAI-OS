import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { ArrowLeft, Filter, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const MaintenanceList = () => {
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                // We reuse the profile endpoint or a dedicated list endpoint. 
                // Let's assume you added a dedicated list view or we filter from profile.
                // For simplicity, let's use the profile 'maintenance_tickets' data or a new endpoint.
                // ideally: api.get('maintenance/') returns only user's tickets
                const res = await api.get('maintenance/'); 
                setTickets(res.data);
            } catch (err) {
                console.error("Failed to load tickets", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTickets();
    }, []);

    const getStatusIcon = (status) => {
        switch(status) {
            case 'COMPLETED': return <CheckCircle className="text-green-500" size={20} />;
            case 'IN_PROGRESS': return <Clock className="text-blue-500" size={20} />;
            default: return <AlertCircle className="text-gray-500" size={20} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-6 font-sans">
            <header className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/tenant/dashboard')} className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-bold">Request History</h1>
                </div>
                <button className="p-2 bg-gray-800 rounded-lg text-gray-400">
                    <Filter size={20} />
                </button>
            </header>

            <div className="space-y-4">
                {loading ? (
                    <p className="text-center text-gray-500">Loading history...</p>
                ) : tickets.length > 0 ? (
                    tickets.map((ticket) => (
                        <div key={ticket.id} className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold text-lg">{ticket.title}</h3>
                                <span className={`text-[10px] px-2 py-1 rounded border ${ticket.priority === 'HIGH' ? 'border-red-500 text-red-400' : 'border-gray-600 text-gray-400'}`}>
                                    {ticket.priority}
                                </span>
                            </div>
                            <p className="text-gray-400 text-sm mb-4 line-clamp-2">{ticket.description}</p>
                            <div className="flex justify-between items-center text-sm border-t border-gray-700 pt-3">
                                <span className="flex items-center gap-2 text-gray-300">
                                    {getStatusIcon(ticket.status)} {ticket.status.replace('_', ' ')}
                                </span>
                                <span className="text-gray-500">{new Date(ticket.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10 text-gray-500">
                        <p>No maintenance history found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MaintenanceList;