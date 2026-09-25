import { io, Socket } from "socket.io-client";
import { API_BASE_URL, getAuthToken } from "./httpService";
import type {
  LockedOutPayload,
  MatchedPayload,
  MatchSummary,
  RoundPayload,
  RoundResultPayload,
  RoundStartPayload,
} from "./versusService";

// Must match the events in the server's versus/versus.constants.ts
export const VersusEvents = {
  Queue: "versus:queue",
  CancelQueue: "versus:cancel_queue",
  CreateRoom: "versus:create_room",
  JoinRoom: "versus:join_room",
  Ready: "versus:ready",
  Answer: "versus:answer",
  Leave: "versus:leave",

  Matched: "versus:matched",
  Round: "versus:round",
  RoundStart: "versus:round_start",
  LockedOut: "versus:locked_out",
  RoundResult: "versus:round_result",
  MatchOver: "versus:match_over",
  LobbyClosed: "versus:lobby_closed",
} as const;

interface Ack<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

export interface VersusServerEvents {
  [VersusEvents.Matched]: MatchedPayload;
  [VersusEvents.Round]: RoundPayload;
  [VersusEvents.RoundStart]: RoundStartPayload;
  [VersusEvents.LockedOut]: LockedOutPayload;
  [VersusEvents.RoundResult]: RoundResultPayload;
  [VersusEvents.MatchOver]: MatchSummary;
  [VersusEvents.LobbyClosed]: { reason: string };
}

const REQUEST_TIMEOUT_MS = 10000;

const SOCKET_URL =
  import.meta.env.VITE_WS_URL || new URL(API_BASE_URL).origin;

export type VersusSocket = ReturnType<typeof createVersusSocket>;

/**
 * Opens a connection for 1v1 matches. The lobby and the match share it; the
 * server treats closing it mid-match as a forfeit.
 */
export const createVersusSocket = () => {
  const socket: Socket = io(`${SOCKET_URL}/versus`, {
    auth: (cb) => {
      getAuthToken()
        .then((token) => cb({ token }))
        .catch(() => cb({ token: null }));
    },
    // A match can't be resumed on a new connection, so we don't retry.
    reconnection: false,
  });

  const request = async <T>(event: string, payload?: unknown): Promise<T> => {
    const ack: Ack<T> = await socket
      .timeout(REQUEST_TIMEOUT_MS)
      .emitWithAck(event, payload);
    if (!ack.ok) {
      throw new Error(ack.error);
    }
    return ack.data;
  };

  return {
    socket,
    queue: (category: string) =>
      request<{ status: "searching" | "matched" }>(VersusEvents.Queue, {
        category,
      }),
    cancelQueue: () => request<null>(VersusEvents.CancelQueue),
    createRoom: (category: string) =>
      request<{ code: string }>(VersusEvents.CreateRoom, { category }),
    joinRoom: (code: string) =>
      request<null>(VersusEvents.JoinRoom, { code: code.trim() }),
    /** The round's question arrived and the player is ready to see it. */
    ready: () => request<null>(VersusEvents.Ready),
    answer: (answerId: string) =>
      request<{ correct: boolean }>(VersusEvents.Answer, { answerId }),
    leave: () => request<null>(VersusEvents.Leave),
    on: <E extends keyof VersusServerEvents>(
      event: E,
      handler: (payload: VersusServerEvents[E]) => void,
    ) => {
      socket.on(event as string, handler);
      return () => {
        socket.off(event as string, handler);
      };
    },
    close: () => {
      socket.removeAllListeners();
      socket.disconnect();
    },
  };
};
