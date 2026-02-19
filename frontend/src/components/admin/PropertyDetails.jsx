import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import AddUnitForm from '../../components/admin/AddUnitForm';
import LeaseForm from '../../components/admin/LeaseForm';
import { ArrowLeft, Home, Plus, Trash2 } from 'lucide-react'; // 👈 1. Import Trash2

function PropertyDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [property, setProperty] = useState(null);
    const [units, setUnits] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    
    // State for Editing Unit
    const [editingUnit, setEditingUnit] = useState(null);

    // Track which unit is being rented
    const [leasingUnit, setLeasingUnit] = useState(null);

    const fetchData = async () => {
        try {
            const [propRes, unitsRes] = await Promise.all([
                api.get(`properties/${id}/`),
                api.get(`units/?property_id=${id}`)
            ]);
            setProperty(propRes.data);
            setUnits(unitsRes.data);
        } catch (err) {
            console.error("Error loading details:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    // Handler for Edit Button
    const handleEdit = (unit) => {
        setEditingUnit(unit);
        setShowModal(true);
    };

    // 👇 2. NEW DELETE FUNCTION
    const handleDelete = async (unitId) => {
        if (window.confirm("Are you sure you want to delete this unit?")) {
            try {
                await api.delete(`units/${unitId}/`);
                // Update UI immediately
                setUnits(units.filter(u => u.id !== unitId));
                // Update the occupancy count locally (optional, but nice UX)
                fetchData(); 
            } catch (err) {
                console.error("Failed to delete unit:", err);
                alert("Could not delete unit. It might have active history.");
            }
        }
    };

    // Handler for closing Edit/Add Modal
    const handleCloseModal = () => {
        setShowModal(false);
        setEditingUnit(null);
    };

    if (loading) return <div className="p-6 text-gray-400">Loading Building Details...</div>;
    if (!property) return <div className="p-6 text-red-500">Property not found</div>;

    return (
        <div className="p-6">
            {/* Header */}
            <button onClick={() => navigate('/properties')} className="flex items-center text-gray-400 hover:text-white mb-6">
                <ArrowLeft size={18} className="mr-2" /> Back to Properties
            </button>

            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">{property.name}</h1>
                    <p className="text-gray-400">{property.address}, {property.city}</p>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 text-center">
                    <p className="text-gray-400 text-xs uppercase">Occupancy</p>
                    <p className="text-2xl font-bold text-green-400">
                        {property.occupied_units} / {property.total_units}
                    </p>
                </div>
            </div>

            {/* Units Table */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-700/50">
                    <h3 className="text-lg font-bold text-white flex items-center">
                        <Home size={20} className="mr-2 text-blue-400" /> Units
                    </h3>
                    <button 
                        onClick={() => setShowModal(true)}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded text-sm font-bold flex items-center"
                    >
                        <Plus size={16} className="mr-1" /> Add Unit
                    </button>
                </div>

                {units.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No units added yet. Add your first apartment or office!
                    </div>
                ) : (
                    <table className="w-full text-left text-sm text-gray-300">
                        <thead className="bg-gray-700 text-gray-100 uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-3">Unit #</th>
                                <th className="px-6 py-3">Type</th>
                                <th className="px-6 py-3">Rent (Yearly)</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {units.map(unit => (
                                <tr key={unit.id} className="hover:bg-gray-700/50 transition">
                                    <td className="px-6 py-4 font-bold text-white">{unit.unit_number}</td>
                                    <td className="px-6 py-4">{unit.unit_type}</td>
                                    <td className="px-6 py-4 font-mono text-green-400">AED {unit.yearly_rent}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold 
                                            ${unit.status === 'VACANT' ? 'bg-green-900 text-green-300' : 
                                              unit.status === 'OCCUPIED' ? 'bg-red-900 text-red-300' : 'bg-yellow-900 text-yellow-300'}`}>
                                            {unit.status}
                                        </span>
                                    </td>
                                    
                                    {/* 👇 3. UPDATED ACTIONS COLUMN */}
                                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                                        {/* RENT Button (Only if Vacant) */}
                                        {unit.status === 'VACANT' && (
                                            <button 
                                                onClick={() => setLeasingUnit(unit)}
                                                className="text-green-400 hover:text-green-300 font-bold text-xs border border-green-600 px-3 py-1 rounded hover:bg-green-900/30 transition"
                                            >
                                                Rent
                                            </button>
                                        )}
                                        
                                        {/* EDIT Button */}
                                        <button 
                                            onClick={() => handleEdit(unit)}
                                            className="text-blue-400 hover:text-blue-300 text-xs font-bold border border-blue-600 px-3 py-1 rounded hover:bg-blue-900/30 transition"
                                        >
                                            Edit
                                        </button>

                                        {/* DELETE Button (Trash Icon) */}
                                        <button 
                                            onClick={() => handleDelete(unit.id)}
                                            className="text-gray-400 hover:text-red-300 p-1 rounded hover:bg-red-900/20 transition"
                                            title="Delete Unit"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal for Adding/Editing Unit */}
            {showModal && (
                <AddUnitForm 
                    propertyId={id} 
                    initialData={editingUnit}
                    onSuccess={() => {
                        handleCloseModal();
                        fetchData();
                    }} 
                    onCancel={handleCloseModal} 
                />
            )}

            {/* Modal for Leasing (Renting) */}
            {leasingUnit && (
                <LeaseForm 
                    unit={leasingUnit}
                    onSuccess={() => {
                        setLeasingUnit(null);
                        fetchData(); // This refreshes the list to show "OCCUPIED"
                    }}
                    onCancel={() => setLeasingUnit(null)}
                />
            )}
        </div>
    );
}

export default PropertyDetails;