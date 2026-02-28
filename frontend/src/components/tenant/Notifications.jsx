import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import TenantNav from './TenantNav';
import { useTheme } from '../../context/ThemeContext';
import { Bell, Loader, AlertTriangle, CreditCard, Wrench, CheckCircle, Clock, BellOff } from 'lucide-react';

const Notifications = () => {
    const { c } = useTheme();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { api.get('me/').then(r => setProfile(r.data)).catch(e => console.error(e)).finally(() => setLoading(false)); }, []);

    const getNotifStyle = (sev) => {
        switch(sev) {
            case 'EMERGENCY': return { bg: c.redBg, icon: <AlertTriangle size={20} className={c.red} /> };
            case 'HIGH': return { bg: c.yellowBg, icon: <CreditCard size={20} className={c.yellow} /> };
            case 'MEDIUM': return { bg: c.blueBg, icon: <Wrench size={20} className={c.blue} /> };
            case 'LOW': return { bg: c.greenBg, icon: <CheckCircle size={20} className={c.green} /> };
            default: return { bg: c.card + ' ' + c.border, icon: <Bell size={20} className={c.textMut} /> };
        }
    };

    const handleClick = (n) => {
        if (n.type === 'PAYMENT_DUE' || n.type === 'BOUNCED') navigate('/tenant/payments');
        else if (n.type === 'MAINTENANCE_UPDATE' || n.type === 'MAINTENANCE_RESOLVED') navigate('/tenant/maintenance/history');
    };

    if (loading) return <div className={'min-h-screen flex items-center justify-center ' + c.bg}><Loader className={'animate-spin ' + c.accent} size={48} /></div>;

    const notifications = profile?.notifications || [];

    return (
        <div className={'min-h-screen font-sans pb-24 ' + c.bg + ' ' + c.text}>
            <header className={'border-b p-5 sticky top-0 z-10 ' + c.card + ' ' + c.border}>
                <div className="flex items-center justify-between">
                    <h1 className={'text-lg font-bold flex items-center gap-2 ' + c.heading}><Bell size={20} className={c.accent} /> Notifications</h1>
                    {notifications.length > 0 && <span className={'px-2 py-0.5 rounded-full text-xs font-bold border ' + c.redBg}>{notifications.length + ' alert' + (notifications.length !== 1 ? 's' : '')}</span>}
                </div>
            </header>
            <main className="p-5 max-w-lg mx-auto space-y-3 fade-in">
                {notifications.length > 0 ? notifications.map((n, i) => {
                    const style = getNotifStyle(n.severity);
                    return (
                        <div key={i} onClick={() => handleClick(n)} className={'p-4 rounded-xl border cursor-pointer transition active:scale-[0.98] ' + style.bg}>
                            <div className="flex gap-3">
                                <div className="shrink-0 mt-0.5">{style.icon}</div>
                                <div className="flex-1 min-w-0">
                                    <p className={'text-sm font-bold truncate ' + c.heading}>{n.title}</p>
                                    <p className={'text-xs mt-1 ' + c.textSec}>{n.message}</p>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className={'text-[10px] flex items-center gap-1 ' + c.textMut}><Clock size={10} /> {n.date}</span>
                                        <span className={'text-[10px] font-medium ' + c.accent}>Tap to view</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                }) : (
                    <div className="text-center py-16">
                        <BellOff size={48} className={c.textMut + ' mx-auto mb-4'} />
                        <p className={c.textMut + ' font-medium'}>You're all caught up!</p>
                        <p className={'text-xs mt-1 ' + c.textMut}>No new notifications at this time.</p>
                    </div>
                )}
            </main>
            <TenantNav notificationCount={notifications.length} />
        </div>
    );
};

export default Notifications;