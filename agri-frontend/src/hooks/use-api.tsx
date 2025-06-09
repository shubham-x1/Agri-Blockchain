import { useAuth } from './use-auth';
import { apiRequest } from '../config/api';

interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  token?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export const useApi = () => {
  const { token } = useAuth();

  const authenticatedRequest = async <T = any>(
    endpoint: string,
    method = 'GET',
    data: any = null
  ): Promise<ApiResponse<T>> => {
    if (!token) {
      throw new Error('No authentication token available');
    }
    return apiRequest(endpoint, method, data, token) as Promise<ApiResponse<T>>;
  };

  return {
    authenticatedRequest,
  };
}; 