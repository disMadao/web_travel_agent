import React, { useEffect } from 'react'
import { Form, Input, Button, Card, message, Divider } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

const SignUp: React.FC = () => {
  const navigate = useNavigate()
  const { signUp, isAuthenticated, isLoading, error, clearError } = useAuthStore()
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

  const handleSubmit = async (values: {
    email: string
    password: string
    fullName?: string
  }) => {
    try {
      await signUp(values.email, values.password, values.fullName)
      message.success('注册成功！')
    } catch (error) {
      // 错误已经在 store 中处理
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-600 px-4">
      <Card className="w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">创建账号</h1>
          <p className="text-gray-600">开始您的智能旅行规划之旅</p>
        </div>

        <Form form={form} onFinish={handleSubmit} size="large">
          <Form.Item name="fullName">
            <Input
              prefix={<UserOutlined />}
              placeholder="姓名（可选）"
              autoComplete="name"
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="邮箱"
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少 6 位' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码（至少 6 位）"
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'))
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="确认密码"
              autoComplete="new-password"
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
              注册
            </Button>
          </Form.Item>
        </Form>

        <Divider>已有账号？</Divider>

        <Link to="/login">
          <Button block size="large">
            返回登录
          </Button>
        </Link>
      </Card>
    </div>
  )
}

export default SignUp

