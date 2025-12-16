
import { User } from '../types';

const CURRENT_USER_KEY = 'mathmate_current_user';
const USERS_DB_KEY = 'mathmate_users_db';

export const getCurrentUser = (): User | null => {
  try {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
};

export const login = (email: string): User | null => {
  const users = JSON.parse(localStorage.getItem(USERS_DB_KEY) || '[]');
  const user = users.find((u: User) => u.email.toLowerCase() === email.toLowerCase());
  
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    return user;
  }
  return null;
};

export const signup = (name: string, email: string): User => {
  const users = JSON.parse(localStorage.getItem(USERS_DB_KEY) || '[]');
  
  // Simple check if user exists
  const existing = users.find((u: User) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    throw new Error("User already exists");
  }

  const newUser: User = {
    id: Date.now().toString(),
    name,
    email
  };

  users.push(newUser);
  localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
  
  return newUser;
};

export const logout = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};
