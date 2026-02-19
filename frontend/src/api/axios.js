import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api/',
    headers: {
        'Content-Type': 'application/json',
    },
});

// --- 1. REQUEST INTERCEPTOR (Attaches Token) ---
api.interceptors.request.use((config) => {
    // 👇 FIX: Use the correct key 'access_token' to match your Login page
    const token = localStorage.getItem('access_token'); 
    
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// --- 2. RESPONSE INTERCEPTOR (Handles Expired Tokens) ---
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 (Unauthorized) and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                // 👇 FIX: Use the correct key 'refresh_token'
                const refreshToken = localStorage.getItem('refresh_token'); 
                
                if (!refreshToken) throw new Error("No refresh token available");

                const response = await axios.post('http://localhost:8000/api/token/refresh/', {
                    refresh: refreshToken,
                });

                // 👇 FIX: Save the new token with the correct key 'access_token'
                localStorage.setItem('access_token', response.data.access);

                // Retry the original request with the new token
                api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
                originalRequest.headers['Authorization'] = `Bearer ${response.data.access}`;
                
                return api(originalRequest);

            } catch (refreshError) {
                console.log("Session expired. Please login again.");
                localStorage.clear();
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;