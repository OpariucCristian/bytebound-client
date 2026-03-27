import { ArcadeCard } from "@/shared/components/ArcadeCard";
import { Hero } from "@/shared/services/heroService";

type HeroCardProps = {
  hero: Hero;
  onAssignHero: () => void;
};
const HeroCard = (props: HeroCardProps) => {
  const { hero, onAssignHero } = props;
  console.log(hero.spriteKey);
  return (
    <div onClick={onAssignHero}>
      <ArcadeCard className="flex flex-col bg-[#212121] justify-center items-center gap-5 w-60 h-72 hover:animate-pulse-glow cursor-pointer">
        <img
          src={`/resources/${hero.spriteKey}/hud/thumbnail.png`}
          className="w-52 h-64 overflow-hidden object-cover"
        />
        <h2>{hero.name}</h2>
      </ArcadeCard>
    </div>
  );
};

export default HeroCard;
