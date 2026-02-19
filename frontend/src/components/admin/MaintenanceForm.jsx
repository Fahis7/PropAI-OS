import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { X, Save, AlertTriangle, Upload, Image as ImageIcon } from 'lucide-react'; // 👈 Added Icons

function MaintenanceForm({ onSuccess, onCancel }) {
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // 👇 Changing state to handle Image separately
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [unit, setUnit] = useState('');
    const [priority, setPriority] = useState('MEDIUM');
    const [status, setStatus] = useState('OPEN');
    const [image, setImage] = useState(null); // 👈 Store the file
    const [preview, setPreview] = useState(null); // 👈 For showing the picture

    useEffect(() => {
        const fetchUnits = async () => {
            try {
                const res = await api.get('units/');
                setUnits(res.data);
            } catch (error) {
                console.error("Failed to load units");
            } finally {
                setLoading(false);
            }
        };
        fetchUnits();
    }, []);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file)); // Show preview immediately
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // 👇 VITAL: Use FormData for File Uploads
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('unit', unit);
        formData.append('priority', priority);
        formData.append('status', status);
        formData.append('source', 'ADMIN'); // Manually created by Admin
        if (image) {
            formData.append('image', image);
        }

        try {
            await api.post('maintenance/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' } // 👈 Required for files
            });
            onSuccess();
        } catch (error) {
            alert("Failed to create ticket.");
            console.error(error);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg w-full max-w-md p-6 relative border border-gray-700 shadow-2xl max-h-[90vh] overflow-y-auto">
                <button onClick={onCancel} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                    <X size={24} />
                </button>

                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <AlertTriangle className="text-yellow-500" /> Report Issue
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Title */}
                    <div>
                        <label className="block text-gray-400 text-sm mb-1">Issue Title</label>
                        <input 
                            type="text" required placeholder="e.g. Leaking Pipe"
                            className="w-full bg-gray-700 text-white p-3 rounded border border-gray-600 outline-none focus:border-blue-500"
                            value={title} onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    {/* Unit */}
                    <div>
                        <label className="block text-gray-400 text-sm mb-1">Unit</label>
                        <select 
                            required className="w-full bg-gray-700 text-white p-3 rounded border border-gray-600 outline-none focus:border-blue-500"
                            value={unit} onChange={(e) => setUnit(e.target.value)}
                        >
                            <option value="">Select Unit</option>
                            {units.map(u => (
                                <option key={u.id} value={u.id}>{u.unit_number} - {u.property_name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Image Upload Field (The AI Input!) */}
                    <div>
                        <label className="block text-gray-400 text-sm mb-2">Upload Evidence</label>
                        <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center hover:border-blue-500 transition relative">
                            <input 
                                type="file" 
                                accept="image/*"
                                onChange={handleImageChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            {preview ? (
                                <div className="relative">
                                    <img src={preview} alt="Preview" className="h-32 mx-auto rounded object-cover" />
                                    <p className="text-xs text-green-400 mt-2">Click to change image</p>
                                </div>
                            ) : (
                                <div className="text-gray-400">
                                    <ImageIcon className="mx-auto mb-2" />
                                    <p className="text-sm">Click to upload photo</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Priority & Status */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-400 text-sm mb-1">Priority</label>
                            <select 
                                className="w-full bg-gray-700 text-white p-3 rounded border border-gray-600 outline-none"
                                value={priority} onChange={(e) => setPriority(e.target.value)}
                            >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                                <option value="EMERGENCY">Emergency</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm mb-1">Status</label>
                            <select 
                                className="w-full bg-gray-700 text-white p-3 rounded border border-gray-600 outline-none"
                                value={status} onChange={(e) => setStatus(e.target.value)}
                            >
                                <option value="OPEN">Open</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="RESOLVED">Resolved</option>
                            </select>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-gray-400 text-sm mb-1">Description</label>
                        <textarea 
                            rows="3" required
                            className="w-full bg-gray-700 text-white p-3 rounded border border-gray-600 outline-none focus:border-blue-500"
                            value={description} onChange={(e) => setDescription(e.target.value)}
                        ></textarea>
                    </div>

                    <button 
                        type="submit" 
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded mt-4 transition flex items-center justify-center gap-2"
                    >
                        <Save size={18} /> Submit Ticket
                    </button>
                </form>
            </div>
        </div>
    );
}

export default MaintenanceForm;