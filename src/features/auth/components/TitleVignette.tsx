import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { PixelCursor } from "@/shared/components/PixelCursor";

/**
 * A looping demo fight on the title screen: one question answered right (the
 * knight strikes) and one answered wrong (the demon hits back). It shows the
 * whole game in a few seconds, before anyone has to sign up.
 */

const TICK_MS = 110;
const SCALE = 2;

interface Sheet {
  src: string;
  frames: number;
}

const KNIGHT = {
  width: 96,
  height: 84,
  idle: { src: "/resources/characters/player/hero_knight/IDLE.png", frames: 7 },
  attack: { src: "/resources/characters/player/hero_knight/ATTACK1.png", frames: 6 },
  hurt: { src: "/resources/characters/player/hero_knight/HURT.png", frames: 4 },
};

const DEMON = {
  width: 81,
  height: 71,
  idle: { src: "/resources/characters/enemy/enemy_demon/IDLE.png", frames: 4 },
  attack: { src: "/resources/characters/enemy/enemy_demon/ATTACK.png", frames: 8 },
  hurt: { src: "/resources/characters/enemy/enemy_demon/HURT.png", frames: 4 },
};

// Real questions from the DSA pool
const QUESTIONS = [
  { text: "Which data structure is Last-In-First-Out?", pick: "Stack", correct: true },
  { text: "Which data structure is First-In-First-Out?", pick: "Stack", correct: false },
];

type BeatKind = "ask" | "resolve" | "rest";

interface Beat {
  kind: BeatKind;
  question: number;
  ticks: number;
}

const BEATS: Beat[] = [
  { kind: "ask", question: 0, ticks: 16 },
  { kind: "resolve", question: 0, ticks: 12 },
  { kind: "rest", question: 0, ticks: 10 },
  { kind: "ask", question: 1, ticks: 16 },
  { kind: "resolve", question: 1, ticks: 14 },
  { kind: "rest", question: 1, ticks: 10 },
];

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Frame of a one-shot animation that starts `delay` ticks into the beat. */
const oneShot = (sheet: Sheet, t: number, delay = 0) =>
  t < delay ? null : Math.min(t - delay, sheet.frames - 1);

const Sprite = ({
  sheet,
  frame,
  width,
  height,
  flip = false,
  className,
}: {
  sheet: Sheet;
  frame: number;
  width: number;
  height: number;
  flip?: boolean;
  className?: string;
}) => (
  <div
    className={className}
    style={{
      width: width * SCALE,
      height: height * SCALE,
      backgroundImage: `url(${sheet.src})`,
      backgroundSize: `${sheet.frames * width * SCALE}px ${height * SCALE}px`,
      backgroundPosition: `${-frame * width * SCALE}px 0`,
      backgroundRepeat: "no-repeat",
      imageRendering: "pixelated",
      transform: flip ? "scaleX(-1)" : undefined,
    }}
  />
);

export const TitleVignette = () => {
  const [reducedMotion] = useState(prefersReducedMotion);
  const [tick, setTick] = useState(0);
  const [beatIndex, setBeatIndex] = useState(0);
  const [beatStart, setBeatStart] = useState(0);

  useEffect(() => {
    if (reducedMotion) return;
    const interval = setInterval(() => setTick((t) => t + 1), TICK_MS);
    return () => clearInterval(interval);
  }, [reducedMotion]);

  useEffect(() => {
    if (tick - beatStart >= BEATS[beatIndex].ticks) {
      setBeatIndex((i) => (i + 1) % BEATS.length);
      setBeatStart(tick);
    }
  }, [tick, beatStart, beatIndex]);

  const beat = BEATS[beatIndex];
  const question = QUESTIONS[beat.question];
  const t = tick - beatStart;
  const resolving = beat.kind === "resolve";
  const heroWins = resolving && question.correct;
  const demonWins = resolving && !question.correct;

  let knight: { sheet: Sheet; frame: number } = {
    sheet: KNIGHT.idle,
    frame: tick % KNIGHT.idle.frames,
  };
  let demon: { sheet: Sheet; frame: number } = {
    sheet: DEMON.idle,
    frame: tick % DEMON.idle.frames,
  };

  if (heroWins) {
    knight = { sheet: KNIGHT.attack, frame: oneShot(KNIGHT.attack, t) ?? 0 };
    const hurt = oneShot(DEMON.hurt, t, 3);
    if (hurt !== null) demon = { sheet: DEMON.hurt, frame: hurt };
  }
  if (demonWins) {
    demon = { sheet: DEMON.attack, frame: oneShot(DEMON.attack, t) ?? 0 };
    const hurt = oneShot(KNIGHT.hurt, t, 5);
    if (hurt !== null) knight = { sheet: KNIGHT.hurt, frame: hurt };
  }

  const showVerdict = beat.kind !== "ask";

  return (
    <figure className="w-full">
      <figcaption className="sr-only">
        A demo fight: answer a question right and your hero strikes; answer
        wrong and the enemy hits back.
      </figcaption>

      <div aria-hidden="true">
        {/* Stage */}
        <div className="rpg-window relative h-44 overflow-hidden !bg-plum-950">
          <div
            className="absolute inset-0 bg-[url('/resources/backgrounds/cave.png')] bg-cover bg-[center_85%] opacity-80"
            style={{ imageRendering: "pixelated" }}
          />
          <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-plum-950/70 to-transparent" />

          <Sprite
            {...knight}
            width={KNIGHT.width}
            height={KNIGHT.height}
            className={cn(
              "absolute bottom-[-30px] left-[4%] sm:left-[14%] transition-transform duration-150 ease-out",
              heroWins && t < KNIGHT.attack.frames && "translate-x-8",
            )}
          />
          <Sprite
            {...demon}
            width={DEMON.width}
            height={DEMON.height}
            flip
            className={cn(
              "absolute bottom-[-10px] right-[4%] sm:right-[14%] transition-transform duration-150 ease-out",
              demonWins && t < DEMON.attack.frames && "-translate-x-6",
            )}
          />
        </div>

        {/* Dialogue box */}
        <div className="rpg-window mt-3 px-5 py-4 text-xs leading-relaxed">
          <p className="text-bone min-h-[3.25em]">{question.text}</p>
          <div className="mt-3 flex items-center gap-3">
            <PixelCursor
              className={cn(
                "h-3 w-3 text-torch",
                beat.kind === "ask" && !reducedMotion && "animate-blink",
              )}
            />
            <span className="text-torch">{question.pick}</span>
            {showVerdict && (
              <span
                className={cn(
                  "ml-auto flex items-center gap-2",
                  question.correct ? "text-torch" : "text-bone-dim",
                )}
              >
                {question.correct ? (
                  <Check className="h-4 w-4" strokeWidth={3} />
                ) : (
                  <X className="h-4 w-4 text-crimson-bright" strokeWidth={3} />
                )}
                {question.correct ? "HERO STRIKES" : "ENEMY HITS BACK"}
              </span>
            )}
          </div>
        </div>
      </div>
    </figure>
  );
};
