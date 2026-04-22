import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001/api';

export const sendOtp = async (email) => {
  const response = await axios.post(`${API_URL}/otp/send-otp`, { email });
  return response.data;
};

export const verifyOtp = async (email, otp) => {
  const response = await axios.post(`${API_URL}/otp/verify-otp`, { email, otp });
  return response.data;
};
