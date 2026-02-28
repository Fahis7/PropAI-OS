import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import TenantNav from './TenantNav';
import { useTheme } from '../../context/ThemeContext';
import { User, Loader, Mail, Phone, Globe, CreditCard, Home, Calendar, FileText, LogOut, Shield, Building } from 'lucide-react';

const TenantProfile = () => {
    const { c } = useTheme();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { api.get('me/').then(r => setProfile(r.data)).catch(e => console.error(e)).finally(() => setLoading(false)); }, []);
    const handleLogout = () => { localStorage.clear(); navigate('/login'); };

    if (loading) return <div className={'min-h-screen flex items-center justify-center ' + c.bg}><Loader className={'animate-spin ' + c.accent} size={48} /></div>;

    const InfoRow = ({ icon: Icon, label, value }) => (
        <div className={'flex items-center gap-3 p-4 border-b last:border-b-0 ' + c.border}>
            <Icon size={16} className={c.textMut + ' shrink-0'} />
            <div><p className={'text-[10px] uppercase font-bold ' + c.textMut}>{label}</p><p className={'text-sm ' + c.heading}>{value || '—'}</p></div>
        </div>
    );

    return (
        <div className={'min-h-screen font-sans pb-24 ' + c.bg + ' ' + c.text}>
            <div className="bg-gradient-to-br from-amber-600 to-amber-500 p-8 text-center">
                <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold mx-auto mb-3 border-4 border-white/20 text-white">
                    {profile?.name?.charAt(0) || 'T'}
                </div>
                <h1 className="text-xl font-extrabold text-white">{profile?.name || 'Tenant'}</h1>
                <p className="text-sm text-amber-100 mt-1">{profile?.unit ? profile.unit.property + ' • Unit ' + profile.unit.number : 'No Active Unit'}</p>
            </div>
            <main className="p-5 max-w-lg mx-auto space-y-5 fade-in">
                <div className={'rounded-2xl border overflow-hidden ' + c.card + ' ' + c.border}>
                    <div className={'p-4 border-b ' + c.border}><h3 className={'font-bold flex items-center gap-2 ' + c.heading}><User size={16} className={c.blue} /> Personal Information</h3></div>
                    <InfoRow icon={Mail} label="Email" value={profile?.email} />
                    <InfoRow icon={Phone} label="Phone" value={profile?.phone} />
                    <InfoRow icon={Globe} label="Nationality" value={profile?.nationality} />
                    {profile?.emirates_id && <InfoRow icon={Shield} label="Emirates ID" value={profile.emirates_id} />}
                    {profile?.ejari_number && <InfoRow icon={FileText} label="Ejari Number" value={profile.ejari_number} />}
                </div>

                {profile?.unit && (
                    <div className={'rounded-2xl border overflow-hidden ' + c.card + ' ' + c.border}>
                        <div className={'p-4 border-b ' + c.border}><h3 className={'font-bold flex items-center gap-2 ' + c.heading}><Building size={16} className={c.purple} /> Unit Details</h3></div>
                        <InfoRow icon={Home} label="Property" value={profile.unit.property} />
                        <div className={'flex justify-between p-4 border-b ' + c.border}>
                            <div><p className={'text-[10px] uppercase font-bold ' + c.textMut}>Unit</p><p className={'text-sm ' + c.heading}>{profile.unit.number}</p></div>
                            <div className="text-right"><p className={'text-[10px] uppercase font-bold ' + c.textMut}>Type</p><p className={'text-sm ' + c.heading}>{profile.unit.type}</p></div>
                        </div>
                        <div className={'flex justify-between p-4 ' + c.border}>
                            <div><p className={'text-[10px] uppercase font-bold ' + c.textMut}>Bedrooms</p><p className={'text-sm ' + c.heading}>{profile.unit.bedrooms}</p></div>
                            <div className="text-center"><p className={'text-[10px] uppercase font-bold ' + c.textMut}>Bathrooms</p><p className={'text-sm ' + c.heading}>{profile.unit.bathrooms}</p></div>
                            <div className="text-right"><p className={'text-[10px] uppercase font-bold ' + c.textMut}>Area</p><p className={'text-sm ' + c.heading}>{profile.unit.square_feet ? profile.unit.square_feet + ' sq ft' : '—'}</p></div>
                        </div>
                    </div>
                )}

                {profile?.lease && (
                    <div className={'rounded-2xl border overflow-hidden ' + c.card + ' ' + c.border}>
                        <div className={'p-4 border-b ' + c.border}><h3 className={'font-bold flex items-center gap-2 ' + c.heading}><Calendar size={16} className={c.green} /> Lease Contract</h3></div>
                        <div className={'flex justify-between p-4 border-b ' + c.border}>
                            <div><p className={'text-[10px] uppercase font-bold ' + c.textMut}>Start</p><p className={'text-sm ' + c.heading}>{profile.lease.start}</p></div>
                            <div className="text-right"><p className={'text-[10px] uppercase font-bold ' + c.textMut}>End</p><p className={'text-sm ' + c.heading}>{profile.lease.end}</p></div>
                        </div>
                        <div className={'flex justify-between p-4 ' + c.border}>
                            <div><p className={'text-[10px] uppercase font-bold ' + c.textMut}>Yearly Rent</p><p className={'text-sm ' + c.heading}>{'AED ' + Number(profile.lease.rent).toLocaleString()}</p></div>
                            <div className="text-right"><p className={'text-[10px] uppercase font-bold ' + c.textMut}>Plan</p><p className={'text-sm ' + c.heading}>{profile.lease.frequency}</p></div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                    <div onClick={() => navigate('/tenant/payments')} className={'rounded-xl p-4 border text-center cursor-pointer transition ' + c.card + ' ' + c.border + ' ' + c.cardHover}>
                        <CreditCard size={20} className={c.green + ' mx-auto mb-2'} />
                        <p className={'text-lg font-bold ' + c.heading}>{profile?.cheques?.length || 0}</p>
                        <p className={'text-[10px] uppercase ' + c.textMut}>Total Cheques</p>
                    </div>
                    <div onClick={() => navigate('/tenant/maintenance/history')} className={'rounded-xl p-4 border text-center cursor-pointer transition ' + c.card + ' ' + c.border + ' ' + c.cardHover}>
                        <FileText size={20} className={c.yellow + ' mx-auto mb-2'} />
                        <p className={'text-lg font-bold ' + c.heading}>{profile?.maintenance_tickets?.length || 0}</p>
                        <p className={'text-[10px] uppercase ' + c.textMut}>Support Tickets</p>
                    </div>
                </div>

                <button onClick={handleLogout}
                    className={'w-full flex items-center justify-center gap-2 font-bold py-4 rounded-xl border transition active:scale-[0.98] ' + c.redBg}>
                    <LogOut size={20} /> Sign Out
                </button>
            </main>
            <TenantNav notificationCount={profile?.notifications?.length || 0} />
        </div>
    );
};

export default TenantProfile;