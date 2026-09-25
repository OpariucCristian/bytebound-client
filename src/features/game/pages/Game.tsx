import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArcadeButton } from "@/shared/components/ArcadeButton";
import { ArcadeCard } from "@/shared/components/ArcadeCard";
import BattleScene from "@/features/game/components/BattleScene/BattleScene";
import {
  ReadNewGameDto,
  type AnswerResultDto,
  type QuestionPoolDto,
  gameQueryKeys,
} from "@/shared/services/gameService";
import { useAuth } from "@/features/auth/contexts/AuthContext";
import { useGameSession } from "@/features/game/hooks/useGameSession";
import {
  getDifficultColor,
  shuffleArray,
} from "@/features/game/utils/gameUtils";
import {
  BattleAction,
  BattleActionEnum,
} from "@/features/game/types/gameTypes";
import { useMusic } from "@/shared/hooks";
import { MusicTracks } from "@/shared/utils/musicUtils";
import { getPlayerByUid, playerQueryKeys } from "@/shared/services";
import { CHARACTER_SPRITES } from "@/shared/utils/spriteConfigs";

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
  const category = searchParams.get("category");
  const { changeTrack } = useMusic();

  const [game, setGame] = useState<ReadNewGameDto | null>(null);
  const [currentQuestion, setCurrentQuestion] =
    useState<QuestionPoolDto | null>(null);
  const [battleAction, setBattleAction] = useState<BattleAction>(
    BattleActionEnum.START_GAME,
  );
  const [stats, setStats] = useState<GameStats>({
    correct: 0,
    wrong: 0,
    streak: 0,
    totalXp: 0,
  });
  const [questionCountDown, setQuestionCountDown] = useState<number | null>(
    null,
  );
  const [isStarting, setIsStarting] = useState(false);
  const [isAwaitingServer, setIsAwaitingServer] = useState(false);
  const [gameError, setGameError] = useState<string | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasAnsweredRef = useRef<boolean>(false);

  const queryClient = useQueryClient();

  const session = useGameSession({
    onQuestionTimeout: (result) => {
      // The server ended the question: time ran out before an answer.
      if (hasAnsweredRef.current) return;
      hasAnsweredRef.current = true;
      stopCountdown();
      applyAnswerResult(result);
    },
  });

  const { data: player, isLoading } = useQuery({
    queryKey: playerQueryKeys.byUid(user?.id || ""),
    queryFn: () => getPlayerByUid(),

    enabled: !!user?.id,
  });

  const isUiLocked =
    isAwaitingServer ||
    battleAction !== "idle" ||
    questionCountDown <= 0 ||
    hasAnsweredRef.current;

  const startGame = async () => {
    setIsStarting(true);
    try {
      const newGame = await session.startGame({
        type: "endless",
        category: category,
        difficulty: 1,
      });
      queryClient.invalidateQueries({ queryKey: gameQueryKeys.all });
      changeTrack(MusicTracks.BATTLE_1);
      setCurrentQuestion(newGame.firstQuestion);
      setGame(newGame);
    } catch (err) {
      console.error("Failed to start game:", err);
      setGameError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsStarting(false);
    }
  };

  const handleIntroComplete = () => {
    console.debug("handleIntroComplete called - setting to IDLE");
    setBattleAction(BattleActionEnum.IDLE);
    showQuestion();
  };

  // Start a new game on mount
  useEffect(() => {
    // if (!game?.category || mode !== "endless") {
    //   console.log("Game mode or category missing, redirecting to category select");
    //   navigate("/category");
    //   return;
    // }

    if (!user) {
      navigate("/login");
      return;
    }
    startGame();

    return () => stopCountdown();
  }, []);

  // The question is on screen: start the visible countdown and the server's clock.
  const showQuestion = () => {
    startCountdown();
    session
      .questionReady()
      .catch((err) => console.error("Failed to start question timer:", err));
  };

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

  // When the countdown runs out we wait for the server's question timeout.
  useEffect(() => {
    if (questionCountDown <= 0) {
      stopCountdown();
    }
  }, [questionCountDown]);

  const handleAnswerSelect = async (answerId: string) => {
    if (!game?.id || isUiLocked) return;

    hasAnsweredRef.current = true;
    stopCountdown();
    setIsAwaitingServer(true);

    try {
      const result = await session.submitAnswer(answerId);
      applyAnswerResult(result);
    } catch (err) {
      console.error("Failed to check answer:", err);
      setGameError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsAwaitingServer(false);
    }
  };

  const applyAnswerResult = (result: AnswerResultDto) => {
    if (result.correct) {
      setBattleAction(BattleActionEnum.PLAYER_ATTACK);

      const baseXp = 75;
      setStats((prev) => ({
        ...prev,
        correct: prev.correct + 1,
        streak: prev.streak + 1,
        totalXp: prev.totalXp + baseXp,
      }));
    } else {
      setBattleAction(
        result.gameOver
          ? BattleActionEnum.ENEMY_WIN
          : BattleActionEnum.ENEMY_ATTACK,
      );
      setStats((prev) => ({
        ...prev,
        wrong: prev.wrong + 1,
        streak: 0,
      }));
    }

    setGame((prev) => ({ ...prev, playerLives: result.playerLives }));

    // Let the attack animation play before moving on
    setTimeout(() => {
      if (result.gameOver) {
        navigate("/results", {
          state: {
            gameId: game.id,
            category: game.category,
            mode: "endless",
          },
        });
      } else {
        loadNextQuestion();
      }
    }, 1500);
  };

  const loadNextQuestion = async () => {
    if (!game?.id) return;

    setIsAwaitingServer(true);
    try {
      const question = await session.nextQuestion();
      const nextQuestion = {
        ...question,
        answers: shuffleArray(question.answers),
      };

      if (nextQuestion.enemy) {
        setGame((prev) => ({ ...prev, enemy: nextQuestion.enemy }));
      }

      const difficultyChanged = nextQuestion.isDifficultyChange;
      console.debug(
        "loadNextQuestion - isDifficultyChange:",
        difficultyChanged,
        "difficulty:",
        nextQuestion.difficulty,
      );

      if (difficultyChanged) {
        console.debug("Setting battle action to DIFFICULTY_CHANGE");
        setBattleAction(BattleActionEnum.DIFFICULTY_CHANGE);
        changeTrack(MusicTracks.BATTLE_2);
      } else {
        console.debug("Setting battle action to IDLE");
        setBattleAction(BattleActionEnum.IDLE);
      }

      setCurrentQuestion(nextQuestion);
      hasAnsweredRef.current = false;

      // After a difficulty change, the question is shown once the new
      // enemy's intro finishes (handleIntroComplete).
      if (!difficultyChanged) {
        showQuestion();
      }
    } catch (err) {
      console.error("Failed to fetch next question:", err);
      setGameError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsAwaitingServer(false);
    }
  };

  const loading = isStarting;
  const error = gameError || session.connectionError;

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
        <h2 className="text-2xl text-destructive">{error}</h2>
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
                  {[...Array(player.hero.baseHealth)].map((_, i) => (
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
                    currentQuestion.difficulty,
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
                const variant: "primary" | "accent" | "danger" = "primary";

                return (
                  <ArcadeButton
                    key={answer.id}
                    variant={variant}
                    onClick={() => handleAnswerSelect(answer.id)}
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
              hero={player.hero}
              enemy={{...game.enemy, enemyLives: currentQuestion.enemyLives}}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Game;
