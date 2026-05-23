import { create } from 'zustand'
import { apiFetch } from '@/lib/api'

export type Plan = 'free' | 'basic' | 'pro'

interface UserData {
  plan: Plan
  credits: number
  xp: number
  level: number
  streak: number
}

interface UserState extends UserData {
  isDeducting: boolean
  isLoadingProfile: boolean
  setPlan: (plan: Plan) => void
  setCredits: (credits: number) => void
  addXp: (amount: number) => void
  deductCredits: (userId: string, amount: number) => Promise<boolean>
  incrementStreak: () => void
  syncFromProfile: (profile: {
    plan?: string
    credits?: number
    xp?: number
    level?: number
    streak?: number
  }) => void
  loadProfile: (userId: string) => Promise<void>
}

export const useUserStore = create<UserState>((set, get) => ({
  plan: 'free',
  credits: 0,
  xp: 0,
  level: 1,
  streak: 0,
  isDeducting: false,
  isLoadingProfile: false,

  setPlan: (plan) => set({ plan }),
  setCredits: (credits) => set({ credits }),

  addXp: (amount) =>
    set((state) => {
      const newXp = state.xp + amount
      const newLevel = Math.floor(newXp / 500) + 1
      return { xp: newXp, level: newLevel }
    }),

  /**
   * Deduct credits server-side and update local state.
   * Pro plan always returns true (unlimited).
   */
  deductCredits: async (userId: string, amount: number) => {
    const state = get()
    if (state.plan === 'pro') return true
    if (state.credits < amount) return false

    set({ isDeducting: true })
    try {
      const res = await apiFetch(`/api/profile/${userId}/deduct`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      })

      if (!res.ok) {
        set({ isDeducting: false })
        return false
      }

      const json = (await res.json()) as { data?: { remaining?: number } }
      const remaining = json.data?.remaining ?? state.credits - amount
      set({ credits: remaining, isDeducting: false })
      return true
    } catch {
      set({ isDeducting: false })
      return false
    }
  },

  incrementStreak: () => set((state) => ({ streak: state.streak + 1 })),

  syncFromProfile: (profile) =>
    set((state) => ({
      plan: (profile.plan as Plan) ?? state.plan,
      credits: profile.credits ?? state.credits,
      xp: profile.xp ?? state.xp,
      level: profile.level ?? state.level,
      streak: profile.streak ?? state.streak,
    })),

  /**
   * Fetch the profile from the API server (which also applies daily credit refresh).
   * Call this on every app load after the user is authenticated.
   */
  loadProfile: async (userId: string) => {
    set({ isLoadingProfile: true })
    try {
      const res = await apiFetch(`/api/profile/${userId}`)
      if (!res.ok) {
        // Profile might not exist yet (first login) — try creating it
        set({ isLoadingProfile: false })
        return
      }
      const json = (await res.json()) as {
        data?: {
          profile?: {
            plan?: string
            credits?: number
            xp?: number
            level?: number
            streak?: number
          }
        }
      }
      if (json.data?.profile) {
        get().syncFromProfile(json.data.profile)
      }
    } catch {
      // silently fail — UI will show stale data
    } finally {
      set({ isLoadingProfile: false })
    }
  },
}))
