import React, { useEffect, useState } from 'react'
import {
  Layout,
  Button,
  Tabs,
  Card,
  Tag,
  Timeline,
  Descriptions,
  Row,
  Col,
  Statistic,
  message,
  Spin,
} from 'antd'
import {
  ArrowLeftOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  HomeOutlined,
} from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import { useTripStore } from '@/store/tripStore'
import { useExpenseStore } from '@/store/expenseStore'
import MapView from '@/components/MapView'
import ExpenseForm from '@/components/ExpenseForm'
import dayjs from 'dayjs'

const { Header, Content } = Layout

const TripDetail: React.FC = () => {
  const navigate = useNavigate()
  const { tripId } = useParams<{ tripId: string }>()
  const { currentTrip, fetchTrip, isLoading } = useTripStore()
  const { summary, fetchExpenses, fetchSummary, createExpense } = useExpenseStore()
  const [expenseFormVisible, setExpenseFormVisible] = useState(false)

  useEffect(() => {
    if (tripId) {
      fetchTrip(tripId)
      fetchExpenses(tripId)
      fetchSummary(tripId)
    }
  }, [tripId])

  const handleBack = () => {
    navigate('/dashboard')
  }

  const handleManageExpenses = () => {
    navigate(`/trip/${tripId}/expenses`)
  }

  const handleAddExpense = async (expense: any) => {
    try {
      await createExpense(expense)
      setExpenseFormVisible(false)
      if (tripId) {
        fetchSummary(tripId)
      }
    } catch (error) {
      message.error('添加费用失败')
    }
  }

  if (isLoading || !currentTrip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" tip="加载中..." />
      </div>
    )
  }

  const tabItems = [
    {
      key: 'itinerary',
      label: '行程安排',
      children: (
        <div className="space-y-6">
          {currentTrip.daily_itineraries.map((day) => (
            <Card key={day.day} title={`第 ${day.day} 天 - ${dayjs(day.date).format('YYYY年MM月DD日')}`}>
              {day.notes && (
                <div className="mb-4 p-3 bg-blue-50 rounded">
                  <p className="text-gray-700">{day.notes}</p>
                </div>
              )}

              <h4 className="font-semibold text-lg mb-3">🎯 景点</h4>
              <Timeline
                items={day.attractions.map((attraction) => ({
                  children: (
                    <div>
                      <h5 className="font-semibold">{attraction.name}</h5>
                      <p className="text-gray-600 text-sm">{attraction.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span>
                          <EnvironmentOutlined /> {attraction.address}
                        </span>
                        <span>
                          <ClockCircleOutlined /> {attraction.duration} 分钟
                        </span>
                        <span>
                          <DollarOutlined /> ¥{attraction.estimated_cost}
                        </span>
                      </div>
                      {attraction.tips && (
                        <div className="mt-2 text-sm text-green-600">💡 {attraction.tips}</div>
                      )}
                    </div>
                  ),
                }))}
              />

              {day.restaurants.length > 0 && (
                <>
                  <h4 className="font-semibold text-lg mb-3 mt-6">🍽️ 餐厅</h4>
                  <div className="space-y-3">
                    {day.restaurants.map((restaurant, index) => (
                      <Card size="small" key={index}>
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-semibold">{restaurant.name}</h5>
                            <p className="text-gray-600 text-sm">{restaurant.cuisine_type}</p>
                            <p className="text-gray-500 text-sm">{restaurant.address}</p>
                            {restaurant.recommendations && (
                              <p className="text-sm text-orange-600 mt-1">
                                推荐：{restaurant.recommendations}
                              </p>
                            )}
                          </div>
                          <Tag color="orange">¥{restaurant.estimated_cost}</Tag>
                        </div>
                      </Card>
                    ))}
                  </div>
                </>
              )}

              {day.transportation.length > 0 && (
                <>
                  <h4 className="font-semibold text-lg mb-3 mt-6">🚗 交通</h4>
                  <div className="space-y-2">
                    {day.transportation.map((trans, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded"
                      >
                        <div>
                          <span className="font-medium">{trans.type}</span>
                          <span className="text-gray-600 ml-2">
                            {trans.from_location} → {trans.to_location}
                          </span>
                          {trans.departure_time && (
                            <span className="text-gray-500 text-sm ml-2">
                              ({trans.departure_time})
                            </span>
                          )}
                        </div>
                        <Tag color="blue">¥{trans.estimated_cost}</Tag>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </Card>
          ))}
        </div>
      ),
    },
    {
      key: 'map',
      label: '地图',
      children: (
        <div className="h-[600px]">
          <MapView
            attractions={currentTrip.daily_itineraries.flatMap((day) => day.attractions)}
            accommodations={currentTrip.accommodations}
            className="h-full rounded-lg overflow-hidden shadow-lg"
          />
        </div>
      ),
    },
    {
      key: 'accommodation',
      label: '住宿',
      children: (
        <Row gutter={[16, 16]}>
          {currentTrip.accommodations.map((acc, index) => (
            <Col xs={24} md={12} key={index}>
              <Card>
                <div className="flex items-start gap-3">
                  <HomeOutlined className="text-3xl text-blue-500" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{acc.name}</h3>
                    <p className="text-gray-600 mb-1">
                      类型: <Tag>{acc.type}</Tag>
                    </p>
                    <p className="text-gray-600 mb-1">
                      入住: {dayjs(acc.check_in).format('YYYY-MM-DD')} ~ 退房:{' '}
                      {dayjs(acc.check_out).format('YYYY-MM-DD')}
                    </p>
                    <p className="text-gray-500 text-sm mb-2">{acc.address}</p>
                    <div className="mb-2">
                      {acc.facilities.map((facility) => (
                        <Tag key={facility} color="cyan" className="mb-1">
                          {facility}
                        </Tag>
                      ))}
                    </div>
                    <p className="text-lg font-semibold text-blue-600">
                      ¥{acc.estimated_cost.toLocaleString()}
                    </p>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      ),
    },
    {
      key: 'budget',
      label: '费用预算',
      children: (
        <div className="space-y-6">
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="总预算"
                  value={currentTrip.budget}
                  prefix="¥"
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="预估花费"
                  value={currentTrip.total_estimated_cost}
                  prefix="¥"
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="实际花费"
                  value={summary?.total_spent || 0}
                  prefix="¥"
                  valueStyle={{
                    color: summary && summary.total_spent > currentTrip.budget ? '#ff4d4f' : '#52c41a',
                  }}
                />
              </Card>
            </Col>
          </Row>

          <Card title="费用明细">
            <Descriptions column={2}>
              <Descriptions.Item label="交通">
                ¥{currentTrip.estimated_costs.transportation.toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="住宿">
                ¥{currentTrip.estimated_costs.accommodation.toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="餐饮">
                ¥{currentTrip.estimated_costs.food.toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="景点门票">
                ¥{currentTrip.estimated_costs.attractions.toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="购物">
                ¥{currentTrip.estimated_costs.shopping.toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="其他">
                ¥{currentTrip.estimated_costs.other.toLocaleString()}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <div className="flex gap-3">
            <Button type="primary" size="large" onClick={() => setExpenseFormVisible(true)}>
              添加实际花费
            </Button>
            <Button size="large" onClick={handleManageExpenses}>
              查看花费记录
            </Button>
          </div>
        </div>
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
          <h1 className="text-2xl font-bold text-blue-600 m-0">{currentTrip.title}</h1>
        </div>
        <div>
          <Tag color="blue">{currentTrip.total_days} 天</Tag>
          <Tag color="green">{currentTrip.travelers} 人</Tag>
          {currentTrip.has_children && <Tag color="orange">亲子游</Tag>}
        </div>
      </Header>

      <Content className="p-8">
        <div className="max-w-7xl mx-auto">
          <Tabs defaultActiveKey="itinerary" items={tabItems} size="large" />
        </div>
      </Content>

      {tripId && (
        <ExpenseForm
          visible={expenseFormVisible}
          tripId={tripId}
          onSubmit={handleAddExpense}
          onCancel={() => setExpenseFormVisible(false)}
        />
      )}
    </Layout>
  )
}

export default TripDetail

