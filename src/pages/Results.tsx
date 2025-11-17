import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ArcadeButton } from "@/components/ArcadeButton";
import { ArcadeCard } from "@/components/ArcadeCard";
import { usePlayerByUid, useGameMutations } from "@/hooks";

interface LocationState {
  gameId: string;
  mode: string;
}

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const {data: playerData, error: playerError} = usePlayerByUid(user?.id || "");

  const state = location.state as LocationState;

  const { data: gameStats, error: gameStatsError } = useGameMutations().getGameStats(
    state?.gameId || ""
  );

  useEffect(() => {
    if (!state || !user || playerError || gameStatsError) {
      navigate("/");
    }
  }, [state, user, navigate, updateUser, gameStats, playerData]);

  if (!state || !user || gameStatsError || playerError) return null;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl text-primary mb-4">GAME OVER</h1>
          <p className="text-xl text-secondary"></p>
        </div>

        {/* Results Card */}
        <ArcadeCard glow={false} className="mb-8">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-5xl text-accent mb-2">
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
                  QUESTIONS ANSWERED
                </p>
              </div>
              <div className="text-center">
                <p className="text-3xl text-destructive">
                  {gameStats?.wrongAnswers}
                </p>
                <p className="text-muted-foreground text-sm">WRONG ANSWERS</p>
              </div>
              <div className="text-center">
                <p className="text-3xl text-secondary">
                  {gameStats?.correctAnswersMaxStreak}
                </p>
                <p className="text-muted-foreground text-sm">MAX STREAK</p>
              </div>
            </div>

            <div className="pt-6 border-t-2 border-border">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-muted-foreground text-sm">NEW LEVEL</p>
                  <p className="text-3xl text-accent">{playerData.lvl}</p>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground text-sm">TOTAL XP</p>
                  <p className="text-2xl text-foreground">{playerData.xp}</p>
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
