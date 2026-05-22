import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AdState {
  sessionGenerations: number;
  totalGenerations: number;
  lastAdShownAt: number | null;
  pendingAd: boolean;

  recordGeneration: () => void;
  shouldShowPostGenAd: (plan: string) => boolean;
  markAdShown: () => void;
  clearPendingAd: () => void;
}

export const useAdStore = create<AdState>()(
  persist(
    (set, get) => ({
      sessionGenerations: 0,
      totalGenerations: 0,
      lastAdShownAt: null,
      pendingAd: false,

      recordGeneration: () => {
        set((state) => ({
          sessionGenerations: state.sessionGenerations + 1,
          totalGenerations: state.totalGenerations + 1,
        }));
      },

      shouldShowPostGenAd: (plan: string) => {
        if (plan === "pro") return false;
        const { sessionGenerations } = get();
        if (plan === "basic") {
          return sessionGenerations % 10 === 0;
        }
        return true;
      },

      markAdShown: () => {
        set({ lastAdShownAt: Date.now(), pendingAd: false });
      },

      clearPendingAd: () => set({ pendingAd: false }),
    }),
    {
      name: "cos-ads",
      partialize: (state) => ({
        totalGenerations: state.totalGenerations,
      }),
    }
  )
);
