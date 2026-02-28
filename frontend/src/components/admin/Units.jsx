import { useState, useEffect } from 'react';
import api from '../../api/axios';
import LeaseForm from './LeaseForm';
import { useTheme } from '../../context/ThemeContext';
import {
    Building, Home, Key, Loader, X,
    TrendingUp, TrendingDown, Minus, Brain, Sparkles,
    ArrowUpRight, Target, Lightbulb, BarChart3, FileText
} from 'lucide-react';

function Units() {
    const { c, isDark } = useTheme();
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [pricingData, setPricingData] = useState(null);
    const [pricingLoading, setPricingLoading] = useState(false);
    const [pricingUnit, setPricingUnit] = useState(null);

    const fetchUnits = async () => {
        try { const res = await api.get('units/'); setUnits(res.data); }
        catch (err) { console.error("Error:", err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchUnits(); }, []);

    const handleSmartPricing = async (unit) => {
        setPricingUnit(unit); setPricingLoading(true); setPricingData(null);
        try { const res = await api.get('units/' + unit.id + '/smart-pricing/'); setPricingData(res.data); }
        catch { setPricingData({ error: "Failed to get pricing analysis." }); }
        finally { setPricingLoading(false); }
    };

    const applyPrice = async (unitId, newPrice) => {
        if (!newPrice) return;
        if (!window.confirm('Update rent to AED ' + Number(newPrice).toLocaleString() + '/year?')) return;
        try { await api.patch('units/' + unitId + '/', { yearly_rent: newPrice }); closePricing(); fetchUnits(); }
        catch { alert("Failed to update price."); }
    };

    const handleEjari = async (unit) => {
        try {
            const leasesRes = await api.get('leases/');
            const lease = leasesRes.data.find(l => l.unit === unit.id && l.is_active);
            if (!lease) { alert("No active lease found."); return; }
            const res = await api.get('leases/' + lease.id + '/ejari/', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url; link.setAttribute('download', 'Ejari_Unit_' + unit.unit_number + '.pdf');
            document.body.appendChild(link); link.click(); link.remove(); window.URL.revokeObjectURL(url);
        } catch { alert("Failed to generate Ejari."); }
    };

    const closePricing = () => { setPricingUnit(null); setPricingData(null); };

    const getStatusColor = (s) => { switch(s) { case 'OCCUPIED': return c.greenBg; case 'VACANT': return c.redBg; case 'MAINTENANCE': return c.yellowBg; default: return c.btn2; }};

    const getVerdictStyle = (v) => {
        switch(v) {
            case 'UNDERPRICED': return { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30', icon: <TrendingDown size={18} className="text-red-400" />, label: 'Underpriced' };
            case 'OVERPRICED': return { color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30', icon: <TrendingUp size={18} className="text-orange-400" />, label: 'Overpriced' };
            case 'PREMIUM': return { color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30', icon: <ArrowUpRight size={18} className="text-purple-400" />, label: 'Premium' };
            case 'FAIR': return { color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30', icon: <Target size={18} className="text-green-400" />, label: 'Fair Price' };
            default: return { color: 'text-gray-400', bg: 'bg-gray-800 border-gray-700', icon: <Minus size={18} />, label: v };
        }
    };

    return (
        <div className="fade-in">
            <h1 className={'text-2xl font-extrabold mb-6 flex items-center gap-3 ' + c.heading}>
                <Building className={c.accent} /> Property Units
            </h1>

            {loading ? <div className={c.textSec + ' animate-pulse'}>Loading units...</div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {units.map((unit) => (
                        <div key={unit.id} className={'rounded-2xl border overflow-hidden transition ' + c.card + ' ' + c.border + ' ' + c.shadow + ' ' + c.cardHover}>
                            <div className={'p-5 border-b flex justify-between items-start ' + c.border}>
                                <div>
                                    <h3 className={'text-lg font-bold flex items-center gap-2 ' + c.heading}>
                                        <Home size={18} className={c.textMut} /> {unit.unit_number}
                                    </h3>
                                    <p className={'text-sm mt-1 ' + c.textSec}>{unit.property_details?.name || 'Main Building'}</p>
                                </div>
                                <span className={'px-3 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider ' + getStatusColor(unit.status)}>{unit.status}</span>
                            </div>
                            <div className="p-5 space-y-3">
                                {[['Type', unit.unit_type], ['Bedrooms', unit.bedrooms], unit.square_feet && ['Area', unit.square_feet + ' sq ft']].filter(Boolean).map(([l,v],i) => (
                                    <div key={i} className="flex justify-between text-sm">
                                        <span className={c.textSec}>{l}:</span><span className={'font-medium ' + c.heading}>{v}</span>
                                    </div>
                                ))}
                                <div className="flex justify-between text-sm">
                                    <span className={c.textSec}>Yearly Rent:</span>
                                    <span className={c.green + ' font-bold font-mono'}>AED {Number(unit.yearly_rent).toLocaleString()}</span>
                                </div>
                                <div className={'pt-4 mt-2 border-t space-y-2 ' + c.border}>
                                    <button onClick={() => handleSmartPricing(unit)}
                                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition text-sm shadow-lg shadow-purple-500/20">
                                        <Brain size={16} /> AI Smart Pricing
                                    </button>
                                    {unit.status === 'VACANT' ? (
                                        <button onClick={() => setSelectedUnit(unit)}
                                            className={c.btn + ' w-full py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 text-sm shadow-lg shadow-amber-500/20'}>
                                            <Key size={16} /> Rent This Unit
                                        </button>
                                    ) : (
                                        <button onClick={() => handleEjari(unit)}
                                            className={'w-full py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 text-sm transition border ' + c.greenBg}>
                                            <FileText size={16} /> Generate Ejari
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedUnit && <LeaseForm unit={selectedUnit} onSuccess={() => { setSelectedUnit(null); fetchUnits(); }} onCancel={() => setSelectedUnit(null)} />}

            {pricingUnit && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className={'rounded-2xl border w-full max-w-lg max-h-[90vh] overflow-y-auto ' + c.card + ' ' + c.border + ' ' + c.shadow}>
                        <div className={'p-5 border-b flex justify-between items-center sticky top-0 z-10 rounded-t-2xl ' + c.card + ' ' + c.border}>
                            <div>
                                <h2 className={'text-lg font-bold flex items-center gap-2 ' + c.heading}><Sparkles size={20} className="text-purple-400" /> Smart Pricing</h2>
                                <p className={'text-xs mt-1 ' + c.textMut}>{pricingUnit.property_details?.name} — Unit {pricingUnit.unit_number}</p>
                            </div>
                            <button onClick={closePricing} className={c.textMut + ' hover:opacity-70 p-1'}><X size={20} /></button>
                        </div>

                        {pricingLoading && (
                            <div className="p-12 text-center">
                                <Brain size={48} className="text-purple-400 mx-auto mb-4 animate-pulse" />
                                <p className={'font-bold ' + c.heading}>AI is analyzing market data...</p>
                                <p className={'text-xs mt-2 ' + c.textMut}>Comparing with Dubai rental market</p>
                            </div>
                        )}

                        {pricingData?.error && <div className="p-8 text-center"><p className={c.red}>{pricingData.error}</p></div>}

                        {pricingData && !pricingData.error && !pricingLoading && (
                            <div className="p-5 space-y-5">
                                {(() => {
                                    const v = getVerdictStyle(pricingData.recommendation?.verdict);
                                    return (
                                        <div className={'p-4 rounded-xl border flex items-center gap-3 ' + v.bg}>
                                            {v.icon}
                                            <div>
                                                <p className={'font-bold ' + v.color}>{v.label}</p>
                                                <p className={'text-xs mt-0.5 ' + c.textMut}>Confidence: {pricingData.recommendation?.confidence}%</p>
                                            </div>
                                            <span className={'ml-auto px-2 py-1 rounded text-[9px] font-bold border ' + (pricingData.source === 'AI' ? c.purpleBg : c.btn2)}>
                                                {pricingData.source === 'AI' ? 'AI Powered' : 'Market Data'}
                                            </span>
                                        </div>
                                    );
                                })()}

                                <div className={'rounded-xl p-4 border ' + c.bg + ' ' + c.border}>
                                    <p className={'text-xs uppercase font-bold mb-3 flex items-center gap-1 ' + c.textMut}><BarChart3 size={12} /> Your Rent vs Market</p>
                                    <div className="flex items-center justify-between mb-4">
                                        <div><p className={'text-[10px] ' + c.textMut}>Current Rent</p><p className={'text-xl font-bold font-mono ' + c.heading}>AED {Number(pricingData.unit?.current_rent).toLocaleString()}</p></div>
                                        <div className="text-right"><p className={'text-[10px] ' + c.textMut}>AI Recommended</p><p className={'text-xl font-bold font-mono ' + c.green}>AED {Number(pricingData.recommendation?.mid).toLocaleString()}</p></div>
                                    </div>
                                    <div className="relative mt-2">
                                        <div className={'flex justify-between text-[9px] mb-1 ' + c.textMut}>
                                            <span>AED {Number(pricingData.recommendation?.low).toLocaleString()}</span>
                                            <span>AED {Number(pricingData.recommendation?.high).toLocaleString()}</span>
                                        </div>
                                        <div className={'w-full h-3 rounded-full relative ' + (isDark ? 'bg-gray-700' : 'bg-gray-200')}>
                                            <div className="absolute h-3 bg-green-500/30 rounded-full" style={{ left: '10%', right: '10%' }} />
                                            {(() => {
                                                const low = pricingData.recommendation?.low || 0;
                                                const high = pricingData.recommendation?.high || 1;
                                                const cur = pricingData.unit?.current_rent || 0;
                                                const pos = Math.max(0, Math.min(100, ((cur - low) / (high - low)) * 80 + 10));
                                                return <div className="absolute w-3 h-3 bg-white rounded-full border-2 border-amber-400 top-0 shadow-lg" style={{ left: pos + '%', transform: 'translateX(-50%)' }} />;
                                            })()}
                                        </div>
                                        <div className="flex justify-between text-[9px] mt-1">
                                            <span className={c.blue}>Budget</span><span className={c.green}>Market</span><span className={c.purple}>Premium</span>
                                        </div>
                                    </div>
                                </div>

                                <div className={'rounded-xl p-4 border ' + c.bg + ' ' + c.border}>
                                    <p className={'text-xs uppercase font-bold mb-3 ' + c.textMut}>Market Data — {pricingData.market?.matched_area}</p>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[['Min', pricingData.market?.market_min, c.red], ['Average', pricingData.market?.market_avg, c.blue], ['Max', pricingData.market?.market_max, c.green]].map(([l,v,col],i) => (
                                            <div key={i} className="text-center"><p className={'text-[10px] ' + c.textMut}>{l}</p><p className={'text-sm font-bold font-mono ' + col}>AED {Number(v).toLocaleString()}</p></div>
                                        ))}
                                    </div>
                                </div>

                                <div className={'rounded-xl p-4 border ' + c.bg + ' ' + c.border}>
                                    <p className={'text-xs uppercase font-bold mb-2 flex items-center gap-1 ' + c.textMut}><Brain size={12} /> AI Analysis</p>
                                    <p className={'text-sm leading-relaxed ' + c.heading}>{pricingData.recommendation?.reasoning}</p>
                                </div>

                                {pricingData.recommendation?.tips?.length > 0 && (
                                    <div className={'rounded-xl p-4 border ' + c.bg + ' ' + c.border}>
                                        <p className={'text-xs uppercase font-bold mb-3 flex items-center gap-1 ' + c.textMut}><Lightbulb size={12} /> Pricing Tips</p>
                                        <div className="space-y-2">
                                            {pricingData.recommendation.tips.map((tip, i) => (
                                                <div key={i} className="flex items-start gap-2"><span className="text-amber-400 text-xs mt-0.5">💡</span><p className={'text-xs ' + c.textSec}>{tip}</p></div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className={'rounded-xl p-4 border ' + c.bg + ' ' + c.border}>
                                    <p className={'text-xs uppercase font-bold mb-3 ' + c.textMut}>Apply AI Recommended Price</p>
                                    <div className="grid grid-cols-3 gap-2 mb-3">
                                        {[['Budget', pricingData.recommendation?.low, 'bg-blue-900/30 hover:bg-blue-600 text-blue-400 hover:text-white border-blue-500/30 hover:border-blue-500'],
                                          ['Recommended', pricingData.recommendation?.mid, 'bg-green-900/30 hover:bg-green-600 text-green-400 hover:text-white border-green-500/30 hover:border-green-500 ring-1 ring-green-500/20'],
                                          ['Premium', pricingData.recommendation?.high, 'bg-purple-900/30 hover:bg-purple-600 text-purple-400 hover:text-white border-purple-500/30 hover:border-purple-500']
                                        ].map(([label, price, cls], i) => (
                                            <button key={i} onClick={() => applyPrice(pricingUnit.id, price)}
                                                className={'py-3 rounded-xl text-center transition-all active:scale-95 border ' + cls}>
                                                <p className="text-[10px] font-bold uppercase">{label}</p>
                                                <p className="text-sm font-bold font-mono mt-1">AED {Number(price).toLocaleString()}</p>
                                            </button>
                                        ))}
                                    </div>
                                    <p className={'text-[10px] text-center ' + c.textMut}>This will update the unit's yearly rent immediately</p>
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