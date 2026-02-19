import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { DollarSign, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import ChequeActionForm from '../../components/admin/ChequeActionForm'; // 👈 Import the Modal

function Finance() {
    const [cheques, setCheques] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL'); 
    
    // 👇 State for managing the modal
    const [selectedCheque, setSelectedCheque] = useState(null);

    const fetchCheques = async () => {
        try {
            const res = await api.get('cheques/');
            setCheques(res.data);
        } catch (err) {
            console.error("Error loading finance:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCheques();
    }, []);

    // Calculate Totals
    const totalPending = cheques
        .filter(c => c.status === 'PENDING')
        .reduce((sum, c) => sum + parseFloat(c.amount), 0);
        
    const totalCollected = cheques
        .filter(c => c.status === 'CLEARED')
        .reduce((sum, c) => sum + parseFloat(c.amount), 0);

    // Filter Logic
    const filteredCheques = filter === 'ALL' 
        ? cheques 
        : cheques.filter(c => c.status === filter);

    const getStatusColor = (status) => {
        switch(status) {
            case 'PENDING': return 'bg-yellow-900/50 text-yellow-400 border-yellow-700';
            case 'DEPOSITED': return 'bg-blue-900/50 text-blue-400 border-blue-700';
            case 'CLEARED': return 'bg-green-900/50 text-green-400 border-green-700';
            case 'BOUNCED': return 'bg-red-900/50 text-red-400 border-red-700';
            default: return 'bg-gray-800 text-gray-400';
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-white mb-2">Finance</h1>
            <p className="text-gray-400 mb-8">Track rent cheques and cash flow</p>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 flex items-center">
                    <div className="p-3 rounded-full bg-yellow-900/30 mr-4">
                        <Clock className="text-yellow-400" size={32} />
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm uppercase">Pending Collections</p>
                        <p className="text-2xl font-bold text-white">AED {totalPending.toLocaleString()}</p>
                    </div>
                </div>
                
                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 flex items-center">
                    <div className="p-3 rounded-full bg-green-900/30 mr-4">
                        <CheckCircle className="text-green-400" size={32} />
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm uppercase">Total Cleared</p>
                        <p className="text-2xl font-bold text-white">AED {totalCollected.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-6 overflow-x-auto">
                {['ALL', 'PENDING', 'DEPOSITED', 'CLEARED', 'BOUNCED'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold border transition
                            ${filter === f 
                                ? 'bg-blue-600 border-blue-600 text-white' 
                                : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'}`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Cheques Table */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                <table className="w-full text-left text-sm text-gray-300">
                    <thead className="bg-gray-700 text-gray-100 uppercase font-semibold">
                        <tr>
                            <th className="px-6 py-3">Due Date</th>
                            <th className="px-6 py-3">Tenant</th>
                            <th className="px-6 py-3">Unit</th>
                            <th className="px-6 py-3">Amount</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Cheque #</th>
                            <th className="px-6 py-3 text-right">Actions</th> {/* 👈 Added Column */}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {loading ? (
                            <tr><td colSpan="7" className="px-6 py-4 text-center">Loading...</td></tr>
                        ) : filteredCheques.length === 0 ? (
                            <tr><td colSpan="7" className="px-6 py-8 text-center text-gray-500">No cheques found.</td></tr>
                        ) : (
                            filteredCheques.map(cheque => (
                                <tr key={cheque.id} className="hover:bg-gray-700/50 transition">
                                    <td className="px-6 py-4 font-mono text-white">
                                        {cheque.cheque_date}
                                    </td>
                                    <td className="px-6 py-4 font-bold text-white">
                                        {cheque.tenant_name}
                                    </td>
                                    <td className="px-6 py-4 text-blue-300">
                                        {cheque.unit_number || '-'}
                                    </td>
                                    <td className="px-6 py-4 font-mono text-lg">
                                        AED {parseFloat(cheque.amount).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold border ${getStatusColor(cheque.status)}`}>
                                            {cheque.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs text-gray-500">
                                        {cheque.cheque_number}
                                    </td>
                                    
                                    {/* 👇 Manage Button */}
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => setSelectedCheque(cheque)}
                                            className="text-blue-400 hover:text-blue-300 font-bold text-xs border border-blue-600 px-3 py-1 rounded hover:bg-blue-900/30 transition"
                                        >
                                            Manage
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* 👇 Render the Modal */}
            {selectedCheque && (
                <ChequeActionForm 
                    cheque={selectedCheque}
                    onSuccess={() => {
                        setSelectedCheque(null);
                        fetchCheques(); // Refresh list to see new status
                    }}
                    onCancel={() => setSelectedCheque(null)}
                />
            )}
        </div>
    );
}

export default Finance;