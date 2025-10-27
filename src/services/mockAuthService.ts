// Mock authentication service
export interface User {
  id: string;
  email: string;
  username: string;
  level: number;
  xp: number;
  totalXp: number;
}

const MOCK_USER: User = {
  id: '1',
  email: 'dev@trivia.com',
  username: 'CodeMaster',
  level: 5,
  xp: 350,
  totalXp: 1850,
};

export const mockAuthService = {
  login: async (email: string, password: string): Promise<User> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (email && password) {
      // Store in localStorage for persistence
      localStorage.setItem('devtrivia_user', JSON.stringify(MOCK_USER));
      return MOCK_USER;
    }
    throw new Error('Invalid credentials');
  },

  signup: async (email: string, username: string, password: string): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newUser: User = {
      id: Math.random().toString(36).substring(7),
      email,
      username,
      level: 1,
      xp: 0,
      totalXp: 0,
    };
    
    localStorage.setItem('devtrivia_user', JSON.stringify(newUser));
    return newUser;
  },

  logout: async (): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    localStorage.removeItem('devtrivia_user');
  },

  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('devtrivia_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  updateUserProgress: async (xpGained: number): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const user = mockAuthService.getCurrentUser();
    if (!user) throw new Error('No user logged in');

    const newTotalXp = user.totalXp + xpGained;
    const newXp = user.xp + xpGained;
    const xpPerLevel = 500;
    const newLevel = Math.floor(newTotalXp / xpPerLevel) + 1;
    const xpInCurrentLevel = newTotalXp % xpPerLevel;

    const updatedUser: User = {
      ...user,
      level: newLevel,
      xp: xpInCurrentLevel,
      totalXp: newTotalXp,
    };

    localStorage.setItem('devtrivia_user', JSON.stringify(updatedUser));
    return updatedUser;
  },
};
