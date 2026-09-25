import { useEffect, useRef, useState } from "react";
import type { AnswerResultDto } from "@/shared/services/gameService";
import {
  createGameSocket,
  type GameSocket,
} from "@/shared/services/gameSocket";

export interface ConnectionError {
  /** unauthorized: sign in again; connect: never reached the server; dropped: lost mid-run */
  kind: "unauthorized" | "connect" | "dropped";
  message: string;
}

interface UseGameSessionOptions {
  /** Called when the server ends the current question because time ran out. */
  onQuestionTimeout: (result: AnswerResultDto) => void;
}

/**
 * Keeps a game socket open for as long as the calling component is mounted.
 */
export const useGameSession = ({ onQuestionTimeout }: UseGameSessionOptions) => {
  const [session] = useState<GameSocket>(createGameSocket);
  const [connectionError, setConnectionError] = useState<ConnectionError | null>(null);

  // Always call the latest handler without re-subscribing.
  const onQuestionTimeoutRef = useRef(onQuestionTimeout);
  onQuestionTimeoutRef.current = onQuestionTimeout;

  useEffect(() => {
    const { socket } = session;

    socket.on("connect_error", (err) => {
      console.error("Game socket connection failed:", err);
      if (err.message === "Unauthorized") {
        setConnectionError({ kind: "unauthorized", message: "Your session has expired. Sign in again to keep playing." });
      } else {
        setConnectionError({ kind: "connect", message: "Couldn't connect to the game server. It may still be starting up." });
      }
    });
    socket.on("disconnect", (reason) => {
      if (reason !== "io client disconnect") {
        setConnectionError({
          kind: "dropped",
          message: "The connection to the game server dropped, so this run can't continue.",
        });
      }
    });
    // Start connecting (and waking the server) while the intro plays.
    session.connect().catch(() => {
      // Reported through connect_error above.
    });
    const unsubscribe = session.onQuestionTimeout((result) =>
      onQuestionTimeoutRef.current(result),
    );

    return () => {
      unsubscribe();
      session.close();
    };
  }, [session]);

  return { ...session, connectionError };
};
