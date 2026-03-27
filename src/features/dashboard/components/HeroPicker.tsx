import { ArcadeCard } from "@/shared/components/ArcadeCard";
import { getHeroes } from "@/shared/services/heroService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import HeroCard from "./HeroCard";
import { assignHero } from "@/shared/services";
import { Dispatch, SetStateAction } from "react";

type HeroPickerProps = {
  onChange: Dispatch<SetStateAction<boolean>>;
};
const HeroPicker = (props: HeroPickerProps) => {
  const { onChange } = props;
  const queryClient = useQueryClient();

  const { data: heroes, isLoading } = useQuery({
    queryKey: ["heroes"],
    queryFn: () => getHeroes(),
  });

  const assignHeroMutation = useMutation({
    mutationFn: (heroId: string) => assignHero(heroId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
      onChange(false);
    },
  });

  return (
    <div className="flex flex-row justify-center items-center w-full gap-5 p-10">
      {isLoading ||
        heroes.map((hero) => {
          return (
            <HeroCard
              key={hero.id}
              hero={hero}
              onAssignHero={() => assignHeroMutation.mutate(hero.id)}
            />
          );
        })}
    </div>
  );
};

export default HeroPicker;
