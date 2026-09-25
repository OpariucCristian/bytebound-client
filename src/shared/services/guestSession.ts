import { API_BASE_URL } from "./apiConfig";

/** A no-account session issued by the server (`POST guest/session`). */
export interface GuestSession {
  token: string;
  /** Unix time in milliseconds. */
  expiresAt: number;
  playerId: string;
  username: string;
}

const STORAGE_KEY = "bytebound.guest";
/** Treat a token as expired a little early so a run doesn't die mid-question. */
const EXPIRY_MARGIN_MS = 5 * 60 * 1000;

const listeners = new Set<() => void>();

const read = (): GuestSession | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as GuestSession;
    if (!session.token || session.expiresAt - EXPIRY_MARGIN_MS < Date.now()) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
};

let current: GuestSession | null = read();

const emit = () => listeners.forEach((listener) => listener());

export const guestSession = {
  get: (): GuestSession | null => {
    if (current && current.expiresAt - EXPIRY_MARGIN_MS < Date.now()) {
      guestSession.clear();
    }
    return current;
  },

  getToken: (): string | null => guestSession.get()?.token ?? null,

  set: (session: GuestSession) => {
    current = session;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch {
      // Private mode: the session still lasts for this tab.
    }
    emit();
  },

  clear: () => {
    if (!current) return;
    current = null;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Nothing stored to remove.
    }
    emit();
  },

  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

/** Asks the server for a guest player and token, and stores them. */
export const startGuestSession = async (): Promise<GuestSession> => {
  const response = await fetch(`${API_BASE_URL}guest/session`, {
    method: "POST",
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error("Too many guest runs from this network. Try again in a while, or sign in.");
    }
    throw new Error(`The server couldn't start a guest run (${response.status}).`);
  }

  const session = (await response.json()) as GuestSession;
  guestSession.set(session);
  return session;
};
