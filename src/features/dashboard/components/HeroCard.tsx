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
      <ArcadeCard className="flex flex-col bg-[#212121] justify-center items-center gap-5 w-64 h-80 hover:animate-pulse-glow cursor-pointer">
        <div className="overflow-hidden h-50">
          <img
            src={`/resources/characters/player/${hero.spriteKey}/hud/thumbnail.png`}
            className="w-52 h-50 object-cover"
          />
        </div>
        <div className="flex flex-col gap-5 justify-center items-center h-20 w-40">
          <h2>{hero.name}</h2>
          <p className="text-muted-foreground text-xs text-center ">
            {hero.description}
          </p>
        </div>
      </ArcadeCard>
    </div>
  );
};

export default HeroCard;
