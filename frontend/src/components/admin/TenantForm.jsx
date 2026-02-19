import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { X } from 'lucide-react';

function TenantForm({ onSuccess, onCancel, initialData = null }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        passport_number: '',
        nationality: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialData) setFormData(initialData);
    }, [initialData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (initialData) {
                await api.put(`tenants/${initialData.id}/`, formData);
            } else {
                await api.post('tenants/', formData);
            }
            onSuccess();
        } catch (error) {
            console.error(error);
            alert('Failed to save tenant. Email might already exist.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg w-full max-w-md p-6 relative border border-gray-700 shadow-2xl">
                <button onClick={onCancel} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                    <X size={24} />
                </button>
                
                <h2 className="text-xl font-bold text-white mb-6">
                    {initialData ? 'Edit Tenant' : 'Add New Tenant'}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-400 text-sm mb-1">Full Name</label>
                        <input 
                            required
                            type="text" 
                            value={formData.name}
                            className="w-full bg-gray-700 text-white rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-400 text-sm mb-1">Phone</label>
                            <input 
                                required
                                type="text" 
                                value={formData.phone}
                                className="w-full bg-gray-700 text-white rounded p-2"
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm mb-1">Nationality</label>
                            <input 
                                type="text" 
                                value={formData.nationality}
                                className="w-full bg-gray-700 text-white rounded p-2"
                                onChange={(e) => setFormData({...formData, nationality: e.target.value})}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-400 text-sm mb-1">Email Address</label>
                        <input 
                            required
                            type="email" 
                            value={formData.email}
                            className="w-full bg-gray-700 text-white rounded p-2"
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="block text-gray-400 text-sm mb-1">Passport Number</label>
                        <input 
                            type="text" 
                            value={formData.passport_number}
                            className="w-full bg-gray-700 text-white rounded p-2"
                            onChange={(e) => setFormData({...formData, passport_number: e.target.value})}
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded mt-4 transition disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Save Tenant'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default TenantForm;