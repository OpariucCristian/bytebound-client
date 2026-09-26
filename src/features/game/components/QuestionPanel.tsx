import { ArcadeButton } from "@/shared/components/ArcadeButton";
import { ArcadeCard } from "@/shared/components/ArcadeCard";
import { cn } from "@/shared/lib/utils";

interface QuestionPanelProps {
  text: string | null;
  answers: { id: string; text: string | null }[];
  onSelect: (answerId: string) => void;
  disabled: boolean;
  /** Reveals the correct answer once the question is resolved. */
  correctAnswerId?: string | null;
  /** The answer the player picked, marked red if it was wrong. */
  selectedAnswerId?: string | null;
  /** Wrong answers a skill took off the board. */
  removedAnswerIds?: string[];
  className?: string;
}

/** The question card and its grid of answer buttons. */
export const QuestionPanel = ({
  text,
  answers,
  onSelect,
  disabled,
  correctAnswerId,
  selectedAnswerId,
  removedAnswerIds,
  className,
}: QuestionPanelProps) => (
  <div className={className}>
    <ArcadeCard
      glow={false}
      className="min-h-28 md:h-32 mb-4 md:mb-6 p-4 md:p-6 flex items-center justify-center md:block text-center"
    >
      <h2 className="text-sm sm:text-lg md:text-xl text-foreground leading-relaxed">
        {text}
      </h2>
    </ArcadeCard>
    <div className="grid grid-cols-2 gap-3 md:gap-4">
      {answers.map((answer) => {
        const isCorrect = correctAnswerId === answer.id;
        const isWrongPick =
          selectedAnswerId === answer.id && correctAnswerId !== answer.id;
        const isRemoved = removedAnswerIds?.includes(answer.id) ?? false;

        return (
          <ArcadeButton
            key={answer.id}
            variant={isWrongPick ? "danger" : "primary"}
            onClick={() => onSelect(answer.id)}
            disabled={disabled || isRemoved}
            aria-label={isRemoved ? `${answer.text} (ruled out)` : undefined}
            className={cn(
              "w-full h-auto min-h-[72px] md:min-h-[80px] px-3 md:px-6 text-xs md:text-sm whitespace-normal text-center",
              isCorrect &&
                "ring-4 ring-neon-green disabled:opacity-100 animate-in fade-in",
              isWrongPick && "disabled:opacity-100",
              isRemoved && "disabled:opacity-20",
            )}
          >
            {answer.text}
          </ArcadeButton>
        );
      })}
    </div>
  </div>
);
