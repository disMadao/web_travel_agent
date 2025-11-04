import { create } from 'zustand'
import { apiService } from '@/services/api'
import type { Expense, ExpenseCreate, ExpenseSummary } from '@/types'

interface ExpenseState {
  expenses: Expense[]
  summary: ExpenseSummary | null
  isLoading: boolean
  error: string | null
  
  createExpense: (expense: ExpenseCreate) => Promise<void>
  fetchExpenses: (tripId: string) => Promise<void>
  fetchSummary: (tripId: string) => Promise<void>
  updateExpense: (expenseId: string, expense: ExpenseCreate) => Promise<void>
  deleteExpense: (expenseId: string) => Promise<void>
  analyzeBudget: (tripId: string) => Promise<any>
  clearError: () => void
}

export const useExpenseStore = create<ExpenseState>((set) => ({
  expenses: [],
  summary: null,
  isLoading: false,
  error: null,

  createExpense: async (expense: ExpenseCreate) => {
    set({ isLoading: true, error: null })
    try {
      const newExpense = await apiService.createExpense(expense)
      set((state) => ({
        expenses: [newExpense, ...state.expenses],
        isLoading: false,
      }))
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || '创建费用记录失败',
        isLoading: false,
      })
      throw error
    }
  },

  fetchExpenses: async (tripId: string) => {
    set({ isLoading: true, error: null })
    try {
      const expenses = await apiService.getTripExpenses(tripId)
      set({
        expenses,
        isLoading: false,
      })
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || '获取费用记录失败',
        isLoading: false,
      })
    }
  },

  fetchSummary: async (tripId: string) => {
    try {
      const summary = await apiService.getExpenseSummary(tripId)
      set({ summary })
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || '获取费用统计失败',
      })
    }
  },

  updateExpense: async (expenseId: string, expense: ExpenseCreate) => {
    set({ isLoading: true, error: null })
    try {
      const updatedExpense = await apiService.updateExpense(expenseId, expense)
      set((state) => ({
        expenses: state.expenses.map((e) =>
          e.id === expenseId ? updatedExpense : e
        ),
        isLoading: false,
      }))
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || '更新费用记录失败',
        isLoading: false,
      })
      throw error
    }
  },

  deleteExpense: async (expenseId: string) => {
    set({ isLoading: true, error: null })
    try {
      await apiService.deleteExpense(expenseId)
      set((state) => ({
        expenses: state.expenses.filter((e) => e.id !== expenseId),
        isLoading: false,
      }))
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || '删除费用记录失败',
        isLoading: false,
      })
      throw error
    }
  },

  analyzeBudget: async (tripId: string) => {
    set({ isLoading: true, error: null })
    try {
      const analysis = await apiService.analyzeBudget(tripId)
      set({ isLoading: false })
      return analysis.data
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'AI 分析失败',
        isLoading: false,
      })
      throw error
    }
  },

  clearError: () => set({ error: null }),
}))

