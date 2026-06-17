// GET /api/recommendations/
import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { generateRecommendations } from '../services/mlService.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => res.json(await generateRecommendations(req.user.department)));

export default router;
