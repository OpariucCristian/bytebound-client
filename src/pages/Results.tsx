import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ArcadeButton } from '@/components/ArcadeButton';
import { ArcadeCard } from '@/components/ArcadeCard';
import { mockAuthService } from '@/services/mockAuthService';
import { mockQuestionService, Category, Difficulty } from '@/services/mockQuestionService';

interface LocationState {
  stats: {
    correct: number;
    wrong: number;
    streak: number;
    maxStreak: number;
    totalXp: number;
  };
  category: Category;
  difficulty: Difficulty;
}

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const state = location.state as LocationState;

  useEffect(() => {
    if (!state || !user) {
      navigate('/');
      return;
    }

    // Update user XP
    const updateXp = async () => {
      const updatedUser = await mockAuthService.updateUserProgress(state.stats.totalXp);
      updateUser(updatedUser);
    };

    updateXp();
  }, [state, user, navigate, updateUser]);

  if (!state || !user) return null;

  const { stats, category, difficulty } = state;
  const totalQuestions = stats.correct + stats.wrong;
  const accuracy = Math.round((stats.correct / totalQuestions) * 100);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl text-primary mb-4">
            GAME OVER
          </h1>
          <p className="text-xl text-secondary">
            {mockQuestionService.getCategoryName(category)} - {difficulty.toUpperCase()}
          </p>
        </div>

        {/* Results Card */}
        <ArcadeCard glow={false} className="mb-8">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-5xl text-accent mb-2">
                +{stats.totalXp} XP
              </h2>
              <p className="text-muted-foreground">TOTAL EARNED</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t-2 border-border">
              <div className="text-center">
                <p className="text-3xl text-neon-green">{stats.correct}</p>
                <p className="text-muted-foreground text-sm">CORRECT</p>
              </div>
              <div className="text-center">
                <p className="text-3xl text-destructive">{stats.wrong}</p>
                <p className="text-muted-foreground text-sm">WRONG</p>
              </div>
              <div className="text-center">
                <p className="text-3xl text-primary">{accuracy}%</p>
                <p className="text-muted-foreground text-sm">ACCURACY</p>
              </div>
              <div className="text-center">
                <p className="text-3xl text-secondary">{stats.maxStreak}</p>
                <p className="text-muted-foreground text-sm">MAX STREAK</p>
              </div>
            </div>

            <div className="pt-6 border-t-2 border-border">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-muted-foreground text-sm">NEW LEVEL</p>
                  <p className="text-3xl text-accent">{user.level}</p>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground text-sm">TOTAL XP</p>
                  <p className="text-2xl text-foreground">{user.totalXp}</p>
                </div>
              </div>
            </div>
          </div>
        </ArcadeCard>

        {/* Performance Message */}
        <ArcadeCard className="mb-8">
          <div className="text-center">
            <h3 className="text-2xl text-secondary mb-4">
              {accuracy >= 80 ? '🏆 EXCELLENT!' : accuracy >= 60 ? '👍 GOOD JOB!' : '💪 KEEP TRYING!'}
            </h3>
            <p className="text-foreground">
              {accuracy >= 80 
                ? 'You\'re a true master! Keep up the amazing work!'
                : accuracy >= 60
                ? 'You\'re getting better! Practice makes perfect!'
                : 'Don\'t give up! Every game makes you stronger!'}
            </p>
          </div>
        </ArcadeCard>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-2 gap-4">
          <ArcadeButton
            variant="primary"
            size="lg"
            onClick={() => navigate('/category')}
            className="w-full"
          >
            ► PLAY AGAIN
          </ArcadeButton>
          <ArcadeButton
            variant="secondary"
            size="lg"
            onClick={() => navigate('/')}
            className="w-full"
          >
            ← MAIN MENU
          </ArcadeButton>
        </div>
      </div>
    </div>
  );
};

export default Results;
