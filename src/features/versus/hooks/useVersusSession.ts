import { useCallback, useEffect, useReducer, useState } from "react";
import {
  createVersusSocket,
  VersusEvents,
  type VersusSocket,
} from "@/shared/services/versusSocket";
import type {
  LivesByUid,
  LockedOutPayload,
  MatchedPayload,
  MatchSummary,
  RoundPayload,
  RoundResultPayload,
} from "@/shared/services/versusService";

export type LobbyPhase = "connecting" | "idle" | "searching" | "hosting";

export interface VersusState {
  connected: boolean;
  lobby: LobbyPhase;
  roomCode: string | null;
  /** Why the lobby was left, or why a lobby action failed. */
  lobbyMessage: string | null;
  match: MatchedPayload | null;
  round: RoundPayload | null;
  /**
   * Set once both players are ready: the question can be shown. Local clock,
   * counted from when the start arrived, so clock skew doesn't matter.
   */
  roundEndsAt: number | null;
  roundResult: RoundResultPayload | null;
  lives: LivesByUid;
  /** Players who answered the current round wrong. */
  lockedOut: string[];
  /** Grows on every locked-out event, so the UI can react to each one. */
  lastLockedOut: (LockedOutPayload & { seq: number }) | null;
  summary: MatchSummary | null;
}

type Action =
  | { type: "connected" }
  | { type: "lobby"; lobby: LobbyPhase; roomCode?: string | null }
  | { type: "lobby_message"; message: string | null }
  | { type: "matched"; payload: MatchedPayload }
  | { type: "round"; payload: RoundPayload }
  | { type: "round_start"; round: number; receivedAt: number }
  | { type: "locked_out"; payload: LockedOutPayload }
  | { type: "round_result"; payload: RoundResultPayload }
  | { type: "match_over"; payload: MatchSummary }
  | { type: "reset" };

const initialState: VersusState = {
  connected: false,
  lobby: "connecting",
  roomCode: null,
  lobbyMessage: null,
  match: null,
  round: null,
  roundEndsAt: null,
  roundResult: null,
  lives: {},
  lockedOut: [],
  lastLockedOut: null,
  summary: null,
};

const reducer = (state: VersusState, action: Action): VersusState => {
  switch (action.type) {
    case "connected":
      return { ...state, connected: true, lobby: "idle" };
    case "lobby":
      return {
        ...state,
        lobby: action.lobby,
        roomCode: action.roomCode ?? null,
        lobbyMessage: null,
      };
    case "lobby_message":
      return { ...state, lobbyMessage: action.message };
    case "matched": {
      const { you, opponent } = action.payload;
      return {
        ...state,
        lobby: "idle",
        roomCode: null,
        lobbyMessage: null,
        match: action.payload,
        round: null,
        roundEndsAt: null,
        roundResult: null,
        lockedOut: [],
        lastLockedOut: null,
        summary: null,
        lives: {
          [you.uid]: you.hero.baseHealth,
          [opponent.uid]: opponent.hero.baseHealth,
        },
      };
    }
    case "round":
      return {
        ...state,
        round: action.payload,
        roundEndsAt: null,
        roundResult: null,
        lockedOut: [],
      };
    case "round_start":
      if (state.round?.round !== action.round) return state;
      return {
        ...state,
        roundEndsAt: action.receivedAt + state.round.seconds * 1000,
      };
    case "locked_out":
      return {
        ...state,
        lives: action.payload.lives,
        lockedOut: [...state.lockedOut, action.payload.uid],
        lastLockedOut: {
          ...action.payload,
          seq: (state.lastLockedOut?.seq ?? 0) + 1,
        },
      };
    case "round_result":
      return {
        ...state,
        lives: action.payload.lives,
        roundResult: action.payload,
      };
    case "match_over":
      return { ...state, summary: action.payload };
    case "reset":
      return {
        ...initialState,
        connected: state.connected,
        lobby: state.connected ? "idle" : "connecting",
      };
  }
};

