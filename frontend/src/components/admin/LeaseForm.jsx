import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { X, Calendar, DollarSign, User } from 'lucide-react';

function LeaseForm({ unit, onSuccess, onCancel }) {
    const [tenants, setTenants] = useState([]);
    const [formData, setFormData] = useState({
        tenant: '',
        start_date: '',
        end_date: '',
        rent_amount: unit.yearly_rent || '', // Auto-fill with unit rent
        payment_frequency: '4_CHEQUES'
    });
    const [loading, setLoading] = useState(false);

    // Fetch Tenants for the Dropdown
    useEffect(() => {
        api.get('tenants/').then(res => setTenants(res.data));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            ...formData,
            unit: unit.id
        };

        try {
            await api.post('leases/', payload);
            alert('Lease Created Successfully! Unit is now Occupied.');
            onSuccess();
        } catch (error) {
            console.error(error);
            alert('Failed to create lease.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg w-full max-w-lg p-6 relative border border-gray-700 shadow-2xl">
                <button onClick={onCancel} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                    <X size={24} />
                </button>
                
                <h2 className="text-xl font-bold text-white mb-6">
                    New Contract: {unit.unit_number}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Tenant Selector */}
                    <div>
                        <label className="block text-gray-400 text-sm mb-1">Select Tenant</label>
                        <div className="relative">
                            <User className="absolute left-3 top-2.5 text-gray-500" size={18} />
                            <select 
                                required
                                className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                                value={formData.tenant}
                                onChange={(e) => setFormData({...formData, tenant: e.target.value})}
                            >
                                <option value="">-- Choose a Tenant --</option>
                                {tenants.map(t => (
                                    <option key={t.id} value={t.id}>{t.name} ({t.phone})</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-400 text-sm mb-1">Start Date</label>
                            <input 
                                required type="date" 
                                className="w-full bg-gray-700 text-white p-2 rounded"
                                onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm mb-1">End Date</label>
                            <input 
                                required type="date" 
                                className="w-full bg-gray-700 text-white p-2 rounded"
                                onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                            />
                        </div>
                    </div>

                    {/* Rent & Payments */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-400 text-sm mb-1">Rent Amount (AED)</label>
                            <input 
                                required type="number" 
                                value={formData.rent_amount}
                                className="w-full bg-gray-700 text-white p-2 rounded"
                                onChange={(e) => setFormData({...formData, rent_amount: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm mb-1">Payment Terms</label>
                            <select 
                                className="w-full bg-gray-700 text-white p-2 rounded"
                                value={formData.payment_frequency}
                                onChange={(e) => setFormData({...formData, payment_frequency: e.target.value})}
                            >
                                <option value="1_CHEQUE">1 Cheque</option>
                                <option value="4_CHEQUES">4 Cheques</option>
                                <option value="12_CHEQUES">12 Cheques (Monthly)</option>
                            </select>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded mt-6 transition disabled:opacity-50"
                    >
                        {loading ? 'Processing...' : 'Generate Contract'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default LeaseForm;