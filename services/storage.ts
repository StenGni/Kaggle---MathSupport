
import { ExerciseResult, SkillProfile, UserMastery } from '../types';

// Simplified constants since we removed authentication
const HISTORY_KEY = 'mathmate_history_v1';
const SKILLS_KEY = 'mathmate_skills_v1';
const MASTERY_KEY = 'mathmate_mastery_v1';

export const getHistory = (): ExerciseResult[] => {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to load history", e);
    return [];
  }
};

export const saveHistoryItem = (item: ExerciseResult) => {
  const current = getHistory();
  const updated = [item, ...current];
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
};

export const updateHistoryItem = (updatedItem: ExerciseResult) => {
  const current = getHistory();
  const index = current.findIndex(i => i.id === updatedItem.id);
  
  if (index !== -1) {
    current[index] = updatedItem;
    localStorage.setItem(HISTORY_KEY, JSON.stringify(current));
  } else {
    // If not found, treat as new
    saveHistoryItem(updatedItem);
  }
};

export const getSkills = (): SkillProfile | null => {
  try {
    const data = localStorage.getItem(SKILLS_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error("Failed to load skills", e);
    return null;
  }
};

export const saveSkills = (skills: SkillProfile) => {
  localStorage.setItem(SKILLS_KEY, JSON.stringify(skills));
};

// Mastery / Practice Tracking
export const getMastery = (): UserMastery => {
    try {
        const data = localStorage.getItem(MASTERY_KEY);
        return data ? JSON.parse(data) : {};
    } catch (e) {
        return {};
    }
};

export const trackMistake = (skillId: string, topicName?: string) => {
    if (!skillId) return;
    
    // Normalize ID to uppercase to avoid mismatch
    const id = skillId.toUpperCase().trim();

    const mastery = getMastery();
    if (!mastery[id]) {
        mastery[id] = { errorCount: 0, lastErrorTimestamp: 0, name: topicName || id };
    }
    
    mastery[id].errorCount += 1;
    mastery[id].lastErrorTimestamp = Date.now();
    if (topicName) mastery[id].name = topicName;
    
    localStorage.setItem(MASTERY_KEY, JSON.stringify(mastery));
};

// Mark a skill as "Resolved" (clears error count so it leaves the problem list)
export const resolveSkill = (skillId: string) => {
    if (!skillId) return;
    const id = skillId.toUpperCase().trim();
    const mastery = getMastery();
    
    if (mastery[id]) {
        mastery[id].errorCount = 0; // Reset errors to remove from "Needs Focus" lists
        localStorage.setItem(MASTERY_KEY, JSON.stringify(mastery));
    }
};

// Helper for generic user info (since we removed auth)
export const getCurrentUser = () => {
    return { name: 'Student', email: '', id: 'guest' };
};

export const logout = () => {
    // Optional: Clear data on "logout" / reset
    // localStorage.clear();
};
