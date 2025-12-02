import { create } from 'zustand'

interface RealtimeMetrics {
  hitRate: number
  reactionTime: number
  accuracy: number
  fatigueLevel: number
  sessionDuration: number
  caloriesBurned: number
}

interface TrainingState {
  isTraining: boolean
  currentSessionId: string | null
  realtimeMetrics: RealtimeMetrics
  poseData: number[][] | null
  startTraining: (sessionId: string) => void
  stopTraining: () => void
  updateMetrics: (metrics: Partial<RealtimeMetrics>) => void
  updatePoseData: (data: number[][]) => void
}

const initialMetrics: RealtimeMetrics = {
  hitRate: 0,
  reactionTime: 0,
  accuracy: 0,
  fatigueLevel: 0,
  sessionDuration: 0,
  caloriesBurned: 0,
}

export const useTrainingStore = create<TrainingState>((set) => ({
  isTraining: false,
  currentSessionId: null,
  realtimeMetrics: initialMetrics,
  poseData: null,

  startTraining: (sessionId) =>
    set({
      isTraining: true,
      currentSessionId: sessionId,
      realtimeMetrics: initialMetrics,
    }),

  stopTraining: () =>
    set({
      isTraining: false,
      currentSessionId: null,
    }),

  updateMetrics: (metrics) =>
    set((state) => ({
      realtimeMetrics: { ...state.realtimeMetrics, ...metrics },
    })),

  updatePoseData: (data) => set({ poseData: data }),
}))
