import { useNavigate, useLocation } from 'react-router-dom';
import { Home, CreditCard, Wrench, Bell, User } from 'lucide-react';

const TenantNav = ({ notificationCount = 0 }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { path: '/tenant/dashboard', icon: Home, label: 'Home' },
        { path: '/tenant/payments', icon: CreditCard, label: 'Payments' },
        { path: '/tenant/maintenance/history', icon: Wrench, label: 'AI Support' },
        { path: '/tenant/notifications', icon: Bell, label: 'Alerts', badge: notificationCount },
        { path: '/tenant/profile', icon: User, label: 'Profile' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 z-50 safe-bottom">
            <div className="max-w-lg mx-auto flex justify-around items-center py-2">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;
                    
                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all relative ${
                                isActive 
                                    ? 'text-blue-400' 
                                    : 'text-gray-500 hover:text-gray-300'
                            }`}
                        >
                            <div className="relative">
                                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                                {item.badge > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                                        {item.badge > 9 ? '9+' : item.badge}
                                    </span>
                                )}
                            </div>
                            <span className={`text-[10px] font-medium ${isActive ? 'text-blue-400' : ''}`}>
                                {item.label}
                            </span>
                            {isActive && (
                                <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-blue-400 rounded-full" />
                            )}
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};

export default TenantNav;