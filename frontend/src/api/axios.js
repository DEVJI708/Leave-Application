// =============================================
// src/api/axios.js
// Axios instance configuration with base API URL
// =============================================

import axios from 'axios';

// Create an Axios instance configured with the backend base URL
const API = axios.create({
  baseURL: 'http://localhost:5000/api', // Backend API URL
});

// ---- Request Interceptor ----
// Automatically attach JWT authorization token to every outgoing request
API.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token'); // Retrieve token from sessionStorage (per tab)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // Attach token to Authorization header
  }
  return config;
});

export default API;
