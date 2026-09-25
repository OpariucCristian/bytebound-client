import { useNavigate, useSearchParams } from "react-router-dom";
import { ArcadeButton } from "@/shared/components/ArcadeButton";
import { ArcadeCard } from "@/shared/components/ArcadeCard";
import { useMusic } from "@/shared/contexts/MusicContext";
import { useEffect } from "react";
import { useAudio } from "@/shared/contexts/AudioContext";
import { MusicTracks } from "@/shared/utils/musicUtils";
import { cn } from "@/shared/lib/utils";
import { CATEGORIES } from "@/features/game/utils/categories";

/** Endless is played alone or as a 1v1 duel. */
type PlayStyle = "solo" | "1v1";

const PLAY_STYLES: Record<PlayStyle, { label: string; rules: string }> = {
  solo: {
    label: "SOLO",
    rules:
      "Answer as many questions as you can! Each wrong answer costs a life. Defeat enemies to face harder ones. The game ends when you run out of lives.",
  },
  "1v1": {
    label: "1V1",
    rules:
      "Duel another player on the same questions. The first correct answer strikes, a wrong answer hurts you. Last hero standing wins.",
  },
};

const CategorySelect = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { changeTrack } = useMusic();
  const { isAudioPlaying } = useAudio();

  const playStyle: PlayStyle =
    searchParams.get("play") === "1v1" ? "1v1" : "solo";

  const setPlayStyle = (style: PlayStyle) =>
    setSearchParams(style === "1v1" ? { play: "1v1" } : {}, { replace: true });

  const handleCategorySelect = (category: string) => {
    navigate(
      playStyle === "1v1"
        ? `/versus?category=${category}`
        : `/game?category=${category}&mode=endless`,
    );
  };

  useEffect(() => {
    if (isAudioPlaying) {
      changeTrack(MusicTracks.MENU);
    }
  }, []);

  return (
    <div className="flex justify-center items-center min-h-screen p-4 pb-20 md:p-8">
      <div className="w-full max-w-[60rem] mx-auto flex flex-col gap-8 md:gap-12">
        <div>
          <div className="flex justify-between items-center gap-4 mb-6 md:mb-8">
            <h1 className="text-2xl md:text-4xl text-primary">
              SELECT CATEGORY
            </h1>
            <ArcadeButton
              variant="secondary"
              size="sm"
              onClick={() => navigate("/")}
            >
              BACK
            </ArcadeButton>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 mb-6 md:mb-8">
            <p className="text-sm text-muted-foreground">ENDLESS</p>
            {(Object.keys(PLAY_STYLES) as PlayStyle[]).map((style) => (
              <ArcadeButton
                key={style}
                size="sm"
                variant={playStyle === style ? "accent" : "secondary"}
                onClick={() => setPlayStyle(style)}
                className={cn(playStyle !== style && "opacity-70")}
              >
                {PLAY_STYLES[style].label}
              </ArcadeButton>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {CATEGORIES.map((category) => (
              <ArcadeCard
                key={category.id}
                className="cursor-pointer hover:scale-105 transition-transform"
              >
                <button
                  onClick={() => handleCategorySelect(category.id)}
                  className="w-full text-center space-y-4 p-4"
                >
                  <h2 className={`text-xl ${category.color}`}>
                    {category.name}
                  </h2>
                </button>
              </ArcadeCard>
            ))}
          </div>
        </div>

        <ArcadeCard>
          <div className="text-center space-y-4">
            <h2 className="text-lg text-secondary">
              ENDLESS · {PLAY_STYLES[playStyle].label}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {PLAY_STYLES[playStyle].rules}
            </p>
          </div>
        </ArcadeCard>
      </div>
    </div>
  );
};

export default CategorySelect;
