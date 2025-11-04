/**
 * 语音识别服务
 * 使用 Web Speech API 实现语音转文字功能
 */

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message: string
}

class SpeechService {
  private recognition: any
  private isListening = false
  private onResultCallback?: (text: string) => void
  private onErrorCallback?: (error: string) => void

  constructor() {
    // 检查浏览器是否支持 Web Speech API
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition()
      this.setupRecognition()
    } else {
      console.warn('当前浏览器不支持 Web Speech API')
    }
  }

  private setupRecognition() {
    if (!this.recognition) return

    // 设置语言为中文
    this.recognition.lang = 'zh-CN'
    
    // 连续识别
    this.recognition.continuous = true
    
    // 返回临时结果
    this.recognition.interimResults = true
    
    // 最大候选结果数
    this.recognition.maxAlternatives = 1

    // 识别结果回调
    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      if (finalTranscript && this.onResultCallback) {
        this.onResultCallback(finalTranscript)
      }
    }

    // 错误回调
    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('语音识别错误:', event.error)
      if (this.onErrorCallback) {
        this.onErrorCallback(event.error)
      }
      this.isListening = false
    }

    // 识别结束回调
    this.recognition.onend = () => {
      this.isListening = false
    }
  }

  /**
   * 开始语音识别
   */
  start(
    onResult: (text: string) => void,
    onError?: (error: string) => void
  ): boolean {
    if (!this.recognition) {
      if (onError) {
        onError('当前浏览器不支持语音识别')
      }
      return false
    }

    if (this.isListening) {
      return false
    }

    this.onResultCallback = onResult
    this.onErrorCallback = onError

    try {
      this.recognition.start()
      this.isListening = true
      return true
    } catch (error) {
      console.error('启动语音识别失败:', error)
      if (onError) {
        onError('启动语音识别失败')
      }
      return false
    }
  }

  /**
   * 停止语音识别
   */
  stop() {
    if (this.recognition && this.isListening) {
      this.recognition.stop()
      this.isListening = false
    }
  }

  /**
   * 检查是否支持语音识别
   */
  isSupported(): boolean {
    return !!this.recognition
  }

  /**
   * 检查是否正在识别
   */
  getIsListening(): boolean {
    return this.isListening
  }
}

export const speechService = new SpeechService()

