// GET /api/predictions/*
import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import {
    predictPerformance,
    computeBehavioralRisk,
    predictPromotion,
    computePayEquity,
    computeTrainingImpact,
} from '../services/mlService.js';

const router = Router();

router.get('/performance', requireAuth, async (req, res) => res.json(await predictPerformance(req.user.department)));
router.get('/behavioral-risk', requireAuth, async (req, res) => res.json(await computeBehavioralRisk(req.user.department)));
router.get('/promotion', requireAuth, async (req, res) => res.json(await predictPromotion(req.user.department)));
router.get('/pay-equity', requireAuth, async (req, res) => res.json(await computePayEquity(req.user.department)));
router.get('/training-impact', requireAuth, async (req, res) => res.json(await computeTrainingImpact(req.user.department)));

export default router;
