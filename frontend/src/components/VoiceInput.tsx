import { useState } from 'react'
import { Button, message } from 'antd'
import { AudioOutlined, AudioMutedOutlined } from '@ant-design/icons'
import { speechService } from '@/services/speechService'

interface VoiceInputProps {
  onResult: (text: string) => void
  className?: string
}

export const VoiceInput: React.FC<VoiceInputProps> = ({ onResult, className }) => {
  const [isRecording, setIsRecording] = useState(false)

  const handleVoiceInput = () => {
    if (!speechService.isSupported()) {
      message.error('您的浏览器不支持语音识别功能，请使用 Chrome 或 Edge 浏览器')
      return
    }

    if (isRecording) {
      speechService.stop()
      setIsRecording(false)
    } else {
      const started = speechService.start(
        (text) => {
          onResult(text)
          message.success('识别成功')
        },
        (error) => {
          message.error(`语音识别失败: ${error}`)
          setIsRecording(false)
        }
      )

      if (started) {
        setIsRecording(true)
        message.info('开始语音识别，请说话...')
      }
    }
  }

  return (
    <Button
      type={isRecording ? 'primary' : 'default'}
      icon={isRecording ? <AudioMutedOutlined /> : <AudioOutlined />}
      onClick={handleVoiceInput}
      className={`${className} ${isRecording ? 'recording-pulse' : ''}`}
      danger={isRecording}
    >
      {isRecording ? '停止录音' : '语音输入'}
    </Button>
  )
}

