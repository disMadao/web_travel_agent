import React from 'react'
import { Card, Tag, Button, Space } from 'antd'
import {
  EnvironmentOutlined,
  CalendarOutlined,
  UserOutlined,
  DollarOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import type { TripPlan } from '@/types'

interface TripCardProps {
  trip: TripPlan
  onView?: (trip: TripPlan) => void
  onEdit?: (trip: TripPlan) => void
  onDelete?: (trip: TripPlan) => void
}

const TripCard: React.FC<TripCardProps> = ({ trip, onView, onEdit, onDelete }) => {
  const startDate = dayjs(trip.start_date)
  const endDate = dayjs(trip.end_date)
  const dateRange = `${startDate.format('YYYY-MM-DD')} ~ ${endDate.format('YYYY-MM-DD')}`

  return (
    <Card
      hoverable
      className="w-full"
      cover={
        <div className="h-48 bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">
          <div className="text-center text-white">
            <EnvironmentOutlined className="text-5xl mb-2" />
            <h3 className="text-2xl font-bold">{trip.destination}</h3>
          </div>
        </div>
      }
      actions={[
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => onView?.(trip)}
          key="view"
        >
          查看
        </Button>,
        <Button
          type="text"
          icon={<EditOutlined />}
          onClick={() => onEdit?.(trip)}
          key="edit"
        >
          编辑
        </Button>,
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => onDelete?.(trip)}
          key="delete"
        >
          删除
        </Button>,
      ]}
    >
      <div className="space-y-3">
        <h3 className="text-lg font-semibold mb-3">{trip.title}</h3>
        
        <div className="flex items-center text-gray-600">
          <CalendarOutlined className="mr-2" />
          <span className="text-sm">{dateRange}</span>
          <Tag color="blue" className="ml-2">
            {trip.total_days} 天
          </Tag>
        </div>

        <div className="flex items-center text-gray-600">
          <UserOutlined className="mr-2" />
          <span className="text-sm">{trip.travelers} 人</span>
          {trip.has_children && (
            <Tag color="orange" className="ml-2">
              亲子游
            </Tag>
          )}
        </div>

        <div className="flex items-center text-gray-600">
          <DollarOutlined className="mr-2" />
          <span className="text-sm">
            预算: ¥{trip.budget.toLocaleString()} / 预估: ¥
            {trip.total_estimated_cost.toLocaleString()}
          </span>
        </div>

        <div className="mt-3">
          <Space wrap>
            {trip.preferences.map((pref) => (
              <Tag key={pref} color="cyan">
                {pref}
              </Tag>
            ))}
          </Space>
        </div>
      </div>
    </Card>
  )
}

export default TripCard

