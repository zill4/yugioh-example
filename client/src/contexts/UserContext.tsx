import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User, Deck, UserProfile, UserStats } from '../types/Card';

// Local Storage Keys
const STORAGE_KEYS = {
  USERS: 'yugioh_vault_users',
  CURRENT_USER: 'yugioh_vault_current_user',
  DECKS: 'yugioh_vault_decks',
  USER_STATS: 'yugioh_vault_user_stats',
} as const;

// Default user profile
const DEFAULT_PROFILE: UserProfile = {
  displayName: '',
  duelistLevel: 1,
  totalWins: 0,
  totalLosses: 0,
};

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  signup: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  getUserDecks: () => Deck[];
  saveDeck: (deck: Deck) => void;
  deleteDeck: (deckId: string) => void;
  getUserStats: () => UserStats;
  updateUserStats: (updates: Partial<UserStats>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Local Storage Utilities
const getFromStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error);
    return defaultValue;
  }
};

const saveToStorage = <T,>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving to localStorage key "${key}":`, error);
  }
};

const getUsers = (): Record<string, User> => getFromStorage(STORAGE_KEYS.USERS, {});
const saveUsers = (users: Record<string, User>) => saveToStorage(STORAGE_KEYS.USERS, users);

const getCurrentUser = (): User | null => getFromStorage(STORAGE_KEYS.CURRENT_USER, null);
const saveCurrentUser = (user: User | null) => saveToStorage(STORAGE_KEYS.CURRENT_USER, user);

const getDecks = (): Record<string, Deck> => getFromStorage(STORAGE_KEYS.DECKS, {});
const saveDecks = (decks: Record<string, Deck>) => saveToStorage(STORAGE_KEYS.DECKS, decks);

const getUserStatsMap = (): Record<string, UserStats> => getFromStorage(STORAGE_KEYS.USER_STATS, {});
const saveUserStatsMap = (stats: Record<string, UserStats>) => saveToStorage(STORAGE_KEYS.USER_STATS, stats);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize user from localStorage on mount
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      // Update last login time
      const updatedUser = {
        ...currentUser,
        lastLoginAt: new Date().toISOString(),
      };
      setUser(updatedUser);
      saveCurrentUser(updatedUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const users = getUsers();
      const foundUser = Object.values(users).find(u => u.username === username);

      if (!foundUser) {
        return false; // User not found
      }

      // In a real app, we'd verify the password hash
      // For now, we'll just accept any password for existing users
      const updatedUser = {
        ...foundUser,
        lastLoginAt: new Date().toISOString(),
      };

      setUser(updatedUser);
      saveCurrentUser(updatedUser);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const signup = async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      const users = getUsers();

      // Check if username already exists
      const existingUser = Object.values(users).find(u => u.username === username);
      if (existingUser) {
        return false; // Username already taken
      }

      // Check if email already exists
      const existingEmail = Object.values(users).find(u => u.email === email);
      if (existingEmail) {
        return false; // Email already taken
      }

      const newUser: User = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        username,
        email,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        profile: {
          ...DEFAULT_PROFILE,
          displayName: username,
        },
      };

      users[newUser.id] = newUser;
      saveUsers(users);

      setUser(newUser);
      saveCurrentUser(newUser);

      // Initialize user stats
      const stats: UserStats = {
        gamesPlayed: 0,
        gamesWon: 0,
        gamesLost: 0,
        winRate: 0,
        favoriteCardType: 'Monster',
        decksCreated: 0,
        lastActive: new Date().toISOString(),
      };

      const statsMap = getUserStatsMap();
      statsMap[newUser.id] = stats;
      saveUserStatsMap(statsMap);

      return true;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    saveCurrentUser(null);
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      profile: { ...user.profile, ...updates },
    };

    setUser(updatedUser);
    saveCurrentUser(updatedUser);

    // Update in users map
    const users = getUsers();
    users[user.id] = updatedUser;
    saveUsers(users);
  };

  const getUserDecks = (): Deck[] => {
    if (!user) return [];
    const decks = getDecks();
    return Object.values(decks).filter(deck => deck.userId === user.id);
  };

  const saveDeck = (deck: Deck) => {
    if (!user) return;

    const decks = getDecks();
    decks[deck.id] = deck;
    saveDecks(decks);
  };

  const deleteDeck = (deckId: string) => {
    if (!user) return;

    const decks = getDecks();
    delete decks[deckId];
    saveDecks(decks);
  };

  const getUserStats = (): UserStats => {
    if (!user) {
      return {
        gamesPlayed: 0,
        gamesWon: 0,
        gamesLost: 0,
        winRate: 0,
        favoriteCardType: 'Monster',
        decksCreated: 0,
        lastActive: new Date().toISOString(),
      };
    }

    const statsMap = getUserStatsMap();
    return statsMap[user.id] || {
      gamesPlayed: 0,
      gamesWon: 0,
      gamesLost: 0,
      winRate: 0,
      favoriteCardType: 'Monster',
      decksCreated: 0,
      lastActive: new Date().toISOString(),
    };
  };

  const updateUserStats = (updates: Partial<UserStats>) => {
    if (!user) return;

    const statsMap = getUserStatsMap();
    const currentStats = statsMap[user.id] || getUserStats();
    const updatedStats = { ...currentStats, ...updates };

    statsMap[user.id] = updatedStats;
    saveUserStatsMap(statsMap);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
    updateProfile,
    getUserDecks,
    saveDeck,
    deleteDeck,
    getUserStats,
    updateUserStats,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
