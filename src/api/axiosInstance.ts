import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { navigate } from '../navigation/navigationRef';

const axiosInstance = axios.create({
  baseURL: 'http://10.0.2.2:3010',
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
    response => response,
    async (error) => {
      const originalRequest = error.config;
      console.log('Error Response:', error.response?.status);
  
      if (error.response?.status === 403 && !originalRequest._retry) {
        originalRequest._retry = true;
        console.log('Attempting to refresh token...');
        
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        console.log('Stored Refresh Token:', refreshToken);
  
        if (!refreshToken) {
          console.log('No refresh token, logging out...');
          await AsyncStorage.multiRemove(['userToken', 'refreshToken', 'userInfo']);
          navigate('Login');
          return Promise.reject(error);
        }
  
        try {
          const res = await axios.post('http://10.0.2.2:3010/auth/refresh-token', { refreshToken });
          console.log('Refresh Token Response:', res.data);
  
          const newAccessToken = res.data.accessToken;
          await AsyncStorage.setItem('userToken', newAccessToken);
  
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          console.log('Refresh Token Error:', refreshError);
          await AsyncStorage.multiRemove(['userToken', 'refreshToken', 'userInfo']);
          navigate('Login');
          return Promise.reject(refreshError);
        }
      }
  
      return Promise.reject(error);
    }
  );
  

export default axiosInstance;
