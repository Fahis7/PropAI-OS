import { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, Building, AlertCircle, ArrowLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useTheme } from './context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import api from '../api/axios';

const Login = () => {
    const { c } = useTheme();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const res = await api.post('token/', { username: formData.username, password: formData.password });
            const accessToken = res.data.access;
            localStorage.setItem('access_token', accessToken);
            localStorage.setItem('refresh_token', res.data.refresh);
            api.defaults.headers.common['Authorization'] = 'Bearer ' + accessToken;
            try {
                const decoded = jwtDecode(accessToken);
                const role = decoded.role || 'TENANT';
                if (role === 'TENANT') navigate('/tenant/dashboard');
                else if (role === 'MAINTENANCE') navigate('/tech/dashboard');
                else if (role === 'MANAGER') navigate('/manager/dashboard');
                else navigate('/dashboard');
            } catch { navigate('/tenant/dashboard'); }
        } catch { setError('Invalid username or password'); }
        finally { setIsLoading(false); }
    };

    return (
        <div className={'min-h-screen flex items-center justify-center p-4 relative overflow-hidden ' + c.bg}>
            <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl opacity-20 bg-amber-500 pointer-events-none" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl opacity-10 bg-blue-500 pointer-events-none" />

            <div className="absolute top-6 right-6 z-20"><ThemeToggle /></div>
            <Link to="/" className={'absolute top-6 left-6 z-20 flex items-center gap-2 text-sm ' + c.textSec}>
                <ArrowLeft size={16} /> Browse Properties
            </Link>

            <div className="relative w-full max-w-[420px] fade-in">
                <div className={'rounded-2xl overflow-hidden border ' + c.card + ' ' + c.border + ' ' + c.shadow}>
                    <div className="relative p-10 text-center border-b border-amber-500/10">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 via-transparent to-blue-900/10" />
                        <div className="relative">
                            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 mb-5">
                                <Building className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                <span className={c.heading}>Prop</span>
                                <span className="gold-shimmer">AI</span>
                                <span className={c.heading}> OS</span>
                            </h1>
                            <p className={'text-sm mt-2 ' + c.textMut}>Dubai Property Management Platform</p>
                        </div>
                    </div>

                    <div className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className={'block text-xs font-semibold uppercase tracking-wider mb-2 ' + c.textMut}>Username</label>
                                <div className="relative">
                                    <Mail className={'absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ' + c.textMut} />
                                    <input name="username" type="text" value={formData.username} onChange={handleChange}
                                        className={'w-full pl-11 pr-4 py-3.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 border ' + c.input + ' ' + c.text}
                                        placeholder="Enter username" required />
                                </div>
                            </div>
                            <div>
                                <label className={'block text-xs font-semibold uppercase tracking-wider mb-2 ' + c.textMut}>Password</label>
                                <div className="relative">
                                    <Lock className={'absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ' + c.textMut} />
                                    <input name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleChange}
                                        className={'w-full pl-11 pr-12 py-3.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 border ' + c.input + ' ' + c.text}
                                        placeholder="Enter password" required />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                        className={'absolute right-3.5 top-1/2 -translate-y-1/2 ' + c.textMut}>
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            {error && (
                                <div className={'flex items-center gap-2 text-sm p-3.5 rounded-xl border ' + c.redBg}>
                                    <AlertCircle size={16} /> <span>{error}</span>
                                </div>
                            )}
                            <button type="submit" disabled={isLoading}
                                className={'w-full py-3.5 rounded-xl font-bold text-sm shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] ' + (isLoading ? 'bg-gray-600 cursor-not-allowed text-gray-300' : c.btn + ' shadow-amber-500/20')}>
                                {isLoading ? 'Signing in...' : 'Sign In'}
                            </button>
                            <Link to="/" className={'w-full py-3 rounded-xl font-semibold text-sm transition text-center block border ' + c.btn2}>
                                Browse Available Properties
                            </Link>
                        </form>
                        <div className={'mt-8 pt-5 border-t text-center ' + c.border}>
                            <p className={'text-xs ' + c.textMut}>Secured by <span className={c.accent + ' font-semibold'}>PropAI OS</span></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;