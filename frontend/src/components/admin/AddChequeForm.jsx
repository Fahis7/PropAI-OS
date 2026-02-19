import { useState, useEffect } from 'react';
import api from '../../api/axios';

function AddChequeForm({ onSuccess, onCancel }) {
    const [tenants, setTenants] = useState([]);
    const [debugMsg, setDebugMsg] = useState("Loading tenants..."); 
    
    const [formData, setFormData] = useState({
        tenant: '',
        amount: '',
        cheque_number: '',
        cheque_date: '',
        bank_name: '', // 👈 NEW
        status: 'PENDING'
    });
    
    const [chequeImage, setChequeImage] = useState(null); // 👈 NEW: Holds the file

    // 1. Fetch Tenants
    useEffect(() => {
        api.get('tenants/')
            .then(res => {
                let dataList = [];
                if (Array.isArray(res.data)) dataList = res.data;
                else if (res.data.results) dataList = res.data.results;
                setTenants(dataList);
                setDebugMsg(`Found ${dataList.length} tenants.`);
            })
            .catch(err => {
                console.error(err);
                setDebugMsg("Error loading data! Check Console.");
            });
    }, []);

    // 2. Handle Text Changes
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // 3. Handle File Selection
    const handleFileChange = (e) => {
        setChequeImage(e.target.files[0]); // Store the file object
    };

    // 4. Submit with "FormData" (Required for Images)
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Create a special package for the file + text
        const data = new FormData();
        data.append('tenant', formData.tenant);
        data.append('amount', formData.amount);
        data.append('cheque_number', formData.cheque_number);
        data.append('cheque_date', formData.cheque_date);
        data.append('bank_name', formData.bank_name);
        data.append('status', formData.status);
        
        if (chequeImage) {
            data.append('image', chequeImage); // Attach the file
        }

        try {
            await api.post('cheques/', data, {
                headers: { 'Content-Type': 'multipart/form-data' } // 👈 Tell Backend it's a file
            });
            onSuccess(); 
        } catch (error) {
            console.error("Full Error:", error);
            if (error.response && error.response.data) {
                alert("Error: " + JSON.stringify(error.response.data));
            } else {
                alert('Error adding cheque.');
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-96 border border-gray-600">
                <h2 className="text-xl font-bold text-white mb-2">New Cheque Entry</h2>
                <p className="text-xs text-yellow-400 mb-4 font-mono pb-2 border-b border-gray-700">
                    System: {debugMsg}
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    {/* Tenant */}
                    <select name="tenant" onChange={handleChange} required className="p-2 bg-gray-700 text-white rounded border border-gray-600">
                        <option value="">Select Tenant...</option>
                        {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>

                    {/* Bank Name (NEW) */}
                    <input type="text" name="bank_name" placeholder="Bank Name (e.g. ADCB)" 
                        onChange={handleChange} className="p-2 bg-gray-700 text-white rounded border border-gray-600" />

                    {/* Amount & Number */}
                    <div className="flex gap-2">
                        <input type="number" name="amount" placeholder="Amount (AED)" required 
                            onChange={handleChange} className="w-1/2 p-2 bg-gray-700 text-white rounded border border-gray-600" />
                        
                        <input type="text" name="cheque_number" placeholder="Chq No." required 
                            onChange={handleChange} className="w-1/2 p-2 bg-gray-700 text-white rounded border border-gray-600" />
                    </div>

                    {/* Date */}
                    <p className="text-xs text-gray-400">Cheque Date:</p>
                    <input type="date" name="cheque_date" required 
                        onChange={handleChange} className="p-2 bg-gray-700 text-white rounded border border-gray-600" />

                    {/* Image Upload (NEW) */}
                    <p className="text-xs text-gray-400">Cheque Photo:</p>
                    <input type="file" accept="image/*" onChange={handleFileChange} 
                        className="text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-gray-700 file:text-white hover:file:bg-gray-600"/>

                    {/* Buttons */}
                    <div className="flex justify-between mt-4">
                        <button type="button" onClick={onCancel} className="text-gray-400 hover:text-white">Cancel</button>
                        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-500">Save Cheque</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddChequeForm;