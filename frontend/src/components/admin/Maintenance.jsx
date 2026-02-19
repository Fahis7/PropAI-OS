import { useState, useEffect } from 'react';
import api from '../../api/axios';
import MaintenanceForm from '../../components/admin/MaintenanceForm';
// 👇 Added Trash2 (Delete) and Eye (View) icons
import { Wrench, Plus, User, Shield, Smartphone, Trash2, Eye } from 'lucide-react'; 

function Maintenance() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const fetchTickets = async () => {
        try {
            const res = await api.get('maintenance/');
            setTickets(res.data);
        } catch (err) {
            console.error("Error loading tickets:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    // 👇 NEW: Function to Delete a Ticket
    const handleDelete = async (id) => {
        if(!window.confirm("Are you sure you want to delete this ticket?")) return;
        try {
            await api.delete(`maintenance/${id}/`);
            fetchTickets(); // Refresh list
        } catch (error) {
            alert("Failed to delete ticket");
        }
    };

    const getPriorityColor = (p) => {
        if (p === 'EMERGENCY') return 'text-red-500 bg-red-900/20 border-red-500';
        if (p === 'HIGH') return 'text-orange-500 bg-orange-900/20 border-orange-500';
        if (p === 'MEDIUM') return 'text-yellow-500 bg-yellow-900/20 border-yellow-500';
        return 'text-blue-400 bg-blue-900/20 border-blue-500';
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Maintenance</h1>
                    <p className="text-gray-400">Track repairs and complaints</p>
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold transition"
                >
                    <Plus size={20} /> Report Issue
                </button>
            </div>

            {loading ? (
                <div className="text-gray-400">Loading tickets...</div>
            ) : tickets.length === 0 ? (
                <div className="bg-gray-800 p-12 rounded-lg border border-gray-700 text-center">
                    <div className="inline-block p-4 bg-gray-700 rounded-full mb-4">
                        <Wrench size={48} className="text-gray-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No Issues Reported</h3>
                    <p className="text-gray-400">Everything is running smoothly!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tickets.map(ticket => (
                        <div key={ticket.id} className="bg-gray-800 rounded-lg border border-gray-700 p-5 shadow-lg hover:border-blue-500 transition relative overflow-hidden group">
                            
                            {/* 👇 NEW: DELETE BUTTON (Top Right) */}
                            <button 
                                onClick={() => handleDelete(ticket.id)}
                                className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition z-10"
                                title="Delete Ticket"
                            >
                                <Trash2 size={18} />
                            </button>

                            <div className={`absolute top-0 left-0 w-1.5 h-full ${ticket.status === 'RESOLVED' ? 'bg-green-500' : ticket.status === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-gray-600'}`}></div>
                            
                            <div className="pl-3">
                                <div className="flex justify-between items-start mb-2 pr-8">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wide ${getPriorityColor(ticket.priority)}`}>
                                        {ticket.priority}
                                    </span>
                                </div>
                                
                                <div className="flex justify-between items-start">
                                     <span className="text-xs text-gray-500 font-mono mb-1 block">
                                        {new Date(ticket.created_at).toLocaleDateString()}
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold text-white mb-1">{ticket.title}</h3>
                                <p className="text-sm text-gray-400 mb-4 line-clamp-2">{ticket.description}</p>
                                
                                {/* 👇 NEW: Show tiny image preview if it exists */}
                                {ticket.image && (
                                    <div className="mb-4">
                                        <img 
                                            src={`http://localhost:8000${ticket.image}`} 
                                            alt="Evidence" 
                                            className="h-20 w-full object-cover rounded border border-gray-600"
                                        />
                                    </div>
                                )}

                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
                                    <div className="text-sm text-gray-300">
                                        <span className="block text-xs text-gray-500 uppercase">Location</span>
                                        Unit {ticket.unit_number}
                                    </div>
                                    <div className="flex items-center gap-2">
                                         {/* Source Icon */}
                                        {ticket.source === 'SYSTEM' && <User size={14} className="text-blue-400" />}
                                        <span className="text-xs font-bold text-gray-400 uppercase">
                                            {ticket.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <MaintenanceForm 
                    onSuccess={() => {
                        setShowModal(false);
                        fetchTickets();
                    }}
                    onCancel={() => setShowModal(false)}
                />
            )}
        </div>
    );
}

export default Maintenance;