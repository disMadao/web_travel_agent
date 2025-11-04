import React, { useEffect } from 'react'
import { Form, Input, Button, Card, message, Divider } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

const Login: React.FC = () => {
  const navigate = useNavigate()
  const { signIn, isAuthenticated, isLoading, error, clearError } = useAuthStore()
  const [form] = Form.useForm()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    if (error) {
      message.error(error)
      clearError()
    }
  }, [error, clearError])

  const handleSubmit = async (values: { email: string; password: string }) => {
    try {
      await signIn(values.email, values.password)
      message.success('登录成功！')
    } catch (error) {
      // 错误已经在 store 中处理
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 px-4">
      <Card className="w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">AI 智能旅行助手</h1>
          <p className="text-gray-600">让 AI 为您规划完美旅程</p>
        </div>

        <Form form={form} onFinish={handleSubmit} size="large">
          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="邮箱"
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              block
              className="h-12 text-lg"
            >
              登录
            </Button>
          </Form.Item>
        </Form>

        <Divider>还没有账号？</Divider>

        <Link to="/signup">
          <Button block size="large">
            注册新账号
          </Button>
        </Link>
      </Card>
    </div>
  )
}

export default Login

