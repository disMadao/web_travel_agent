import { create } from 'zustand'
import { apiService } from '@/services/api'
import type { TripPlan, TripPlanRequest } from '@/types'

interface TripState {
  trips: TripPlan[]
  currentTrip: TripPlan | null
  isLoading: boolean
  error: string | null
  
  createTrip: (request: TripPlanRequest) => Promise<TripPlan>
  fetchTrips: () => Promise<void>
  fetchTrip: (tripId: string) => Promise<void>
  updateTrip: (tripId: string, trip: TripPlan) => Promise<void>
  deleteTrip: (tripId: string) => Promise<void>
  setCurrentTrip: (trip: TripPlan | null) => void
  clearError: () => void
}

export const useTripStore = create<TripState>((set) => ({
  trips: [],
  currentTrip: null,
  isLoading: false,
  error: null,

  createTrip: async (request: TripPlanRequest) => {
    set({ isLoading: true, error: null })
    try {
      const trip = await apiService.createTripPlan(request)
      set((state) => ({
        trips: [trip, ...state.trips],
        currentTrip: trip,
        isLoading: false,
      }))
      return trip
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || '创建行程失败'
      set({ error: errorMsg, isLoading: false })
      throw new Error(errorMsg)
    }
  },

  fetchTrips: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiService.getTrips()
      set({
        trips: response.trips,
        isLoading: false,
      })
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || '获取行程列表失败',
        isLoading: false,
      })
    }
  },

  fetchTrip: async (tripId: string) => {
    set({ isLoading: true, error: null })
    try {
      const trip = await apiService.getTrip(tripId)
      set({
        currentTrip: trip,
        isLoading: false,
      })
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || '获取行程详情失败',
        isLoading: false,
      })
    }
  },

  updateTrip: async (tripId: string, trip: TripPlan) => {
    set({ isLoading: true, error: null })
    try {
      const updatedTrip = await apiService.updateTrip(tripId, trip)
      set((state) => ({
        trips: state.trips.map((t) => (t.id === tripId ? updatedTrip : t)),
        currentTrip: state.currentTrip?.id === tripId ? updatedTrip : state.currentTrip,
        isLoading: false,
      }))
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || '更新行程失败',
        isLoading: false,
      })
      throw error
    }
  },

  deleteTrip: async (tripId: string) => {
    set({ isLoading: true, error: null })
    try {
      await apiService.deleteTrip(tripId)
      set((state) => ({
        trips: state.trips.filter((t) => t.id !== tripId),
        currentTrip: state.currentTrip?.id === tripId ? null : state.currentTrip,
        isLoading: false,
      }))
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || '删除行程失败',
        isLoading: false,
      })
      throw error
    }
  },

  setCurrentTrip: (trip: TripPlan | null) => {
    set({ currentTrip: trip })
  },

  clearError: () => set({ error: null }),
}))

