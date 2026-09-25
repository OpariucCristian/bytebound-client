import { useEffect, useRef, useState } from "react";
import type { AnswerResultDto } from "@/shared/services/gameService";
import {
  createGameSocket,
  type GameSocket,
} from "@/shared/services/gameSocket";

interface UseGameSessionOptions {
  /** Called when the server ends the current question because time ran out. */
  onQuestionTimeout: (result: AnswerResultDto) => void;
}

/**
 * Keeps a game socket open for as long as the calling component is mounted.
 */
export const useGameSession = ({ onQuestionTimeout }: UseGameSessionOptions) => {
  const [session] = useState<GameSocket>(createGameSocket);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Always call the latest handler without re-subscribing.
  const onQuestionTimeoutRef = useRef(onQuestionTimeout);
  onQuestionTimeoutRef.current = onQuestionTimeout;

  useEffect(() => {
    const { socket } = session;

    socket.on("connect_error", (err) => {
      console.error("Game socket connection failed:", err);
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
