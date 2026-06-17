// GET /api/dashboard/*
import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import {
    executiveKpis,
    departmentBreakdown,
    turnoverMetrics,
    performanceMetrics,
    absenteeismMetrics,
    demographics,
} from '../services/metricsService.js';

const router = Router();

router.get('/overview', requireAuth, async (req, res) => res.json(await executiveKpis(req.user.department)));
router.get('/departments', requireAuth, async (req, res) => res.json(await departmentBreakdown(req.user.department)));
router.get('/turnover', requireAuth, async (req, res) => res.json(await turnoverMetrics(req.user.department)));
router.get('/performance', requireAuth, async (req, res) => res.json(await performanceMetrics(req.user.department)));
router.get('/absenteeism', requireAuth, async (req, res) => res.json(await absenteeismMetrics(req.user.department)));
router.get('/demographics', requireAuth, async (req, res) => res.json(await demographics(req.user.department)));

export default router;
