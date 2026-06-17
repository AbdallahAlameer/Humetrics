// JWT authentication — users stored in MongoDB
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from './db.js';

const SECRET_KEY = process.env.JWT_SECRET || 'hr-analytics-demo-secret-key-2024';
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

// ── Seed users ───────────────────────────────────────────────────
const SEED_USERS = [
    { username: 'hr', full_name: 'HR Administrator', password: 'hr123', role: 'hr' },
    { username: 'manager', full_name: 'Department Manager', password: 'manager123', role: 'manager' },
];

export async function seedUsers() {
    const db = getDb();
    const col = db.collection('users');
    await col.createIndex({ username: 1 }, { unique: true });

    for (const u of SEED_USERS) {
        const hashed = await bcrypt.hash(u.password, 10);
        await col.updateOne(
            { username: u.username },
            { $setOnInsert: { username: u.username, full_name: u.full_name, hashed_password: hashed, role: u.role } },
            { upsert: true }
        );
    }
}

// ── Auth helpers ─────────────────────────────────────────────────
export async function authenticateUser(username, password) {
    const db = getDb();
    const user = await db.collection('users').findOne({ username });
    if (!user) return null;
    const ok = await bcrypt.compare(password, user.hashed_password);
    if (!ok) return null;
    return { username: user.username, full_name: user.full_name, role: user.role };
}

export function createAccessToken(data) {
    return jwt.sign(data, SECRET_KEY, { algorithm: 'HS256', expiresIn: EXPIRES_IN });
}

export function verifyToken(token) {
    return jwt.verify(token, SECRET_KEY, { algorithms: ['HS256'] });
}
