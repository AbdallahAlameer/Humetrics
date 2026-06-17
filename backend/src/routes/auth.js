import { Router } from 'express';
import { authenticateUser, createAccessToken } from '../auth.js';
import { getDepartments } from '../services/dataService.js';

const router = Router();

router.get('/departments', async (req, res) => {
    try {
        const depts = await getDepartments();
        res.json(depts);
    } catch (err) {
        res.status(500).json({ detail: 'Failed to load departments' });
    }
});

router.post('/login', async (req, res) => {
    const { username, password, department } = req.body;
    if (!username || !password) {
        return res.status(422).json({ detail: 'username and password are required' });
    }
    const user = await authenticateUser(username, password);
    if (!user) {
        return res.status(401).json({ detail: 'Invalid credentials' });
    }
    
    // Create token with department if provided
    const payload = { sub: user.username, role: user.role };
    if (department) {
        payload.department = department;
    }
    
    const token = createAccessToken(payload);
    res.json({
        access_token: token,
        token_type: 'bearer',
        user: { username: user.username, full_name: user.full_name, role: user.role, department: department || null },
    });
});

export default router;
