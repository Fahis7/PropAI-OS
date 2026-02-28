import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useTheme } from '../../context/ThemeContext';
import { Camera, Upload, ArrowLeft, Loader } from 'lucide-react';

const NewRequestForm = () => {
    const { c } = useTheme();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState(null);
    const [profileLoading, setProfileLoading] = useState(true);

    useEffect(() => { api.get('me/').then(r => setProfile(r.data)).catch(e => console.error(e)).finally(() => setProfileLoading(false)); }, []);

    const handleImageChange = (e) => { const f = e.target.files[0]; if (f) { setImage(f); setPreview(URL.createObjectURL(f)); } };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!profile?.unit?.id) { alert("No unit found."); return; }
        setLoading(true);
        const fd = new FormData();
        fd.append('title', title); fd.append('description', description); fd.append('unit', profile.unit.id); fd.append('priority', 'LOW'); fd.append('source', 'TENANT');
        if (image) fd.append('image', image);
        try { await api.post('maintenance/', fd, { headers: { 'Content-Type': 'multipart/form-data' } }); navigate('/tenant/dashboard'); }
        catch (err) { alert(err.response?.data ? JSON.stringify(err.response.data) : "Failed to submit."); }
        finally { setLoading(false); }
    };

    if (profileLoading) return <div className={'min-h-screen flex items-center justify-center ' + c.bg}><Loader className={'animate-spin ' + c.accent} size={48} /></div>;

    return (
        <div className={'min-h-screen p-6 font-sans ' + c.bg + ' ' + c.text}>
            <header className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate(-1)} className={'p-2 rounded-xl border transition ' + c.btn2}><ArrowLeft size={20} /></button>
                <h1 className={'text-xl font-extrabold ' + c.heading}>New Maintenance Request</h1>
            </header>
            {profile?.unit && (
                <div className={'max-w-lg mx-auto mb-6 rounded-xl p-4 border ' + c.card + ' ' + c.border}>
                    <p className={'text-xs uppercase font-bold ' + c.textMut}>Reporting for</p>
                    <p className={'font-semibold ' + c.heading}>{profile.unit.property + ' — Unit ' + profile.unit.number}</p>
                </div>
            )}
            <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-6">
                <div>
                    <label className={'block text-sm font-medium mb-2 ' + c.textSec}>Issue Title</label>
                    <input type="text" required className={'w-full border rounded-xl p-4 text-sm focus:ring-2 focus:ring-amber-500/50 focus:outline-none ' + c.input + ' ' + c.text}
                        placeholder="e.g., Leaking AC in Bedroom" value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div>
                    <label className={'block text-sm font-medium mb-2 ' + c.textSec}>Description</label>
                    <textarea required rows="4" className={'w-full border rounded-xl p-4 text-sm focus:ring-2 focus:ring-amber-500/50 focus:outline-none resize-none ' + c.input + ' ' + c.text}
                        placeholder="Describe the problem in detail..." value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
                <div>
                    <label className={'block text-sm font-medium mb-2 ' + c.textSec}>Photo Evidence (For AI Analysis)</label>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="image-upload" />
                    <label htmlFor="image-upload"
                        className={'flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-2xl cursor-pointer transition ' + c.border + ' ' + (preview ? 'border-amber-500' : '')}>
                        {preview ? <img src={preview} alt="Preview" className="h-full w-full object-cover rounded-2xl opacity-60" /> :
                            <div className={'flex flex-col items-center ' + c.textMut}><Camera size={32} className="mb-2" /><span className="text-sm">Tap to take photo or upload</span></div>}
                    </label>
                </div>
                <button type="submit" disabled={loading || !profile?.unit}
                    className={c.btn + ' w-full font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50 transition'}>
                    {loading ? <Loader className="animate-spin" size={20} /> : <Upload size={20} />}
                    {loading ? 'AI is Analyzing...' : 'Submit Request'}
                </button>
            </form>
        </div>
    );
};

export default NewRequestForm;