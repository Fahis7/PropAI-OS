import { useState } from 'react'
import axios from 'axios'

function AddPropertyForm({ onPropertyAdded }) {
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        city: '',
        state: 'Dubai' // Default value
    })

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault() // Stop page refresh
        try {
            // Send data to Django
            await axios.post('http://localhost:8000/api/properties/', formData)
            
            // Clear form
            setFormData({ name: '', address: '', city: '', state: 'Dubai' })
            
            // Refresh the list
            if (onPropertyAdded) onPropertyAdded()
            
            alert('Property Added Successfully! 🏢')
        } catch (error) {
            console.error('Error adding property:', error)
            alert('Failed to add property. Check the console.')
        }
    }

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">🏗️ Add New Property</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                        type="text"
                        name="name"
                        placeholder="Property Name (e.g. Marina Heights)"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 outline-none"
                        required
                    />
                    <input
                        type="text"
                        name="address"
                        placeholder="Address"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 outline-none"
                        required
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                        type="text"
                        name="city"
                        placeholder="City"
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 outline-none"
                        required
                    />
                    <input
                        type="text"
                        name="state"
                        placeholder="State"
                        value={formData.state}
                        onChange={handleChange}
                        className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 outline-none"
                        required
                    />
                </div>
                <button 
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200"
                >
                    Add Property
                </button>
            </form>
        </div>
    )
}

export default AddPropertyForm