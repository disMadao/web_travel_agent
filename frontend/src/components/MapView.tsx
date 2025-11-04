import React, { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import { Icon, LatLngBounds } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Attraction, Accommodation } from '@/types'

// 自定义景点图标（蓝色）
const AttractionIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="48" viewBox="0 0 32 48">
      <path fill="#1890ff" d="M16 0C7.2 0 0 7.2 0 16c0 12 16 32 16 32s16-20 16-32C32 7.2 24.8 0 16 0zm0 22c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6z"/>
      <circle fill="white" cx="16" cy="16" r="4"/>
    </svg>
  `),
  iconSize: [32, 48],
  iconAnchor: [16, 48],
  popupAnchor: [0, -48],
})

// 自定义住宿图标（红色）
const AccommodationIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="48" viewBox="0 0 32 48">
      <path fill="#ff4d4f" d="M16 0C7.2 0 0 7.2 0 16c0 12 16 32 16 32s16-20 16-32C32 7.2 24.8 0 16 0zm0 22c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6z"/>
      <circle fill="white" cx="16" cy="16" r="4"/>
    </svg>
  `),
  iconSize: [32, 48],
  iconAnchor: [16, 48],
  popupAnchor: [0, -48],
})

interface MapViewProps {
  attractions?: Attraction[]
  accommodations?: Accommodation[]
  center?: [number, number]
  zoom?: number
  className?: string
}

// 地图控制组件 - 用于自动调整视野
function MapController({ attractions, accommodations }: { attractions: Attraction[], accommodations: Accommodation[] }) {
  const map = useMap()

  useEffect(() => {
    if (attractions.length === 0 && accommodations.length === 0) return

    const bounds = new LatLngBounds([])
    
    attractions.forEach(a => {
      bounds.extend([a.latitude, a.longitude])
    })
    
    accommodations.forEach(a => {
      bounds.extend([a.latitude, a.longitude])
    })

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [attractions, accommodations, map])

  return null
}

const MapView: React.FC<MapViewProps> = ({
  attractions = [],
  accommodations = [],
  center,
  zoom = 12,
  className = '',
}) => {
  // 确定地图中心点
  let mapCenter: [number, number] = [39.90923, 116.397428] // 默认北京 (注意 Leaflet 是 [lat, lng])

  if (center) {
    mapCenter = [center[1], center[0]] // 转换为 [lat, lng]
  } else if (attractions.length > 0) {
    mapCenter = [attractions[0].latitude, attractions[0].longitude]
  } else if (accommodations.length > 0) {
    mapCenter = [accommodations[0].latitude, accommodations[0].longitude]
  }

  // 生成景点之间的路线
  const attractionPath = attractions.map(a => [a.latitude, a.longitude] as [number, number])

  return (
    <div className={`relative ${className}`} style={{ height: '100%', minHeight: '400px' }}>
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        {/* 使用 OpenStreetMap 作为底图 - 完全免费无需 API key */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* 自动调整视野 */}
        <MapController attractions={attractions} accommodations={accommodations} />

        {/* 添加景点标记 */}
        {attractions.map((attraction, index) => (
          <Marker
            key={`attraction-${index}`}
            position={[attraction.latitude, attraction.longitude]}
            icon={AttractionIcon}
          >
            <Popup>
              <div style={{ minWidth: '200px' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold' }}>
                  {index + 1}. {attraction.name}
                </h3>
                <p style={{ margin: '4px 0', color: '#666', fontSize: '14px' }}>
                  {attraction.description}
                </p>
                <p style={{ margin: '4px 0', color: '#999', fontSize: '12px' }}>
                  📍 {attraction.address}
                </p>
                <p style={{ margin: '4px 0', color: '#1890ff', fontWeight: 'bold' }}>
                  💰 约 ¥{attraction.estimated_cost}
                </p>
                {attraction.tips && (
                  <p style={{ margin: '4px 0', color: '#52c41a', fontSize: '12px' }}>
                    💡 {attraction.tips}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* 添加住宿标记 */}
        {accommodations.map((accommodation, index) => (
          <Marker
            key={`accommodation-${index}`}
            position={[accommodation.latitude, accommodation.longitude]}
            icon={AccommodationIcon}
          >
            <Popup>
              <div style={{ minWidth: '200px' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold' }}>
                  🏨 {accommodation.name}
                </h3>
                <p style={{ margin: '4px 0', color: '#666' }}>
                  类型: {accommodation.type}
                </p>
                <p style={{ margin: '4px 0', color: '#999', fontSize: '12px' }}>
                  📍 {accommodation.address}
                </p>
                <p style={{ margin: '4px 0', color: '#1890ff', fontWeight: 'bold' }}>
                  💰 约 ¥{accommodation.estimated_cost}
                </p>
                {accommodation.facilities && accommodation.facilities.length > 0 && (
                  <p style={{ margin: '4px 0', color: '#52c41a', fontSize: '12px' }}>
                    🎯 {accommodation.facilities.join(', ')}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* 如果有多个景点，绘制路线 */}
        {attractionPath.length > 1 && (
          <Polyline
            positions={attractionPath}
            pathOptions={{
              color: '#1890ff',
              weight: 4,
              opacity: 0.8,
            }}
          />
        )}
      </MapContainer>
    </div>
  )
}

export default MapView
