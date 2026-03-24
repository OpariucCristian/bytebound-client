import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/contexts/AuthContext";
import { ArcadeButton } from "@/shared/components/ArcadeButton";
import { ArcadeCard } from "@/shared/components/ArcadeCard";
import { Progress } from "@/shared/components/ui/Progress";
import { getScoreboard } from "@/shared/services/gameService";
import { useEffect, useState } from "react";
import { useMusic } from "@/shared/hooks/useMusic";
import { useAudio } from "@/shared/contexts/AudioContext";
import { MusicTracks } from "@/shared/utils/musicUtils";

const Scoreboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { changeTrack } = useMusic();
    const { isAudioPlaying } = useAudio();

    const [currentPage, setCurrentPage] = useState<number>(0);

    const { data: scoreboardData } = useQuery({
        queryKey: ["scoreboard", currentPage],
        queryFn: () => getScoreboard(currentPage),
        enabled: !!user?.id,
    });

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

                    <div className="flex space-x-5">
                        <ArcadeButton variant="secondary" size="sm" onClick={() => navigate("/")}>
                            BACK
                        </ArcadeButton>
                    </div>
                </div>

                {/* Player Stats */}

                {/* Main Menu */}
                <ArcadeCard>
                    <div className="text-center space-y-6">
                        <h3 className="text-2xl text-primary mb-8">SCOREBOARD</h3>

                        <div className="h-64 flex items-center justify-center">
                            <table className="w-full max-w-xl border-collapse">
                                <thead>
                                    <tr >
                                        <th></th>
                                        <th>Name</th>
                                        <th>Correct</th>
                                        <th>Max streak</th>

                                    </tr>
                                </thead>
                                <tbody className="">
                               
                                    {scoreboardData?.map((sc, index) => {
                                        return <tr className="m-5"><td><p>{index + 1}.</p></td><td><p>{sc.player.userName}</p></td><td> <p>{sc.correctAnswers}</p></td><td> <p>{sc.correctAnswersStreakMax}</p></td> </tr>
                                    })}
                                  
                                </tbody>
                            </table>
                        </div>


                    </div>
                </ArcadeCard>
            </div>
        </div>
    );
};

export default Scoreboard;
