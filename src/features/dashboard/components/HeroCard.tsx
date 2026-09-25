import { ArcadeCard } from "@/shared/components/ArcadeCard";
import { Hero } from "@/shared/services/heroService";

type HeroCardProps = {
  hero: Hero;
  onAssignHero: () => void;
};
const HeroCard = (props: HeroCardProps) => {
  const { hero, onAssignHero } = props;

  return (
    <div onClick={onAssignHero}>
      {/* A row on phones (portrait beside the text), a tall card from sm up */}
      <ArcadeCard className="flex flex-row sm:flex-col bg-[#212121] justify-start sm:justify-center items-center gap-4 sm:gap-5 w-full sm:w-64 sm:h-80 p-4 sm:p-6 hover:animate-pulse-glow cursor-pointer">
        <div className="shrink-0 overflow-hidden h-20 sm:h-50">
          <img
            src={`/resources/characters/player/${hero.spriteKey}/hud/thumbnail.png`}
            alt=""
            className="w-20 h-20 sm:w-52 sm:h-50 object-cover"
          />
        </div>
        <div className="flex flex-col gap-3 sm:gap-5 justify-center items-start sm:items-center sm:h-20 sm:w-40">
          <h2>{hero.name}</h2>
          <p className="text-muted-foreground text-xs text-left sm:text-center">
            {hero.description}
          </p>
        </div>
      </ArcadeCard>
    </div>
  );
};

export default HeroCard;
