import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import TenantNav from './TenantNav';
import { 
    Bell, Loader, AlertTriangle, CreditCard, Wrench, 
    CheckCircle, Clock, BellOff
} from 'lucide-react';

const Notifications = () => {
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

    const getNotifStyle = (severity) => {
        switch(severity) {
            case 'EMERGENCY': return {
                bg: 'bg-red-500/10 border-red-500/40',
                icon: <AlertTriangle size={20} className="text-red-400" />,
                dot: 'bg-red-500',
            };
            case 'HIGH': return {
                bg: 'bg-orange-500/10 border-orange-500/40',
                icon: <CreditCard size={20} className="text-orange-400" />,
                dot: 'bg-orange-500',
            };
            case 'MEDIUM': return {
                bg: 'bg-blue-500/10 border-blue-500/40',
                icon: <Wrench size={20} className="text-blue-400" />,
                dot: 'bg-blue-500',
            };
            case 'LOW': return {
                bg: 'bg-green-500/10 border-green-500/40',
                icon: <CheckCircle size={20} className="text-green-400" />,
                dot: 'bg-green-500',
            };
            default: return {
                bg: 'bg-gray-800 border-gray-700',
                icon: <Bell size={20} className="text-gray-400" />,
                dot: 'bg-gray-500',
            };
        }
    };

    const handleNotifClick = (notif) => {
        if (notif.type === 'PAYMENT_DUE' || notif.type === 'BOUNCED') {
            navigate('/tenant/payments');
        } else if (notif.type === 'MAINTENANCE_UPDATE' || notif.type === 'MAINTENANCE_RESOLVED') {
            navigate('/tenant/maintenance/history');
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center text-blue-500">
            <Loader className="animate-spin" size={48} />
        </div>
    );

    const notifications = profile?.notifications || [];
    const notifCount = notifications.length;

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 font-sans pb-24">
            
            {/* Header */}
            <header className="bg-gray-800 border-b border-gray-700 p-5 sticky top-0 z-10">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-bold text-white flex items-center gap-2">
                        <Bell size={20} className="text-yellow-400" /> Notifications
                    </h1>
                    {notifCount > 0 && (
                        <span className="bg-red-500/20 text-red-400 border border-red-500/50 px-2 py-0.5 rounded-full text-xs font-bold">
                            {notifCount} alert{notifCount !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>
            </header>

            <main className="p-5 max-w-lg mx-auto space-y-3">

                {notifications.length > 0 ? (
                    notifications.map((notif, index) => {
                        const style = getNotifStyle(notif.severity);
                        return (
                            <div 
                                key={index}
                                onClick={() => handleNotifClick(notif)}
                                className={`p-4 rounded-xl border ${style.bg} cursor-pointer hover:brightness-110 transition-all active:scale-[0.98]`}
                            >
                                <div className="flex gap-3">
                                    <div className="shrink-0 mt-0.5">
                                        {style.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`w-2 h-2 rounded-full ${style.dot} shrink-0`} />
                                            <p className="text-sm font-bold text-white truncate">{notif.title}</p>
                                        </div>
                                        <p className="text-xs text-gray-400 mb-2">{notif.message}</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                                <Clock size={10} /> {notif.date}
                                            </span>
                                            <span className="text-[10px] text-blue-400 font-medium">Tap to view →</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-16">
                        <BellOff size={48} className="text-gray-700 mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">You're all caught up!</p>
                        <p className="text-xs text-gray-600 mt-1">No new notifications at this time.</p>
                    </div>
                )}
            </main>

            <TenantNav notificationCount={notifCount} />
        </div>
    );
};

export default Notifications;