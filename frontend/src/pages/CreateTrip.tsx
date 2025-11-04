import React, { useState } from 'react'
import {
  Layout,
  Card,
  Form,
  Input,
  DatePicker,
  InputNumber,
  Select,
  Switch,
  Button,
  Steps,
  message,
  Spin,
} from 'antd'
import {
  EnvironmentOutlined,
  CalendarOutlined,
  DollarOutlined,
  UserOutlined,
  HeartOutlined,
  ArrowLeftOutlined,
  AudioOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useTripStore } from '@/store/tripStore'
import { speechService } from '@/services/speechService'
import { TravelPreference } from '@/types'
import type { TripPlanRequest } from '@/types'
import dayjs from 'dayjs'

const { Header, Content } = Layout
const { RangePicker } = DatePicker
const { TextArea } = Input

const PREFERENCE_OPTIONS = [
  { label: '美食', value: TravelPreference.FOOD },
  { label: '文化', value: TravelPreference.CULTURE },
  { label: '自然', value: TravelPreference.NATURE },
  { label: '购物', value: TravelPreference.SHOPPING },
  { label: '冒险', value: TravelPreference.ADVENTURE },
  { label: '休闲', value: TravelPreference.RELAXATION },
  { label: '动漫', value: TravelPreference.ANIME },
  { label: '历史', value: TravelPreference.HISTORY },
]

