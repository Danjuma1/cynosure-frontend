import { useAuthStore } from '@/store/authStore'

const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8001'

class WebSocketService {
  constructor() {
    this.connections = new Map()
    this.reconnectAttempts = new Map()
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 3000
  }

  connect(endpoint, onMessage, options = {}) {
    const token = useAuthStore.getState().accessToken
    const url = `${WS_BASE_URL}/ws/${endpoint}/?token=${token}`
    
    if (this.connections.has(endpoint)) {
      this.disconnect(endpoint)
    }

    const ws = new WebSocket(url)
    
    ws.onopen = () => {
      console.log(`WebSocket connected: ${endpoint}`)
      this.reconnectAttempts.set(endpoint, 0)
      
      if (options.onOpen) {
        options.onOpen()
      }
      
      // Send initial subscriptions if provided
      if (options.subscriptions) {
        options.subscriptions.forEach(sub => {
          ws.send(JSON.stringify({
            action: 'subscribe',
            ...sub,
          }))
        })
      }
      
      // Start ping interval
      const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ action: 'ping' }))
        }
      }, 30000)
      
      ws._pingInterval = pingInterval
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type !== 'pong') {
          onMessage(data)
        }
      } catch (error) {
        console.error('WebSocket message parse error:', error)
      }
    }

    ws.onerror = (error) => {
      console.error(`WebSocket error: ${endpoint}`, error)
      if (options.onError) {
        options.onError(error)
      }
    }

    ws.onclose = (event) => {
      console.log(`WebSocket closed: ${endpoint}`, event.code)
      
      if (ws._pingInterval) {
        clearInterval(ws._pingInterval)
      }
      
      this.connections.delete(endpoint)
      
      // Attempt reconnection
      const attempts = this.reconnectAttempts.get(endpoint) || 0
      if (attempts < this.maxReconnectAttempts && !event.wasClean) {
        this.reconnectAttempts.set(endpoint, attempts + 1)
        setTimeout(() => {
          console.log(`Reconnecting ${endpoint}... Attempt ${attempts + 1}`)
          this.connect(endpoint, onMessage, options)
        }, this.reconnectDelay * (attempts + 1))
      }
      
      if (options.onClose) {
        options.onClose(event)
      }
    }

    this.connections.set(endpoint, ws)
    return ws
  }

  disconnect(endpoint) {
    const ws = this.connections.get(endpoint)
    if (ws) {
      if (ws._pingInterval) {
        clearInterval(ws._pingInterval)
      }
      ws.close(1000, 'Client disconnect')
      this.connections.delete(endpoint)
    }
  }

  disconnectAll() {
    this.connections.forEach((ws, endpoint) => {
      this.disconnect(endpoint)
    })
  }

  send(endpoint, data) {
    const ws = this.connections.get(endpoint)
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data))
    }
  }

  subscribe(endpoint, subscriptionType, id) {
    this.send(endpoint, {
      action: 'subscribe',
      subscription_type: subscriptionType,
      id: id,
    })
  }

  unsubscribe(endpoint, subscriptionType, id) {
    this.send(endpoint, {
      action: 'unsubscribe',
      subscription_type: subscriptionType,
      id: id,
    })
  }
}

export const wsService = new WebSocketService()
export default wsService
