import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Building2, 
    Users, 
    Banknote, 
    LogOut, 
    Home,   // 👈 Added for Units
    Wrench  // 👈 Added for Maintenance
} from 'lucide-react';

function Layout() {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    // 👇 UPDATED MENU LIST (Added 'Units' and 'Maintenance')
    const menuItems = [
        { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
        { name: 'Properties', path: '/properties', icon: <Building2 size={20} /> },
        { name: 'Units', path: '/units', icon: <Home size={20} /> },       // 👈 NEW: For Renting
        { name: 'Tenants', path: '/tenants', icon: <Users size={20} /> },
        { name: 'Maintenance', path: '/maintenance', icon: <Wrench size={20} /> }, // 👈 NEW: For Repairs
        { name: 'Finance', path: '/finance', icon: <Banknote size={20} /> },
    ];

    return (
        <div className="flex h-screen bg-gray-900 text-gray-100 font-sans">
            
            {/* --- LEFT SIDEBAR --- */}
            <aside className="w-64 bg-gray-950 border-r border-gray-800 flex flex-col">
                <div className="h-16 flex items-center px-6 border-b border-gray-800">
                    <span className="text-xl font-bold text-blue-500 tracking-tight">PropOS AI</span>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                                location.pathname.startsWith(item.path)
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                            }`}
                        >
                            {/* Icon Wrapper */}
                            <span className="flex items-center justify-center">
                                {item.icon}
                            </span>
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-800">
                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-900/20 hover:text-red-300 rounded-lg transition"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* --- RIGHT MAIN CONTENT --- */}
            <div className="flex-1 flex flex-col overflow-hidden bg-gray-900">
                {/* Header */}
                <header className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-8">
                    <h2 className="text-gray-200 font-semibold text-lg">
                        {menuItems.find(i => location.pathname.startsWith(i.path))?.name || 'Overview'}
                    </h2>
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold border border-gray-700">
                        A
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto p-8">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}

export default Layout;