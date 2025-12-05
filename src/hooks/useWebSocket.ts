import { useEffect, useRef, useState, useCallback } from 'react'

export type WebSocketStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

interface UseWebSocketOptions {
  url: string
  onMessage?: (event: MessageEvent) => void
  onOpen?: (event: Event) => void
  onClose?: (event: CloseEvent) => void
  onError?: (event: Event) => void
  reconnect?: boolean
  reconnectAttempts?: number
  reconnectInterval?: number
}

interface UseWebSocketReturn {
  status: WebSocketStatus
  send: (data: string | object) => void
  disconnect: () => void
  reconnect: () => void
  lastMessage: MessageEvent | null
}

/**
 * Custom hook for WebSocket connections with auto-reconnect
 *
 * @example
 * const { status, send, lastMessage } = useWebSocket({
 *   url: 'ws://localhost:8000/ws/notifications',
 *   onMessage: (event) => console.log('Message:', event.data),
 *   reconnect: true,
 * })
 */
export function useWebSocket(options: UseWebSocketOptions): UseWebSocketReturn {
  const {
    url,
    onMessage,
    onOpen,
    onClose,
    onError,
    reconnect = true,
    reconnectAttempts = 5,
    reconnectInterval = 1000,
  } = options

  const [status, setStatus] = useState<WebSocketStatus>('connecting')
  const [lastMessage, setLastMessage] = useState<MessageEvent | null>(null)

  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()
  const reconnectCountRef = useRef(0)
  const shouldReconnectRef = useRef(true)

  const connect = useCallback(() => {
    try {
      setStatus('connecting')

      const ws = new WebSocket(url)
      wsRef.current = ws

      ws.onopen = (event) => {
        setStatus('connected')
        reconnectCountRef.current = 0
        onOpen?.(event)
      }

      ws.onmessage = (event) => {
        setLastMessage(event)
        onMessage?.(event)
      }

      ws.onclose = (event) => {
        setStatus('disconnected')
        onClose?.(event)

        // Attempt reconnection if enabled and not manually disconnected
        if (
          reconnect &&
          shouldReconnectRef.current &&
          reconnectCountRef.current < reconnectAttempts
        ) {
          const delay = reconnectInterval * Math.pow(2, reconnectCountRef.current)
          console.log(
            `WebSocket disconnected. Reconnecting in ${delay}ms (attempt ${
              reconnectCountRef.current + 1
            }/${reconnectAttempts})...`
          )

          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectCountRef.current++
            connect()
          }, delay)
        }
      }

      ws.onerror = (event) => {
        setStatus('error')
        onError?.(event)
        console.error('WebSocket error:', event)
      }
    } catch (error) {
      setStatus('error')
      console.error('WebSocket connection error:', error)
    }
  }, [url, onMessage, onOpen, onClose, onError, reconnect, reconnectAttempts, reconnectInterval])

  const disconnect = useCallback(() => {
    shouldReconnectRef.current = false

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }

    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }

    setStatus('disconnected')
  }, [])

  const manualReconnect = useCallback(() => {
    disconnect()
    shouldReconnectRef.current = true
    reconnectCountRef.current = 0
    connect()
  }, [disconnect, connect])

  const send = useCallback((data: string | object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const message = typeof data === 'string' ? data : JSON.stringify(data)
      wsRef.current.send(message)
    } else {
      console.warn('WebSocket is not connected. Message not sent:', data)
    }
  }, [])

  // Connect on mount
  useEffect(() => {
    connect()

    // Cleanup on unmount
    return () => {
      shouldReconnectRef.current = false
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [connect])

  return {
    status,
    send,
    disconnect,
    reconnect: manualReconnect,
    lastMessage,
  }
}

/**
 * Hook for subscribing to specific WebSocket events/channels
 *
 * @example
 * useWebSocketSubscription({
 *   url: 'ws://localhost:8000/ws',
 *   event: 'task.updated',
 *   onMessage: (data) => {
 *     console.log('Task updated:', data)
 *     queryClient.invalidateQueries(['tasks'])
 *   },
 * })
 */
export function useWebSocketSubscription<T = any>(options: {
  url: string
  event: string
  onMessage: (data: T) => void
  enabled?: boolean
}) {
  const { url, event, onMessage, enabled = true } = options

  const handleMessage = useCallback(
    (messageEvent: MessageEvent) => {
      try {
        const data = JSON.parse(messageEvent.data)

        // Check if message is for this event
        if (data.event === event || data.type === event) {
          onMessage(data.data || data.payload || data)
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error)
      }
    },
    [event, onMessage]
  )

  const { status, send } = useWebSocket({
    url,
    onMessage: handleMessage,
    reconnect: true,
  })

  // Subscribe to event when connected
  useEffect(() => {
    if (enabled && status === 'connected') {
      send({ action: 'subscribe', event })
    }

    return () => {
      if (enabled && status === 'connected') {
        send({ action: 'unsubscribe', event })
      }
    }
  }, [status, event, send, enabled])

  return { status }
}