import { useCallback } from 'react';
import supabase from '@/utils/supabase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5165/api/';

interface RequestConfig extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

export const useHttp = () => {
  const getAuthToken = useCallback(async (): Promise<string | null> => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  }, []);

  const buildHeaders = useCallback(async (customHeaders?: HeadersInit): Promise<Headers> => {
    const headers = new Headers(customHeaders);
    
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const token = await getAuthToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }, [getAuthToken]);

  const buildURL = useCallback((endpoint: string, params?: Record<string, string | number | boolean>): string => {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    const url = new URL(cleanEndpoint, API_BASE_URL);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }
    return url.toString();
  }, []);

  const handleResponse = useCallback(async <T,>(response: Response): Promise<T> => {
    if (!response.ok) {
      let errorMessage = `HTTP Error: ${response.status} ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        try {
          errorMessage = await response.text() || errorMessage;
        } catch {
          // Keep the default error message
        }
      }

      throw new Error(errorMessage);
    }

    if (response.status === 204) {
      return null as T;
    }

    try {
      return await response.json();
    } catch {
      return null as T;
    }
  }, []);

  const request = useCallback(async <T,>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> => {
    const { params, headers: customHeaders, ...restConfig } = config;
    
    const url = buildURL(endpoint, params);
    const headers = await buildHeaders(customHeaders);

    const response = await fetch(url, {
      ...restConfig,
      headers,
    });

    return handleResponse<T>(response);
  }, [buildURL, buildHeaders, handleResponse]);

  const get = useCallback(<T,>(endpoint: string, config?: RequestConfig): Promise<T> => {
    return request<T>(endpoint, {
      ...config,
      method: 'GET',
    });
  }, [request]);

  const post = useCallback(<T, D = unknown>(
    endpoint: string,
    data?: D,
    config?: RequestConfig
  ): Promise<T> => {
    return request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }, [request]);

  const put = useCallback(<T, D = unknown>(
    endpoint: string,
    data?: D,
    config?: RequestConfig
  ): Promise<T> => {
    return request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }, [request]);

  const patch = useCallback(<T, D = unknown>(
    endpoint: string,
    data?: D,
    config?: RequestConfig
  ): Promise<T> => {
    return request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }, [request]);

  const del = useCallback(<T,>(endpoint: string, config?: RequestConfig): Promise<T> => {
    return request<T>(endpoint, {
      ...config,
      method: 'DELETE',
    });
  }, [request]);

  return {
    get,
    post,
    put,
    patch,
    delete: del,
  };
};
