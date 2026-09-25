import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { ArcadeButton } from "@/shared/components/ArcadeButton";
import { ArcadeCard } from "@/shared/components/ArcadeCard";
import { useMusic } from "@/shared/hooks";
import { useAudio } from "@/shared/contexts/AudioContext";
import { MusicTracks } from "@/shared/utils/musicUtils";
import { playerQueryKeys } from "@/shared/services/playerService";
import { versusQueryKeys } from "@/shared/services/versusService";
import { getCategoryName } from "@/features/game/utils/categories";
import { useVersusSession } from "../hooks/useVersusSession";
import VersusLobby from "../components/VersusLobby";
import VersusMatchView from "../components/VersusMatchView";
import VersusResults from "../components/VersusResults";

/**
 * Endless 1v1: lobby, duel and results on one page, so a single socket lives
 * through all of them.
 */
const Versus = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { changeTrack } = useMusic();
  const { isAudioPlaying } = useAudio();

  const session = useVersusSession();
  const { state, connectionError, joinRoom, reset } = session;
  const [showResults, setShowResults] = useState(false);
  const deepLinkHandledRef = useRef(false);

  const roomFromLink = searchParams.get("room");
  const category = state.match?.category ?? searchParams.get("category") ?? "dsa";
  const categoryName = getCategoryName(category);
  const inLobby = !state.match;

  useEffect(() => {
    if (inLobby && isAudioPlaying) changeTrack(MusicTracks.MENU);
  }, [inLobby]);

  // An invite link joins its room as soon as we're connected.
  useEffect(() => {
    if (!state.connected || !roomFromLink || deepLinkHandledRef.current) {
      return;
    }
    deepLinkHandledRef.current = true;
    setSearchParams({ category }, { replace: true });
    void joinRoom(roomFromLink);
  }, [state.connected, roomFromLink]);

  // XP and the win/loss record changed on the server.
  useEffect(() => {
    if (!state.summary) return;
    queryClient.invalidateQueries({ queryKey: ["players"] });
    queryClient.invalidateQueries({ queryKey: versusQueryKeys.all });
  }, [state.summary]);

  const playAgain = () => {
    setShowResults(false);
    reset();
  };

  if (connectionError && !(state.summary && showResults)) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-6 p-4 text-center">
        <h2 className="text-xl md:text-2xl text-destructive">
          {connectionError}
        </h2>
        {state.match && !state.summary && (
          <p className="text-sm text-muted-foreground">
            The duel counts as forfeited.
          </p>
        )}
        <ArcadeButton onClick={() => navigate("/category?play=1v1")}>
          BACK TO CATEGORIES
        </ArcadeButton>
      </div>
    );
  }

  if (state.match && !showResults) {
    return (
      <VersusMatchView
        key={state.match.matchId}
        session={session}
        onFinished={() => setShowResults(true)}
      />
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen p-4 md:p-8">
      <div className="w-full max-w-[60rem] mx-auto space-y-8">
        {state.match && state.summary ? (
          <VersusResults
            match={state.match}
            summary={state.summary}
            onPlayAgain={playAgain}
            onMainMenu={() => navigate("/")}
          />
        ) : (
          <>
            <div className="flex justify-between items-center gap-4">
              <div>
                <p className="text-sm text-muted-foreground">ENDLESS</p>
                <h1 className="text-2xl md:text-4xl text-primary">1V1 DUEL</h1>
              </div>
              <ArcadeButton
                variant="secondary"
                size="sm"
                onClick={() => navigate("/category?play=1v1")}
              >
                BACK
              </ArcadeButton>
            </div>

            <p className="text-sm">
              <span className="text-muted-foreground">CATEGORY </span>
              <span className="text-secondary">{categoryName}</span>
            </p>

            {state.lobbyMessage && (
              <p className="text-sm text-destructive" role="alert">
                {state.lobbyMessage}
              </p>
            )}

            <VersusLobby
              session={session}
              category={category}
              categoryName={categoryName}
            />

            <ArcadeCard glow={false}>
              <div className="space-y-3 text-sm">
                <h4 className="text-lg text-secondary text-center mb-4">
                  HOW A DUEL WORKS
                </h4>
                <p>• You both get the same question at the same time.</p>
                <p>• The first correct answer strikes your opponent.</p>
                <p>• A wrong answer costs you a life and locks you out of the round.</p>
                <p>• Questions get harder every 4 rounds. Last hero standing wins.</p>
                <p>• Earn XP for each correct answer, plus a bonus for the win.</p>
              </div>
            </ArcadeCard>
          </>
        )}
      </div>
    </div>
  );
};

export default Versus;
