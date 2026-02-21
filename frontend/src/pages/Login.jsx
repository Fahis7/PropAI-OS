import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, Building, AlertCircle } from 'lucide-react';
import api from '../api/axios'; 
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode"; // 👈 1. IMPORT THIS

const Login = () => {
  const [formData, setFormData] = useState({
    username: '', 
    password: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(''); 
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(''); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
        // 1. Login Request
        const res = await api.post('token/', { 
            username: formData.username, 
            password: formData.password 
        });

        // 2. Save Tokens
        const accessToken = res.data.access;
        const refreshToken = res.data.refresh;
        
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
        
        // 3. Set Header for future requests
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        
        // 4. Decode Token to Check Role 🧠
        try {
            const decoded = jwtDecode(accessToken);
            const userRole = decoded.role || 'TENANT'; // Default to tenant if missing

            console.log("Logged in as:", userRole); // Debugging

            // 5. Smart Redirect 🔀
            if (userRole === 'TENANT') {
                navigate('/tenant/dashboard');
            } else if (userRole === 'MAINTENANCE') {
                navigate('/tech/dashboard');
            } else {
                navigate('/dashboard');
            }
        } catch (decodeError) {
            console.error("Token decode failed:", decodeError);
            // Fallback if decoding fails (usually shouldn't happen)
            navigate('/tenant/dashboard');
        }

    } catch (err) {
        console.error("Login Failed:", err);
        setError('Invalid Username or Password');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute inset-0 bg-grid-white/5 bg-grid-16 opacity-10"></div>
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
      
      <div className="relative w-full max-w-md">
        
        <div className="relative bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-2xl overflow-hidden">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-900/40 to-blue-900/40 p-8 border-b border-gray-700/50 text-center">
            <div className="flex justify-center mb-4">
                <div className="p-3 bg-gray-800 rounded-full border border-gray-600 shadow-lg">
                    <Building className="w-8 h-8 text-amber-400" />
                </div>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">PropOS AI</h1>
            <p className="text-gray-400 text-sm mt-1">Dubai's Premier Property Ecosystem</p>
          </div>
          
          {/* Login Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Username Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 focus:outline-none transition-all"
                    placeholder="Enter your username"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-12 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 focus:outline-none transition-all"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-900/20 p-3 rounded-lg border border-red-900/50">
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`
                  w-full py-3 px-4 rounded-xl font-bold text-white shadow-lg
                  transition-all duration-200 transform hover:scale-[1.02]
                  ${isLoading 
                    ? 'bg-gray-700 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-amber-600 to-blue-600 hover:from-amber-500 hover:to-blue-500'
                  }
                `}
              >
                {isLoading ? 'Authenticating...' : 'Sign In'}
              </button>

            </form>

            <div className="mt-8 pt-6 border-t border-gray-700/50 text-center">
              <p className="text-xs text-gray-500">
                Protected by <span className="text-blue-400 font-semibold">PropOS Security</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;