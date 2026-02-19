import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { X } from 'lucide-react';

function AddUnitForm({ propertyId, onSuccess, onCancel, initialData = null }) {
    const [formData, setFormData] = useState({
        unit_number: '',
        floor: '',
        unit_type: '1BHK',
        rent_amount: '',
        bedrooms: 1,
        bathrooms: 1,
        square_feet: '',
        status: 'VACANT'
    });
    const [loading, setLoading] = useState(false);

    // 👇 NEW: Pre-fill form if editing
    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                rent_amount: initialData.yearly_rent // Map backend name to frontend name
            });
        }
    }, [initialData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            ...formData,
            property: propertyId,
            yearly_rent: formData.rent_amount
        };

        try {
            if (initialData) {
                // 👇 EDIT MODE: PUT request
                await api.put(`units/${initialData.id}/`, payload);
            } else {
                // 👇 ADD MODE: POST request
                await api.post('units/', payload);
            }
            onSuccess();
        } catch (error) {
            console.error(error);
            alert('Failed to save unit');
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
                
                {/* Dynamic Title */}
                <h2 className="text-xl font-bold text-white mb-6">
                    {initialData ? 'Edit Unit' : 'Add New Unit'}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-400 text-sm mb-1">Unit Number</label>
                            <input 
                                required
                                type="text" 
                                value={formData.unit_number}
                                placeholder="e.g. 101"
                                className="w-full bg-gray-700 text-white rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                onChange={(e) => setFormData({...formData, unit_number: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm mb-1">Floor</label>
                            <input 
                                required
                                type="text" 
                                value={formData.floor}
                                placeholder="e.g. 1st"
                                className="w-full bg-gray-700 text-white rounded p-2"
                                onChange={(e) => setFormData({...formData, floor: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-400 text-sm mb-1">Type</label>
                            <select 
                                className="w-full bg-gray-700 text-white rounded p-2"
                                value={formData.unit_type}
                                onChange={(e) => setFormData({...formData, unit_type: e.target.value})}
                            >
                                <option value="1BHK">1 Bedroom</option>
                                <option value="2BHK">2 Bedroom</option>
                                <option value="STUDIO">Studio</option>
                                <option value="OFFICE">Office</option>
                                <option value="VILLA">Villa</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm mb-1">Yearly Rent (AED)</label>
                            <input 
                                required
                                type="number" 
                                value={formData.rent_amount}
                                placeholder="50000"
                                className="w-full bg-gray-700 text-white rounded p-2"
                                onChange={(e) => setFormData({...formData, rent_amount: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-gray-400 text-sm mb-1">Beds</label>
                            <input type="number" value={formData.bedrooms} className="w-full bg-gray-700 text-white rounded p-2"
                                onChange={(e) => setFormData({...formData, bedrooms: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm mb-1">Baths</label>
                            <input type="number" value={formData.bathrooms} className="w-full bg-gray-700 text-white rounded p-2"
                                onChange={(e) => setFormData({...formData, bathrooms: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm mb-1">Sq. Ft</label>
                            <input type="number" value={formData.square_feet} className="w-full bg-gray-700 text-white rounded p-2"
                                onChange={(e) => setFormData({...formData, square_feet: e.target.value})} />
                        </div>
                    </div>

                    {/* Status Dropdown (Only show when editing) */}
                    {initialData && (
                        <div>
                            <label className="block text-gray-400 text-sm mb-1">Status</label>
                            <select 
                                className="w-full bg-gray-700 text-white rounded p-2"
                                value={formData.status}
                                onChange={(e) => setFormData({...formData, status: e.target.value})}
                            >
                                <option value="VACANT">Vacant</option>
                                <option value="OCCUPIED">Occupied</option>
                                <option value="MAINTENANCE">Maintenance</option>
                            </select>
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2 rounded mt-4 transition disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : (initialData ? 'Update Unit' : 'Save Unit')}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AddUnitForm;