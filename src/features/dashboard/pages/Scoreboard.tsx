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

    const {
        data: scoreboardData,
        isLoading,
        error,
        refetch,
    } = useQuery({
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
        <div className="flex justify-center items-center min-h-screen p-4 pb-20 md:p-8">
            <div className="w-full max-w-[60rem] mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center gap-4 mb-4">
                    <img
                        src="/resources/images/logo-long.png"
                        alt="ByteBound"
                        className="h-auto w-44 sm:h-12 sm:w-64"
                    />

                    <div className="flex space-x-5">
                        <ArcadeButton variant="secondary" size="sm" onClick={() => navigate("/")}>
                            BACK
                        </ArcadeButton>
                    </div>
                </div>

                {/* Player Stats */}

                {/* Main Menu */}
                <ArcadeCard className="px-4 sm:px-6">
                    <div className="text-center space-y-6">
                        <h1 className="text-xl sm:text-2xl text-primary mb-8">SCOREBOARD</h1>

                        <div className="min-h-72 flex items-center justify-center">
                            {isLoading ? (
                                <p role="status" className="text-primary animate-blink motion-reduce:animate-none">
                                    LOADING SCORES...
                                </p>
                            ) : error ? (
                                <div role="alert" className="space-y-6">
                                    <p className="text-sm leading-relaxed text-muted-foreground">
                                        {error.message}
                                    </p>
                                    <ArcadeButton variant="primary" onClick={() => void refetch()}>
                                        TRY AGAIN
                                    </ArcadeButton>
                                </div>
                            ) : !scoreboardData?.length ? (
                                <div className="space-y-6">
                                    <p className="text-sm leading-relaxed text-foreground">
                                        No runs on the board yet.
                                    </p>
                                    <p className="text-xs leading-relaxed text-muted-foreground">
                                        {user?.isGuest
                                            ? "Guest runs aren't ranked. Sign up to claim the top spot."
                                            : "Finish a run to claim the top spot."}
                                    </p>
                                    <ArcadeButton variant="primary" onClick={() => navigate("/category")}>
                                        START GAME
                                    </ArcadeButton>
                                </div>
                            ) : (
                                <table className="w-full max-w-xl border-collapse table-fixed">
                                    <caption className="sr-only">Best runs by correct answers</caption>
                                    <thead>
                                        <tr className="text-[0.625rem] sm:text-xs text-muted-foreground">
                                            <th scope="col" className="w-8 sm:w-12 py-3 text-left">#</th>
                                            <th scope="col" className="py-3 text-left">NAME</th>
                                            <th scope="col" className="w-20 sm:w-24 pl-2 py-3 text-right">CORRECT</th>
                                            <th scope="col" className="w-[4.5rem] sm:w-24 pl-2 py-3 text-right">STREAK</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-xs sm:text-sm">
                                        {scoreboardData.map((sc, index) => (
                                            <tr key={sc.gameId ?? index} className="border-t-2 border-border">
                                                <td className="py-3 text-left tabular-nums">{index + 1}.</td>
                                                <td className="py-3 pr-2 text-left truncate" title={sc.player?.userName}>
                                                    {sc.player?.userName ?? "Unknown"}
                                                </td>
                                                <td className="py-3 text-right tabular-nums">{sc.correctAnswers}</td>
                                                <td className="py-3 text-right tabular-nums">{sc.correctAnswersStreakMax}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>


                    </div>
                </ArcadeCard>
            </div>
        </div>
    );
};

export default Scoreboard;
