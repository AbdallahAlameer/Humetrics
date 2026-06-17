// Upload route — CSV dataset upload with preview & validation
import { Router } from 'express';
import multer from 'multer';
import { requireRole } from '../middleware/authMiddleware.js';
import {
    parseCsvBuffer,
    validateMainColumns,
    replaceMainDataset,
} from '../services/dataService.js';

const router = Router();

// Multer: store in memory, max 50 MB
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter(req, file, cb) {
        if (
            file.mimetype === 'text/csv' ||
            file.mimetype === 'application/vnd.ms-excel' ||
            file.originalname.endsWith('.csv')
        ) {
            cb(null, true);
        } else {
            cb(new Error('Only CSV files are accepted'));
        }
    },
});

// ── Preview / Validate ────────────────────────────────────────────
router.post(
    '/preview',
    requireRole('hr'),
    upload.single('file'),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ detail: 'No file uploaded' });
            }

            const rows = await parseCsvBuffer(req.file.buffer);
            if (!rows.length) {
                return res.status(400).json({ detail: 'CSV file is empty' });
            }

            const headers = Object.keys(rows[0]);
            const validation = validateMainColumns(headers);

            // Build preview (first 10 rows)
            const preview = rows.slice(0, 10).map(row => {
                const clean = {};
                for (const [k, v] of Object.entries(row)) {
                    clean[k] = v;
                }
                return clean;
            });

            res.json({
                filename: req.file.originalname,
                size_bytes: req.file.size,
                total_rows: rows.length,
                columns: headers,
                validation,
                preview,
            });
        } catch (err) {
            console.error('[Upload Preview Error]', err);
            res.status(400).json({ detail: err.message || 'Failed to parse CSV' });
        }
    }
);

// ── Upload & Apply ────────────────────────────────────────────────
router.post(
    '/apply',
    requireRole('hr'),
    upload.single('file'),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ detail: 'No file uploaded' });
            }

            const rows = await parseCsvBuffer(req.file.buffer);
            if (!rows.length) {
                return res.status(400).json({ detail: 'CSV file is empty' });
            }

            // Validate required columns
            const headers = Object.keys(rows[0]);
            const validation = validateMainColumns(headers);

            if (!validation.valid) {
                return res.status(400).json({
                    detail: `Missing required columns: ${validation.missing.join(', ')}`,
                    validation,
                });
            }

            // Replace dataset (preprocess + cache + MongoDB)
            const count = await replaceMainDataset(rows);

            res.json({
                success: true,
                message: `Dataset replaced successfully`,
                total_rows: count,
                columns_defaulted: validation.optionalMissing,
            });
        } catch (err) {
            console.error('[Upload Apply Error]', err);
            res.status(500).json({ detail: err.message || 'Failed to process dataset' });
        }
    }
);

// Multer error handler
router.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({ detail: 'File too large. Maximum size is 50 MB.' });
        }
        return res.status(400).json({ detail: err.message });
    }
    if (err) {
        return res.status(400).json({ detail: err.message });
    }
    next();
});

export default router;
