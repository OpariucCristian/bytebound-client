import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ArcadeButton } from '@/components/ArcadeButton';
import { ArcadeCard } from '@/components/ArcadeCard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
        toast({
          title: '🎮 LOGIN SUCCESSFUL',
          description: 'Welcome back, player!',
        });
      } else {
        await signup(email, username, password);
        toast({
          title: '🎮 ACCOUNT CREATED',
          description: 'Ready to play!',
        });
      }
      navigate('/');
    } catch (error) {
      toast({
        title: '❌ ERROR',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl arcade-glow text-primary mb-4">
            DEVTRIVIA
          </h1>
          <p className="text-lg text-muted-foreground">
            LEVEL UP YOUR SKILLS
          </p>
        </div>

        <ArcadeCard>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl arcade-glow text-secondary">
                {isLogin ? 'LOGIN' : 'SIGN UP'}
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-foreground">
                  EMAIL
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-2 bg-input border-2 border-border text-foreground"
                />
              </div>

              {!isLogin && (
                <div>
                  <Label htmlFor="username" className="text-foreground">
                    USERNAME
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="mt-2 bg-input border-2 border-border text-foreground"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="password" className="text-foreground">
                  PASSWORD
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-2 bg-input border-2 border-border text-foreground"
                />
              </div>
            </div>

            <ArcadeButton
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'LOADING...' : isLogin ? 'START GAME' : 'CREATE PLAYER'}
            </ArcadeButton>

            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="w-full text-center text-accent hover:text-accent/80 text-sm"
            >
              {isLogin ? 'New player? Sign up' : 'Already have account? Login'}
            </button>
          </form>
        </ArcadeCard>
      </div>
    </div>
  );
};

export default Login;
