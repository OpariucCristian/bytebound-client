import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/contexts/AuthContext";
import { ArcadeButton } from "@/shared/components/ArcadeButton";
import { ArcadeCard } from "@/shared/components/ArcadeCard";
import { getPlayerByUid, playerQueryKeys } from "@/shared/services/playerService";
import { getGameStats, gameQueryKeys } from "@/shared/services/gameService";
import { GuestNotice } from "@/features/auth/components/GuestNotice";
import { ErrorPanel } from "@/shared/components/ErrorPanel";
import { LoadingScreen } from "@/shared/components/LoadingScreen";

interface LocationState {
  gameId: string;
  mode: string;
}

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const state = location.state as LocationState;

  const {
    data: playerData,
    error: playerError,
    refetch: refetchPlayer,
  } = useQuery({
    queryKey: playerQueryKeys.byUid(user?.id || ""),
    queryFn: () => getPlayerByUid(),
    enabled: !!user?.id,
  });

  const {
    data: gameStats,
    error: gameStatsError,
    refetch: refetchStats,
  } = useQuery({
    queryKey: gameQueryKeys.stats(state?.gameId || ""),
    queryFn: () => getGameStats(state?.gameId || ""),
    enabled: !!state?.gameId,
  });

  const toMainMenu = { label: "MAIN MENU", onClick: () => navigate("/") };

  if (!user) return null;

  // Opened directly or after a refresh: the run to show isn't known
  if (!state?.gameId) {
    return (
      <ErrorPanel
        fullScreen
        title="NO RESULTS TO SHOW"
        message="Results appear right after a run ends. Start a run to get some."
        action={{ label: "START GAME", onClick: () => navigate("/category") }}
        secondaryAction={toMainMenu}
      />
    );
  }

  const loadError = gameStatsError ?? playerError;
  if (loadError) {
    return (
      <ErrorPanel
        fullScreen
        title="COULDN'T LOAD YOUR RESULTS"
        message={loadError.message}
        action={{
          label: "TRY AGAIN",
          onClick: () => {
            void refetchStats();
            void refetchPlayer();
          },
        }}
        secondaryAction={toMainMenu}
      />
    );
  }

  if (!gameStats || !playerData) {
    return <LoadingScreen label="TALLYING YOUR RUN..." />;
  }

  return (
    <div className="flex justify-center items-center min-h-screen p-4 pb-20 md:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-6xl text-primary mb-4">GAME OVER</h1>
          <p className="text-xl text-secondary"></p>
        </div>

        {gameStats?.gameId && (
          <>
            {/* Results Card */}
            <ArcadeCard glow={false} className="mb-8">
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-4xl sm:text-5xl text-accent mb-2">
                    +{gameStats?.xpGained} XP
                  </h2>
                  <p className="text-muted-foreground">TOTAL EARNED</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-6 border-t-2 border-border">
                  <div className="text-center">
                    <p className="text-3xl text-neon-green">
                      {gameStats?.correctAnswers}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      CORRECT ANSWERS
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl text-destructive">
                      {gameStats?.wrongAnswers}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      WRONG ANSWERS
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl text-secondary">
                      {gameStats?.correctAnswersStreakMax}
                    </p>
                    <p className="text-muted-foreground text-sm">MAX STREAK</p>
                  </div>
                </div>

                <div className="pt-6 border-t-2 border-border">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-muted-foreground text-sm">LEVEL</p>
                      <p className="text-3xl text-accent">{playerData.lvl}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-muted-foreground text-sm">TOTAL XP</p>
                      <p className="text-2xl text-foreground">
                        {playerData.xp}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </ArcadeCard>

            {/* Performance Message */}
            <ArcadeCard className="mb-8">
              <div className="text-center">
                <h3 className="text-2xl text-secondary mb-4">
                  {gameStats?.correctAnswers >= 10
                    ? "EXCELLENT!"
                    : gameStats?.correctAnswers >= 5
                    ? "GOOD JOB!"
                    : "KEEP TRYING!"}
                </h3>
                <p className="text-foreground">
                  {gameStats?.correctAnswers >= 10
                    ? `You answered ${gameStats?.correctAnswers} questions correctly! You're a true master!`
                    : gameStats?.correctAnswers >= 5
                    ? `${gameStats?.correctAnswers} correct answers! You're getting better! Practice makes perfect!`
                    : `You got ${gameStats?.correctAnswers} correct. Don't give up! Every game makes you stronger!`}
                </p>
              </div>
            </ArcadeCard>
          </>
        )}

        {user.isGuest && (
          <GuestNotice title="THIS RUN WASN'T SAVED" className="mb-8" />
        )}

        {/* Action Buttons */}
        <div className="grid md:grid-cols-2 gap-4">
          <ArcadeButton
            variant="primary"
            size="lg"
            onClick={() => navigate("/category")}
            className="w-full"
          >
            PLAY AGAIN
          </ArcadeButton>
          <ArcadeButton
            variant="secondary"
            size="lg"
            onClick={() => navigate("/")}
            className="w-full"
          >
            MAIN MENU
          </ArcadeButton>
        </div>
      </div>
    </div>
  );
};

export default Results;
