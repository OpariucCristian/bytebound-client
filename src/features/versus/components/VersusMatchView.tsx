import { useCallback, useEffect, useRef, useState } from "react";
import { ArcadeButton } from "@/shared/components/ArcadeButton";
import { ArcadeCard } from "@/shared/components/ArcadeCard";
import Modal from "@/shared/components/ui/Modal";
import { QuestionPanel } from "@/features/game/components/QuestionPanel";
import {
  BattleAction,
  BattleActionEnum,
} from "@/features/game/types/gameTypes";
import { getDifficultColor } from "@/features/game/utils/gameUtils";
import { useMusic } from "@/shared/hooks";
import { MusicTracks } from "@/shared/utils/musicUtils";
import type { VersusSession } from "../hooks/useVersusSession";
import { useCountdown } from "../hooks/useCountdown";
import DuelScene, { type DuelBanner } from "./DuelScene";

/** How long a hit or hurt animation plays before the hero idles again. */
const REACTION_MS = 900;
/** Time to watch the final blow before the results appear. */
const FINAL_BLOW_MS = 2600;
/** Battle music switches to the faster track from this difficulty. */
const INTENSE_DIFFICULTY = 3;

interface VersusMatchViewProps {
  session: VersusSession;
  onFinished: () => void;
}

const VersusMatchView = ({ session, onFinished }: VersusMatchViewProps) => {
  const { state, ready, answer, leave } = session;
  const { match, round, roundEndsAt, roundResult, lockedOut, summary } = state;
  const you = match.you;
  const opponent = match.opponent;

  const { changeTrack } = useMusic();
  const [introDone, setIntroDone] = useState(false);
  const [yourAction, setYourAction] = useState<BattleAction>(
    BattleActionEnum.START_GAME,
  );
  const [opponentAction, setOpponentAction] = useState<BattleAction>(
    BattleActionEnum.START_GAME,
  );
  const [banner, setBanner] = useState<DuelBanner | null>({
    text: "DUEL START!",
    tone: "neutral",
  });
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(
    null,
  );
  const [isAwaitingServer, setIsAwaitingServer] = useState(false);
  const [answerError, setAnswerError] = useState<string | null>(null);
  const [isForfeitOpen, setIsForfeitOpen] = useState(false);

  const readiedRoundRef = useRef(0);
  const reactionTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const isOverRef = useRef(false);
  const isIntenseMusicRef = useRef(false);

  const secondsLeft = useCountdown(roundEndsAt);

  /** Plays one reaction on each side, then returns both heroes to idle. */
  const react = useCallback(
    (yours: BattleAction, theirs: BattleAction, next: DuelBanner | null) => {
      if (isOverRef.current) return;
      clearTimeout(reactionTimerRef.current);
      setYourAction(yours);
      setOpponentAction(theirs);
      setBanner(next);
      reactionTimerRef.current = setTimeout(() => {
        if (isOverRef.current) return;
        setYourAction(BattleActionEnum.IDLE);
        setOpponentAction(BattleActionEnum.IDLE);
      }, REACTION_MS);
    },
    [],
  );

  useEffect(() => {
    changeTrack(MusicTracks.BATTLE_1);
    return () => clearTimeout(reactionTimerRef.current);
  }, []);

  const handleIntroComplete = useCallback(() => {
    setIntroDone(true);
    setYourAction(BattleActionEnum.IDLE);
    setOpponentAction(BattleActionEnum.IDLE);
    setBanner(null);
  }, []);

  // A new round: report ready once the heroes are in place.
  useEffect(() => {
    if (!round || !introDone || readiedRoundRef.current === round.round) {
      return;
    }
    readiedRoundRef.current = round.round;
    setSelectedAnswerId(null);
    setAnswerError(null);
    if (!isOverRef.current) setBanner(null);
    if (round.difficulty >= INTENSE_DIFFICULTY && !isIntenseMusicRef.current) {
      isIntenseMusicRef.current = true;
      changeTrack(MusicTracks.BATTLE_2);
    }
    ready();
  }, [round, introDone, ready]);

  // Someone answered wrong: they take the penalty hit.
  useEffect(() => {
    const event = state.lastLockedOut;
    if (!event) return;
    if (event.uid === you.uid) {
      react(BattleActionEnum.ENEMY_ATTACK, BattleActionEnum.IDLE, {
        text: "WRONG! LOCKED OUT",
        tone: "bad",
      });
    } else {
      react(BattleActionEnum.IDLE, BattleActionEnum.ENEMY_ATTACK, {
        text: `${opponent.userName.toUpperCase()} MISSED!`,
        tone: "good",
      });
    }
  }, [state.lastLockedOut?.seq]);

  // The round is resolved: the fastest correct answer attacks.
  useEffect(() => {
    if (!roundResult) return;
    const { attackerUid, damage, reason } = roundResult;

    if (attackerUid === you.uid) {
      react(BattleActionEnum.PLAYER_ATTACK, BattleActionEnum.ENEMY_ATTACK, {
        text: `FIRST STRIKE! -${damage}`,
        tone: "good",
      });
    } else if (attackerUid === opponent.uid) {
      react(BattleActionEnum.ENEMY_ATTACK, BattleActionEnum.PLAYER_ATTACK, {
        text: `TOO SLOW! -${damage}`,
        tone: "bad",
      });
    } else if (reason === "timeout") {
      setBanner({ text: "TIME'S UP!", tone: "neutral" });
    } else {
      setBanner({ text: "NOBODY SCORES", tone: "neutral" });
    }
  }, [roundResult]);

  // The match is over: play the final blow, then show the results.
  useEffect(() => {
    if (!summary) return;

    const finalBlow = setTimeout(() => {
      isOverRef.current = true;
      clearTimeout(reactionTimerRef.current);
      const won = summary.winnerUid === you.uid;
      const lost = summary.winnerUid === opponent.uid;

      if (summary.reason === "forfeit") {
        setBanner(
          won
            ? { text: "OPPONENT FLED!", tone: "good" }
            : { text: "YOU FLED", tone: "bad" },
        );
      } else if (won) {
        setOpponentAction(BattleActionEnum.ENEMY_WIN);
        setBanner({ text: "VICTORY!", tone: "good" });
      } else if (lost) {
        setYourAction(BattleActionEnum.ENEMY_WIN);
        setBanner({ text: "DEFEAT", tone: "bad" });
      } else {
        setBanner({ text: "DRAW", tone: "neutral" });
      }
    }, REACTION_MS);

    const results = setTimeout(onFinished, FINAL_BLOW_MS);
    return () => {
      clearTimeout(finalBlow);
      clearTimeout(results);
    };
  }, [summary]);

  const handleAnswerSelect = async (answerId: string) => {
    if (isUiLocked) return;
    setSelectedAnswerId(answerId);
    setIsAwaitingServer(true);
    try {
      await answer(answerId);
    } catch (err) {
      setAnswerError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsAwaitingServer(false);
    }
  };

  const isRoundLive = !!roundEndsAt && !roundResult;
  const isLockedOut = lockedOut.includes(you.uid);
  const isUiLocked =
    !isRoundLive ||
    isLockedOut ||
    isAwaitingServer ||
    !!summary ||
    secondsLeft === 0;

  const status = (() => {
    if (summary) return null;
    if (isLockedOut && !roundResult) return "LOCKED OUT. WAIT FOR THE NEXT ROUND";
    if (lockedOut.includes(opponent.uid) && !roundResult) {
      return `${opponent.userName.toUpperCase()} IS LOCKED OUT. TAKE YOUR TIME`;
    }
    return null;
  })();

  return (
    <div className="flex justify-center items-center min-h-screen p-4 pb-20 md:p-8">
      {/* As in solo: on phones the duel sits under the HUD, answers come last */}
      <div className="w-full max-w-[60rem] mx-auto flex flex-col">
        {introDone && round && (
          <>
            {/* HUD */}
            <div className="order-1 animate-in fade-in duration-700 grid grid-cols-2 gap-y-3 md:flex md:justify-between items-end mb-4 md:mb-6 md:gap-4">
              {/* Phones: round and forfeit on top, the counters below */}
              <div className="order-1 md:order-none md:w-40">
                <p className="text-muted-foreground text-[0.625rem] sm:text-sm">ENDLESS 1V1</p>
                <p className="text-lg sm:text-2xl text-secondary mt-1 sm:mt-2">
                  ROUND {round.round}
                </p>
              </div>
              <div className="order-3 md:order-none md:text-center md:w-40">
                <p className="text-muted-foreground text-[0.625rem] sm:text-sm">TIME</p>
                <p
                  className={`text-lg sm:text-2xl ${
                    secondsLeft !== null && secondsLeft < 4
                      ? "text-destructive"
                      : "text-accent"
                  }`}
                >
                  {secondsLeft ?? round.seconds}
                </p>
              </div>
              <div className="order-4 md:order-none text-right md:text-center md:w-40">
                <p className="text-muted-foreground text-[0.625rem] sm:text-sm">DIFFICULTY</p>
                <p
                  className={`text-lg sm:text-2xl text-${getDifficultColor(
                    round.difficulty,
                  )}`}
                >
                  {round.difficulty}
                </p>
              </div>
              <div className="order-2 md:order-none md:w-40 flex justify-end">
                <ArcadeButton
                  variant="danger"
                  size="sm"
                  onClick={() => setIsForfeitOpen(true)}
                  disabled={!!summary}
                >
                  FORFEIT
                </ArcadeButton>
              </div>
            </div>

            {/* Question and answers, hidden until both players are ready */}
            <div className="order-3 md:order-2 animate-in fade-in duration-700">
              {roundEndsAt ? (
                <QuestionPanel
                  key={round.round}
                  className="animate-in fade-in duration-300"
                  text={round.question.text}
                  answers={round.question.answers}
                  onSelect={handleAnswerSelect}
                  disabled={isUiLocked}
                  correctAnswerId={roundResult?.correctAnswerId}
                  selectedAnswerId={selectedAnswerId}
                />
              ) : (
                <ArcadeCard
                  glow={false}
                  className="min-h-28 md:h-32 mb-4 md:mb-6 flex items-center justify-center text-center"
                >
                  <p className="text-sm sm:text-lg text-muted-foreground animate-blink motion-reduce:animate-none">
                    ROUND {round.round}: GET READY...
                  </p>
                </ArcadeCard>
              )}

              <p
                className="h-6 mt-4 text-center text-xs text-muted-foreground"
                aria-live="polite"
              >
                {answerError ?? status}
              </p>
            </div>
          </>
        )}

        {/* Duel, centered on screen during the intro */}
        <div
          className={`transition-all ease-out ${
            introDone
              ? "order-2 md:order-3 mb-4 md:mb-0 md:mt-4"
              : "fixed inset-0 flex items-center justify-center p-4"
          }`}
          style={{ transitionDuration: "1500ms" }}
        >
          <DuelScene
            you={you}
            opponent={opponent}
            yourLives={state.lives[you.uid] ?? you.hero.baseHealth}
            opponentLives={
              state.lives[opponent.uid] ?? opponent.hero.baseHealth
            }
            yourAction={yourAction}
            opponentAction={opponentAction}
            banner={banner}
            onIntroComplete={handleIntroComplete}
          />
        </div>
      </div>

      <Modal
        open={isForfeitOpen}
        onOpenChange={setIsForfeitOpen}
        title="Forfeit the match?"
        variant="danger"
        confirmLabel="Forfeit"
        cancelLabel="Keep fighting"
        onCancel={() => setIsForfeitOpen(false)}
        onConfirm={() => {
          setIsForfeitOpen(false);
          leave();
        }}
      >
        {opponent.userName} wins, and you earn no XP for this match.
      </Modal>
    </div>
  );
};

export default VersusMatchView;
