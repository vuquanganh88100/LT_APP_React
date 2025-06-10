import axios from 'axios';

const BASE_URL = 'http://192.168.90.100:8484'; 
const instance = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Xử lý lỗi chung
const handleError = (error, errorCallback) => {
  const message = error?.response?.data || error.message || 'Unknown Error';
  if (errorCallback) {
    errorCallback(message);
  } else {
    console.error('API Error:', message);
  }
};

// ✅ Các phương thức call API

export const getRequest = async (
  url = '',
  params = {},
  successCallback,
  errorCallback,
  config = {}
) => {
  try {
    const res = await instance.get(url, { params, ...config });
    if (successCallback) successCallback(res.data);
    return res.data;
  } catch (error) {
    handleError(error, errorCallback);
    throw error;
  }
};

export const postRequest = async (
  url = '',
  data = {},
  successCallback,
  errorCallback,
  config = {}
) => {
  try {
    const res = await instance.post(url, data, config);
    if (successCallback) successCallback(res.data);
    return res.data;
  } catch (error) {
    handleError(error, errorCallback);
    throw error;
  }
};

export const putRequest = async (
  url = '',
  data = {},
  successCallback,
  errorCallback,
  config = {}
) => {
  try {
    const res = await instance.put(url, data, config);
    if (successCallback) successCallback(res.data);
    return res.data;
  } catch (error) {
    handleError(error, errorCallback);
    throw error;
  }
};

export const deleteRequest = async (
  url = '',
  params = {},
  successCallback,
  errorCallback,
  config = {}
) => {
  try {
    const res = await instance.delete(url, { params, ...config });
    if (successCallback) successCallback(res.data);
    return res.data;
  } catch (error) {
    handleError(error, errorCallback);
    throw error;
  }
};
