import { useState } from 'react';
import api from '../../api/axios';
import { X, Upload, CheckCircle } from 'lucide-react';

function ChequeActionForm({ cheque, onSuccess, onCancel }) {
    const [status, setStatus] = useState(cheque.status);
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append('status', status);
        if (image) {
            formData.append('image', image);
        }

        try {
            // PATCH request to update only specific fields
            await api.patch(`cheques/${cheque.id}/`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            onSuccess();
        } catch (error) {
            console.error(error);
            alert("Failed to update cheque.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg w-full max-w-md p-6 relative border border-gray-700 shadow-2xl">
                <button onClick={onCancel} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                    <X size={24} />
                </button>

                <h2 className="text-xl font-bold text-white mb-1">Process Payment</h2>
                <p className="text-gray-400 text-sm mb-6">Cheque #{cheque.cheque_number} • AED {parseFloat(cheque.amount).toLocaleString()}</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Status Dropdown */}
                    <div>
                        <label className="block text-gray-400 text-sm mb-1">Update Status</label>
                        <select 
                            className="w-full bg-gray-700 text-white p-3 rounded border border-gray-600 focus:border-blue-500 outline-none"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <option value="PENDING">Pending (With Landlord)</option>
                            <option value="DEPOSITED">Deposited (In Bank)</option>
                            <option value="CLEARED">Cleared (Money Received)</option>
                            <option value="BOUNCED">Bounced (Action Required)</option>
                        </select>
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-gray-400 text-sm mb-1">Upload Proof (Optional)</label>
                        <div className="relative border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-gray-500 transition cursor-pointer">
                            <input 
                                type="file" 
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={(e) => setImage(e.target.files[0])}
                            />
                            <div className="flex flex-col items-center">
                                <Upload className="text-gray-400 mb-2" size={24} />
                                <span className="text-gray-300 text-sm">
                                    {image ? image.name : "Click to upload Receipt / Cheque Photo"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded mt-4 transition flex items-center justify-center gap-2"
                    >
                        {loading ? 'Processing...' : <><CheckCircle size={18} /> Update Cheque</>}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ChequeActionForm;