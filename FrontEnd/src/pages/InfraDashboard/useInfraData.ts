import { useState, useEffect } from 'react'
import { io, Socket } from 'socket.io-client'
import { InfraMetrics, InstitutionMetrics, APILatency, LiveEvent, MetricsUpdate } from './types'

const SOCKET_URL = 'http://localhost:3000'

export const useInfraData = () => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const [metrics, setMetrics] = useState<InfraMetrics>({
    activeUsers: 0,
    requestsPerSecond: 0,
    resultsDeliveredToday: 0,
    trafficLoad: 0,
    cacheHitRate: 0,
    platformUptime: 99.99,
    totalStudents: 0,
    totalInstitutions: 0,
    activeInstitutions: 0
  })
  const [institutions, setInstitutions] = useState<InstitutionMetrics[]>([])
  const [latency, setLatency] = useState<APILatency>({
    p50: 0,
    p95: 0,
    p99: 0,
    avgResponseTime: 0
  })
  const [events, setEvents] = useState<LiveEvent[]>([])

  useEffect(() => {
    // Initialize Socket.IO connection
    const socketInstance = io(SOCKET_URL, {
      transports: ['websocket', 'polling']
    })

    socketInstance.on('connect', () => {
      console.log('Connected to Socket.IO server')
      setConnected(true)
    })

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server')
      setConnected(false)
    })

    socketInstance.on('metrics-update', (data: MetricsUpdate) => {
      setMetrics(data.metrics)
      setInstitutions(data.institutions)
      setLatency(data.latency)
      setEvents(data.events)
    })

    setSocket(socketInstance)

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect()
    }
  }, [])

  return {
    connected,
    metrics,
    institutions,
    latency,
    events
  }
}
