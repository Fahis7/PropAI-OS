import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { DollarSign, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import ChequeActionForm from '../../components/admin/ChequeActionForm'; // 👈 Import the Modal
import { useTheme } from '../../context/ThemeContext';

function Finance() {
    const { c, isDark } = useTheme();
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
            case 'PENDING': return c.yellowBg;
            case 'DEPOSITED': return c.blueBg;
            case 'CLEARED': return c.greenBg;
            case 'BOUNCED': return c.redBg;
            default: return isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500';
        }
    };

    return (
        <div className="p-6">
            <h1 className={`text-3xl font-bold ${c.heading} mb-2`}>Finance</h1>
            <p className={`${c.textSec} mb-8`}>Track rent cheques and cash flow</p>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className={`${c.card} p-6 rounded-lg border ${c.border} flex items-center`}>
                    <div className={`p-3 rounded-full ${isDark ? "bg-yellow-900/30" : "bg-amber-50"} mr-4`}>
                        <Clock className="text-yellow-400" size={32} />
                    </div>
                    <div>
                        <p className={`${c.textSec} text-sm uppercase`}>Pending Collections</p>
                        <p className={`text-2xl font-bold ${c.heading}`}>AED {totalPending.toLocaleString()}</p>
                    </div>
                </div>
                
                <div className={`${c.card} p-6 rounded-lg border ${c.border} flex items-center`}>
                    <div className={`p-3 rounded-full ${isDark ? "bg-green-900/30" : "bg-emerald-50"} mr-4`}>
                        <CheckCircle className="text-green-400" size={32} />
                    </div>
                    <div>
                        <p className={`${c.textSec} text-sm uppercase`}>Total Cleared</p>
                        <p className={`text-2xl font-bold ${c.heading}`}>AED {totalCollected.toLocaleString()}</p>
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
                                ? c.btn
                                : c.btn2}`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Cheques Table */}
            <div className={`${c.card} rounded-lg border ${c.border} overflow-hidden`}>
                <table className={`w-full text-left text-sm ${c.textSec}`}>
                    <thead className={`${isDark ? "bg-gray-700" : "bg-gray-100"} ${c.text} uppercase font-semibold`}>
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
                    <tbody className={`divide-y ${isDark ? "divide-gray-700" : "divide-gray-100"}`}>
                        {loading ? (
                            <tr><td colSpan="7" className="px-6 py-4 text-center">Loading...</td></tr>
                        ) : filteredCheques.length === 0 ? (
                            <tr><td colSpan="7" className={`px-6 py-8 text-center ${c.textMut}`}>No cheques found.</td></tr>
                        ) : (
                            filteredCheques.map(cheque => (
                                <tr key={cheque.id} className={`${c.hover}/50 transition`}>
                                    <td className={`px-6 py-4 font-mono ${c.heading}`}>
                                        {cheque.cheque_date}
                                    </td>
                                    <td className={`px-6 py-4 font-bold ${c.heading}`}>
                                        {cheque.tenant_name}
                                    </td>
                                    <td className={`px-6 py-4 ${c.accent}`}>
                                        {cheque.unit_number || '-'}
                                    </td>
                                    <td className={`px-6 py-4 font-mono text-lg ${c.heading}`}>
                                        AED {parseFloat(cheque.amount).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold border ${getStatusColor(cheque.status)}`}>
                                            {cheque.status}
                                        </span>
                                    </td>
                                    <td className={`px-6 py-4 font-mono text-xs ${c.textMut}`}>
                                        {cheque.cheque_number}
                                    </td>
                                    
                                    {/* 👇 Manage Button */}
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => setSelectedCheque(cheque)}
                                            className={`${c.accent} font-bold text-xs border ${c.border} px-3 py-1 rounded ${c.hover} transition`}
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