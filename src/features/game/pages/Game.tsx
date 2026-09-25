import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ErrorPanel } from "@/shared/components/ErrorPanel";
import { LoadingScreen } from "@/shared/components/LoadingScreen";
import BattleScene from "@/features/game/components/BattleScene/BattleScene";
import { LivesBar } from "@/features/game/components/LivesBar";
import { QuestionPanel } from "@/features/game/components/QuestionPanel";
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

/** Turns a socket failure into something a player can act on. */
const describeGameError = (err: unknown): string => {
  const message = err instanceof Error ? err.message : String(err);
  if (/timed out/i.test(message)) {
    return "The game server took too long to answer. It may still be waking up.";
  }
  return message || "Something went wrong with this run.";
};

interface GameRunProps {
  /** Throws this run away and starts a fresh one on a new connection. */
  onRetry: () => void;
}

const GameRun = ({ onRetry }: GameRunProps) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, logout } = useAuth();
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

  const {
    data: player,
    isLoading: isPlayerLoading,
    error: playerError,
    refetch: refetchPlayer,
  } = useQuery({
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
      setGameError(describeGameError(err));
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
      setGameError(describeGameError(err));
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
      setGameError(describeGameError(err));
    } finally {
      setIsAwaitingServer(false);
    }
  };

  const connectionError = session.connectionError;
  const toMainMenu = { label: "MAIN MENU", onClick: () => navigate("/") };

  if (connectionError?.kind === "unauthorized") {
    return (
      <ErrorPanel
        fullScreen
        title="SESSION EXPIRED"
        message={connectionError.message}
        action={{ label: "SIGN IN", onClick: () => void logout() }}
      />
    );
  }

  if (connectionError || gameError) {
    const started = !!game?.id;
    return (
      <ErrorPanel
        fullScreen
        title={started ? "RUN INTERRUPTED" : "COULDN'T START THE RUN"}
        message={connectionError?.message ?? gameError}
        action={{ label: started ? "START A NEW RUN" : "TRY AGAIN", onClick: onRetry }}
        secondaryAction={toMainMenu}
      />
    );
  }

  if (playerError) {
    return (
      <ErrorPanel
        fullScreen
        title="COULDN'T LOAD YOUR HERO"
        message={playerError.message}
        action={{ label: "TRY AGAIN", onClick: () => void refetchPlayer() }}
        secondaryAction={toMainMenu}
      />
    );
  }

  if (isStarting || isPlayerLoading || !game || !currentQuestion) {
    return <LoadingScreen label="ENTERING THE CAVE..." />;
  }

  if (!player?.hero) {
    return (
      <ErrorPanel
        fullScreen
        title="NO HERO YET"
        message="Pick a hero on the main menu before heading into the cave."
        action={{ label: "PICK A HERO", onClick: () => navigate("/") }}
      />
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen p-4 pb-20 md:p-8">
      {/*
        Phones put the fight right under the HUD and the answers last, within
        thumb reach, so every hit lands on screen. Desktop keeps the fight below
        the stats.
      */}
      <div className="w-full max-w-[60rem] mx-auto flex flex-col">
        <h1 className="sr-only">Endless battle</h1>
        {/* What the battle scene shows, read out for screen readers */}
        <p className="sr-only" aria-live="polite">
          {battleAction === BattleActionEnum.PLAYER_ATTACK && "Correct answer. Your hero strikes."}
          {battleAction === BattleActionEnum.ENEMY_ATTACK &&
            `Wrong answer. ${game.playerLives} ${game.playerLives === 1 ? "life" : "lives"} left.`}
          {battleAction === BattleActionEnum.ENEMY_WIN && "Wrong answer. You are out of lives."}
          {battleAction === BattleActionEnum.DIFFICULTY_CHANGE && "Enemy defeated. A new enemy appears."}
          {battleAction === BattleActionEnum.IDLE && questionCountDown === 5 && "5 seconds left."}
        </p>
        {/* Header */}
        {battleAction !== "start-game" && (
          <>
            <div
              className={`order-1 grid grid-cols-3 gap-y-2 md:flex md:justify-between md:items-start mb-4 md:mb-6 transition-opacity duration-1000 ${
                battleAction === "idle" ? "animate-in fade-in" : ""
              }`}
            >
              <div className="col-span-3 flex items-center justify-between md:block md:w-40">
                <p className="text-muted-foreground text-[0.625rem] sm:text-sm">ENDLESS</p>
                <LivesBar
                  className="md:mt-2"
                  size="responsive"
                  lives={game.playerLives}
                  maxLives={player.hero.baseHealth}
                />
              </div>
              <div className="md:text-center md:w-40">
                <p className="text-muted-foreground text-[0.625rem] sm:text-sm">TIME</p>
                <p
                  className={`text-lg sm:text-2xl text-accent ${
                    questionCountDown < 4 ? "text-destructive" : ""
                  }`}
                >
                  {questionCountDown}
                </p>
              </div>
              <div className="text-center md:w-40">
                <p className="text-muted-foreground text-[0.625rem] sm:text-sm">STREAK</p>
                <p className="text-lg sm:text-2xl text-accent">{stats.streak}</p>
              </div>
              <div className="text-right md:w-40">
                <p className="text-muted-foreground text-[0.625rem] sm:text-sm">DIFFICULTY</p>
                <p
                  className={`text-lg sm:text-2xl text-${getDifficultColor(
                    currentQuestion.difficulty,
                  )}`}
                >
                  {currentQuestion.difficulty}
                </p>
              </div>
            </div>
            {/* Question and answers */}
            <QuestionPanel
              text={currentQuestion.text}
              answers={currentQuestion.answers}
              onSelect={handleAnswerSelect}
              disabled={isUiLocked}
              className={`order-3 md:order-2 transition-opacity duration-1000 ${
                battleAction === "idle" ? "animate-in fade-in" : ""
              }`}
            />
            {/* Stats */}
            <div
              className={`order-4 md:order-3 mt-6 flex justify-around transition-opacity duration-500 ${
                battleAction === "idle" ? "animate-in fade-in" : ""
              }`}
            >
              <div className="text-center">
                <p className="text-neon-green text-xl sm:text-2xl">{stats.correct}</p>
                <p className="text-muted-foreground text-xs">CORRECT</p>
              </div>
              <div className="text-center">
                <p className="text-destructive text-xl sm:text-2xl">{stats.wrong}</p>
                <p className="text-muted-foreground text-xs">WRONG</p>
              </div>
              <div className="text-center">
                <p className="text-accent text-xl sm:text-2xl">{stats.totalXp}</p>
                <p className="text-muted-foreground text-xs">XP EARNED</p>
              </div>
            </div>
          </>
        )}

        {/* Battle Scene */}
        <div
          className={`transition-all ease-out ${
            battleAction === "start-game"
              ? "fixed inset-0 flex items-center justify-center p-4"
              : "order-2 md:order-4 mb-4 md:mb-0 md:mt-8"
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

/**
 * A run lives on one socket connection that can't be resumed, so retrying
 * remounts the run with a fresh connection.
 */
const Game = () => {
  const [attempt, setAttempt] = useState(0);
  return <GameRun key={attempt} onRetry={() => setAttempt((a) => a + 1)} />;
};

export default Game;
