type MessageHandler = (data: unknown) => void

class WebSocketService {
  private ws: WebSocket | null = null
  private url: string = ''
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private handlers: Map<string, MessageHandler[]> = new Map()
  private reconnectTimer: number | null = null

  connect(userId: string) {
    // 生产环境直接使用 Render 后端地址
    const isProduction = window.location.hostname !== 'localhost'
    const wsBaseUrl = isProduction
      ? 'wss://sports-vision-cloud.onrender.com'
      : 'ws://localhost:8000'

    this.url = `${wsBaseUrl}/ws/user/${userId}`
    console.log('[WS] 连接地址:', this.url)

    this.createConnection()
  }

  private createConnection() {
    if (this.ws?.readyState === WebSocket.OPEN) return

    this.ws = new WebSocket(this.url)

    this.ws.onopen = () => {
      console.log('[WS] 连接已建立')
      this.reconnectAttempts = 0
      this.startHeartbeat()
    }

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        const handlers = this.handlers.get(data.type) || []
        handlers.forEach((handler) => handler(data))
      } catch (e) {
        console.error('[WS] 消息解析失败', e)
      }
    }

    this.ws.onclose = () => {
      console.log('[WS] 连接已关闭')
      this.attemptReconnect()
    }

    this.ws.onerror = (error) => {
      console.error('[WS] 连接错误', error)
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('[WS] 达到最大重连次数')
      return
    }

    this.reconnectAttempts++
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)

    console.log(`[WS] ${delay / 1000}秒后尝试重连...`)

    this.reconnectTimer = window.setTimeout(() => {
      this.createConnection()
    }, delay)
  }

  private startHeartbeat() {
    setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping' })
      }
    }, 30000)
  }

  send(data: object) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    }
  }

  subscribe(type: string, handler: MessageHandler) {
    const handlers = this.handlers.get(type) || []
    handlers.push(handler)
    this.handlers.set(type, handlers)

    return () => {
      const hs = this.handlers.get(type) || []
      const idx = hs.indexOf(handler)
      if (idx > -1) hs.splice(idx, 1)
    }
  }

  subscribeDevice(deviceId: string) {
    this.send({ type: 'subscribe_device', device_id: deviceId })
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }
    this.ws?.close()
    this.ws = null
  }
}

export const wsService = new WebSocketService()
