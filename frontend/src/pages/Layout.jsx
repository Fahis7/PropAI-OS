import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Building2, Users, Banknote, LogOut, Home, Wrench, BarChart3, Building } from 'lucide-react';
import Chatbot from '../components/Chatbot';
import NotificationBell from '../components/NotificationBell';
import ThemeToggle from '../components/ThemeToggle';
import { useTheme } from '../context/ThemeContext';
function Layout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { c } = useTheme();

    const handleLogout = () => { localStorage.clear(); navigate('/login'); };

    const menuItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Properties', path: '/properties', icon: Building2 },
        { name: 'Units', path: '/units', icon: Home },
        { name: 'Tenants', path: '/tenants', icon: Users },
        { name: 'Maintenance', path: '/maintenance', icon: Wrench },
        { name: 'Finance', path: '/finance', icon: Banknote },
        { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    ];

    const current = menuItems.find(i => location.pathname.startsWith(i.path));

    return (
        <div className={'flex h-screen font-sans ' + c.bg + ' ' + c.text}>
            <aside className="w-64 bg-[#0d1117] border-r border-white/5 flex flex-col shrink-0">
                <div className="h-14 flex items-center px-6 border-b border-white/5">
                    <Link to="/" className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                            <Building size={16} className="text-white" />
                        </div>
                        <span className="text-lg font-bold tracking-tight">
                            <span className="text-white">Prop</span><span className="text-amber-400">AI</span>
                        </span>
                    </Link>
                </div>
                <nav className="flex-1 px-3 py-5 space-y-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const active = location.pathname.startsWith(item.path);
                        return (
                            <Link key={item.path} to={item.path}
                                className={'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ' + (
                                    active ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-white border-transparent'
                                )}>
                                <Icon size={18} /> <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-3 border-t border-white/5 space-y-2">
                    <div className="flex items-center justify-between px-4 py-2">
                        <span className="text-xs text-gray-500">Theme</span>
                        <ThemeToggle />
                    </div>
                    <button onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-gray-400 hover:bg-rose-500/10 hover:text-rose-400 rounded-xl transition text-sm">
                        <LogOut size={18} /> <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            <div className="flex-1 flex flex-col overflow-hidden">
                <header className={'h-14 border-b flex items-center justify-between px-8 shrink-0 ' + c.card + ' ' + c.border}>
                    <h2 className={'text-base font-bold ' + c.heading}>{current ? current.name : 'Overview'}</h2>
                    <div className="flex items-center gap-4">
                        <NotificationBell />
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-xs font-bold text-white">A</div>
                    </div>
                </header>
                <main className="flex-1 overflow-auto p-6">
                    <div className="max-w-7xl mx-auto fade-in"><Outlet /></div>
                </main>
            </div>
            <Chatbot />
        </div>
    );
}

export default Layout;