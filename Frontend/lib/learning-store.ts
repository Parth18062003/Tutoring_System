// lib/store/learning-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  ContentResponse, 
  InteractionMetadata, 
  ContentSection 
} from '@/types/api-types';

interface LearningState {
  // Current content being viewed
  currentContent: ContentResponse | null;
  currentMetadata: InteractionMetadata | null;
  loadingContent: boolean;
  contentError: string | null;
  
  // Learning history
  learningHistory: {
    interaction_id: string;
    topic: string;
    timestamp: string;
    contentType: string;
  }[];
  
  // Session tracking
  lastInteractionStartTime: number | null;
  currentInteractionTime: number;
  completionPercentage: number;
  
  // Actions
  setCurrentContent: (content: ContentResponse | null) => void;
  setCurrentMetadata: (metadata: InteractionMetadata | null) => void;
  setLoadingContent: (loading: boolean) => void;
  setContentError: (error: string | null) => void;
  addToHistory: (entry: { interaction_id: string; topic: string; contentType: string }) => void;
  startInteraction: () => void;
  updateInteractionTime: () => void;
  updateCompletionPercentage: (percentage: number) => void;
  clearCurrentContent: () => void;
  resetInteractionData: () => void;
}

export const useLearningStore = create<LearningState>()(
  persist(
    (set, get) => ({
      currentContent: null,
      currentMetadata: null,
      loadingContent: false,
      contentError: null,
      learningHistory: [],
      lastInteractionStartTime: null,
      currentInteractionTime: 0,
      completionPercentage: 0,

      setCurrentContent: (content) => set({ currentContent: content }),
      
      setCurrentMetadata: (metadata) => set({ currentMetadata: metadata }),
      
      setLoadingContent: (loading) => set({ loadingContent: loading }),
      
      setContentError: (error) => set({ contentError: error }),
      
      addToHistory: (entry) => set((state) => ({
        learningHistory: [
          ...state.learningHistory,
          {
            ...entry,
            timestamp: new Date().toISOString(),
          },
        ],
      })),
      
      startInteraction: () => set({ 
        lastInteractionStartTime: Date.now(),
        currentInteractionTime: 0,
        completionPercentage: 0,
      }),
      
      updateInteractionTime: () => {
        const { lastInteractionStartTime } = get();
        if (lastInteractionStartTime) {
          set({ 
            currentInteractionTime: Math.floor((Date.now() - lastInteractionStartTime) / 1000) 
          });
        }
      },
      
      updateCompletionPercentage: (percentage) => set({ 
        completionPercentage: percentage 
      }),
      
      clearCurrentContent: () => set({
        currentContent: null,
        currentMetadata: null,
      }),
      
      resetInteractionData: () => set({
        lastInteractionStartTime: null,
        currentInteractionTime: 0,
        completionPercentage: 0,
      }),
    }),
    {
      name: 'learning-storage',
      partialize: (state) => ({
        learningHistory: state.learningHistory,
      }),
    }
  )
);