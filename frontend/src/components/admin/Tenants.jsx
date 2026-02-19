import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import TenantForm from '../../components/admin/TenantForm';
import { Users, Search, Plus, User, ArrowLeft, Home, Calendar, MapPin, Trash2 } from 'lucide-react'; // 👈 Added Trash2

function Tenants() {
    const navigate = useNavigate();
    const [tenants, setTenants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingTenant, setEditingTenant] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchTenants = async () => {
        try {
            const res = await api.get('tenants/');
            setTenants(res.data);
        } catch (err) {
            console.error("Error loading tenants:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTenants();
    }, []);

    const handleEdit = (tenant) => {
        setEditingTenant(tenant);
        setShowModal(true);
    };

    // 👇 NEW DELETE FUNCTION
    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this tenant? This action cannot be undone.")) {
            try {
                await api.delete(`tenants/${id}/`);
                // Remove from local state immediately to update UI
                setTenants(tenants.filter(t => t.id !== id));
            } catch (err) {
                console.error("Failed to delete tenant", err);
                alert("Could not delete tenant. They might have active leases.");
            }
        }
    };

    const handleClose = () => {
        setShowModal(false);
        setEditingTenant(null);
    };

    // Filter tenants
    const filteredTenants = tenants.filter(t => 
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.phone.includes(searchTerm)
    );

    return (
        <div className="p-6">
            {/* Back Button */}
            <button 
                onClick={() => navigate('/dashboard')} 
                className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
            >
                <ArrowLeft size={20} className="mr-2" /> Back to Dashboard
            </button>

            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Users className="text-blue-500" /> Tenants Directory
                    </h1>
                    <p className="text-gray-400 mt-1">Manage residents and view lease status</p>
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold transition shadow-lg shadow-blue-900/20"
                >
                    <Plus size={20} /> Onboard Tenant
                </button>
            </div>

            {/* Search Bar */}
            <div className="mb-6 relative max-w-md">
                <Search className="absolute left-3 top-2.5 text-gray-500" size={20} />
                <input 
                    type="text" 
                    placeholder="Search name, unit, or phone..."
                    className="w-full bg-gray-800 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-700 focus:border-blue-500 outline-none placeholder-gray-500"
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Table */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-xl">
                <table className="w-full text-left text-sm text-gray-300">
                    <thead className="bg-gray-750 text-gray-400 uppercase font-bold text-xs tracking-wider border-b border-gray-700">
                        <tr>
                            <th className="px-6 py-4">Tenant</th>
                            <th className="px-6 py-4">Residence Info</th>
                            <th className="px-6 py-4">Contact Info</th>
                            <th className="px-6 py-4">Documents</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {loading ? (
                            <tr><td colSpan="5" className="px-6 py-8 text-center animate-pulse">Loading directory...</td></tr>
                        ) : filteredTenants.length === 0 ? (
                            <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-500">No tenants found.</td></tr>
                        ) : (
                            filteredTenants.map(tenant => (
                                <tr key={tenant.id} className="hover:bg-gray-700/30 transition group">
                                    
                                    {/* 1. Name */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
                                                {tenant.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-white text-base">{tenant.name}</div>
                                                <div className="text-xs text-gray-500">ID: #{tenant.id}</div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* 2. Residence Info */}
                                    <td className="px-6 py-4">
                                        {tenant.active_lease ? (
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-2 text-gray-300 text-xs uppercase font-bold tracking-wider">
                                                    <MapPin size={12} className="text-blue-400" />
                                                    {tenant.active_lease.unit_details?.property_details?.name || 'Main Property'}
                                                </div>
                                                <div className="flex items-center gap-2 text-white font-bold text-lg">
                                                    <Home size={18} className="text-green-400" />
                                                    Unit {tenant.active_lease.unit_details?.unit_number}
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1 bg-gray-750 w-fit px-2 py-0.5 rounded">
                                                    <Calendar size={12} />
                                                    Ends: {tenant.active_lease.end_date}
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-700 text-gray-400 border border-gray-600">
                                                No Active Lease
                                            </span>
                                        )}
                                    </td>

                                    {/* 3. Contact */}
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-white">{tenant.email}</span>
                                            <span className="text-xs text-blue-400 font-mono">{tenant.phone}</span>
                                        </div>
                                    </td>

                                    {/* 4. Documents */}
                                    <td className="px-6 py-4">
                                        <div className="text-xs space-y-1">
                                            <div className="text-gray-400">Nat: <span className="text-gray-200">{tenant.nationality || '-'}</span></div>
                                            <div className="text-gray-400">Pass: <span className="text-gray-200 font-mono">{tenant.passport_number || '-'}</span></div>
                                        </div>
                                    </td>

                                    {/* 5. Actions (Edit & Delete) */}
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => handleEdit(tenant)}
                                                className="text-gray-400 hover:text-white transition bg-gray-700/50 hover:bg-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold"
                                            >
                                                Edit
                                            </button>
                                            
                                            {/* 👇 DELETE BUTTON */}
                                            <button 
                                                onClick={() => handleDelete(tenant.id)}
                                                className="text-gray-400 hover:text-red-300 transition bg-gray-700/50 hover:bg-red-900/40 p-1.5 rounded-lg"
                                                title="Delete Tenant"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>

                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <TenantForm 
                    initialData={editingTenant}
                    onSuccess={() => {
                        handleClose();
                        fetchTenants();
                    }}
                    onCancel={handleClose}
                />
            )}
        </div>
    );
}

export default Tenants;