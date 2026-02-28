import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useTheme } from '../../context/ThemeContext';
import { Camera, Upload, ArrowLeft, Loader, CheckCircle, Wrench, ArrowRight } from 'lucide-react';

const NewRequestForm = () => {
    const { c, isDark } = useTheme();
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [submitted, setSubmitted] = useState(false);
    const [result, setResult] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try { const res = await api.get('me/'); setProfile(res.data); }
            catch (err) { console.error("Failed to load profile", err); }
            finally { setProfileLoading(false); }
        };
        fetchProfile();
    }, []);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) { setImage(file); setPreview(URL.createObjectURL(file)); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!profile?.unit?.id) { alert("No unit found for your profile. Please contact management."); return; }
        setLoading(true);
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('unit', profile.unit.id);
        formData.append('priority', 'LOW');
        formData.append('source', 'TENANT');
        if (image) formData.append('image', image);

        try {
            const res = await api.post('maintenance/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setResult(res.data);
            setSubmitted(true);
        } catch (err) {
            const errorMsg = err.response?.data ? JSON.stringify(err.response.data) : "Failed to submit request.";
            alert(errorMsg);
        } finally { setLoading(false); }
    };

    if (profileLoading) return (
        <div className={"min-h-screen flex items-center justify-center " + c.bg}>
            <Loader className={"animate-spin " + c.accent} size={48} />
        </div>
    );

    // ═══ SUCCESS SCREEN ═══
    if (submitted) return (
        <div className={"min-h-screen flex items-center justify-center p-6 " + c.bg}>
            <div className="text-center max-w-sm mx-auto fade-in">
                <div className="relative inline-block mb-6">
                    <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto border-2 border-emerald-500/30">
                        <CheckCircle size={48} className="text-emerald-400" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/30">
                        <Wrench size={16} className={c.accent} />
                    </div>
                </div>
                <h2 className={"text-2xl font-extrabold mb-2 " + c.heading}>Request Submitted!</h2>
                <p className={"text-sm mb-1 " + c.textSec}>Our AI has analyzed your issue and assigned it to the right technician.</p>
                <p className={"text-xs mb-8 " + c.textMut}>You'll receive a notification when there's an update.</p>

                <div className={"rounded-2xl border p-4 mb-6 text-left " + c.card + " " + c.border}>
                    <p className={"text-[10px] uppercase font-bold mb-3 " + c.textMut}>AI Analysis</p>
                    <p className={"text-sm font-bold " + c.heading}>{result?.title || title}</p>
                    <p className={"text-xs mt-1 " + c.textSec}>{profile?.unit?.property} — Unit {profile?.unit?.number}</p>

                    <div className="flex flex-wrap gap-2 mt-4">
                        {result?.priority && (
                            <span className={"inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border " +
                                (result.priority === 'EMERGENCY' ? c.redBg :
                                 result.priority === 'HIGH' ? c.yellowBg :
                                 result.priority === 'MEDIUM' ? c.blueBg : c.greenBg)}>
                                {result.priority === 'EMERGENCY' ? '🚨' : result.priority === 'HIGH' ? '⚠️' : result.priority === 'MEDIUM' ? '🔶' : '✅'}
                                {' Priority: ' + result.priority}
                            </span>
                        )}
                        {result?.ai_category && result.ai_category !== 'GENERAL' && (
                            <span className={"inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border " + c.blueBg}>
                                🔧 {result.ai_category}
                            </span>
                        )}
                    </div>

                    {result?.assigned_to_name && (
                        <p className={"text-xs mt-3 " + c.textSec}>
                            👷 Assigned to: <span className={"font-bold " + c.heading}>{result.assigned_to_name}</span>
                        </p>
                    )}
                </div>

                <div className="flex gap-3">
                    <button onClick={() => navigate('/tenant/maintenance/history')}
                        className={"flex-1 py-3 rounded-xl font-bold text-sm transition border " + c.btn2}>
                        View All Tickets
                    </button>
                    <button onClick={() => navigate('/tenant/dashboard')}
                        className={"flex-1 py-3 rounded-xl font-bold text-sm transition flex items-center justify-center gap-1 shadow-lg shadow-amber-500/20 " + c.btn}>
                        Home <ArrowRight size={14} />
                    </button>
                </div>
            </div>
        </div>
    );

    // ═══ FORM ═══
    return (
        <div className={"min-h-screen p-6 pb-28 font-sans " + c.bg + " " + c.text}>
            <header className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate(-1)} className={"p-2 rounded-xl transition border " + c.btn2}>
                    <ArrowLeft size={20} />
                </button>
                <h1 className={"text-xl font-bold " + c.heading}>New Maintenance Request</h1>
            </header>

            {profile?.unit && (
                <div className={"max-w-lg mx-auto mb-6 rounded-xl p-4 border " + c.card + " " + c.border}>
                    <p className={"text-xs uppercase font-bold " + c.textMut}>Reporting for</p>
                    <p className={"font-semibold " + c.heading}>{profile.unit.property} — Unit {profile.unit.number}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-6">
                <div>
                    <label className={"block text-sm font-medium mb-2 " + c.textSec}>Issue Title</label>
                    <input type="text" required placeholder="e.g., Leaking AC in Bedroom"
                        value={title} onChange={(e) => setTitle(e.target.value)}
                        className={"w-full rounded-xl p-4 text-sm focus:ring-2 focus:ring-amber-500/50 focus:outline-none border " + c.input + " " + c.text} />
                </div>

                <div>
                    <label className={"block text-sm font-medium mb-2 " + c.textSec}>Description</label>
                    <textarea required rows="4" placeholder="Describe the problem in detail..."
                        value={description} onChange={(e) => setDescription(e.target.value)}
                        className={"w-full rounded-xl p-4 text-sm focus:ring-2 focus:ring-amber-500/50 focus:outline-none border resize-none " + c.input + " " + c.text} />
                </div>

                <div>
                    <label className={"block text-sm font-medium mb-2 " + c.textSec}>Photo Evidence (For AI Analysis)</label>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="image-upload" />
                    <label htmlFor="image-upload"
                        className={"flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-2xl cursor-pointer transition " +
                            (preview ? "border-amber-500 " + c.card : c.border + " " + (isDark ? "hover:bg-white/[0.02]" : "hover:bg-gray-50"))}>
                        {preview ? (
                            <img src={preview} alt="Preview" className="h-full w-full object-cover rounded-2xl opacity-60" />
                        ) : (
                            <div className={"flex flex-col items-center " + c.textMut}>
                                <Camera size={32} className="mb-2" />
                                <span className="text-sm">Tap to take photo or upload</span>
                            </div>
                        )}
                    </label>
                </div>

                <button type="submit" disabled={loading || !profile?.unit}
                    className={c.btn + " w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-lg shadow-amber-500/20"}>
                    {loading ? <Loader className="animate-spin" size={20} /> : <Upload size={20} />}
                    {loading ? 'AI is Analyzing...' : 'Submit Request'}
                </button>
            </form>
        </div>
    );
};

export default NewRequestForm;