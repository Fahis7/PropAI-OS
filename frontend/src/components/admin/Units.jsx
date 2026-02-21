import { useState, useEffect } from 'react';
import api from '../../api/axios';
import LeaseForm from '../../components/admin/LeaseForm';
import { 
    Building, Home, CheckCircle, Key, Loader, X,
    TrendingUp, TrendingDown, Minus, Brain, Sparkles,
    ArrowUpRight, ArrowDownRight, Target, Lightbulb, BarChart3, FileText
} from 'lucide-react';

function Units() {
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [pricingData, setPricingData] = useState(null);
    const [pricingLoading, setPricingLoading] = useState(false);
    const [pricingUnit, setPricingUnit] = useState(null);

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

    useEffect(() => { fetchUnits(); }, []);

    const handleSmartPricing = async (unit) => {
        setPricingUnit(unit);
        setPricingLoading(true);
        setPricingData(null);

        try {
            const res = await api.get(`units/${unit.id}/smart-pricing/`);
            setPricingData(res.data);
        } catch (err) {
            console.error("Smart pricing failed:", err);
            setPricingData({ error: "Failed to get pricing analysis. Please try again." });
        } finally {
            setPricingLoading(false);
        }
    };

    const applyPrice = async (unitId, newPrice) => {
        if (!newPrice) return;
        const confirmed = window.confirm(`Update rent to AED ${Number(newPrice).toLocaleString()}/year?`);
        if (!confirmed) return;

        try {
            await api.patch(`units/${unitId}/`, { yearly_rent: newPrice });
            closePricing();
            fetchUnits();
        } catch (err) {
            console.error("Failed to update price:", err);
            alert("Failed to update price. Please try again.");
        }
    };

    const handleEjari = async (unit) => {
        try {
            // Find the active lease for this unit
            const leasesRes = await api.get('leases/');
            const lease = leasesRes.data.find(l => l.unit === unit.id && l.is_active);
            
            if (!lease) {
                alert("No active lease found for this unit.");
                return;
            }

            // Download the PDF
            const res = await api.get(`leases/${lease.id}/ejari/`, {
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Ejari_Unit_${unit.unit_number}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Ejari generation failed:", err);
            alert("Failed to generate Ejari contract. Please try again.");
        }
    };

    const closePricing = () => {
        setPricingUnit(null);
        setPricingData(null);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'OCCUPIED': return 'bg-green-900/30 text-green-400 border-green-500/30';
            case 'VACANT': return 'bg-red-900/30 text-red-400 border-red-500/30';
            case 'MAINTENANCE': return 'bg-yellow-900/30 text-yellow-400 border-yellow-500/30';
            default: return 'bg-gray-800 text-gray-400';
        }
    };

    const getVerdictStyle = (verdict) => {
        switch (verdict) {
            case 'UNDERPRICED': return { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30', icon: <TrendingDown size={18} className="text-red-400" />, label: 'Underpriced' };
            case 'OVERPRICED': return { color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30', icon: <TrendingUp size={18} className="text-orange-400" />, label: 'Overpriced' };
            case 'PREMIUM': return { color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30', icon: <ArrowUpRight size={18} className="text-purple-400" />, label: 'Premium' };
            case 'FAIR': return { color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30', icon: <Target size={18} className="text-green-400" />, label: 'Fair Price' };
            default: return { color: 'text-gray-400', bg: 'bg-gray-800 border-gray-700', icon: <Minus size={18} />, label: verdict };
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
                                    <span className="text-white font-medium">{unit.unit_type}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Bedrooms:</span>
                                    <span className="text-white font-medium">{unit.bedrooms}</span>
                                </div>
                                {unit.square_feet && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Area:</span>
                                        <span className="text-white font-medium">{unit.square_feet} sq ft</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Yearly Rent:</span>
                                    <span className="text-green-400 font-bold font-mono">
                                        AED {Number(unit.yearly_rent).toLocaleString()}
                                    </span>
                                </div>

                                {/* Action Buttons */}
                                <div className="pt-4 mt-2 border-t border-gray-700 space-y-2">
                                    <button 
                                        onClick={() => handleSmartPricing(unit)}
                                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition text-sm"
                                    >
                                        <Brain size={16} /> AI Smart Pricing
                                    </button>

                                    {unit.status === 'VACANT' ? (
                                        <button 
                                            onClick={() => setSelectedUnit(unit)}
                                            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition text-sm"
                                        >
                                            <Key size={16} /> Rent This Unit
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => handleEjari(unit)}
                                            className="w-full bg-emerald-700 hover:bg-emerald-600 text-white py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition text-sm"
                                        >
                                            <FileText size={16} /> Generate Ejari Contract
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Lease Form Modal */}
            {selectedUnit && (
                <LeaseForm 
                    unit={selectedUnit}
                    onSuccess={() => { setSelectedUnit(null); fetchUnits(); }}
                    onCancel={() => setSelectedUnit(null)}
                />
            )}

            {/* Smart Pricing Modal */}
            {pricingUnit && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
                        
                        {/* Modal Header */}
                        <div className="p-5 border-b border-gray-700 flex justify-between items-center sticky top-0 bg-gray-800 rounded-t-2xl z-10">
                            <div>
                                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Sparkles size={20} className="text-purple-400" /> Smart Pricing
                                </h2>
                                <p className="text-xs text-gray-400 mt-1">
                                    {pricingUnit.property_details?.name} — Unit {pricingUnit.unit_number}
                                </p>
                            </div>
                            <button onClick={closePricing} className="text-gray-400 hover:text-white p-1">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Loading State */}
                        {pricingLoading && (
                            <div className="p-12 text-center">
                                <Brain size={48} className="text-purple-400 mx-auto mb-4 animate-pulse" />
                                <p className="text-white font-bold">AI is analyzing market data...</p>
                                <p className="text-xs text-gray-400 mt-2">Comparing with Dubai rental market</p>
                            </div>
                        )}

                        {/* Error State */}
                        {pricingData?.error && (
                            <div className="p-8 text-center">
                                <p className="text-red-400">{pricingData.error}</p>
                            </div>
                        )}

                        {/* Results */}
                        {pricingData && !pricingData.error && !pricingLoading && (
                            <div className="p-5 space-y-5">

                                {/* Verdict Banner */}
                                {(() => {
                                    const v = getVerdictStyle(pricingData.recommendation?.verdict);
                                    return (
                                        <div className={`p-4 rounded-xl border ${v.bg} flex items-center gap-3`}>
                                            {v.icon}
                                            <div>
                                                <p className={`font-bold ${v.color}`}>{v.label}</p>
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    Confidence: {pricingData.recommendation?.confidence}%
                                                </p>
                                            </div>
                                            <span className={`ml-auto px-2 py-1 rounded text-[9px] font-bold ${
                                                pricingData.source === 'AI' 
                                                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                                                    : 'bg-gray-700 text-gray-400 border border-gray-600'
                                            }`}>
                                                {pricingData.source === 'AI' ? '🤖 AI Powered' : '📊 Market Data'}
                                            </span>
                                        </div>
                                    );
                                })()}

                                {/* Current vs Recommended */}
                                <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
                                    <p className="text-xs text-gray-400 uppercase font-bold mb-3 flex items-center gap-1">
                                        <BarChart3 size={12} /> Your Rent vs Market
                                    </p>
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <p className="text-[10px] text-gray-500">Current Rent</p>
                                            <p className="text-xl font-bold text-white font-mono">
                                                AED {Number(pricingData.unit?.current_rent).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-gray-500">AI Recommended</p>
                                            <p className="text-xl font-bold text-green-400 font-mono">
                                                AED {Number(pricingData.recommendation?.mid).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Price Range Bar */}
                                    <div className="relative mt-2">
                                        <div className="flex justify-between text-[9px] text-gray-500 mb-1">
                                            <span>AED {Number(pricingData.recommendation?.low).toLocaleString()}</span>
                                            <span>AED {Number(pricingData.recommendation?.high).toLocaleString()}</span>
                                        </div>
                                        <div className="w-full bg-gray-700 h-3 rounded-full relative">
                                            <div className="absolute h-3 bg-green-500/30 rounded-full" style={{
                                                left: '10%',
                                                right: '10%',
                                            }} />
                                            {(() => {
                                                const low = pricingData.recommendation?.low || 0;
                                                const high = pricingData.recommendation?.high || 1;
                                                const current = pricingData.unit?.current_rent || 0;
                                                const pos = Math.max(0, Math.min(100, ((current - low) / (high - low)) * 80 + 10));
                                                return (
                                                    <div 
                                                        className="absolute w-3 h-3 bg-white rounded-full border-2 border-blue-400 top-0 shadow-lg"
                                                        style={{ left: `${pos}%`, transform: 'translateX(-50%)' }}
                                                        title={`Current: AED ${Number(current).toLocaleString()}`}
                                                    />
                                                );
                                            })()}
                                        </div>
                                        <div className="flex justify-between text-[9px] mt-1">
                                            <span className="text-blue-400">Budget</span>
                                            <span className="text-green-400">Market</span>
                                            <span className="text-purple-400">Premium</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Market Comparison */}
                                <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
                                    <p className="text-xs text-gray-400 uppercase font-bold mb-3">
                                        📍 Market Data — {pricingData.market?.matched_area}
                                    </p>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="text-center">
                                            <p className="text-[10px] text-gray-500">Min</p>
                                            <p className="text-sm font-bold text-red-400 font-mono">
                                                AED {Number(pricingData.market?.market_min).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[10px] text-gray-500">Average</p>
                                            <p className="text-sm font-bold text-blue-400 font-mono">
                                                AED {Number(pricingData.market?.market_avg).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[10px] text-gray-500">Max</p>
                                            <p className="text-sm font-bold text-green-400 font-mono">
                                                AED {Number(pricingData.market?.market_max).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* AI Reasoning */}
                                <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
                                    <p className="text-xs text-gray-400 uppercase font-bold mb-2 flex items-center gap-1">
                                        <Brain size={12} /> AI Analysis
                                    </p>
                                    <p className="text-sm text-gray-200 leading-relaxed">
                                        {pricingData.recommendation?.reasoning}
                                    </p>
                                </div>

                                {/* Tips */}
                                {pricingData.recommendation?.tips?.length > 0 && (
                                    <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
                                        <p className="text-xs text-gray-400 uppercase font-bold mb-3 flex items-center gap-1">
                                            <Lightbulb size={12} /> Pricing Tips
                                        </p>
                                        <div className="space-y-2">
                                            {pricingData.recommendation.tips.map((tip, i) => (
                                                <div key={i} className="flex items-start gap-2">
                                                    <span className="text-yellow-400 text-xs mt-0.5">💡</span>
                                                    <p className="text-xs text-gray-300">{tip}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* 🆕 Apply Price Buttons */}
                                <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
                                    <p className="text-xs text-gray-400 uppercase font-bold mb-3">
                                        Apply AI Recommended Price
                                    </p>
                                    <div className="grid grid-cols-3 gap-2 mb-3">
                                        <button
                                            onClick={() => applyPrice(pricingUnit.id, pricingData.recommendation?.low)}
                                            className="bg-blue-900/30 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 hover:border-blue-500 py-3 rounded-xl text-center transition-all active:scale-95"
                                        >
                                            <p className="text-[10px] font-bold uppercase">Budget</p>
                                            <p className="text-sm font-bold font-mono mt-1">
                                                AED {Number(pricingData.recommendation?.low).toLocaleString()}
                                            </p>
                                        </button>
                                        <button
                                            onClick={() => applyPrice(pricingUnit.id, pricingData.recommendation?.mid)}
                                            className="bg-green-900/30 hover:bg-green-600 text-green-400 hover:text-white border border-green-500/30 hover:border-green-500 py-3 rounded-xl text-center transition-all active:scale-95 ring-1 ring-green-500/20"
                                        >
                                            <p className="text-[10px] font-bold uppercase">Recommended</p>
                                            <p className="text-sm font-bold font-mono mt-1">
                                                AED {Number(pricingData.recommendation?.mid).toLocaleString()}
                                            </p>
                                        </button>
                                        <button
                                            onClick={() => applyPrice(pricingUnit.id, pricingData.recommendation?.high)}
                                            className="bg-purple-900/30 hover:bg-purple-600 text-purple-400 hover:text-white border border-purple-500/30 hover:border-purple-500 py-3 rounded-xl text-center transition-all active:scale-95"
                                        >
                                            <p className="text-[10px] font-bold uppercase">Premium</p>
                                            <p className="text-sm font-bold font-mono mt-1">
                                                AED {Number(pricingData.recommendation?.high).toLocaleString()}
                                            </p>
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-gray-500 text-center">
                                        This will update the unit's yearly rent immediately
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Units;