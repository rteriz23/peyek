/**
 * P.E.Y.E.K PWA Manifest Route
 * GET /api/pwa/manifest  — Return a dynamic manifest.json
 */
import { Router } from 'express';
import { PwaController } from '../controllers/PwaController.js';

const router = Router();

router.get('/manifest', PwaController.manifest);

export default router;
