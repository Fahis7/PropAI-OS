import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();
export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    const [isDark, setIsDark] = useState(() => {
        const saved = localStorage.getItem('propai-theme');
        return saved ? saved === 'dark' : true;
    });

    useEffect(() => {
        localStorage.setItem('propai-theme', isDark ? 'dark' : 'light');
        document.documentElement.className = isDark ? 'dark' : 'light';
    }, [isDark]);

    const toggleTheme = () => setIsDark(prev => !prev);

    const d = {
        bg: 'bg-[#0a0e1a]', card: 'bg-[#111827]/80', sidebar: 'bg-[#0d1117]',
        input: 'bg-[#0f172a] border-[#1e293b]', hover: 'hover:bg-[#1e293b]',
        border: 'border-[#1e293b]', text: 'text-gray-100', textSec: 'text-gray-400',
        textMut: 'text-gray-500', heading: 'text-white', accent: 'text-amber-400',
        accentBg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
        btn: 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white',
        btn2: 'bg-[#1e293b] hover:bg-[#334155] text-white border border-[#334155]',
        green: 'text-emerald-400', greenBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
        red: 'text-rose-400', redBg: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
        yellow: 'text-amber-400', yellowBg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
        blue: 'text-sky-400', blueBg: 'bg-sky-500/10 border-sky-500/20 text-sky-400',
        shadow: 'shadow-xl shadow-black/20',
        glass: 'bg-white/5 backdrop-blur-xl border border-white/10',
    };

    const l = {
        bg: 'bg-[#f8f7f4]', card: 'bg-white', sidebar: 'bg-[#1a1a2e]',
        input: 'bg-gray-50 border-gray-200', hover: 'hover:bg-gray-100',
        border: 'border-gray-200', text: 'text-gray-800', textSec: 'text-gray-500',
        textMut: 'text-gray-400', heading: 'text-gray-900', accent: 'text-amber-600',
        accentBg: 'bg-amber-50 border-amber-200 text-amber-700',
        btn: 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white',
        btn2: 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200',
        green: 'text-emerald-600', greenBg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
        red: 'text-rose-600', redBg: 'bg-rose-50 border-rose-200 text-rose-700',
        yellow: 'text-amber-600', yellowBg: 'bg-amber-50 border-amber-200 text-amber-700',
        blue: 'text-sky-600', blueBg: 'bg-sky-50 border-sky-200 text-sky-700',
        shadow: 'shadow-lg shadow-gray-200/50',
        glass: 'bg-white/80 backdrop-blur-xl border border-gray-200',
    };

    const c = isDark ? d : l;

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme, c }}>
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeContext;