import { useEffect, useState } from "react";
import { cn } from "@/shared/lib/utils";

/**
 * A looping demo of the game screen on the title page: one question answered
 * right (the knight strikes) and one answered wrong (the demon hits back). It
 * reuses the look of the real battle scene and answer buttons, so what people
 * see here is what they'll play.
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
  baseHealth: 3,
  idle: { src: "/resources/characters/enemy/enemy_demon/IDLE.png", frames: 4 },
  attack: { src: "/resources/characters/enemy/enemy_demon/ATTACK.png", frames: 8 },
  hurt: { src: "/resources/characters/enemy/enemy_demon/HURT.png", frames: 4 },
};

// Real questions from the DSA pool, with the answer the demo player picks
const QUESTIONS = [
  {
    text: "Which data structure is Last-In-First-Out (LIFO)?",
    answers: ["Stack", "Queue", "Linked list", "Heap"],
    pick: 0,
    correct: true,
  },
  {
    text: "Which data structure is First-In-First-Out (FIFO)?",
    answers: ["Queue", "Stack", "Binary tree", "Hash set"],
    pick: 1,
    correct: false,
  },
];

type BeatKind = "ask" | "resolve" | "rest";

interface Beat {
  kind: BeatKind;
  question: number;
  ticks: number;
}

const BEATS: Beat[] = [
  { kind: "ask", question: 0, ticks: 18 },
  { kind: "resolve", question: 0, ticks: 14 },
  { kind: "rest", question: 0, ticks: 6 },
  { kind: "ask", question: 1, ticks: 18 },
  { kind: "resolve", question: 1, ticks: 14 },
  { kind: "rest", question: 1, ticks: 6 },
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
  className,
}: {
  sheet: Sheet;
  frame: number;
  width: number;
  height: number;
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
  const answered = beat.kind !== "ask";
  const heroWins = beat.kind === "resolve" && question.correct;
  const demonWins = beat.kind === "resolve" && !question.correct;
  const demonLives = question.correct && answered ? DEMON.baseHealth - 1 : DEMON.baseHealth;

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

  return (
    <figure className="w-full">
      <figcaption className="sr-only">
        A demo fight: answer a question right and your hero strikes; answer
        wrong and the enemy hits back.
      </figcaption>

      <div aria-hidden="true" className="flex flex-col gap-3">
        {/* Battle scene, as in the game */}
        <div className="relative h-44 border-2 overflow-hidden">
          <div
            className="absolute inset-0 bg-[url('/resources/backgrounds/cave.png')] bg-cover bg-[center_85%] opacity-90"
            style={{ imageRendering: "pixelated" }}
          />

          <div className="absolute top-0 right-0 mt-2 mr-2">
            <p className="text-end text-xs">Demon</p>
            <div className="mt-1 flex flex-row-reverse">
              {Array.from({ length: DEMON.baseHealth }, (_, i) => (
                <img
                  key={i}
                  src={
                    i < demonLives
                      ? "/resources/hud/heart-full.png"
                      : "/resources/hud/heart-empty.png"
                  }
                  alt=""
                  className="w-5 h-5"
                />
              ))}
            </div>
          </div>

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
            className={cn(
              "absolute bottom-[-10px] right-[4%] sm:right-[14%] transition-transform duration-150 ease-out",
              demonWins && t < DEMON.attack.frames && "-translate-x-6",
            )}
          />

          {beat.kind === "resolve" && (
            <p
              className={cn(
                "absolute top-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-sm arcade-glow animate-pulse motion-reduce:animate-none",
                question.correct ? "text-neon-green" : "text-red-500",
              )}
            >
              {question.correct ? "CORRECT ANSWER!" : "WRONG ANSWER!"}
            </p>
          )}
        </div>

        {/* Question and answers, as in the game */}
        <div className="arcade-border bg-card px-4 py-3 text-center">
          <p className="text-xs leading-relaxed text-foreground">{question.text}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {question.answers.map((answer, i) => {
            const picked = answered && i === question.pick;
            return (
              <div
                key={answer}
                className={cn(
                  "bg-primary text-primary-foreground px-3 py-2 text-center text-xs leading-relaxed transition-all duration-150",
                  "shadow-[0_4px_0_0_hsl(var(--border))]",
                  picked && "translate-y-1 shadow-none brightness-75",
                  answered && !picked && "opacity-50",
                )}
              >
                {answer}
              </div>
            );
          })}
        </div>
      </div>
    </figure>
  );
};
