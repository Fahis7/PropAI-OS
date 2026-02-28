import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { ShieldX } from 'lucide-react';

function Unauthorized() {
    const navigate = useNavigate();
    const { c } = useTheme();

    return (
        <div className={'flex h-screen items-center justify-center p-4 ' + c.bg}>
            <div className={'max-w-md w-full p-8 rounded-2xl border text-center ' + c.card + ' ' + c.border + ' ' + c.shadow}>
                <div className={'mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4 border ' + c.redBg}>
                    <ShieldX size={32} />
                </div>
                <h1 className={'text-2xl font-extrabold mb-2 ' + c.red}>Access Denied</h1>
                <p className={c.textSec + ' mb-6 text-sm'}>You do not have permission to view this page.</p>
                <div className="flex flex-col gap-3">
                    <button onClick={() => navigate(-1)}
                        className={c.btn2 + ' px-4 py-2.5 rounded-xl text-sm font-bold transition'}>Go Back</button>
                    <button onClick={() => { localStorage.clear(); navigate('/login'); }}
                        className={c.btn + ' px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-amber-500/20 transition'}>
                        Logout & Switch Account
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Unauthorized;