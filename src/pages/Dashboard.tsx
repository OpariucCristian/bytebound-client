import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ArcadeButton } from '@/components/ArcadeButton';
import { ArcadeCard } from '@/components/ArcadeCard';
import { Progress } from '@/components/ui/progress';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const xpPercentage = (user.xp / 500) * 100;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl md:text-5xl arcade-glow text-primary">
            DEVTRIVIA
          </h1>
          <ArcadeButton variant="danger" size="sm" onClick={logout}>
            LOGOUT
          </ArcadeButton>
        </div>

        {/* Player Stats */}
        <ArcadeCard glow className="mb-8">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-muted-foreground text-sm">PLAYER</p>
                <h2 className="text-2xl arcade-glow text-secondary">
                  {user.username}
                </h2>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground text-sm">LEVEL</p>
                <h2 className="text-4xl arcade-glow text-accent">
                  {user.level}
                </h2>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-foreground">XP</span>
                <span className="text-muted-foreground">
                  {user.xp} / 500
                </span>
              </div>
              <Progress value={xpPercentage} className="h-4" />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t-2 border-border">
              <div>
                <p className="text-muted-foreground text-xs">TOTAL XP</p>
                <p className="text-xl text-foreground">{user.totalXp}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">NEXT LEVEL</p>
                <p className="text-xl text-foreground">{500 - user.xp} XP</p>
              </div>
            </div>
          </div>
        </ArcadeCard>

        {/* Main Menu */}
        <ArcadeCard>
          <div className="text-center space-y-6">
            <h3 className="text-2xl arcade-glow text-primary mb-8">
              MAIN MENU
            </h3>

            <ArcadeButton
              variant="primary"
              size="lg"
              onClick={() => navigate('/category')}
              className="w-full"
            >
              ► START GAME
            </ArcadeButton>

            <div className="pt-8 border-t-2 border-border">
              <p className="text-muted-foreground text-sm mb-4">
                GAME INFO
              </p>
              <div className="space-y-2 text-left text-sm">
                <p className="text-foreground">• Choose your category</p>
                <p className="text-foreground">• Select difficulty</p>
                <p className="text-foreground">• Answer questions correctly</p>
                <p className="text-foreground">• Build streak multipliers</p>
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
