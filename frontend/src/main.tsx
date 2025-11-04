import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import App from './App'
import './index.css'
import 'dayjs/locale/zh-cn'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ConfigProvider locale={zhCN} theme={{
        token: {
          colorPrimary: '#0ea5e9',
          borderRadius: 8,
        },
      }}>
        <App />
      </ConfigProvider>
    </BrowserRouter>
  </React.StrictMode>,
)

