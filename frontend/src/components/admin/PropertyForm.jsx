import { useState } from 'react';
import api from '../../api/axios';
import { X } from 'lucide-react';

function PropertyForm({ onSuccess, onCancel }) {
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        city: 'Dubai',
        property_type: 'RESIDENTIAL',
        image: null
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        data.append('name', formData.name);
        data.append('address', formData.address);
        data.append('city', formData.city);
        data.append('property_type', formData.property_type);
        if (formData.image) data.append('image', formData.image);

        try {
            await api.post('properties/', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            onSuccess();
        } catch (error) {
            alert('Failed to add property');
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
                
                <h2 className="text-xl font-bold text-white mb-6">Add New Property</h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-400 text-sm mb-1">Property Name</label>
                        <input 
                            required
                            type="text" 
                            placeholder="e.g. Sunshine Tower"
                            className="w-full bg-gray-700 text-white rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-400 text-sm mb-1">City</label>
                            <input 
                                type="text" 
                                value={formData.city}
                                className="w-full bg-gray-700 text-white rounded p-2"
                                onChange={(e) => setFormData({...formData, city: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm mb-1">Type</label>
                            <select 
                                className="w-full bg-gray-700 text-white rounded p-2"
                                onChange={(e) => setFormData({...formData, property_type: e.target.value})}
                            >
                                <option value="RESIDENTIAL">Residential</option>
                                <option value="COMMERCIAL">Commercial</option>
                                <option value="MIXED">Mixed Use</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-400 text-sm mb-1">Address</label>
                        <textarea 
                            required
                            rows="2"
                            className="w-full bg-gray-700 text-white rounded p-2"
                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-gray-400 text-sm mb-1">Building Image</label>
                        <input 
                            type="file" 
                            className="w-full text-gray-400 text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-gray-700 file:text-blue-400 hover:file:bg-gray-600"
                            onChange={(e) => setFormData({...formData, image: e.target.files[0]})}
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded mt-4 transition disabled:opacity-50"
                    >
                        {loading ? 'Adding...' : 'Save Property'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default PropertyForm;