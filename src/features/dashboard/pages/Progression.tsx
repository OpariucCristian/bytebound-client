import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/contexts/AuthContext";
import { ArcadeButton } from "@/shared/components/ArcadeButton";
import { ArcadeCard } from "@/shared/components/ArcadeCard";
import { getPlayerByUid, playerQueryKeys } from "@/shared/services/playerService";
import { getHeroSkills, heroQueryKeys } from "@/shared/services/heroService";
import { useMusic } from "@/shared/hooks/useMusic";
import { useAudio } from "@/shared/contexts/AudioContext";
import { MusicTracks } from "@/shared/utils/musicUtils";
import { ProgressionTrack } from "../components/ProgressionTrack";

/** The skills the player's hero unlocks, laid out along their levels. */
const Progression = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { changeTrack } = useMusic();
  const { isAudioPlaying } = useAudio();

  const {
    data: player,
    isLoading: isPlayerLoading,
    error: playerError,
    refetch: refetchPlayer,
  } = useQuery({
    queryKey: playerQueryKeys.byUid(user?.id || ""),
    queryFn: () => getPlayerByUid(),
    enabled: !!user?.id,
  });

  const heroId = player?.hero?.id;
  const {
    data: skills,
    isLoading: areSkillsLoading,
    error: skillsError,
    refetch: refetchSkills,
  } = useQuery({
    queryKey: heroQueryKeys.skills(heroId ?? ""),
    queryFn: () => getHeroSkills(heroId!),
    enabled: !!heroId,
  });

  useEffect(() => {
    if (isAudioPlaying) {
      changeTrack(MusicTracks.MENU);
    }
  }, []);

  const error = playerError ?? skillsError;
  const playerLvl = player?.lvl ?? 1;

  const renderBody = () => {
    if (isPlayerLoading || areSkillsLoading) {
      return (
        <p role="status" className="text-primary animate-blink motion-reduce:animate-none">
          LOADING SKILLS...
        </p>
      );
    }
    if (error) {
      return (
        <div role="alert" className="space-y-6">
          <p className="text-sm leading-relaxed text-muted-foreground">{error.message}</p>
          <ArcadeButton
            variant="primary"
            onClick={() => void (playerError ? refetchPlayer() : refetchSkills())}
          >
            TRY AGAIN
          </ArcadeButton>
        </div>
      );
    }
    if (!player?.hero) {
      return (
        <div className="space-y-6">
          <p className="text-sm leading-relaxed text-foreground">Pick a hero first.</p>
          <ArcadeButton variant="primary" onClick={() => navigate("/")}>
            CHOOSE HERO
          </ArcadeButton>
        </div>
      );
    }
    if (!skills?.length) {
      return (
        <p className="text-sm leading-relaxed text-muted-foreground">
          {player.hero.name} has no skills yet.
        </p>
      );
    }
    return <ProgressionTrack skills={skills} playerLvl={playerLvl} className="w-full" />;
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-4 pb-20 md:p-8">
      <div className="w-full max-w-[60rem] mx-auto">
        <div className="flex justify-between items-center gap-4 mb-4">
          <img
            src="/resources/images/logo-long.png"
            alt="ByteBound"
            className="h-auto w-44 sm:h-12 sm:w-64"
          />
          <ArcadeButton variant="secondary" size="sm" onClick={() => navigate("/")}>
            BACK
          </ArcadeButton>
        </div>

        <ArcadeCard className="px-4 sm:px-6">
          <div className="space-y-8">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                {player?.hero && (
                  <img
                    src={`/resources/characters/player/${player.hero.spriteKey}/hud/icon.png`}
                    alt=""
                    className="w-12 h-11 shrink-0 arcade-border-shadowless border-b-8"
                  />
                )}
                <div className="min-w-0">
                  <h1 className="text-base sm:text-2xl text-primary">PROGRESSION</h1>
                  {player?.hero && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {player.hero.name?.toUpperCase()} SKILLS
                    </p>
                  )}
                </div>
              </div>
              {player && (
                <div className="text-right shrink-0">
                  <p className="text-muted-foreground text-xs">LEVEL</p>
                  <p className="text-2xl sm:text-3xl text-accent">{playerLvl}</p>
                </div>
              )}
            </div>

            <div className="min-h-72 flex items-center justify-center text-center pt-6 border-t-2 border-border">
              {renderBody()}
            </div>
          </div>
        </ArcadeCard>
      </div>
    </div>
  );
};

export default Progression;
