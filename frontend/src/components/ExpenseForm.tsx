import React, { useState } from 'react'
import { Modal, Form, Input, InputNumber, DatePicker, Select, Button, message } from 'antd'
import { AudioOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { speechService } from '@/services/speechService'
import type { ExpenseCreate } from '@/types'

interface ExpenseFormProps {
  visible: boolean
  tripId: string
  onSubmit: (expense: ExpenseCreate) => Promise<void>
  onCancel: () => void
  initialValues?: Partial<ExpenseCreate>
}

const EXPENSE_CATEGORIES = [
  { label: '交通', value: 'transportation' },
  { label: '住宿', value: 'accommodation' },
  { label: '餐饮', value: 'food' },
  { label: '景点门票', value: 'attractions' },
  { label: '购物', value: 'shopping' },
  { label: '其他', value: 'other' },
]

const ExpenseForm: React.FC<ExpenseFormProps> = ({
  visible,
  tripId,
  onSubmit,
  onCancel,
  initialValues,
}) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [recording, setRecording] = useState(false)

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)

      const expense: ExpenseCreate = {
        trip_id: tripId,
        category: values.category,
        amount: values.amount,
        description: values.description,
        date: values.date.format('YYYY-MM-DD'),
        location: values.location,
        notes: values.notes,
      }

      await onSubmit(expense)
      message.success('费用记录已添加')
      form.resetFields()
    } catch (error) {
      console.error('添加费用记录失败:', error)
      message.error('添加费用记录失败')
    } finally {
      setLoading(false)
    }
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
      message.info('正在录音...')
    } else {
      message.warning('当前浏览器不支持语音识别')
    }
  }

  return (
    <Modal
      title={initialValues ? '编辑费用记录' : '添加费用记录'}
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          取消
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
          提交
        </Button>,
      ]}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={
          initialValues
            ? {
                ...initialValues,
                date: initialValues.date ? dayjs(initialValues.date) : dayjs(),
              }
            : {
                date: dayjs(),
              }
        }
      >
        <Form.Item
          label="类别"
          name="category"
          rules={[{ required: true, message: '请选择费用类别' }]}
        >
          <Select options={EXPENSE_CATEGORIES} placeholder="选择费用类别" />
        </Form.Item>

        <Form.Item
          label="金额"
          name="amount"
          rules={[{ required: true, message: '请输入金额' }]}
        >
          <InputNumber
            style={{ width: '100%' }}
            min={0}
            precision={2}
            prefix="¥"
            placeholder="0.00"
          />
        </Form.Item>

        <Form.Item
          label="描述"
          name="description"
          rules={[{ required: true, message: '请输入描述' }]}
        >
          <Input
            placeholder="例如：午餐、出租车费等"
            suffix={
              <Button
                type="text"
                size="small"
                icon={<AudioOutlined />}
                className={recording ? 'recording-pulse text-red-500' : ''}
                onClick={() => handleVoiceInput('description')}
              />
            }
          />
        </Form.Item>

        <Form.Item
          label="日期"
          name="date"
          rules={[{ required: true, message: '请选择日期' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item label="地点" name="location">
          <Input
            placeholder="可选，记录消费地点"
            suffix={
              <Button
                type="text"
                size="small"
                icon={<AudioOutlined />}
                className={recording ? 'recording-pulse text-red-500' : ''}
                onClick={() => handleVoiceInput('location')}
              />
            }
          />
        </Form.Item>

        <Form.Item label="备注" name="notes">
          <Input.TextArea
            rows={3}
            placeholder="可选，添加额外备注"
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default ExpenseForm

