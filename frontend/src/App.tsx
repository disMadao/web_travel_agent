import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Spin } from 'antd'
import Login from '@/pages/Login'
import SignUp from '@/pages/SignUp'
import Dashboard from '@/pages/Dashboard'
import CreateTrip from '@/pages/CreateTrip'
import TripDetail from '@/pages/TripDetail'
import ExpenseManagement from '@/pages/ExpenseManagement'

// 受保护的路由组件
const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" tip="加载中..." />
      </div>
    )
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />
}

// 公开路由组件（已登录则重定向）
const PublicRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" tip="加载中..." />
      </div>
    )
  }

  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />
}

const App: React.FC = () => {
  const { getCurrentUser } = useAuthStore()

  useEffect(() => {
    // 应用启动时检查用户登录状态
    getCurrentUser()
  }, [getCurrentUser])

  return (
    <Routes>
      {/* 默认路由 */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* 公开路由 */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <SignUp />
          </PublicRoute>
        }
      />

      {/* 受保护的路由 */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-trip"
        element={
          <ProtectedRoute>
            <CreateTrip />
          </ProtectedRoute>
        }
      />
      <Route
        path="/trip/:tripId"
        element={
          <ProtectedRoute>
            <TripDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/trip/:tripId/expenses"
        element={
          <ProtectedRoute>
            <ExpenseManagement />
          </ProtectedRoute>
        }
      />

      {/* 404 页面 */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App

