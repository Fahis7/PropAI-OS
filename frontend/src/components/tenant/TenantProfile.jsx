import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import TenantNav from './TenantNav';
import { 
    User, Loader, Mail, Phone, Globe, CreditCard, 
    Home, Calendar, FileText, LogOut, Shield, Building
} from 'lucide-react';

const TenantProfile = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('me/');
                setProfile(res.data);
            } catch (err) {
                console.error("Failed to load profile", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center text-blue-500">
            <Loader className="animate-spin" size={48} />
        </div>
    );

    const notifCount = profile?.notifications?.length || 0;

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 font-sans pb-24">
            
            {/* Profile Header */}
            <div className="bg-gradient-to-br from-blue-900 to-gray-800 p-8 text-center border-b border-gray-700">
                <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-3xl font-bold mx-auto mb-3 border-4 border-blue-400/30 shadow-lg">
                    {profile?.name?.charAt(0) || 'T'}
                </div>
                <h1 className="text-xl font-bold text-white">{profile?.name || 'Tenant'}</h1>
                <p className="text-sm text-blue-300 mt-1">
                    {profile?.unit ? `${profile.unit.property} • Unit ${profile.unit.number}` : 'No Active Unit'}
                </p>
            </div>

            <main className="p-5 max-w-lg mx-auto space-y-5">

                {/* Personal Info */}
                <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
                    <div className="p-4 border-b border-gray-700">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <User size={16} className="text-blue-400" /> Personal Information
                        </h3>
                    </div>
                    <div className="divide-y divide-gray-700/50">
                        <div className="flex items-center gap-3 p-4">
                            <Mail size={16} className="text-gray-500 shrink-0" />
                            <div>
                                <p className="text-[10px] text-gray-500 uppercase font-bold">Email</p>
                                <p className="text-sm text-gray-200">{profile?.email || '—'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4">
                            <Phone size={16} className="text-gray-500 shrink-0" />
                            <div>
                                <p className="text-[10px] text-gray-500 uppercase font-bold">Phone</p>
                                <p className="text-sm text-gray-200">{profile?.phone || '—'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4">
                            <Globe size={16} className="text-gray-500 shrink-0" />
                            <div>
                                <p className="text-[10px] text-gray-500 uppercase font-bold">Nationality</p>
                                <p className="text-sm text-gray-200">{profile?.nationality || '—'}</p>
                            </div>
                        </div>
                        {profile?.emirates_id && (
                            <div className="flex items-center gap-3 p-4">
                                <Shield size={16} className="text-gray-500 shrink-0" />
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase font-bold">Emirates ID</p>
                                    <p className="text-sm text-gray-200">{profile.emirates_id}</p>
                                </div>
                            </div>
                        )}
                        {profile?.ejari_number && (
                            <div className="flex items-center gap-3 p-4">
                                <FileText size={16} className="text-gray-500 shrink-0" />
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase font-bold">Ejari Number</p>
                                    <p className="text-sm text-gray-200">{profile.ejari_number}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Unit Details */}
                {profile?.unit && (
                    <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
                        <div className="p-4 border-b border-gray-700">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <Building size={16} className="text-purple-400" /> Unit Details
                            </h3>
                        </div>
                        <div className="divide-y divide-gray-700/50">
                            <div className="flex items-center gap-3 p-4">
                                <Home size={16} className="text-gray-500 shrink-0" />
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase font-bold">Property</p>
                                    <p className="text-sm text-gray-200">{profile.unit.property}</p>
                                </div>
                            </div>
                            <div className="flex justify-between p-4">
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase font-bold">Unit</p>
                                    <p className="text-sm text-gray-200">{profile.unit.number}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-500 uppercase font-bold">Type</p>
                                    <p className="text-sm text-gray-200">{profile.unit.type}</p>
                                </div>
                            </div>
                            <div className="flex justify-between p-4">
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase font-bold">Bedrooms</p>
                                    <p className="text-sm text-gray-200">{profile.unit.bedrooms}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] text-gray-500 uppercase font-bold">Bathrooms</p>
                                    <p className="text-sm text-gray-200">{profile.unit.bathrooms}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-500 uppercase font-bold">Area</p>
                                    <p className="text-sm text-gray-200">{profile.unit.square_feet ? `${profile.unit.square_feet} sq ft` : '—'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Lease Info */}
                {profile?.lease && (
                    <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
                        <div className="p-4 border-b border-gray-700">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <Calendar size={16} className="text-green-400" /> Lease Contract
                            </h3>
                        </div>
                        <div className="divide-y divide-gray-700/50">
                            <div className="flex justify-between p-4">
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase font-bold">Start Date</p>
                                    <p className="text-sm text-gray-200">{profile.lease.start}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-500 uppercase font-bold">End Date</p>
                                    <p className="text-sm text-gray-200">{profile.lease.end}</p>
                                </div>
                            </div>
                            <div className="flex justify-between p-4">
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase font-bold">Yearly Rent</p>
                                    <p className="text-sm text-gray-200 font-mono">AED {Number(profile.lease.rent).toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-500 uppercase font-bold">Payment Plan</p>
                                    <p className="text-sm text-gray-200">{profile.lease.frequency}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3">
                    <div 
                        onClick={() => navigate('/tenant/payments')}
                        className="bg-gray-800 rounded-xl p-4 border border-gray-700 text-center cursor-pointer hover:border-green-500/50 transition"
                    >
                        <CreditCard size={20} className="text-green-400 mx-auto mb-2" />
                        <p className="text-lg font-bold text-white">{profile?.cheques?.length || 0}</p>
                        <p className="text-[10px] text-gray-400 uppercase">Total Cheques</p>
                    </div>
                    <div 
                        onClick={() => navigate('/tenant/maintenance/history')}
                        className="bg-gray-800 rounded-xl p-4 border border-gray-700 text-center cursor-pointer hover:border-orange-500/50 transition"
                    >
                        <FileText size={20} className="text-orange-400 mx-auto mb-2" />
                        <p className="text-lg font-bold text-white">{profile?.maintenance_tickets?.length || 0}</p>
                        <p className="text-[10px] text-gray-400 uppercase">Support Tickets</p>
                    </div>
                </div>

                {/* Logout Button */}
                <button 
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 font-bold py-4 rounded-xl border border-red-500/30 transition active:scale-[0.98]"
                >
                    <LogOut size={20} />
                    Sign Out
                </button>
            </main>

            <TenantNav notificationCount={notifCount} />
        </div>
    );
};

export default TenantProfile;