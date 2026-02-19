import { useNavigate } from 'react-router-dom';

function Unauthorized() {
    const navigate = useNavigate();

    return (
        <div className="flex h-screen items-center justify-center bg-gray-900 text-white p-4">
            <div className="max-w-md w-full bg-gray-800 p-8 rounded-xl shadow-2xl border border-red-500/30 text-center">
                <div className="mx-auto w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                    <span className="text-3xl">🚫</span>
                </div>
                
                <h1 className="text-3xl font-bold text-red-500 mb-2">Access Denied</h1>
                <p className="text-gray-400 mb-6">
                    You do not have permission to view this page.
                </p>

                <div className="flex flex-col gap-3">
                    <button 
                        onClick={() => navigate(-1)}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition"
                    >
                        Go Back
                    </button>
                    
                    <button 
                        onClick={() => {
                            localStorage.clear();
                            navigate('/login');
                        }}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition"
                    >
                        Logout & Switch Account
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Unauthorized;