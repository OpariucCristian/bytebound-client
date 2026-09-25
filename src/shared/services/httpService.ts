import { getToken } from "@clerk/react";
import { API_BASE_URL } from "./apiConfig";
import { guestSession } from "./guestSession";
import { waitForServer } from "./serverStatus";

export { API_BASE_URL };

// Clerk refreshes the short-lived session token as needed. Signed-out players
// may be on a guest session instead.
export const getAuthToken = async (): Promise<string | null> =>
  (await getToken().catch(() => null)) ?? guestSession.getToken();

const buildHeaders = async (): Promise<Headers> => {
  const headers = new Headers();
  headers.set("Content-Type", "application/json");

  const token = await getAuthToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return headers;
};

/** A failed API call, with a message fit to show to players. */
export class ApiError extends Error {
  constructor(
    message: string,
    /** HTTP status, or 0 when the server couldn't be reached at all. */
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const describeFailure = (status: number, serverMessage?: string): string => {
  if (status === 401) return "Your session has expired. Sign in again to keep playing.";
  if (status === 429) return serverMessage || "Too many requests. Wait a moment and try again.";
  if (status >= 500) return "The game server hit a problem. Try again in a moment.";
  return serverMessage || `The request failed (${status}).`;
};

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    let serverMessage: string | undefined;
    try {
      const errorData = await response.json();
      const message = errorData.message ?? errorData.error;
      serverMessage = Array.isArray(message) ? message.join(", ") : message;
    } catch {
      // No JSON body; the status decides the message.
    }

    // A guest token only lasts a day. Dropping it sends the player back to
    // the title screen instead of leaving every request failing.
    if (response.status === 401 && guestSession.get()) {
      guestSession.clear();
    }

    throw new ApiError(describeFailure(response.status, serverMessage), response.status);
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

/** Waits out a cold start, then sends the request. */
const request = async (url: string, init: RequestInit): Promise<Response> => {
  await waitForServer();
  try {
    return await fetch(url, init);
  } catch {
    throw new ApiError(
      "Can't reach the game server. Check your connection and try again.",
      0,
    );
  }
};

export const httpService = {
  get: async <T>(endpoint: string): Promise<T> => {
    const headers = await buildHeaders();
    const response = await request(`${API_BASE_URL}${endpoint}`, {
      method: "GET",
      headers,
    });
    return handleResponse<T>(response);
  },

  post: async <T, D = unknown>(endpoint: string, data?: D): Promise<T> => {
    const headers = await buildHeaders();
    const response = await request(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
    return handleResponse<T>(response);
  },

  put: async <T, D = unknown>(endpoint: string, data?: D): Promise<T> => {
    const headers = await buildHeaders();
    const response = await request(`${API_BASE_URL}${endpoint}`, {
      method: "PUT",
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
    return handleResponse<T>(response);
  },

  patch: async <T, D = unknown>(endpoint: string, data?: D): Promise<T> => {
    const headers = await buildHeaders();
    const response = await request(`${API_BASE_URL}${endpoint}`, {
      method: "PATCH",
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
    return handleResponse<T>(response);
  },

  delete: async <T>(endpoint: string): Promise<T> => {
    const headers = await buildHeaders();
    const response = await request(`${API_BASE_URL}${endpoint}`, {
      method: "DELETE",
      headers,
    });
    return handleResponse<T>(response);
  },
};
