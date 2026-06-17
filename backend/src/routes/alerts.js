// GET /api/alerts/
import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { generateAlerts } from '../services/alertsService.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => res.json(await generateAlerts(req.user.department)));

export default router;
