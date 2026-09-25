import { ArcadeCard } from "@/shared/components/ArcadeCard";
import { Hero } from "@/shared/services/heroService";

type HeroCardProps = {
  hero: Hero;
  onAssignHero: () => void;
};
const HeroCard = (props: HeroCardProps) => {
  const { hero, onAssignHero } = props;

  return (
    <button
      type="button"
      onClick={onAssignHero}
      className="block w-full sm:w-auto text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
    >
      {/* A row on phones (portrait beside the text), a tall card from sm up */}
      <ArcadeCard className="flex flex-row sm:flex-col bg-background justify-start sm:justify-center items-center gap-4 sm:gap-5 w-full sm:w-64 sm:h-80 p-4 sm:p-6 hover:animate-pulse-glow motion-reduce:hover:animate-none cursor-pointer">
        <div className="shrink-0 overflow-hidden size-20 sm:size-40">
          <img
            src={`/resources/characters/player/${hero.spriteKey}/hud/thumbnail.png`}
            alt=""
            className="size-full object-contain"
          />
        </div>
        <div className="flex flex-col gap-3 sm:gap-5 justify-center items-start sm:items-center sm:h-20 sm:w-40">
          <span className="text-base text-foreground">{hero.name}</span>
          <span className="text-muted-foreground text-xs leading-relaxed text-left sm:text-center">
            {hero.description}
          </span>
        </div>
      </ArcadeCard>
    </button>
  );
};

export default HeroCard;
