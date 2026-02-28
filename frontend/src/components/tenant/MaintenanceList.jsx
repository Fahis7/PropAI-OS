import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import TenantNav from './TenantNav';
import { useTheme } from '../../context/ThemeContext';
import { Wrench, Loader, CheckCircle, Clock, AlertCircle, Plus } from 'lucide-react';

const MaintenanceList = () => {
    const { c, isDark } = useTheme();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => { api.get('me/').then(r => setProfile(r.data)).catch(e => console.error(e)).finally(() => setLoading(false)); }, []);

    const getPriorityStyle = (p) => { switch(p) { case 'EMERGENCY': return c.redBg; case 'HIGH': return c.yellowBg; case 'MEDIUM': return c.blueBg; default: return isDark ? 'bg-gray-700 text-gray-400 border-gray-600':'bg-gray-100 text-gray-500 border-gray-200'; }};
    const getStatusIcon = (s) => { switch(s) { case 'RESOLVED': case 'CLOSED': return <CheckCircle size={18} className={c.green}/>; case 'IN_PROGRESS': return <Clock size={18} className={c.yellow}/>; case 'OPEN': return <AlertCircle size={18} className={c.blue}/>; default: return <Clock size={18} className={c.textMut}/>; }};
    const getStatusStyle = (s) => { switch(s) { case 'RESOLVED': case 'CLOSED': return c.green; case 'IN_PROGRESS': return c.yellow; case 'OPEN': return c.blue; default: return c.textSec; }};

    if (loading) return <div className={'min-h-screen flex items-center justify-center ' + c.bg}><Loader className={'animate-spin ' + c.accent} size={48} /></div>;

    const tickets = profile?.maintenance_tickets || [];
    const filtered = filter === 'ALL' ? tickets : tickets.filter(t => t.status === filter);

    return (
        <div className={'min-h-screen font-sans pb-24 ' + c.bg + ' ' + c.text}>
            <header className={'border-b p-5 sticky top-0 z-10 ' + c.card + ' ' + c.border}>
                <div className="flex items-center justify-between">
                    <h1 className={'text-lg font-bold flex items-center gap-2 ' + c.heading}><Wrench size={20} className={c.yellow} /> AI Support Tracking</h1>
                    <button onClick={() => navigate('/tenant/maintenance')} className={c.btn + ' px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-lg shadow-amber-500/20'}>
                        <Plus size={14} /> New Request
                    </button>
                </div>
            </header>
            <main className="p-5 max-w-lg mx-auto space-y-4 fade-in">
                <div className="grid grid-cols-3 gap-3">
                    {[{val:tickets.filter(t=>t.status==='OPEN').length,label:'Open',color:c.blue},
                      {val:tickets.filter(t=>t.status==='IN_PROGRESS').length,label:'In Progress',color:c.yellow},
                      {val:tickets.filter(t=>t.status==='RESOLVED'||t.status==='CLOSED').length,label:'Resolved',color:c.green}].map((s,i)=>(
                        <div key={i} className={'rounded-xl p-3 border text-center ' + c.card + ' ' + c.border}>
                            <p className={'text-lg font-bold ' + s.color}>{s.val}</p>
                            <p className={'text-[10px] uppercase font-bold ' + c.textMut}>{s.label}</p>
                        </div>
                    ))}
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {['ALL','OPEN','IN_PROGRESS','RESOLVED','CLOSED'].map(s => {
                        const cnt = s === 'ALL' ? tickets.length : tickets.filter(t=>t.status===s).length;
                        if (cnt === 0 && s !== 'ALL') return null;
                        return (<button key={s} onClick={() => setFilter(s)}
                            className={'px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition border ' + (filter === s ? c.btn : c.btn2)}>
                            {s.replace('_',' ') + ' (' + cnt + ')'}</button>);
                    })}
                </div>
                <div className="space-y-3">
                    {filtered.length > 0 ? filtered.map(t => (
                        <div key={t.id} className={'p-4 rounded-xl border transition-all ' + c.card + ' ' + c.border + ' ' + c.cardHover}>
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2 flex-1 min-w-0">{getStatusIcon(t.status)}<h3 className={'font-semibold text-sm truncate ' + c.heading}>{t.title}</h3></div>
                                <span className={'px-2 py-1 rounded-md text-[10px] font-bold border shrink-0 ml-3 ' + getPriorityStyle(t.priority)}>{t.priority}</span>
                            </div>
                            <p className={'text-xs mb-3 line-clamp-2 ml-7 ' + c.textSec}>{t.description}</p>
                            <div className="flex justify-between items-center text-xs ml-7">
                                <span className={'font-medium ' + getStatusStyle(t.status)}>{t.status.replace('_',' ')}</span>
                                <div className="flex items-center gap-3">
                                    {t.source === 'SYSTEM' && <span className={'px-1.5 py-0.5 rounded text-[9px] font-bold border ' + c.purpleBg}>AI Triaged</span>}
                                    <span className={c.textMut}>{t.date}</span>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className={'text-center py-12 border-2 border-dashed rounded-xl ' + c.border}>
                            <Wrench size={36} className={c.textMut + ' mx-auto mb-3'} />
                            <p className={c.textMut + ' font-medium'}>No tickets found.</p>
                            <button onClick={() => navigate('/tenant/maintenance')} className={c.btn + ' mt-4 px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-amber-500/20'}>Report an Issue</button>
                        </div>
                    )}
                </div>
            </main>
            <TenantNav notificationCount={profile?.notifications?.length || 0} />
        </div>
    );
};

export default MaintenanceList;