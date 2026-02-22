/**
 * P.E.Y.E.K Analytics Route
 * POST /api/analytics/track  — Record a page visit
 * GET  /api/analytics/stats  — Return aggregate stats
 */
import { Router } from 'express';
import { AnalyticsController } from '../controllers/AnalyticsController.js';

const router = Router();

router.post('/track', AnalyticsController.track);
router.post('/track-download', AnalyticsController.trackDownload);
router.get('/stats', AnalyticsController.stats);

export default router;
