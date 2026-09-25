import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/contexts/AuthContext";
import { ArcadeButton } from "@/shared/components/ArcadeButton";
import { ArcadeCard } from "@/shared/components/ArcadeCard";
import { Progress } from "@/shared/components/ui/Progress";
import {
  getPlayerByUid,
  Player,
  playerQueryKeys,
} from "@/shared/services/playerService";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  getVersusStats,
  versusQueryKeys,
} from "@/shared/services/versusService";
import { useMusic } from "@/shared/hooks/useMusic";
import { useAudio } from "@/shared/contexts/AudioContext";
import { MusicTracks } from "@/shared/utils/musicUtils";
import Dialog from "@/shared/components/ui/Modal";
import HeroCard from "../components/HeroCard";
import HeroPicker from "../components/HeroPicker";
import HeroIcon from "../components/HeroIcon";
import { GuestNotice } from "@/features/auth/components/GuestNotice";
import { ErrorPanel } from "@/shared/components/ErrorPanel";
import { LoadingScreen } from "@/shared/components/LoadingScreen";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { changeTrack } = useMusic();
  const { isAudioPlaying } = useAudio();

  const {
    data: player,
    isLoading,
    error: playerError,
    refetch: refetchPlayer,
  } = useQuery({
    queryKey: playerQueryKeys.byUid(user?.id || ""),
    queryFn: () => getPlayerByUid(),

    enabled: !!user?.id,
  });

  const { data: versusStats } = useQuery({
    queryKey: versusQueryKeys.stats(),
    queryFn: getVersusStats,
    enabled: !!user?.id,
  });

  const xp = player?.xp ?? 0;
  // No neededXp means the player is at the top level
  const neededXp = player?.neededXp ?? 0;
  const isMaxLevel = !!player && neededXp <= 0;
  const xpPercentage = isMaxLevel ? 100 : Math.min(100, (xp / neededXp) * 100);

  const [isHeroSelectModalOpen, setIsHeroSelectModalOpen] = useState<boolean>(
    false,
  );

  useEffect(() => {
    if (isAudioPlaying) {
      changeTrack(MusicTracks.MENU);
    }
  }, []);

  useEffect(() => {
  // Only once we know the player: a failed load isn't "no hero yet"
  if (player && !player.hero?.id) {
    setIsHeroSelectModalOpen(true);
  }
}, [player]);

  if (!user) return null;

  if (playerError) {
    return (
      <ErrorPanel
        fullScreen
        title="COULDN'T LOAD YOUR PLAYER"
        message={playerError.message}
        action={{ label: "TRY AGAIN", onClick: () => void refetchPlayer() }}
        secondaryAction={{ label: user.isGuest ? "EXIT" : "LOGOUT", onClick: () => void logout() }}
      />
    );
  }

  if (isLoading || !player) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex justify-center items-center min-h-screen p-4 pb-20 md:p-8">
      <div className="w-full max-w-[60rem] mx-auto">
        {/* Header: logo over the actions on phones, side by side from sm up */}
        <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-4 mb-4">
          <img
            src="/resources/images/logo-long.png"
            alt="ByteBound"
            className="h-auto w-56 sm:h-12 sm:w-64"
          />
          <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end gap-3 sm:gap-5">
            {player.hero && (
              <div onClick={() => setIsHeroSelectModalOpen(true)}>
                <HeroIcon hero={(player as Player)?.hero} />
              </div>
            )}
            <ArcadeButton
              variant="secondary"
              size="sm"
              onClick={() => navigate("/scoreboard")}
            >
              SCOREBOARD
            </ArcadeButton>
            <ArcadeButton variant="danger" size="sm" onClick={logout}>
              {user.isGuest ? "EXIT" : "LOGOUT"}
            </ArcadeButton>
          </div>
        </div>

        {user.isGuest && (
          <GuestNotice title={`PLAYING AS ${user.username.toUpperCase()}`} className="mb-6" />
        )}

        {/* Player Stats */}
        <ArcadeCard glow={false} className="mb-8">
          <div className="space-y-4">
            <div className="flex justify-between items-center gap-6">
              <div className="min-w-0">
                <p className="text-muted-foreground text-sm">PLAYER</p>
                <h2 className="text-xl sm:text-2xl text-secondary break-words">
                  {user.username}
                </h2>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground text-sm">LEVEL</p>
                <h2 className="text-3xl sm:text-4xl text-accent">{player.lvl}</h2>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-foreground">XP</span>
                <span className="text-muted-foreground">
                  {isMaxLevel ? `${xp} XP` : `${xp} / ${neededXp} XP`}
                </span>
              </div>
              <Progress value={xpPercentage} className="h-4" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t-2 border-border">
              <div>
                <p className="text-muted-foreground text-xs">TOTAL XP</p>
                <p className="text-lg sm:text-xl text-foreground">{xp}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">NEXT LEVEL</p>
                <p className="text-lg sm:text-xl text-foreground">
                  {isMaxLevel ? "MAX LEVEL" : `${neededXp - xp} XP`}
                </p>
              </div>
              <div className="col-span-2 sm:col-span-1 sm:text-right">
                <p className="text-muted-foreground text-xs">1V1 W / L / D</p>
                <p className="text-lg sm:text-xl text-foreground whitespace-nowrap">
                  {versusStats
                    ? `${versusStats.wins} / ${versusStats.losses} / ${versusStats.draws}`
                    : "-"}
                </p>
              </div>
            </div>
          </div>
        </ArcadeCard>

        {/* Main Menu */}
        <ArcadeCard>
          <div className="text-center space-y-6">
            <h3 className="text-2xl text-primary mb-8">MAIN MENU</h3>

            <ArcadeButton
              variant="primary"
              size="lg"
              onClick={() => navigate("/category")}
              className="w-full"
            >
              START GAME
            </ArcadeButton>

            <div className="pt-8 border-t-2 border-border">
              <p className="text-muted-foreground text-sm mb-4">GAME INFO</p>
              <div className="space-y-2 text-left text-sm">
                <p className="text-foreground">• Choose your category</p>
                <p className="text-foreground">• Answer questions correctly</p>
                <p className="text-foreground">
                  • Build your compsci knowledge
                </p>
                <p className="text-foreground">• Earn XP and level up!</p>
              </div>
            </div>
          </div>
        </ArcadeCard>
      </div>

      <Dialog open={isHeroSelectModalOpen} title="Choose your hero">
        <h2>You can change it anytime.</h2>
        <HeroPicker onChange={setIsHeroSelectModalOpen} />
      </Dialog>
    </div>
  );
};

export default Dashboard;
