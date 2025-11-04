import React, { useEffect, useState } from 'react'
import { Layout, Button, Row, Col, Spin, Empty, Modal, message } from 'antd'
import { PlusOutlined, LogoutOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useTripStore } from '@/store/tripStore'
import TripCard from '@/components/TripCard'
import type { TripPlan } from '@/types'

const { Header, Content } = Layout

const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const { user, signOut } = useAuthStore()
  const { trips, isLoading, fetchTrips, deleteTrip } = useTripStore()
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [tripToDelete, setTripToDelete] = useState<TripPlan | null>(null)

  useEffect(() => {
    fetchTrips()
  }, [fetchTrips])

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  const handleCreateTrip = () => {
    navigate('/create-trip')
  }

  const handleViewTrip = (trip: TripPlan) => {
    navigate(`/trip/${trip.id}`)
  }

  const handleEditTrip = (trip: TripPlan) => {
    navigate(`/trip/${trip.id}/edit`)
  }

  const handleDeleteClick = (trip: TripPlan) => {
    setTripToDelete(trip)
    setDeleteModalVisible(true)
  }

  const handleDeleteConfirm = async () => {
    if (!tripToDelete?.id) return

    try {
      await deleteTrip(tripToDelete.id)
      message.success('行程已删除')
      setDeleteModalVisible(false)
      setTripToDelete(null)
    } catch (error) {
      message.error('删除失败')
    }
  }

  return (
    <Layout className="min-h-screen">
      <Header className="bg-white shadow-md flex items-center justify-between px-8">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-blue-600 m-0">AI 智能旅行助手</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-700">欢迎，{user?.email}</span>
          <Button icon={<LogoutOutlined />} onClick={handleLogout}>
            登出
          </Button>
        </div>
      </Header>

      <Content className="p-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">我的行程</h2>
              <p className="text-gray-600">管理您的所有旅行计划</p>
            </div>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={handleCreateTrip}
              className="h-12"
            >
              创建新行程
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Spin size="large" tip="加载中..." />
            </div>
          ) : trips.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="还没有任何行程"
              className="mt-20"
            >
              <Button type="primary" size="large" onClick={handleCreateTrip}>
                创建第一个行程
              </Button>
            </Empty>
          ) : (
            <Row gutter={[24, 24]}>
              {trips.map((trip) => (
                <Col xs={24} sm={12} lg={8} xl={6} key={trip.id}>
                  <TripCard
                    trip={trip}
                    onView={handleViewTrip}
                    onEdit={handleEditTrip}
                    onDelete={handleDeleteClick}
                  />
                </Col>
              ))}
            </Row>
          )}
        </div>
      </Content>

      <Modal
        title="确认删除"
        open={deleteModalVisible}
        onOk={handleDeleteConfirm}
        onCancel={() => setDeleteModalVisible(false)}
        okText="删除"
        cancelText="取消"
        okButtonProps={{ danger: true }}
      >
        <p>确定要删除行程 "{tripToDelete?.title}" 吗？此操作无法撤销。</p>
      </Modal>
    </Layout>
  )
}

export default Dashboard

