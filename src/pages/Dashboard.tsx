import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { ArcadeButton } from "@/components/ArcadeButton";
import { ArcadeCard } from "@/components/ArcadeCard";
import { Progress } from "@/components/ui/Progress";
import { getPlayerByUid, playerQueryKeys } from "@/services/playerService";
import { useEffect } from "react";
import { useMusic } from "@/hooks/useMusic";
import { useAudio } from "@/contexts/AudioContext";
import { MusicTracks } from "@/utils/musicUtils";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { changeTrack } = useMusic();
  const { isAudioPlaying } = useAudio();

  const { data: userInfo } = useQuery({
    queryKey: playerQueryKeys.byUid(user?.id || ""),
    queryFn: () => getPlayerByUid(user?.id || ""),
    enabled: !!user?.id,
  });

  if (!user) return null;

  const xpPercentage = (userInfo?.xp / userInfo?.neededXp) * 100;

  useEffect(() => {
    if (isAudioPlaying) {
       changeTrack(MusicTracks.MENU);
    }
  }, []);

  return (
    <div className="flex justify-center items-center min-h-screen p-4 md:p-8">
      <div className="w-[60rem] mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <img
            src="/resources/images/logo-long.png"
            className="inline h-12 w-64 md:h-12 mr-4"
          />

          <ArcadeButton variant="danger" size="sm" onClick={logout}>
            LOGOUT
          </ArcadeButton>
        </div>

        {/* Player Stats */}
        <ArcadeCard glow={false} className="mb-8">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-muted-foreground text-sm">PLAYER</p>
                <h2 className="text-2xl text-secondary">
                  {user.user_metadata.username}
                </h2>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground text-sm">LEVEL</p>
                <h2 className="text-4xl text-accent">{userInfo?.lvl}</h2>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-foreground">XP</span>
                <span className="text-muted-foreground">
                  {userInfo?.xp}{" "}
                  {userInfo?.neededXp ? ` / ${userInfo?.neededXp}` : ""} XP
                </span>
              </div>
              <Progress value={xpPercentage} className="h-4" />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t-2 border-border">
              <div>
                <p className="text-muted-foreground text-xs">TOTAL XP</p>
                <p className="text-xl text-foreground">{userInfo?.xp}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">NEXT LEVEL</p>
                <p className="text-xl text-foreground">
                  {userInfo?.neededXp - userInfo?.xp} XP
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
    </div>
  );
};

export default Dashboard;
