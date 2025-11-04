import React, { useEffect, useState } from 'react'
import {
  Layout,
  Button,
  Table,
  Card,
  Row,
  Col,
  Statistic,
  Tag,
  Modal,
  message,
  Space,
} from 'antd'
import {
  ArrowLeftOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  BarChartOutlined,
} from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import { useExpenseStore } from '@/store/expenseStore'
import { useTripStore } from '@/store/tripStore'
import ExpenseForm from '@/components/ExpenseForm'
import dayjs from 'dayjs'
import type { Expense, ExpenseCreate } from '@/types'
import type { ColumnsType } from 'antd/es/table'

const { Header, Content } = Layout

const ExpenseManagement: React.FC = () => {
  const navigate = useNavigate()
  const { tripId } = useParams<{ tripId: string }>()
  const { expenses, summary, fetchExpenses, fetchSummary, updateExpense, deleteExpense, analyzeBudget } =
    useExpenseStore()
  const { fetchTrip } = useTripStore()
  const [expenseFormVisible, setExpenseFormVisible] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null)
  const [analysisModalVisible, setAnalysisModalVisible] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)
  const [analyzing, setAnalyzing] = useState(false)

  useEffect(() => {
    if (tripId) {
      fetchTrip(tripId)
      fetchExpenses(tripId)
      fetchSummary(tripId)
    }
  }, [tripId])

  const handleBack = () => {
    navigate(`/trip/${tripId}`)
  }

  const handleAddExpense = () => {
    setEditingExpense(null)
    setExpenseFormVisible(true)
  }

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense)
    setExpenseFormVisible(true)
  }

  const handleDeleteClick = (expense: Expense) => {
    setExpenseToDelete(expense)
    setDeleteModalVisible(true)
  }

  const handleDeleteConfirm = async () => {
    if (!expenseToDelete) return

    try {
      await deleteExpense(expenseToDelete.id)
      message.success('费用记录已删除')
      setDeleteModalVisible(false)
      setExpenseToDelete(null)
      if (tripId) {
        fetchSummary(tripId)
      }
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleSubmitExpense = async (expense: ExpenseCreate) => {
    try {
      if (editingExpense) {
        await updateExpense(editingExpense.id, expense)
        message.success('费用记录已更新')
      } else {
        const { createExpense } = useExpenseStore.getState()
        await createExpense(expense)
        message.success('费用记录已添加')
      }
      setExpenseFormVisible(false)
      setEditingExpense(null)
      if (tripId) {
        fetchSummary(tripId)
      }
    } catch (error) {
      message.error('操作失败')
    }
  }

  const handleAnalyze = async () => {
    if (!tripId) return

    setAnalyzing(true)
    try {
      const result = await analyzeBudget(tripId)
      setAnalysis(result)
      setAnalysisModalVisible(true)
    } catch (error) {
      message.error('AI 分析失败')
    } finally {
      setAnalyzing(false)
    }
  }

  const columns: ColumnsType<Expense> = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
      sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
    },
    {
      title: '类别',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => {
        const colorMap: Record<string, string> = {
          transportation: 'blue',
          accommodation: 'green',
          food: 'orange',
          attractions: 'purple',
          shopping: 'pink',
          other: 'default',
        }
        return <Tag color={colorMap[category] || 'default'}>{category}</Tag>
      },
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `¥${amount.toFixed(2)}`,
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: '地点',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditExpense(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteClick(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <Layout className="min-h-screen bg-gray-50">
      <Header className="bg-white shadow-md flex items-center justify-between px-8">
        <div className="flex items-center">
          <Button icon={<ArrowLeftOutlined />} onClick={handleBack} className="mr-4">
            返回
          </Button>
          <h1 className="text-2xl font-bold text-blue-600 m-0">费用管理</h1>
        </div>
        <Space>
          <Button
            icon={<BarChartOutlined />}
            onClick={handleAnalyze}
            loading={analyzing}
          >
            AI 分析
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddExpense}>
            添加费用
          </Button>
        </Space>
      </Header>

      <Content className="p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {summary && (
            <Row gutter={16}>
              <Col xs={24} sm={6}>
                <Card>
                  <Statistic
                    title="总预算"
                    value={summary.budget}
                    prefix="¥"
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={6}>
                <Card>
                  <Statistic
                    title="已花费"
                    value={summary.total_spent}
                    prefix="¥"
                    valueStyle={{ color: summary.total_spent > summary.budget ? '#ff4d4f' : '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={6}>
                <Card>
                  <Statistic
                    title="剩余预算"
                    value={summary.remaining}
                    prefix="¥"
                    valueStyle={{ color: summary.remaining < 0 ? '#ff4d4f' : '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={6}>
                <Card>
                  <Statistic
                    title="日均花费"
                    value={summary.daily_average}
                    prefix="¥"
                    precision={2}
                  />
                </Card>
              </Col>
            </Row>
          )}

          {summary && Object.keys(summary.by_category).length > 0 && (
            <Card title="分类统计">
              <Row gutter={[16, 16]}>
                {Object.entries(summary.by_category).map(([category, amount]) => (
                  <Col xs={12} sm={8} md={6} key={category}>
                    <Statistic
                      title={category}
                      value={amount as number}
                      prefix="¥"
                      valueStyle={{ fontSize: '18px' }}
                    />
                  </Col>
                ))}
              </Row>
            </Card>
          )}

          <Card title="费用记录">
            <Table
              columns={columns}
              dataSource={expenses}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </div>
      </Content>

      {tripId && (
        <ExpenseForm
          visible={expenseFormVisible}
          tripId={tripId}
          onSubmit={handleSubmitExpense}
          onCancel={() => {
            setExpenseFormVisible(false)
            setEditingExpense(null)
          }}
          initialValues={
            editingExpense
              ? {
                  trip_id: editingExpense.trip_id,
                  category: editingExpense.category,
                  amount: editingExpense.amount,
                  description: editingExpense.description,
                  date: editingExpense.date,
                  location: editingExpense.location,
                  notes: editingExpense.notes,
                }
              : undefined
          }
        />
      )}

      <Modal
        title="确认删除"
        open={deleteModalVisible}
        onOk={handleDeleteConfirm}
        onCancel={() => setDeleteModalVisible(false)}
        okText="删除"
        cancelText="取消"
        okButtonProps={{ danger: true }}
      >
        <p>确定要删除这条费用记录吗？此操作无法撤销。</p>
      </Modal>

      <Modal
        title="AI 预算分析"
        open={analysisModalVisible}
        onCancel={() => setAnalysisModalVisible(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setAnalysisModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={700}
      >
        {analysis && (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">分析报告</h4>
              <p className="text-gray-700 whitespace-pre-wrap">{analysis.analysis}</p>
            </div>
            {analysis.suggestions && (
              <div>
                <h4 className="font-semibold mb-2">建议</h4>
                <ul className="list-disc list-inside space-y-1">
                  {analysis.suggestions.map((suggestion: string, index: number) => (
                    <li key={index} className="text-gray-700">
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Modal>
    </Layout>
  )
}

export default ExpenseManagement

