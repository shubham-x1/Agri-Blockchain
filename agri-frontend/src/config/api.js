const API_BASE_URL = 'http://localhost:5000/api';

export const API_ENDPOINTS = {
  // Farmer endpoints
  FARMER: {
    REGISTER: `${API_BASE_URL}/farmer/register`,
    LOGIN: `${API_BASE_URL}/farmer/login`,
    PROFILE: `${API_BASE_URL}/farmer/profile`,
  },
  // Trader endpoints
  TRADER: {
    REGISTER: `${API_BASE_URL}/trader/register`,
    LOGIN: `${API_BASE_URL}/trader/login`,
    PROFILE: `${API_BASE_URL}/trader/profile`,
  },
  // Transporter endpoints
  TRANSPORTER: {
    REGISTER: `${API_BASE_URL}/transporter/register`,
    LOGIN: `${API_BASE_URL}/transporter/login`,
    PROFILE: `${API_BASE_URL}/transporter/profile`,
  },
  // Order endpoints
  ORDER: {
    CREATE: `${API_BASE_URL}/order/create`,
    LIST: `${API_BASE_URL}/order/list`,
    DETAILS: (orderId) => `${API_BASE_URL}/order/${orderId}`,
    UPDATE: (orderId) => `${API_BASE_URL}/order/${orderId}/update`,
  },
};

export const apiRequest = async (endpoint, method = 'GET', data = null, token = null) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(endpoint, options);
    const responseData = await response.json();

    if (!response.ok) {
      const error = new Error(responseData.message || 'Something went wrong');
      error.status = response.status;
      throw error;
    }

    return responseData;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}; 