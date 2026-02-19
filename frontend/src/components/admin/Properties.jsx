import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import PropertyForm from '../../components/admin/PropertyForm';
import { Building2, MapPin, Plus, Trash2 } from 'lucide-react'; // 👈 1. Import Trash2

function Properties() {
    const [properties, setProperties] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    
    const navigate = useNavigate();

    const fetchProperties = async () => {
        try {
            const res = await api.get('properties/');
            setProperties(res.data);
        } catch (err) {
            console.error("Error loading properties:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProperties();
    }, []);

    // 👇 2. NEW DELETE FUNCTION
    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this property? All units and leases inside it will also be deleted!")) {
            try {
                await api.delete(`properties/${id}/`);
                // Update UI immediately
                setProperties(properties.filter(p => p.id !== id));
            } catch (err) {
                console.error("Failed to delete property:", err);
                alert("Could not delete property. Check if it has active contracts.");
            }
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Properties</h1>
                    <p className="text-gray-400">Manage your buildings and units</p>
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold transition"
                >
                    <Plus size={20} /> Add Property
                </button>
            </div>

            {loading ? (
                <div className="text-gray-400">Loading your portfolio...</div>
            ) : properties.length === 0 ? (
                <div className="bg-gray-800 p-12 rounded-lg border border-gray-700 text-center">
                    <div className="inline-block p-4 bg-gray-700 rounded-full mb-4">
                        <Building2 size={48} className="text-gray-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No Properties Yet</h3>
                    <p className="text-gray-400 mb-6">Add your first building to start managing units.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {properties.map(property => (
                        <div 
                            key={property.id} 
                            onClick={() => navigate(`/properties/${property.id}`)}
                            className="bg-gray-800 cursor-pointer rounded-lg overflow-hidden border border-gray-700 hover:border-blue-500 transition group shadow-lg relative"
                        >
                            {/* Image Header */}
                            <div className="h-48 bg-gray-700 relative group-hover:opacity-90 transition">
                                {property.image ? (
                                    <img src={property.image} alt={property.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-600">
                                        <Building2 size={64} />
                                    </div>
                                )}
                                
                                {/* Badge (Moved to Left) */}
                                <div className="absolute top-4 left-4 bg-black/60 px-2 py-1 rounded text-xs text-white font-mono backdrop-blur-sm">
                                    {property.property_type}
                                </div>

                                {/* 👇 3. DELETE BUTTON (Top Right) */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation(); // 🛑 Stop click from opening the details page
                                        handleDelete(property.id);
                                    }}
                                    className="absolute top-4 right-4 bg-red-600/80 hover:bg-red-600 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-lg backdrop-blur-sm transform hover:scale-110"
                                    title="Delete Property"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-5">
                                <h3 className="text-xl font-bold text-white mb-1">{property.name}</h3>
                                <div className="flex items-center text-gray-400 text-sm mb-4">
                                    <MapPin size={14} className="mr-1" />
                                    {property.city}
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-3 gap-2 border-t border-gray-700 pt-4 text-center">
                                    
                                    {/* Total */}
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">Total</p>
                                        <p className="text-lg font-bold text-white">{property.total_units}</p>
                                    </div>

                                    {/* Occupied */}
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">Occupied</p>
                                        <p className="text-lg font-bold text-blue-400">
                                            {property.occupied_units ?? (property.total_units - property.vacant_units)}
                                        </p>
                                    </div>

                                    {/* Vacant */}
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">Vacant</p>
                                        <p className="text-lg font-bold text-green-400">{property.vacant_units}</p>
                                    </div>
                                    
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <PropertyForm 
                    onSuccess={() => {
                        setShowModal(false);
                        fetchProperties();
                    }}
                    onCancel={() => setShowModal(false)}
                />
            )}
        </div>
    );
}

export default Properties;