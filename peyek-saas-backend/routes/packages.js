/**
 * P.E.Y.E.K Packages Route
 * GET /api/packages/downloads  — Fetch npm download counts for all peyek packages
 */
import { Router } from 'express';
import { PackagesController } from '../controllers/PackagesController.js';

const router = Router();

router.get('/downloads', PackagesController.downloads);

export default router;
