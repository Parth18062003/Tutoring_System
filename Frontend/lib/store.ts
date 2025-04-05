// src/lib/store.ts
import { create } from 'zustand';

interface LearningSessionState {
  currentInteractionId: string | null;
  currentSubject: string | null;
  currentTopic: string | null; // Full topic name like 'Subject-Topic'
  setInteraction: (id: string | null, subject: string | null, topic: string | null) => void;
  clearInteraction: () => void;
}

export const useLearningSessionStore = create<LearningSessionState>((set) => ({
  currentInteractionId: null,
  currentSubject: 'Science', // Example default subject
  currentTopic: null,       // No default topic initially
  setInteraction: (id, subject, topic) => set({ currentInteractionId: id, currentSubject: subject, currentTopic: topic }),
  clearInteraction: () => set({ currentInteractionId: null, currentSubject: null, currentTopic: null }),
}));