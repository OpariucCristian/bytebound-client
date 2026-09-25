import { ArcadeButton } from "@/shared/components/ArcadeButton";
import { ArcadeCard } from "@/shared/components/ArcadeCard";
import { cn } from "@/shared/lib/utils";
import type {
  MatchedPayload,
  MatchPlayerSummary,
  MatchSummary,
} from "@/shared/services/versusService";

interface VersusResultsProps {
  match: MatchedPayload;
  summary: MatchSummary;
  onPlayAgain: () => void;
  onMainMenu: () => void;
}

const headline = (summary: MatchSummary, uid: string) => {
  const you = summary.players.find((p) => p.uid === uid);
  switch (you?.result) {
    case "win":
      return { title: "VICTORY", tone: "text-neon-green" };
    case "loss":
      return { title: "DEFEAT", tone: "text-destructive" };
    default:
      return { title: "DRAW", tone: "text-accent" };
  }
};

const subtitle = (summary: MatchSummary, uid: string, opponent: string) => {
  const won = summary.winnerUid === uid;
  switch (summary.reason) {
    case "forfeit":
      return won ? `${opponent} left the duel.` : "You left the duel.";
    case "idle":
      return "Nobody answered for three rounds, so the duel was called off.";
    case "error":
      return "Something went wrong on the server. This duel doesn't count.";
    case "draw":
      return "You went down together, with the same number of hits.";
    default:
      return won
        ? `You knocked out ${opponent} in ${summary.rounds} rounds.`
        : `${opponent} knocked you out in ${summary.rounds} rounds.`;
  }
};

const StatRow = ({
  label,
  you,
  them,
}: {
  label: string;
  you: number;
  them: number;
}) => (
  <div className="grid grid-cols-3 items-center py-3 border-t-2 border-border">
    <p className="text-2xl text-left">{you}</p>
    <p className="text-xs text-muted-foreground text-center">{label}</p>
    <p className="text-2xl text-right">{them}</p>
  </div>
);

const VersusResults = ({
  match,
  summary,
  onPlayAgain,
  onMainMenu,
}: VersusResultsProps) => {
  const you = summary.players.find((p) => p.uid === match.you.uid);
  const them = summary.players.find((p) => p.uid === match.opponent.uid);
  const { title, tone } = headline(summary, match.you.uid);

  const stat = (key: keyof MatchPlayerSummary) => ({
    you: Number(you?.[key] ?? 0),
    them: Number(them?.[key] ?? 0),
  });

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className={cn("text-5xl md:text-6xl", tone)}>{title}</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {subtitle(summary, match.you.uid, match.opponent.userName)}
        </p>
      </div>

      <ArcadeCard glow={false} className="space-y-6">
        <div className="text-center">
          <h2 className="text-5xl text-accent mb-2">+{you?.xpGained ?? 0} XP</h2>
          <p className="text-muted-foreground text-sm">EARNED THIS DUEL</p>
        </div>

        <div>
          <div className="grid grid-cols-3 items-end pb-3">
            <p className="text-sm text-secondary text-left truncate">
              {match.you.userName}
            </p>
            <p className="text-xs text-muted-foreground text-center">VS</p>
            <p className="text-sm text-secondary text-right truncate">
              {match.opponent.userName}
            </p>
          </div>
          <StatRow label="CORRECT" {...stat("correctAnswers")} />
          <StatRow label="WRONG" {...stat("wrongAnswers")} />
          <StatRow label="LIVES LEFT" {...stat("livesLeft")} />
          <StatRow label="XP" {...stat("xpGained")} />
        </div>
      </ArcadeCard>

      <div className="grid md:grid-cols-2 gap-4">
        <ArcadeButton size="lg" className="w-full" onClick={onPlayAgain}>
          PLAY AGAIN
        </ArcadeButton>
        <ArcadeButton
          variant="secondary"
          size="lg"
          className="w-full"
          onClick={onMainMenu}
        >
          MAIN MENU
        </ArcadeButton>
      </div>
    </div>
  );
};

export default VersusResults;
