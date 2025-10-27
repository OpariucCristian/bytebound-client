import { useNavigate } from 'react-router-dom';
import { ArcadeButton } from '@/components/ArcadeButton';
import { ArcadeCard } from '@/components/ArcadeCard';
import { Category } from '@/services/mockQuestionService';

const CategorySelect = () => {
  const navigate = useNavigate();

  const categories: Array<{ id: Category; name: string; color: string }> = [
    { id: 'data-structures', name: 'DATA STRUCTURES', color: 'text-primary' },
    { id: 'typescript', name: 'TYPESCRIPT', color: 'text-secondary' },
    { id: 'csharp', name: 'C#', color: 'text-accent' },
  ];

  const handleCategorySelect = (category: Category) => {
    navigate(`/difficulty?category=${category}`);
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-4xl arcade-glow text-primary">
            SELECT CATEGORY
          </h1>
          <ArcadeButton variant="secondary" size="sm" onClick={() => navigate('/')}>
            ← BACK
          </ArcadeButton>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {categories.map((category) => (
            <ArcadeCard key={category.id} className="cursor-pointer hover:scale-105 transition-transform">
              <button
                onClick={() => handleCategorySelect(category.id)}
                className="w-full text-center space-y-4 p-4"
              >
                <div className={`text-4xl arcade-glow ${category.color}`}>
                  {category.id === 'data-structures' && '🔢'}
                  {category.id === 'typescript' && '💎'}
                  {category.id === 'csharp' && '⚡'}
                </div>
                <h3 className={`text-xl arcade-glow ${category.color}`}>
                  {category.name}
                </h3>
              </button>
            </ArcadeCard>
          ))}
        </div>

        <div className="mt-12">
          <ArcadeCard>
            <div className="text-center space-y-4">
              <h4 className="text-lg arcade-glow text-secondary">
                CATEGORY INFO
              </h4>
              <p className="text-sm text-muted-foreground">
                Each category tests different aspects of development knowledge.
                Choose wisely and prove your expertise!
              </p>
            </div>
          </ArcadeCard>
        </div>
      </div>
    </div>
  );
};

export default CategorySelect;
