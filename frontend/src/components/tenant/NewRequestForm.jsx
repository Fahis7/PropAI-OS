import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Camera, Upload, ArrowLeft, Loader } from 'lucide-react';

const NewRequestForm = () => {
    const navigate = useNavigate();
    
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState(null);
    const [profileLoading, setProfileLoading] = useState(true);

    // 🔧 FIX: Fetch tenant profile to get unit_id and tenant_id
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('me/');
                setProfile(res.data);
            } catch (err) {
                console.error("Failed to load profile", err);
            } finally {
                setProfileLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!profile?.unit?.id) {
            alert("No unit found for your profile. Please contact management.");
            return;
        }

        setLoading(true);

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('unit', profile.unit.id);       // 🔧 FIX: Send unit ID
        formData.append('priority', 'LOW');
        formData.append('source', 'TENANT');
        
        if (image) {
            formData.append('image', image);
        }

        try {
            await api.post('maintenance/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            navigate('/tenant/dashboard');
        } catch (err) {
            console.error("Upload failed", err);
            const errorMsg = err.response?.data 
                ? JSON.stringify(err.response.data) 
                : "Failed to submit request.";
            alert(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    if (profileLoading) return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center text-blue-500">
            <Loader className="animate-spin" size={48} />
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-6 font-sans">
            <header className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate(-1)} className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700">
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-xl font-bold">New Maintenance Request</h1>
            </header>

            {/* Show current unit info */}
            {profile?.unit && (
                <div className="max-w-lg mx-auto mb-6 bg-gray-800 border border-gray-700 rounded-xl p-4">
                    <p className="text-xs text-gray-400 uppercase font-bold">Reporting for</p>
                    <p className="text-white font-semibold">{profile.unit.property} — Unit {profile.unit.number}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-6">
                
                {/* Title Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Issue Title</label>
                    <input 
                        type="text" 
                        required
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="e.g., Leaking AC in Bedroom"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                {/* Description Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                    <textarea 
                        required
                        rows="4"
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Describe the problem in detail..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                {/* Image Upload Area */}
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Photo Evidence (For AI Analysis)</label>
                    <div className="relative">
                        <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden" 
                            id="image-upload"
                        />
                        <label 
                            htmlFor="image-upload" 
                            className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-2xl cursor-pointer transition-colors ${preview ? 'border-blue-500 bg-gray-800' : 'border-gray-600 hover:bg-gray-800'}`}
                        >
                            {preview ? (
                                <img src={preview} alt="Preview" className="h-full w-full object-cover rounded-2xl opacity-50" />
                            ) : (
                                <div className="flex flex-col items-center text-gray-400">
                                    <Camera size={32} className="mb-2" />
                                    <span className="text-sm">Tap to take photo or upload</span>
                                </div>
                            )}
                        </label>
                    </div>
                </div>

                {/* Submit Button */}
                <button 
                    type="submit" 
                    disabled={loading || !profile?.unit}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                    {loading ? <Loader className="animate-spin" /> : <Upload size={20} />}
                    {loading ? 'AI is Analyzing...' : 'Submit Request'}
                </button>
            </form>
        </div>
    );
};

export default NewRequestForm;