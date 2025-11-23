import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach the token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const signup = async (userData) => {
  const response = await api.post('/auth/signup', userData);
  return response.data;
};

export const getPatientDates = async (patientId) => {
  const response = await api.get(`/dashboard/patient-dates/${patientId}`);
  return response.data;
};

export const getPatientAnalysis = async (patientId, timestamp = null) => {
  const url = `/dashboard/patient-analysis/${patientId}`;
  const params = timestamp ? { timestamp } : {};
  const response = await api.get(url, { params });
  return response.data;
};

export default api;
