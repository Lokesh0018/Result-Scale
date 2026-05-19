import express from 'express'
import { AnalyticsController } from '../controller/analyticsController'

const router = express.Router()

// Analytics routes
router.get('/infra-metrics', AnalyticsController.getInfraMetrics)
router.get('/institution-metrics', AnalyticsController.getInstitutionMetrics)
router.get('/security-events', AnalyticsController.getSecurityEvents)
router.get('/api-latency', AnalyticsController.getAPILatency)
router.get('/live-events', AnalyticsController.getLiveEvents)

export { router }
