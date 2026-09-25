import { io, Socket } from "socket.io-client";
import { API_BASE_URL, getAuthToken } from "./httpService";
import type {
  AnswerResultDto,
  CreateNewGameDto,
  QuestionPoolDto,
  ReadNewGameDto,
} from "./gameService";

// Must match the events in the server's games.gateway.ts
export const GameEvents = {
  Start: "game:start",
  QuestionReady: "game:question_ready",
  Answer: "game:answer",
  NextQuestion: "game:next_question",
  QuestionTimeout: "game:question_timeout",
} as const;

interface Ack<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

const REQUEST_TIMEOUT_MS = 10000;

// The socket server runs on the same host as the REST API, unless overridden.
const SOCKET_URL =
  import.meta.env.VITE_WS_URL || new URL(API_BASE_URL).origin;

export type GameSocket = ReturnType<typeof createGameSocket>;

/**
 * Opens a connection to a game session on the server. One connection hosts
 * one game at a time; the server forgets the game when the connection closes.
 */
export const createGameSocket = () => {
  const socket: Socket = io(`${SOCKET_URL}/games`, {
    // Called on every (re)connect, so an expired token is refreshed.
    auth: (cb) => {
      getAuthToken()
        .then((token) => cb({ token }))
        .catch(() => cb({ token: null }));
    },
    // The server can't resume a game on a new connection, so we don't retry.
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
    startGame: (data: CreateNewGameDto) =>
      request<ReadNewGameDto>(GameEvents.Start, data),
    /** Tells the server the question is on screen, which starts its clock. */
    questionReady: () => request<null>(GameEvents.QuestionReady),
    submitAnswer: (answerId: string) =>
      request<AnswerResultDto>(GameEvents.Answer, { answerId }),
    nextQuestion: () => request<QuestionPoolDto>(GameEvents.NextQuestion),
    onQuestionTimeout: (handler: (result: AnswerResultDto) => void) => {
      socket.on(GameEvents.QuestionTimeout, handler);
      return () => {
        socket.off(GameEvents.QuestionTimeout, handler);
      };
    },
    close: () => {
      socket.removeAllListeners();
      socket.disconnect();
    },
  };
};
