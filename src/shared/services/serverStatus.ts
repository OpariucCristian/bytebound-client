import { useSyncExternalStore } from "react";
import { API_BASE_URL } from "./apiConfig";

/**
 * The API runs on a free tier that sleeps when idle and takes up to a minute to
 * wake. We start waking it as soon as the site opens, and screens show how far
 * along that is instead of failing.
 */
export type ServerState = "checking" | "waking" | "ready" | "unreachable";

export interface ServerStatus {
  state: ServerState;
  /** When the current wake attempt began (ms since epoch). */
  startedAt: number;
}

/** A healthy server answers well within this; slower means it is waking. */
const QUICK_RESPONSE_MS = 1500;
const PING_TIMEOUT_MS = 15000;
const RETRY_DELAY_MS = 3000;
/** Render usually wakes in under a minute; give it some slack. */
const GIVE_UP_AFTER_MS = 120000;
/** A ready server is re-checked after this long before we rely on it again. */
const READY_TTL_MS = 5 * 60 * 1000;

let status: ServerStatus = { state: "checking", startedAt: Date.now() };
let readyAt = 0;
let wakePromise: Promise<boolean> | null = null;
const listeners = new Set<() => void>();

const setStatus = (next: ServerStatus) => {
  status = next;
  listeners.forEach((listener) => listener());
};

const ping = async (): Promise<boolean> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PING_TIMEOUT_MS);
  try {
    const response = await fetch(`${API_BASE_URL}health`, {
      signal: controller.signal,
      cache: "no-store",
    });
    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const runWake = async (): Promise<boolean> => {
  const startedAt = Date.now();
  setStatus({ state: "checking", startedAt });

  // Only call it "waking" if the first answer is slow, so a warm server
  // never flashes a warning.
  const slowTimer = setTimeout(
    () => setStatus({ state: "waking", startedAt }),
    QUICK_RESPONSE_MS,
  );

  try {
    while (Date.now() - startedAt < GIVE_UP_AFTER_MS) {
      if (await ping()) {
        readyAt = Date.now();
        setStatus({ state: "ready", startedAt });
        return true;
      }
      setStatus({ state: "waking", startedAt });
      await wait(RETRY_DELAY_MS);
    }
    setStatus({ state: "unreachable", startedAt });
    return false;
  } finally {
    clearTimeout(slowTimer);
  }
};

/**
 * Resolves true once the server answers, false if it stays down. Concurrent
 * callers share one attempt; a recent success resolves immediately.
 */
export const waitForServer = (): Promise<boolean> => {
  if (status.state === "ready" && Date.now() - readyAt < READY_TTL_MS) {
    return Promise.resolve(true);
  }
  if (!wakePromise) {
    wakePromise = runWake().finally(() => {
      wakePromise = null;
    });
  }
  return wakePromise;
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const useServerStatus = (): ServerStatus =>
  useSyncExternalStore(subscribe, () => status);
