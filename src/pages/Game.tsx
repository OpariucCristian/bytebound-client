import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArcadeButton } from "@/components/ArcadeButton";
import { ArcadeCard } from "@/components/ArcadeCard";
import BattleScene from "@/components/BattleScene/BattleScene";
import { ReadNewGameDto, type QuestionPoolDto } from "@/hooks/useGame";
import { useAuth } from "@/contexts/AuthContext";
import { getDifficultColor, shuffleArray } from "@/utils/gameUtils";
import { useGameMutations, useGetNextQuestion } from "@/hooks";
import { BattleAction, BattleActionEnum } from "@/types/gameTypes";

interface GameStats {
  correct: number;
  wrong: number;
  streak: number;
  totalXp: number;
}

const Game = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const mode = searchParams.get("mode"); // 'endless'

  const [game, setGame] = useState<ReadNewGameDto | null>(null);
  const [currentQuestion, setCurrentQuestion] =
    useState<QuestionPoolDto | null>(null);
  const [battleAction, setBattleAction] = useState<BattleAction>(
    BattleActionEnum.START_GAME
  );
  const [stats, setStats] = useState<GameStats>({
    correct: 0,
    wrong: 0,
    streak: 0,
    totalXp: 0,
  });
  const [questionCountDown, setQuestionCountDown] = useState<number | null>(
    null
  );
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasAnsweredRef = useRef<boolean>(false);

  const { startNewGame, checkGameAnswer, timeoutQuestion } = useGameMutations();
  const { refetch: fetchNextQuestion, isLoading: isLoadingNextQuestion } =
    useGetNextQuestion(game?.id);

  const isUiLocked =
    isLoadingNextQuestion ||
    battleAction !== "idle" ||
    checkGameAnswer.isPending ||
    timeoutQuestion.isPending ||
    hasAnsweredRef.current;

  const startGame = async () => {
    try {
      const newGame = await startNewGame.mutateAsync({
        type: "endless",
        category: game.category,
        difficulty: 1,
      });

      setCurrentQuestion(newGame.firstQuestion);
      setGame(newGame);
    } catch (err) {
      console.error("Failed to start game:", err);
    }
  };

  const handleIntroComplete = () => {
    setBattleAction(BattleActionEnum.IDLE);
    startCountdown();
  };

  // Start a new game on mount
  useEffect(() => {
    if (!game?.category || mode !== "endless") {
      navigate("/category");
      return;
    }

    if (!user) {
      navigate("/login");
      return;
    }
    startGame();

    return () => stopCountdown();
  }, []);

  const startCountdown = () => {
    stopCountdown();

    setQuestionCountDown(currentQuestion.questionSeconds);
    countdownIntervalRef.current = setInterval(() => {
      setQuestionCountDown((prev) => prev - 1);
    }, 1000);
  };

  const stopCountdown = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  };

  useEffect(() => {
    if (questionCountDown <= 0 && game?.id) {
      // Time's up, treat as incorrect answer
      handleAnswerSelect(-1, true);
    }
  }, [questionCountDown, game?.id]);

  const handleAnswerSelect = async (answerId: number, isTimeout: boolean) => {
    if (!game?.id || battleAction === "start-game" || hasAnsweredRef.current)
      return;

    hasAnsweredRef.current = true;
    stopCountdown();

    try {
      let isCorrect;
      if (isTimeout) {
        await timeoutQuestion.mutateAsync({ gameId: game?.id });
        isCorrect = false;
      } else {
        isCorrect = await checkGameAnswer.mutateAsync({
          gameId: game?.id,
          answerId,
        });
      }

      if (isCorrect) {
        setBattleAction(BattleActionEnum.PLAYER_ATTACK);

        const newStreak = stats.streak + 1;
        const multiplier = Math.min(Math.floor(newStreak / 3) + 1, 5); // Max 5x multiplier
        const baseXp = 75;
        const xpGained = baseXp;

        setStats({
          ...stats,
          correct: stats.correct + 1,
          streak: newStreak,
          totalXp: stats.totalXp + xpGained,
        });

        // Auto advance after 1.5s
        setTimeout(() => {
          loadNextQuestion();
          startCountdown();
        }, 1500);
      } else {
        // Trigger enemy attack animation
        const newLives = game.playerLives - 1;

        if (newLives <= 0) {
          setBattleAction(BattleActionEnum.ENEMY_WIN);
        } else {
          setBattleAction(BattleActionEnum.ENEMY_ATTACK);
        }

        setGame((prev) => ({
          ...prev,
          playerLives: newLives,
        }));

        setStats({
          ...stats,
          wrong: stats.wrong + 1,
          streak: 0,
        });

        // Auto advance after 1.5s
        setTimeout(() => {
          if (newLives <= 0) {
            // Game over - no more lives
            navigate("/results", {
              state: {
                gameId: game.id,
                category: game.category,
                mode: "endless",
              },
            });
          } else {
            loadNextQuestion();
            startCountdown();
          }
        }, 1500);
      }
    } catch (err) {
      console.error("Failed to check answer:", err);
    }
  };

  const loadNextQuestion = async () => {
    if (!game?.id) return;

    try {
      setBattleAction(BattleActionEnum.IDLE);

      const result = await fetchNextQuestion();
      if (result.data) {
        const nextQuestion = {
          ...result.data,
          answers: shuffleArray(result.data.answers),
        };
        setCurrentQuestion(nextQuestion);
        hasAnsweredRef.current = false;
      }
    } catch (err) {
      console.error("Failed to fetch next question:", err);
    }
  };

  const loading = startNewGame.isPending;
  const error = startNewGame.error || checkGameAnswer.error;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h2 className="text-2xl text-primary animate-blink">LOADING...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <h2 className="text-2xl text-destructive">
          {error instanceof Error ? error.message : "An error occurred"}
        </h2>
        <ArcadeButton onClick={() => navigate("/category")}>
          Back to Category Select
        </ArcadeButton>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen p-4 md:p-8">
      <div className="w-[60rem] mx-auto">
        {/* Header */}
        {battleAction !== "start-game" && (
          <>
            {" "}
            <div
              className={`flex justify-between items-center mb-6 transition-opacity duration-1000 ${
                battleAction === "idle" ? "animate-in fade-in" : ""
              }`}
            >
              <div className="w-40">
                <p className="text-muted-foreground text-sm">ENDLESS</p>
                <div className="flex gap-2 mt-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} title={`Life ${i + 1}`}>
                      {i < game.playerLives && (
                        <span className="flex items-center justify-center h-full text-sm">
                          <img
                            src={"/resources/hud/heart-full.png"}
                            className="w-9 h-9"
                          />
                        </span>
                      )}
                      {!(i < game.playerLives) && (
                        <span className="flex items-center justify-center h-full text-sm">
                          <img
                            src={"/resources/hud/heart-empty.png"}
                            className="w-9 h-9"
                          />
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-center w-40">
                <p className="text-muted-foreground text-sm">TIME</p>
                <p
                  className={`text-2xl text-accent ${
                    questionCountDown < 4 ? "text-destructive" : ""
                  }`}
                >
                  {questionCountDown}
                </p>
              </div>
              <div className="text-center w-40">
                <p className="text-muted-foreground text-sm">STREAK</p>
                <p className="text-2xl text-accent">{stats.streak}</p>
              </div>
              <div className="text-right w-40">
                <p className="text-muted-foreground text-sm">DIFFICULTY</p>
                <p
                  className={`text-2xl text-${getDifficultColor(
                    currentQuestion.difficulty
                  )}`}
                >
                  {currentQuestion.difficulty}
                </p>
              </div>
            </div>
            {/* Question */}
            <ArcadeCard
              glow={false}
              className={`h-32 mb-6 text-center transition-opacity duration-1000 ${
                battleAction === "idle" ? "animate-in fade-in" : ""
              }`}
            >
              <h2 className="text-lg md:text-xl text-foreground leading-relaxed">
                {currentQuestion.text}
              </h2>
            </ArcadeCard>
            {/* Answers */}
            <div
              className={`grid md:grid-cols-2 gap-4 transition-opacity duration-1000 ${
                battleAction === "idle" ? "animate-in fade-in" : ""
              }`}
            >
              {currentQuestion.answers.map((answer) => {
                let variant: "primary" | "accent" | "danger" = "primary";

                return (
                  <ArcadeButton
                    key={answer.id}
                    variant={variant}
                    onClick={() => handleAnswerSelect(answer.id, false)}
                    disabled={isUiLocked}
                    className="w-full h-auto min-h-[80px] whitespace-normal text-left"
                  >
                    {answer.text}
                  </ArcadeButton>
                );
              })}
            </div>
            {/* Stats */}
            <div
              className={`mt-6 flex justify-around transition-opacity duration-500 ${
                battleAction === "idle" ? "animate-in fade-in" : ""
              }`}
            >
              <div className="text-center">
                <p className="text-neon-green text-2xl">{stats.correct}</p>
                <p className="text-muted-foreground text-xs">CORRECT</p>
              </div>
              <div className="text-center">
                <p className="text-destructive text-2xl">{stats.wrong}</p>
                <p className="text-muted-foreground text-xs">WRONG</p>
              </div>
              <div className="text-center">
                <p className="text-accent text-2xl">{stats.totalXp}</p>
                <p className="text-muted-foreground text-xs">XP EARNED</p>
              </div>
            </div>
          </>
        )}

        {/* Battle Scene */}
        <div
          className={`transition-all ease-out ${
            battleAction === "start-game"
              ? "fixed inset-0 flex items-center justify-center"
              : "mt-8"
          }`}
          style={{ transitionDuration: "1500ms" }}
        >
          {game?.id && (
            <BattleScene
              action={battleAction}
              onIntroComplete={handleIntroComplete}
              questionDifficulty={currentQuestion?.difficulty}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Game;