const CreateTrip: React.FC = () => {
  const navigate = useNavigate()
  const { createTrip, isLoading } = useTripStore()
  const [form] = Form.useForm()
  const [currentStep, setCurrentStep] = useState(0)
  const [recording, setRecording] = useState(false)
  const [generating, setGenerating] = useState(false)

  const handleBack = () => {
    navigate('/dashboard')
  }

  const handleVoiceInput = (field: string) => {
    if (recording) {
      speechService.stop()
      setRecording(false)
      return
    }

    const success = speechService.start(
      (text) => {
        form.setFieldsValue({ [field]: text })
        message.success('语音识别成功')
        speechService.stop()
        setRecording(false)
      },
      (error) => {
        message.error(`语音识别失败: ${error}`)
        setRecording(false)
      }
    )

    if (success) {
      setRecording(true)
      message.info('正在录音，请说话...')
    } else {
      message.warning('当前浏览器不支持语音识别')
    }
  }

  // 验证当前步骤的字段
  const validateCurrentStep = async () => {
    try {
      if (currentStep === 0) {
        // 验证第一步的必填字段
        await form.validateFields(['destination', 'dateRange', 'budget', 'travelers'])
        return true
      } else if (currentStep === 1) {
        // 第二步没有必填字段，直接通过
        return true
      }
      return true
    } catch (error) {
      message.error('请填写所有必填项')
      return false
    }
  }

  // 处理下一步
  const handleNext = async () => {
    const isValid = await validateCurrentStep()
    if (isValid) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setGenerating(true)

      const request: TripPlanRequest = {
        destination: values.destination,
        start_date: values.dateRange?.[0]?.format('YYYY-MM-DD') || '',
        end_date: values.dateRange?.[1]?.format('YYYY-MM-DD') || '',
        budget: values.budget,
        travelers: values.travelers,
        preferences: values.preferences || [],
        has_children: values.has_children || false,
        additional_notes: values.additional_notes,
      }

      const trip = await createTrip(request)
      message.success('行程规划生成成功！')
      navigate(`/trip/${trip.id}`)
    } catch (error: any) {
      message.error(error.message || '生成行程失败')
    } finally {
      setGenerating(false)
    }
  }

  const steps = [
    {
      title: '基本信息',
      icon: <EnvironmentOutlined />,
    },
    {
      title: '偏好设置',
      icon: <HeartOutlined />,
    },
    {
      title: '确认生成',
      icon: <CalendarOutlined />,
    },
  ]

  return (
    <Layout className="min-h-screen bg-gray-50">
      <Header className="bg-white shadow-md flex items-center px-8">
        <Button icon={<ArrowLeftOutlined />} onClick={handleBack} className="mr-4">
          返回
        </Button>
        <h1 className="text-2xl font-bold text-blue-600 m-0">创建新行程</h1>
      </Header>

      <Content className="p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg">
            <Steps current={currentStep} items={steps} className="mb-8" />

            {generating ? (
              <div className="text-center py-20">
                <Spin size="large" />
                <h3 className="text-xl font-semibold mt-6 mb-2">AI 正在生成您的行程...</h3>
                <p className="text-gray-600">这可能需要 30-60 秒，请稍候</p>
              </div>
            ) : (
              <Form
                form={form}
                layout="vertical"
                initialValues={{
                  travelers: 1,
                  has_children: false,
                  preferences: [],
                }}
              >
                <div className="space-y-4" style={{ display: currentStep === 0 ? 'block' : 'none' }}>
                    <Form.Item
                      label="目的地"
                      name="destination"
                      rules={[{ required: true, message: '请输入目的地' }]}
                    >
                      <Input
                        size="large"
                        prefix={<EnvironmentOutlined />}
                        placeholder="例如：日本东京"
                        suffix={
                          <Button
                            type="text"
                            icon={<AudioOutlined />}
                            className={recording ? 'recording-pulse text-red-500' : ''}
                            onClick={() => handleVoiceInput('destination')}
                          />
                        }
                      />
                    </Form.Item>

                    <Form.Item
                      label="旅行日期"
                      name="dateRange"
                      rules={[{ required: true, message: '请选择旅行日期' }]}
                    >
                      <RangePicker
                        size="large"
                        style={{ width: '100%' }}
                        disabledDate={(current) => current && current < dayjs().startOf('day')}
                      />
                    </Form.Item>

                    <Form.Item
                      label="预算（元）"
                      name="budget"
                      rules={[{ required: true, message: '请输入预算' }]}
                    >
                      <InputNumber
                        size="large"
                        style={{ width: '100%' }}
                        min={0}
                        prefix={<DollarOutlined />}
                        placeholder="10000"
                      />
                    </Form.Item>

                    <Form.Item
                      label="同行人数"
                      name="travelers"
                      rules={[{ required: true, message: '请输入同行人数' }]}
                    >
                      <InputNumber
                        size="large"
                        style={{ width: '100%' }}
                        min={1}
                        prefix={<UserOutlined />}
                      />
                    </Form.Item>
                </div>

                <div className="space-y-4" style={{ display: currentStep === 1 ? 'block' : 'none' }}>
                    <Form.Item label="旅行偏好" name="preferences">
                      <Select
                        mode="multiple"
                        size="large"
                        placeholder="选择您的旅行偏好"
                        options={PREFERENCE_OPTIONS}
                      />
                    </Form.Item>

                    <Form.Item label="是否带孩子" name="has_children" valuePropName="checked">
                      <Switch checkedChildren="是" unCheckedChildren="否" />
                    </Form.Item>

                    <Form.Item label="额外说明" name="additional_notes">
                      <TextArea
                        rows={4}
                        placeholder="可以输入任何额外的需求，例如：喜欢住民宿、对海鲜过敏等"
                      />
                    </Form.Item>
                </div>

                <div className="text-center py-8" style={{ display: currentStep === 2 ? 'block' : 'none' }}>
                    <h3 className="text-2xl font-bold mb-4">准备好了吗？</h3>
                    <p className="text-gray-600 mb-6">
                      我们将根据您提供的信息，使用 AI 生成个性化的旅行计划，包括：
                    </p>
                    <ul className="text-left max-w-md mx-auto space-y-2 mb-8">
                      <li className="flex items-center">
                        <span className="text-green-500 mr-2">✓</span>
                        每日详细行程安排
                      </li>
                      <li className="flex items-center">
                        <span className="text-green-500 mr-2">✓</span>
                        景点推荐和介绍
                      </li>
                      <li className="flex items-center">
                        <span className="text-green-500 mr-2">✓</span>
                        餐厅和美食建议
                      </li>
                      <li className="flex items-center">
                        <span className="text-green-500 mr-2">✓</span>
                        住宿推荐
                      </li>
                      <li className="flex items-center">
                        <span className="text-green-500 mr-2">✓</span>
                        交通方式和路线
                      </li>
                      <li className="flex items-center">
                        <span className="text-green-500 mr-2">✓</span>
                        详细费用预估
                      </li>
                    </ul>
                </div>

                <div className="flex justify-between mt-8">
                  <Button
                    size="large"
                    onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                    disabled={currentStep === 0}
                  >
                    上一步
                  </Button>

                  {currentStep < 2 ? (
                    <Button
                      type="primary"
                      size="large"
                      onClick={handleNext}
                    >
                      下一步
                    </Button>
                  ) : (
                    <Button
                      type="primary"
                      size="large"
                      onClick={handleSubmit}
                      loading={isLoading}
                    >
                      生成行程
                    </Button>
                  )}
                </div>
              </Form>
            )}
          </Card>
        </div>
      </Content>
    </Layout>
  )
}

export default CreateTrip

