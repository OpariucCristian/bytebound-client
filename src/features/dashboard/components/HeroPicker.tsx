import { ArcadeButton } from "@/shared/components/ArcadeButton";
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

  const { data: heroes, isLoading, error, refetch } = useQuery({
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-96">
        <p role="status" className="text-primary animate-blink motion-reduce:animate-none">
          LOADING HEROES...
        </p>
      </div>
    );
  }

  if (error || !heroes?.length) {
    return (
      <div role="alert" className="flex flex-col items-center justify-center gap-6 w-full h-96 p-10 text-center">
        <p className="text-sm leading-relaxed text-muted-foreground">
          {error ? error.message : "No heroes are available right now."}
        </p>
        <ArcadeButton variant="primary" onClick={() => void refetch()}>
          TRY AGAIN
        </ArcadeButton>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full gap-4">
      <div
        aria-busy={assignHeroMutation.isPending}
        className={`flex flex-row justify-center items-center w-full h-96 gap-5 p-10 ${
          assignHeroMutation.isPending ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        {heroes.map((hero) => (
          <HeroCard
            key={hero.id}
            hero={hero}
            onAssignHero={() => assignHeroMutation.mutate(hero.id)}
          />
        ))}
      </div>
      {assignHeroMutation.isError && (
        <p role="alert" className="text-xs leading-relaxed text-destructive text-center">
          Couldn't save your hero: {assignHeroMutation.error.message}. Pick again to retry.
        </p>
      )}
    </div>
  );
};

export default HeroPicker;
