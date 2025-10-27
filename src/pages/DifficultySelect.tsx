import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArcadeButton } from '@/components/ArcadeButton';
import { ArcadeCard } from '@/components/ArcadeCard';
import { Difficulty, mockQuestionService } from '@/services/mockQuestionService';

const DifficultySelect = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category');

  if (!category) {
    navigate('/category');
    return null;
  }

  const difficulties: Array<{ id: Difficulty; name: string; questions: number; color: string }> = [
    { id: 'short', name: 'SHORT', questions: 5, color: 'text-neon-green' },
    { id: 'medium', name: 'MEDIUM', questions: 10, color: 'text-accent' },
    { id: 'long', name: 'LONG', questions: 15, color: 'text-destructive' },
  ];

  const handleDifficultySelect = (difficulty: Difficulty) => {
    navigate(`/game?category=${category}&difficulty=${difficulty}`);
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl md:text-4xl arcade-glow text-primary">
              SELECT DIFFICULTY
            </h1>
            <p className="text-muted-foreground mt-2">
              Category: {mockQuestionService.getCategoryName(category as any)}
            </p>
          </div>
          <ArcadeButton variant="secondary" size="sm" onClick={() => navigate('/category')}>
            ← BACK
          </ArcadeButton>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {difficulties.map((difficulty) => (
            <ArcadeCard key={difficulty.id} className="cursor-pointer hover:scale-105 transition-transform">
              <button
                onClick={() => handleDifficultySelect(difficulty.id)}
                className="w-full text-center space-y-4 p-4"
              >
                <h3 className={`text-2xl arcade-glow ${difficulty.color}`}>
                  {difficulty.name}
                </h3>
                <div className="text-4xl">
                  {difficulty.id === 'short' && '⚡'}
                  {difficulty.id === 'medium' && '🎯'}
                  {difficulty.id === 'long' && '🔥'}
                </div>
                <p className="text-foreground">
                  {difficulty.questions} Questions
                </p>
              </button>
            </ArcadeCard>
          ))}
        </div>

        <div className="mt-12">
          <ArcadeCard>
            <div className="text-center space-y-4">
              <h4 className="text-lg arcade-glow text-secondary">
                DIFFICULTY INFO
              </h4>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>• More questions = More XP potential</p>
                <p>• Build streaks for XP multipliers</p>
                <p>• Wrong answers break your streak</p>
              </div>
            </div>
          </ArcadeCard>
        </div>
      </div>
    </div>
  );
};

export default DifficultySelect;
