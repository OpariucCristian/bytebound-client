import { useNavigate } from "react-router-dom";
import { ArcadeButton } from "@/components/ArcadeButton";
import { ArcadeCard } from "@/components/ArcadeCard";
import { useMusic } from "@/contexts/MusicContext";
import { useEffect } from "react";
import { useAudio } from "@/contexts/AudioContext";

type Category = "dsa" | "typescript" | "csharp";

const CategorySelect = () => {
  const navigate = useNavigate();
  const { restartMusic } = useMusic();
  const {isAudioPlaying} = useAudio();

  const categories: Array<{ id: Category; name: string; color: string }> = [
    { id: "dsa", name: "DATA STRUCTURES", color: "text-primary" },
  ];

  const handleCategorySelect = (category: Category) => {
    navigate(`/game?category=${category}&mode=endless`);
  };

  useEffect(() => {
    if (isAudioPlaying) {
      restartMusic();
    }
  }, []);

  return (
    <div className="flex justify-center items-center min-h-screen p-4 md:p-8">
      <div className="w-[60rem] h-[40rem] mx-auto flex flex-col gap-48">
    
<div>
      <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-4xl text-primary">SELECT CATEGORY</h1>
          <ArcadeButton
            variant="secondary"
            size="sm"
            onClick={() => navigate("/")}
          >
            BACK
          </ArcadeButton>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {categories.map((category) => (
            <ArcadeCard
              key={category.id}
              className="cursor-pointer hover:scale-105 transition-transform"
            >
              <button
                onClick={() => handleCategorySelect(category.id)}
                className="w-full text-center space-y-4 p-4"
              >
                <div className={`text-4xl ${category.color}`}></div>
                <h3 className={`text-xl ${category.color}`}>{category.name}</h3>
              </button>
            </ArcadeCard>
          ))}
        </div></div>

        <div className="mt-12">
          <ArcadeCard>
            <div className="text-center space-y-4">
              <h4 className="text-lg text-secondary">ENDLESS MODE</h4>
              <p className="text-sm text-muted-foreground">
                Answer as many questions as you can! You have 3 lives. Each
                wrong answer costs a life. Game ends when you run out of lives.
              </p>
            </div>
          </ArcadeCard>
        </div>
      </div>
    </div>
  );
};

export default CategorySelect;
