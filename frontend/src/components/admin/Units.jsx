import { useState, useEffect } from 'react';
import api from '../../api/axios';
import LeaseForm from '../../components/admin/LeaseForm'; // 👈 Import your form
import { Building, Home, CheckCircle, XCircle, Key } from 'lucide-react';

function Units() {
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUnit, setSelectedUnit] = useState(null); // Which unit are we renting?

    const fetchUnits = async () => {
        try {
            const res = await api.get('units/');
            setUnits(res.data);
        } catch (err) {
            console.error("Error fetching units:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUnits();
    }, []);

    // 🟢 Color badge helper
    const getStatusColor = (status) => {
        switch (status) {
            case 'OCCUPIED': return 'bg-green-900/30 text-green-400 border-green-500/30';
            case 'VACANT': return 'bg-red-900/30 text-red-400 border-red-500/30';
            case 'MAINTENANCE': return 'bg-yellow-900/30 text-yellow-400 border-yellow-500/30';
            default: return 'bg-gray-800 text-gray-400';
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <Building className="text-blue-500" /> Property Units
            </h1>

            {loading ? (
                <div className="text-gray-400 animate-pulse">Loading units...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {units.map((unit) => (
                        <div key={unit.id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-blue-500/50 transition shadow-lg">
                            
                            {/* Card Header */}
                            <div className="p-5 border-b border-gray-700 flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                        <Home size={20} className="text-gray-400" /> 
                                        {unit.unit_number}
                                    </h3>
                                    <p className="text-sm text-gray-400 mt-1">{unit.property_details?.name || 'Main Building'}</p>
                                </div>
                                <span className={`px-3 py-1 rounded text-xs font-bold border uppercase tracking-wider ${getStatusColor(unit.status)}`}>
                                    {unit.status}
                                </span>
                            </div>

                            {/* Card Details */}
                            <div className="p-5 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Type:</span>
                                    <span className="text-white font-medium">{unit.type}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Yearly Rent:</span>
                                    <span className="text-green-400 font-bold font-mono">
                                        AED {Number(unit.yearly_rent).toLocaleString()}
                                    </span>
                                </div>

                                {/* 👇 ACTION AREA */}
                                <div className="pt-4 mt-2 border-t border-gray-700">
                                    {unit.status === 'VACANT' ? (
                                        <button 
                                            onClick={() => setSelectedUnit(unit)}
                                            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition"
                                        >
                                            <Key size={18} /> Rent This Unit
                                        </button>
                                    ) : (
                                        <div className="text-center py-2 text-gray-500 text-sm flex items-center justify-center gap-2">
                                            <CheckCircle size={16} /> Currently Leased
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 👇 THIS IS WHERE YOUR FORM POPS UP */}
            {selectedUnit && (
                <LeaseForm 
                    unit={selectedUnit}
                    onSuccess={() => {
                        setSelectedUnit(null); // Close modal
                        fetchUnits(); // Refresh list to show "Occupied"
                    }}
                    onCancel={() => setSelectedUnit(null)}
                />
            )}
        </div>
    );
}

export default Units;