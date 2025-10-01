import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, Deck, UserProfile, UserStats, DeckCard } from '../types/Card';

// Local Storage Keys
const STORAGE_KEYS = {
  USERS: 'warlok_vault_users',
  CURRENT_USER: 'warlok_vault_current_user',
  DECKS: 'warlok_vault_decks',
  USER_STATS: 'warlok_vault_user_stats',
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
  clearCorruptedData: () => void;
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
    // Clean the value before stringifying to avoid circular references
    const cleanValue = JSON.parse(JSON.stringify(value));
    localStorage.setItem(key, JSON.stringify(cleanValue));
  } catch (error) {
    console.error(`Error saving to localStorage key "${key}":`, error);
    console.error('Value that failed to serialize:', value);
  }
};

const getUsers = (): Record<string, User> => getFromStorage(STORAGE_KEYS.USERS, {});
const saveUsers = (users: Record<string, User>) => saveToStorage(STORAGE_KEYS.USERS, users);

const getCurrentUser = (): User | null => getFromStorage(STORAGE_KEYS.CURRENT_USER, null);
const saveCurrentUser = (user: User | null) => saveToStorage(STORAGE_KEYS.CURRENT_USER, user);

// Validate and sanitize deck data
const validateDeck = (deck: any): Deck | null => {
  try {
    if (!deck || typeof deck !== 'object') return null;
    
    // Ensure required properties exist
    if (!deck.id || !deck.name || !deck.userId) return null;
    
    // Validate cards array
    let cards: DeckCard[] = [];
    if (Array.isArray(deck.cards)) {
      cards = deck.cards.filter((card: any) => {
        return card && 
               typeof card === 'object' && 
               typeof card.cardId === 'string' && 
               typeof card.quantity === 'number' && 
               card.quantity > 0;
      });
    }
    
    return {
      id: String(deck.id),
      name: String(deck.name),
      userId: String(deck.userId),
      cards,
      createdAt: deck.createdAt || new Date().toISOString(),
      updatedAt: deck.updatedAt || new Date().toISOString(),
      isPublic: Boolean(deck.isPublic),
      tags: Array.isArray(deck.tags) ? deck.tags : [],
    };
  } catch (error) {
    console.error('Error validating deck:', error);
    return null;
  }
};

const getDecks = (): Record<string, Deck> => {
  try {
    const rawDecks = getFromStorage(STORAGE_KEYS.DECKS, {});
    const validatedDecks: Record<string, Deck> = {};
    
    Object.entries(rawDecks).forEach(([id, deck]) => {
      const validatedDeck = validateDeck(deck);
      if (validatedDeck) {
        validatedDecks[id] = validatedDeck;
      }
    });
    
    return validatedDecks;
  } catch (error) {
    console.error('Error loading decks from storage:', error);
    return {};
  }
};

const saveDecks = (decks: Record<string, Deck>) => {
  try {
    // Validate all decks before saving
    const validatedDecks: Record<string, Deck> = {};
    Object.entries(decks).forEach(([id, deck]) => {
      const validatedDeck = validateDeck(deck);
      if (validatedDeck) {
        validatedDecks[id] = validatedDeck;
      }
    });
    
    saveToStorage(STORAGE_KEYS.DECKS, validatedDecks);
  } catch (error) {
    console.error('Error saving decks to storage:', error);
  }
};

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

  const login = async (username: string, _password: string): Promise<boolean> => {
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

  const signup = async (username: string, email: string, _password: string): Promise<boolean> => {
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

    try {
      // Validate deck before saving
      const validatedDeck = validateDeck(deck);
      if (!validatedDeck) {
        console.error('Invalid deck data, cannot save:', deck);
        return;
      }

      const decks = getDecks();
      decks[validatedDeck.id] = validatedDeck;
      saveDecks(decks);
    } catch (error) {
      console.error('Error saving deck:', error);
    }
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

  const clearCorruptedData = () => {
    try {
      console.log('Clearing potentially corrupted localStorage data...');
      localStorage.removeItem(STORAGE_KEYS.DECKS);
      localStorage.removeItem(STORAGE_KEYS.USER_STATS);
      console.log('Corrupted data cleared. Please refresh the page.');
    } catch (error) {
      console.error('Error clearing corrupted data:', error);
    }
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
    clearCorruptedData,
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