const toMessage = (err: unknown) =>
  err instanceof Error ? err.message : String(err);

/**
 * Keeps a versus socket open for as long as the calling component is
 * mounted, and folds the server's events into one state object.
 */
export const useVersusSession = () => {
  const [session] = useState<VersusSocket>(createVersusSocket);
  const [state, dispatch] = useReducer(reducer, initialState);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    const { socket } = session;

    socket.on("connect", () => dispatch({ type: "connected" }));
    socket.on("connect_error", (err) => {
      console.error("Versus socket connection failed:", err);
      setConnectionError(
        err.message === "Unauthorized"
          ? "Your session has expired. Please log in again."
          : "Could not connect to the game server",
      );
    });
    socket.on("disconnect", (reason) => {
      if (reason !== "io client disconnect") {
        setConnectionError("Lost connection to the game server");
      }
    });

    const unsubscribers = [
      session.on(VersusEvents.Matched, (payload) =>
        dispatch({ type: "matched", payload }),
      ),
      session.on(VersusEvents.Round, (payload) =>
        dispatch({ type: "round", payload }),
      ),
      session.on(VersusEvents.RoundStart, ({ round }) =>
        dispatch({ type: "round_start", round, receivedAt: Date.now() }),
      ),
      session.on(VersusEvents.LockedOut, (payload) =>
        dispatch({ type: "locked_out", payload }),
      ),
      session.on(VersusEvents.RoundResult, (payload) =>
        dispatch({ type: "round_result", payload }),
      ),
      session.on(VersusEvents.MatchOver, (payload) =>
        dispatch({ type: "match_over", payload }),
      ),
      session.on(VersusEvents.LobbyClosed, ({ reason }) => {
        dispatch({ type: "lobby", lobby: "idle" });
        dispatch({ type: "lobby_message", message: reason });
      }),
    ];

    return () => {
      unsubscribers.forEach((off) => off());
      session.close();
    };
  }, [session]);

  /** Runs a lobby request, showing its error in the lobby if it fails. */
  const lobbyRequest = useCallback(
    async <T>(request: () => Promise<T>, onError?: () => void) => {
      try {
        return await request();
      } catch (err) {
        onError?.();
        dispatch({ type: "lobby_message", message: toMessage(err) });
        return undefined;
      }
    },
    [],
  );

  const quickMatch = useCallback(
    async (category: string) => {
      dispatch({ type: "lobby", lobby: "searching" });
      await lobbyRequest(
        () => session.queue(category),
        () => dispatch({ type: "lobby", lobby: "idle" }),
      );
    },
    [session, lobbyRequest],
  );

  const createRoom = useCallback(
    async (category: string) => {
      const result = await lobbyRequest(() => session.createRoom(category));
      if (result) {
        dispatch({ type: "lobby", lobby: "hosting", roomCode: result.code });
      }
    },
    [session, lobbyRequest],
  );

  const joinRoom = useCallback(
    (code: string) => lobbyRequest(() => session.joinRoom(code)),
    [session, lobbyRequest],
  );

  const cancelLobby = useCallback(async () => {
    dispatch({ type: "lobby", lobby: "idle" });
    await lobbyRequest(() => session.cancelQueue());
  }, [session, lobbyRequest]);

  const ready = useCallback(() => {
    session
      .ready()
      .catch((err) => console.error("Failed to report ready:", err));
  }, [session]);

  const answer = useCallback(
    (answerId: string) => session.answer(answerId),
    [session],
  );

  const leave = useCallback(() => {
    session.leave().catch((err) => console.error("Failed to leave:", err));
  }, [session]);

  const reset = useCallback(() => dispatch({ type: "reset" }), []);

  return {
    state,
    connectionError,
    quickMatch,
    createRoom,
    joinRoom,
    cancelLobby,
    ready,
    answer,
    leave,
    reset,
  };
};

export type VersusSession = ReturnType<typeof useVersusSession>;
