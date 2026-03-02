import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

function Unauthorized() {
    const { c } = useTheme();
    const navigate = useNavigate();

    return (
        <div className={"flex h-screen items-center justify-center p-4 " + c.bg}>
            <div className={"max-w-md w-full p-8 rounded-2xl text-center border " + c.card + " " + c.shadow + " border-rose-500/30"}>
                <div className="mx-auto w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mb-4">
                    <span className="text-3xl">🚫</span>
                </div>
                <h1 className={c.red + " text-3xl font-bold mb-2"}>Access Denied</h1>
                <p className={c.textSec + " mb-6"}>You do not have permission to view this page.</p>
                <div className="flex flex-col gap-3">
                    <button onClick={() => navigate(-1)}
                        className={"px-4 py-2 rounded-xl text-sm font-medium transition border " + c.btn2}>Go Back</button>
                    <button onClick={() => { localStorage.clear(); navigate('/login'); }}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-medium transition">
                        Logout & Switch Account
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Unauthorized;