// GET /api/employees/*
import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { getEmployeeList, getEmployeeById, getDepartments } from '../services/dataService.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
    const dept = req.user.department || req.query.department;
    const search = req.query.search;
    res.json(await getEmployeeList({ department: dept, search }));
});

router.get('/departments', requireAuth, async (req, res) => {
    res.json(await getDepartments());
});

router.get('/:employee_id', requireAuth, async (req, res) => {
    const emp = await getEmployeeById(req.params.employee_id);
    if (!emp) return res.status(404).json({ detail: 'Employee not found' });
    res.json(emp);
});

export default router;
