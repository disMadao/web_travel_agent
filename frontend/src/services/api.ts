import axios, { AxiosInstance } from 'axios'
import { config } from '@/config'
import type {
  TripPlanRequest,
  TripPlan,
  Expense,
  ExpenseCreate,
  ExpenseSummary,
  AuthResponse,
} from '@/types'

class ApiService {
  private api: AxiosInstance

  constructor() {
    this.api = axios.create({
      baseURL: config.api.baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // 请求拦截器：添加认证 token
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('access_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })

    // 响应拦截器：处理错误
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token 过期，尝试刷新
          const refreshToken = localStorage.getItem('refresh_token')
          if (refreshToken) {
            try {
              const response = await this.refreshToken(refreshToken)
              localStorage.setItem('access_token', response.access_token)
              localStorage.setItem('refresh_token', response.refresh_token)
              // 重试原请求
              return this.api.request(error.config)
            } catch {
              // 刷新失败，清除 token 并跳转登录
              localStorage.removeItem('access_token')
              localStorage.removeItem('refresh_token')
              window.location.href = '/login'
            }
          }
        }
        return Promise.reject(error)
      }
    )
  }

  // 认证相关
  async signUp(email: string, password: string, fullName?: string): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/signup', {
      email,
      password,
      full_name: fullName,
    })
    return response.data
  }

  async signIn(email: string, password: string): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/signin', {
      email,
      password,
    })
    return response.data
  }

  async signOut(): Promise<void> {
    await this.api.post('/auth/signout')
  }

  async getCurrentUser(): Promise<any> {
    const response = await this.api.get('/auth/me')
    return response.data
  }

  async refreshToken(refreshToken: string): Promise<any> {
    const response = await this.api.post('/auth/refresh', { refresh_token: refreshToken })
    return response.data
  }

  // 行程相关
  async createTripPlan(request: TripPlanRequest): Promise<TripPlan> {
    const response = await this.api.post<TripPlan>('/trips/plan', request)
    return response.data
  }

  async getTrips(limit = 50, offset = 0): Promise<{ trips: TripPlan[]; total: number }> {
    const response = await this.api.get('/trips/', {
      params: { limit, offset },
    })
    return response.data
  }

  async getTrip(tripId: string): Promise<TripPlan> {
    const response = await this.api.get<TripPlan>(`/trips/${tripId}`)
    return response.data
  }

  async updateTrip(tripId: string, trip: TripPlan): Promise<TripPlan> {
    const response = await this.api.put<TripPlan>(`/trips/${tripId}`, trip)
    return response.data
  }

  async deleteTrip(tripId: string): Promise<void> {
    await this.api.delete(`/trips/${tripId}`)
  }

  // 费用相关
  async createExpense(expense: ExpenseCreate): Promise<Expense> {
    const response = await this.api.post<Expense>('/expenses/', expense)
    return response.data
  }

  async getTripExpenses(tripId: string): Promise<Expense[]> {
    const response = await this.api.get<Expense[]>(`/expenses/trip/${tripId}`)
    return response.data
  }

  async getExpenseSummary(tripId: string): Promise<ExpenseSummary> {
    const response = await this.api.get<ExpenseSummary>(`/expenses/trip/${tripId}/summary`)
    return response.data
  }

  async updateExpense(expenseId: string, expense: ExpenseCreate): Promise<Expense> {
    const response = await this.api.put<Expense>(`/expenses/${expenseId}`, expense)
    return response.data
  }

  async deleteExpense(expenseId: string): Promise<void> {
    await this.api.delete(`/expenses/${expenseId}`)
  }

  async analyzeBudget(tripId: string): Promise<any> {
    const response = await this.api.post(`/expenses/trip/${tripId}/analyze`)
    return response.data
  }
}

export const apiService = new ApiService()

