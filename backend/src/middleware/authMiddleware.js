// Auth middleware — verifies Bearer JWT and attaches req.user
import { verifyToken } from '../auth.js';

export function requireAuth(req, res, next) {
    const header = req.headers['authorization'] || '';
    if (!header.startsWith('Bearer ')) {
        return res.status(401).json({ detail: 'Could not validate credentials' });
    }
    const token = header.slice(7);
    try {
        const payload = verifyToken(token);
        req.user = { username: payload.sub, role: payload.role, department: payload.department };
        next();
    } catch {
        return res.status(401).json({ detail: 'Could not validate credentials' });
    }
}

export function requireRole(...roles) {
    return (req, res, next) => {
        requireAuth(req, res, () => {
            if (!roles.includes(req.user.role)) {
                return res.status(403).json({ detail: 'Insufficient permissions' });
            }
            next();
        });
    };
}
