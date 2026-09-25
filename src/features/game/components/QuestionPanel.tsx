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
  className,
}: QuestionPanelProps) => (
  <div className={className}>
    <ArcadeCard glow={false} className="h-32 mb-6 text-center">
      <h2 className="text-lg md:text-xl text-foreground leading-relaxed">
        {text}
      </h2>
    </ArcadeCard>
    <div className="grid md:grid-cols-2 gap-4">
      {answers.map((answer) => {
        const isCorrect = correctAnswerId === answer.id;
        const isWrongPick =
          selectedAnswerId === answer.id && correctAnswerId !== answer.id;

        return (
          <ArcadeButton
            key={answer.id}
            variant={isWrongPick ? "danger" : "primary"}
            onClick={() => onSelect(answer.id)}
            disabled={disabled}
            className={cn(
              "w-full h-auto min-h-[80px] whitespace-normal text-left",
              isCorrect &&
                "ring-4 ring-neon-green disabled:opacity-100 animate-in fade-in",
              isWrongPick && "disabled:opacity-100",
            )}
          >
            {answer.text}
          </ArcadeButton>
        );
      })}
    </div>
  </div>
);
