import supabase from "@/shared/utils/supabase";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5165/api/";

const getAuthToken = async (): Promise<string | null> => {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || null;
};

const buildHeaders = async (): Promise<Headers> => {
  const headers = new Headers();
  headers.set("Content-Type", "application/json");

  const token = await getAuthToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return headers;
};

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    let errorMessage = `HTTP Error: ${response.status} ${response.statusText}`;

    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      try {
        errorMessage = (await response.text()) || errorMessage;
      } catch(e) {console.log(e)}
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
};

export const httpService = {
  get: async <T>(endpoint: string): Promise<T> => {
    const headers = await buildHeaders();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "GET",
      headers,
    });
    return handleResponse<T>(response);
  },

  post: async <T, D = unknown>(endpoint: string, data?: D): Promise<T> => {
    const headers = await buildHeaders();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
    return handleResponse<T>(response);
  },

  put: async <T, D = unknown>(endpoint: string, data?: D): Promise<T> => {
    const headers = await buildHeaders();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PUT",
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
    return handleResponse<T>(response);
  },

  patch: async <T, D = unknown>(endpoint: string, data?: D): Promise<T> => {
    const headers = await buildHeaders();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PATCH",
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
    return handleResponse<T>(response);
  },

  delete: async <T>(endpoint: string): Promise<T> => {
    const headers = await buildHeaders();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "DELETE",
      headers,
    });
    return handleResponse<T>(response);
  },
};
