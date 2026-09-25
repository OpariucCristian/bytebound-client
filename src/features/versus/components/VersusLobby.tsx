import { FormEvent, useEffect, useState } from "react";
import { ArcadeButton } from "@/shared/components/ArcadeButton";
import { ArcadeCard } from "@/shared/components/ArcadeCard";
import { Input } from "@/shared/components/ui/Input";
import type { VersusSession } from "../hooks/useVersusSession";

const ROOM_CODE_LENGTH = 6;
/** After this long, explain that the free-tier server may be asleep. */
const COLD_START_HINT_MS = 4000;

interface VersusLobbyProps {
  session: VersusSession;
  category: string;
  categoryName: string;
}

const useElapsedSeconds = (running: boolean) => {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    setSeconds(0);
    if (!running) return;
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [running]);
  return seconds;
};

const formatElapsed = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

const VersusLobby = ({ session, category, categoryName }: VersusLobbyProps) => {
  const { state, quickMatch, createRoom, joinRoom, cancelLobby } = session;
  const [code, setCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showColdStartHint, setShowColdStartHint] = useState(false);

  const searchSeconds = useElapsedSeconds(state.lobby === "searching");

  useEffect(() => {
    if (state.lobby !== "connecting") return;
    const timer = setTimeout(
      () => setShowColdStartHint(true),
      COLD_START_HINT_MS,
    );
    return () => clearTimeout(timer);
  }, [state.lobby]);

  const handleJoin = async (e: FormEvent) => {
    e.preventDefault();
    if (code.trim().length !== ROOM_CODE_LENGTH) return;
    setIsJoining(true);
    await joinRoom(code);
    setIsJoining(false);
  };

  const copyInviteLink = async () => {
    const url = `${window.location.origin}/versus?room=${state.roomCode}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be denied; the code is on screen anyway.
    }
  };

  if (state.lobby === "connecting") {
    return (
      <ArcadeCard glow={false} className="text-center space-y-4 py-12">
        <p className="text-xl text-primary animate-blink motion-reduce:animate-none">CONNECTING...</p>
        {showColdStartHint && (
          <p className="text-xs text-muted-foreground leading-relaxed">
            Waking up the game server. The first connection after a quiet
            spell can take up to a minute.
          </p>
        )}
      </ArcadeCard>
    );
  }

  if (state.lobby === "searching") {
    return (
      <ArcadeCard className="text-center space-y-6 py-12" glow>
        <p className="text-xl text-primary animate-blink motion-reduce:animate-none">
          SEARCHING FOR AN OPPONENT
        </p>
        <p className="text-sm text-muted-foreground">
          {categoryName} · {formatElapsed(searchSeconds)}
        </p>
        <ArcadeButton variant="secondary" size="sm" onClick={cancelLobby}>
          CANCEL
        </ArcadeButton>
      </ArcadeCard>
    );
  }

  if (state.lobby === "hosting") {
    return (
      <ArcadeCard className="text-center space-y-6 py-10" glow>
        <p className="text-sm text-muted-foreground">ROOM CODE</p>
        <p
          className="text-4xl md:text-5xl text-accent tracking-[0.3em] select-all"
          aria-label={`Room code ${state.roomCode?.split("").join(" ")}`}
        >
          {state.roomCode}
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Send the code or the link to a friend. The room closes after 10
          minutes.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <ArcadeButton variant="accent" size="sm" onClick={copyInviteLink}>
            {copied ? "LINK COPIED!" : "COPY INVITE LINK"}
          </ArcadeButton>
          <ArcadeButton variant="secondary" size="sm" onClick={cancelLobby}>
            CLOSE ROOM
          </ArcadeButton>
        </div>
        <p className="text-sm text-primary animate-blink motion-reduce:animate-none">
          WAITING FOR A CHALLENGER...
        </p>
      </ArcadeCard>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <ArcadeCard className="flex flex-col justify-between gap-6 text-center">
        <div className="space-y-3">
          <h2 className="text-lg text-primary">QUICK MATCH</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Fight the next player looking for a duel in {categoryName}.
          </p>
        </div>
        <ArcadeButton className="w-full" onClick={() => quickMatch(category)}>
          FIND MATCH
        </ArcadeButton>
      </ArcadeCard>

      <ArcadeCard className="flex flex-col justify-between gap-6 text-center">
        <div className="space-y-3">
          <h2 className="text-lg text-secondary">CREATE ROOM</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Get a code to challenge a friend.
          </p>
        </div>
        <ArcadeButton
          variant="secondary"
          className="w-full"
          onClick={() => createRoom(category)}
        >
          CREATE
        </ArcadeButton>
      </ArcadeCard>

      <ArcadeCard className="text-center">
        <form
          onSubmit={handleJoin}
          className="flex flex-col justify-between gap-6 h-full"
        >
          <div className="space-y-3">
            <label htmlFor="room-code" className="block text-lg text-accent">
              JOIN ROOM
            </label>
            <Input
              id="room-code"
              value={code}
              onChange={(e) =>
                setCode(
                  e.target.value.replace(/[^a-z0-9]/gi, "").toUpperCase(),
                )
              }
              maxLength={ROOM_CODE_LENGTH}
              placeholder="CODE"
              autoComplete="off"
              spellCheck={false}
              className="font-pixel text-center text-lg tracking-[0.3em] uppercase h-12"
            />
          </div>
          <ArcadeButton
            type="submit"
            variant="accent"
            className="w-full"
            disabled={code.length !== ROOM_CODE_LENGTH || isJoining}
          >
            {isJoining ? "JOINING..." : "JOIN"}
          </ArcadeButton>
        </form>
      </ArcadeCard>
    </div>
  );
};

export default VersusLobby;
