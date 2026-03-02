import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import TenantNav from './TenantNav';
import { useTheme } from '../../context/ThemeContext';
import { Bell, Loader, AlertTriangle, CreditCard, Wrench, CheckCircle, Clock, BellOff } from 'lucide-react';

const Notifications = () => {
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

    const getNotifStyle = (severity) => {
        switch (severity) {
            case 'EMERGENCY': return { bg: c.redBg, icon: <AlertTriangle size={20} className={c.red} />, dot: 'bg-rose-500' };
            case 'HIGH': return { bg: c.yellowBg, icon: <CreditCard size={20} className={c.yellow} />, dot: 'bg-amber-500' };
            case 'MEDIUM': return { bg: c.blueBg, icon: <Wrench size={20} className={c.blue} />, dot: 'bg-sky-500' };
            case 'LOW': return { bg: c.greenBg, icon: <CheckCircle size={20} className={c.green} />, dot: 'bg-emerald-500' };
            default: return { bg: c.card + ' ' + c.border, icon: <Bell size={20} className={c.textMut} />, dot: 'bg-gray-500' };
        }
    };

    const handleNotifClick = (notif) => {
        if (notif.type === 'PAYMENT_DUE' || notif.type === 'BOUNCED') navigate('/tenant/payments');
        else if (notif.type === 'MAINTENANCE_UPDATE' || notif.type === 'MAINTENANCE_RESOLVED') navigate('/tenant/maintenance/history');
    };

    if (loading) return (<div className={"min-h-screen flex items-center justify-center " + c.bg}><Loader className={"animate-spin " + c.accent} size={48} /></div>);

    const notifications = profile?.notifications || [];
    const notifCount = notifications.length;

    return (
        <div className={"min-h-screen font-sans pb-24 " + c.bg + " " + c.text}>
            <header className={"border-b p-5 sticky top-0 z-10 " + c.card + " " + c.border}>
                <div className="flex items-center justify-between">
                    <h1 className={"text-lg font-bold flex items-center gap-2 " + c.heading}>
                        <Bell size={20} className={c.accent} /> Notifications
                    </h1>
                    {notifCount > 0 && (
                        <span className={"px-2 py-0.5 rounded-full text-xs font-bold border " + c.redBg}>
                            {notifCount} alert{notifCount !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>
            </header>

            <main className="p-5 max-w-lg mx-auto space-y-3">
                {notifications.length > 0 ? notifications.map((notif, index) => {
                    const style = getNotifStyle(notif.severity);
                    return (
                        <div key={index} onClick={() => handleNotifClick(notif)}
                            className={"p-4 rounded-xl border cursor-pointer hover:brightness-110 transition-all active:scale-[0.98] " + style.bg}>
                            <div className="flex gap-3">
                                <div className="shrink-0 mt-0.5">{style.icon}</div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={"w-2 h-2 rounded-full shrink-0 " + style.dot} />
                                        <p className={"text-sm font-bold truncate " + c.heading}>{notif.title}</p>
                                    </div>
                                    <p className={"text-xs mb-2 " + c.textSec}>{notif.message}</p>
                                    <div className="flex items-center justify-between">
                                        <span className={"text-[10px] flex items-center gap-1 " + c.textMut}>
                                            <Clock size={10} /> {notif.date}
                                        </span>
                                        <span className={"text-[10px] font-medium " + c.accent}>Tap to view →</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                }) : (
                    <div className="text-center py-16">
                        <BellOff size={48} className={c.textMut + " mx-auto mb-4"} />
                        <p className={c.textMut + " font-medium"}>You're all caught up!</p>
                        <p className={"text-xs mt-1 " + c.textMut}>No new notifications at this time.</p>
                    </div>
                )}
            </main>
            <TenantNav notificationCount={notifCount} />
        </div>
    );
};

export default Notifications;