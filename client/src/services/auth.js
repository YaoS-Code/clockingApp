import api from './api';
import { setCredentials, logout } from '../store/authSlice';

export const login = async (dispatch, credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    dispatch(setCredentials(response.data));
  } catch (error) {
    throw error.response?.data?.error || 'Login failed';
  }
};

export const register = async (userData) => {
  try {
    await api.post('/auth/register', userData);
  } catch (error) {
    throw error.response?.data?.error || 'Registration failed';
  }
};

export const logoutUser = (dispatch) => {
  dispatch(logout());
};