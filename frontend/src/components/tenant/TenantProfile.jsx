import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import TenantNav from './TenantNav';
import { useTheme } from '../../context/ThemeContext';
import { User, Loader, Mail, Phone, Globe, CreditCard, Home, Calendar, FileText, LogOut, Shield, Building } from 'lucide-react';

const TenantProfile = () => {
    const { c, isDark } = useTheme();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try { const res = await api.get('me/'); setProfile(res.data); }
            catch (err) { console.error("Failed to load profile", err); }
            finally { setLoading(false); }
        };
        fetchProfile();
    }, []);

    const handleLogout = () => { localStorage.clear(); navigate('/login'); };

    if (loading) return (<div className={"min-h-screen flex items-center justify-center " + c.bg}><Loader className={"animate-spin " + c.accent} size={48} /></div>);

    const notifCount = profile?.notifications?.length || 0;
    const divider = isDark ? "divide-gray-700/50" : "divide-gray-100";
    const sectionBorder = isDark ? "border-gray-700" : "border-gray-100";

    const InfoRow = ({ icon: Icon, label, value }) => (
        <div className="flex items-center gap-3 p-4">
            <Icon size={16} className={c.textMut + " shrink-0"} />
            <div>
                <p className={"text-[10px] uppercase font-bold " + c.textMut}>{label}</p>
                <p className={"text-sm " + c.textSec}>{value || '—'}</p>
            </div>
        </div>
    );

    return (
        <div className={"min-h-screen font-sans pb-24 " + c.bg + " " + c.text}>

            {/* Profile Header */}
            <div className="bg-gradient-to-br from-amber-600 to-amber-500 p-8 text-center">
                <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold mx-auto mb-3 border-4 border-white/30 shadow-lg text-white">
                    {profile?.name?.charAt(0) || 'T'}
                </div>
                <h1 className="text-xl font-bold text-white">{profile?.name || 'Tenant'}</h1>
                <p className="text-sm text-amber-100 mt-1">
                    {profile?.unit ? `${profile.unit.property} • Unit ${profile.unit.number}` : 'No Active Unit'}
                </p>
            </div>

            <main className="p-5 max-w-lg mx-auto space-y-5">

                {/* Personal Info */}
                <div className={"rounded-2xl border overflow-hidden " + c.card + " " + c.border}>
                    <div className={"p-4 border-b " + sectionBorder}>
                        <h3 className={"font-bold flex items-center gap-2 " + c.heading}>
                            <User size={16} className={c.accent} /> Personal Information
                        </h3>
                    </div>
                    <div className={"divide-y " + divider}>
                        <InfoRow icon={Mail} label="Email" value={profile?.email} />
                        <InfoRow icon={Phone} label="Phone" value={profile?.phone} />
                        <InfoRow icon={Globe} label="Nationality" value={profile?.nationality} />
                        {profile?.emirates_id && <InfoRow icon={Shield} label="Emirates ID" value={profile.emirates_id} />}
                        {profile?.ejari_number && <InfoRow icon={FileText} label="Ejari Number" value={profile.ejari_number} />}
                    </div>
                </div>

                {/* Unit Details */}
                {profile?.unit && (
                    <div className={"rounded-2xl border overflow-hidden " + c.card + " " + c.border}>
                        <div className={"p-4 border-b " + sectionBorder}>
                            <h3 className={"font-bold flex items-center gap-2 " + c.heading}>
                                <Building size={16} className="text-purple-400" /> Unit Details
                            </h3>
                        </div>
                        <div className={"divide-y " + divider}>
                            <InfoRow icon={Home} label="Property" value={profile.unit.property} />
                            <div className="flex justify-between p-4">
                                <div><p className={"text-[10px] uppercase font-bold " + c.textMut}>Unit</p><p className={"text-sm " + c.textSec}>{profile.unit.number}</p></div>
                                <div className="text-right"><p className={"text-[10px] uppercase font-bold " + c.textMut}>Type</p><p className={"text-sm " + c.textSec}>{profile.unit.type}</p></div>
                            </div>
                            <div className="flex justify-between p-4">
                                <div><p className={"text-[10px] uppercase font-bold " + c.textMut}>Bedrooms</p><p className={"text-sm " + c.textSec}>{profile.unit.bedrooms}</p></div>
                                <div className="text-center"><p className={"text-[10px] uppercase font-bold " + c.textMut}>Bathrooms</p><p className={"text-sm " + c.textSec}>{profile.unit.bathrooms}</p></div>
                                <div className="text-right"><p className={"text-[10px] uppercase font-bold " + c.textMut}>Area</p><p className={"text-sm " + c.textSec}>{profile.unit.square_feet ? `${profile.unit.square_feet} sq ft` : '—'}</p></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Lease Info */}
                {profile?.lease && (
                    <div className={"rounded-2xl border overflow-hidden " + c.card + " " + c.border}>
                        <div className={"p-4 border-b " + sectionBorder}>
                            <h3 className={"font-bold flex items-center gap-2 " + c.heading}>
                                <Calendar size={16} className={c.green} /> Lease Contract
                            </h3>
                        </div>
                        <div className={"divide-y " + divider}>
                            <div className="flex justify-between p-4">
                                <div><p className={"text-[10px] uppercase font-bold " + c.textMut}>Start Date</p><p className={"text-sm " + c.textSec}>{profile.lease.start}</p></div>
                                <div className="text-right"><p className={"text-[10px] uppercase font-bold " + c.textMut}>End Date</p><p className={"text-sm " + c.textSec}>{profile.lease.end}</p></div>
                            </div>
                            <div className="flex justify-between p-4">
                                <div><p className={"text-[10px] uppercase font-bold " + c.textMut}>Yearly Rent</p><p className={"text-sm font-mono " + c.heading}>AED {Number(profile.lease.rent).toLocaleString()}</p></div>
                                <div className="text-right"><p className={"text-[10px] uppercase font-bold " + c.textMut}>Payment Plan</p><p className={"text-sm " + c.textSec}>{profile.lease.frequency}</p></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3">
                    <div onClick={() => navigate('/tenant/payments')}
                        className={"rounded-xl p-4 border text-center cursor-pointer transition hover:border-amber-500/30 " + c.card + " " + c.border}>
                        <CreditCard size={20} className={c.green + " mx-auto mb-2"} />
                        <p className={"text-lg font-bold " + c.heading}>{profile?.cheques?.length || 0}</p>
                        <p className={"text-[10px] uppercase " + c.textMut}>Total Cheques</p>
                    </div>
                    <div onClick={() => navigate('/tenant/maintenance/history')}
                        className={"rounded-xl p-4 border text-center cursor-pointer transition hover:border-amber-500/30 " + c.card + " " + c.border}>
                        <FileText size={20} className={c.accent + " mx-auto mb-2"} />
                        <p className={"text-lg font-bold " + c.heading}>{profile?.maintenance_tickets?.length || 0}</p>
                        <p className={"text-[10px] uppercase " + c.textMut}>Support Tickets</p>
                    </div>
                </div>

                {/* Logout */}
                <button onClick={handleLogout}
                    className={"w-full flex items-center justify-center gap-2 font-bold py-4 rounded-xl transition active:scale-[0.98] border " + c.redBg}>
                    <LogOut size={20} /> Sign Out
                </button>
            </main>
            <TenantNav notificationCount={notifCount} />
        </div>
    );
};

export default TenantProfile;