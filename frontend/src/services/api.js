import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error.response?.data;
    let message = data?.message || error.message || 'Request failed';

    // Surface express-validator details when present
    if (Array.isArray(data?.error) && data.error.length) {
      message = data.error.map((e) => e.msg).filter(Boolean).join('. ');
    } else if (typeof data?.error === 'string' && data.error && data.error !== message) {
      message = `${message}: ${data.error}`;
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
