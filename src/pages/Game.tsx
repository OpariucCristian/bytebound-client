import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArcadeButton } from '@/components/ArcadeButton';
import { ArcadeCard } from '@/components/ArcadeCard';
import { Progress } from '@/components/ui/progress';
import { mockQuestionService, Question, Category, Difficulty } from '@/services/mockQuestionService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface GameStats {
  correct: number;
  wrong: number;
  streak: number;
  maxStreak: number;
  totalXp: number;
}

const Game = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category') as Category;
  const difficulty = searchParams.get('difficulty') as Difficulty;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [shuffledAnswers, setShuffledAnswers] = useState<typeof questions[0]['answers']>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [stats, setStats] = useState<GameStats>({
    correct: 0,
    wrong: 0,
    streak: 0,
    maxStreak: 0,
    totalXp: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!category || !difficulty) {
      navigate('/category');
      return;
    }

    const loadQuestions = async () => {
      const qs = await mockQuestionService.getQuestions(category, difficulty);
      setQuestions(qs);
      setLoading(false);
    };

    loadQuestions();
  }, [category, difficulty, navigate]);

  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex < questions.length) {
      // Shuffle answers for current question
      const answers = [...questions[currentQuestionIndex].answers];
      const shuffled = answers.sort(() => Math.random() - 0.5);
      setShuffledAnswers(shuffled);
    }
  }, [currentQuestionIndex, questions]);

  const handleAnswerSelect = (answerId: string) => {
    if (selectedAnswer) return; // Already answered

    setSelectedAnswer(answerId);
    const isCorrect = shuffledAnswers.find(a => a.id === answerId)?.isCorrect;

    if (isCorrect) {
      const newStreak = stats.streak + 1;
      const multiplier = Math.min(Math.floor(newStreak / 3) + 1, 5); // Max 5x multiplier
      const baseXp = 50;
      const xpGained = baseXp * multiplier;

      setStats({
        ...stats,
        correct: stats.correct + 1,
        streak: newStreak,
        maxStreak: Math.max(newStreak, stats.maxStreak),
        totalXp: stats.totalXp + xpGained,
      });

      // Auto advance after 1.5s
      setTimeout(() => {
        handleNextQuestion();
      }, 1500);
    } else {
      setStats({
        ...stats,
        wrong: stats.wrong + 1,
        streak: 0,
      });
      setShowExplanation(true);
    }
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setShowExplanation(false);
    
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Game over
      navigate('/results', {
        state: { stats, category, difficulty },
      });
    }
  };

  if (loading || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h2 className="text-2xl text-primary animate-blink">LOADING...</h2>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const multiplier = Math.min(Math.floor(stats.streak / 3) + 1, 5);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-muted-foreground text-sm">
              Question {currentQuestionIndex + 1} / {questions.length}
            </p>
            <Progress value={progress} className="w-48 h-3 mt-2" />
          </div>
          <div className="text-right">
            <p className="text-muted-foreground text-sm">STREAK</p>
            <p className="text-2xl text-accent">{stats.streak}</p>
            {stats.streak >= 3 && (
              <p className="text-xs text-secondary">x{multiplier} MULTIPLIER!</p>
            )}
          </div>
        </div>

        {/* Question */}
        <ArcadeCard glow={false} className="mb-6">
          <h2 className="text-lg md:text-xl text-foreground leading-relaxed">
            {currentQuestion.question}
          </h2>
        </ArcadeCard>

        {/* Answers */}
        <div className="grid md:grid-cols-2 gap-4">
          {shuffledAnswers.map((answer) => {
            const isSelected = selectedAnswer === answer.id;
            const isCorrectAnswer = answer.isCorrect;
            const showResult = selectedAnswer !== null;

            let variant: 'primary' | 'accent' | 'danger' = 'primary';
            if (showResult && isSelected) {
              variant = isCorrectAnswer ? 'accent' : 'danger';
            }

            return (
              <ArcadeButton
                key={answer.id}
                variant={variant}
                onClick={() => handleAnswerSelect(answer.id)}
                disabled={selectedAnswer !== null}
                className="w-full h-auto min-h-[80px] whitespace-normal text-left"
              >
                {answer.text}
              </ArcadeButton>
            );
          })}
        </div>

        {/* Stats */}
        <div className="mt-6 flex justify-around">
          <div className="text-center">
            <p className="text-neon-green text-2xl">{stats.correct}</p>
            <p className="text-muted-foreground text-xs">CORRECT</p>
          </div>
          <div className="text-center">
            <p className="text-destructive text-2xl">{stats.wrong}</p>
            <p className="text-muted-foreground text-xs">WRONG</p>
          </div>
          <div className="text-center">
            <p className="text-accent text-2xl">{stats.totalXp}</p>
            <p className="text-muted-foreground text-xs">XP EARNED</p>
          </div>
        </div>

        {/* Wrong Answer Explanation Dialog */}
        <Dialog open={showExplanation} onOpenChange={setShowExplanation}>
          <DialogContent className="arcade-border bg-card">
            <DialogHeader>
              <DialogTitle className="text-2xl text-destructive">
                WRONG ANSWER!
              </DialogTitle>
              <DialogDescription className="text-foreground mt-4 space-y-4">
                <p className="text-lg">{currentQuestion.explanation}</p>
                <div className="pt-4">
                  <ArcadeButton
                    variant="primary"
                    onClick={handleNextQuestion}
                    className="w-full"
                  >
                    CONTINUE
                  </ArcadeButton>
                </div>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Game;
