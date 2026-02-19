import { useState, useEffect } from 'react';
import api from '../../api/axios';
import AddChequeForm from './AddChequeForm';
import { Trash2, Search, Filter } from 'lucide-react'; // 👈 Added Search/Filter icons

function ChequeList() {
    const [cheques, setCheques] = useState([]);
    const [filteredCheques, setFilteredCheques] = useState([]); // 👈 Stores the search results
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [showModal, setShowModal] = useState(false); 

    const fetchCheques = () => {
        api.get('cheques/')
            .then(res => {
                setCheques(res.data);
                setFilteredCheques(res.data); // Initially, show everything
            })
            .catch(err => console.error(err));
    };

    useEffect(() => {
        fetchCheques();
    }, []);

    // 👇 The Search & Filter Logic
    useEffect(() => {
        let result = cheques;

        // 1. Filter by Name (Search Bar)
        if (searchTerm) {
            result = result.filter(c => 
                c.tenant_name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // 2. Filter by Status (Dropdown)
        if (statusFilter !== 'ALL') {
            result = result.filter(c => c.status === statusFilter);
        }

        setFilteredCheques(result);
    }, [searchTerm, statusFilter, cheques]);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this cheque?")) {
            try {
                await api.delete(`cheques/${id}/`);
                fetchCheques(); 
            } catch (err) {
                alert("Failed to delete cheque");
            }
        }
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'CLEARED': return 'bg-green-600 text-white';
            case 'BOUNCED': return 'bg-red-600 text-white';
            default: return 'bg-yellow-600 text-black';
        }
    };

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg mt-8 border-t-4 border-green-500 relative">
            
            {/* --- HEADER & CONTROLS --- */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-green-400">
                    💰 Cheque Management
                </h2>

                {/* Search & Filter Bar */}
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search tenant..." 
                            className="bg-gray-700 text-white pl-10 pr-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500 w-full md:w-48"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="relative">
                        <Filter className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <select 
                            className="bg-gray-700 text-white pl-10 pr-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none cursor-pointer"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="ALL">All Status</option>
                            <option value="PENDING">Pending</option>
                            <option value="CLEARED">Cleared</option>
                            <option value="BOUNCED">Bounced</option>
                        </select>
                    </div>

                    <button 
                        onClick={() => setShowModal(true)}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-500 font-bold text-sm whitespace-nowrap"
                    >
                        + Add
                    </button>
                </div>
            </div>

            {/* --- TABLE --- */}
            {filteredCheques.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    {searchTerm ? "No cheques match your search." : "No cheques found. Add one now!"}
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm text-gray-300">
                        <thead className="bg-gray-700 text-gray-100 uppercase font-semibold">
                            <tr>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3">Tenant</th>
                                <th className="px-4 py-3">Bank</th>
                                <th className="px-4 py-3">Amount</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Evidence</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {filteredCheques.map(cheque => (
                                <tr key={cheque.id} className="hover:bg-gray-700 transition">
                                    <td className="px-4 py-3 whitespace-nowrap">{cheque.cheque_date}</td>
                                    <td className="px-4 py-3 text-white font-medium">{cheque.tenant_name}</td>
                                    <td className="px-4 py-3 text-gray-400">{cheque.bank_name || '-'}</td>
                                    <td className="px-4 py-3 font-mono text-green-300">AED {cheque.amount}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(cheque.status)}`}>
                                            {cheque.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        {cheque.image ? (
                                            <a href={cheque.image} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline text-xs">
                                                View Photo 📸
                                            </a>
                                        ) : (
                                            <span className="text-gray-500 text-xs">No Image</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button 
                                            onClick={() => handleDelete(cheque.id)}
                                            className="text-red-400 hover:text-red-300 hover:bg-red-900/30 p-2 rounded transition"
                                            title="Delete Cheque"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <AddChequeForm 
                    onSuccess={() => {
                        setShowModal(false);
                        fetchCheques(); 
                    }} 
                    onCancel={() => setShowModal(false)} 
                />
            )}
        </div>
    );
}

export default ChequeList;