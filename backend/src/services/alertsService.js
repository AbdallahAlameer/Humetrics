// Threshold-based alert generation — port of alerts_service.py
// Only includes alert rules that exist in the Python service.
import { getMainDf } from './dataService.js';

export async function generateAlerts(dept = null) {
    const df = await getMainDf(dept);
    const alerts = [];
    const now = new Date().toISOString();

    // ── 1. High-attrition departments ──────────────────────────
    const deptGroups = {};
    for (const r of df) {
        const d = r['Department'];
        if (!deptGroups[d]) deptGroups[d] = { total: 0, attrition: 0 };
        deptGroups[d].total += 1;
        deptGroups[d].attrition += r['AttritionFlag'] || 0;
    }
    for (const [dept, { total, attrition }] of Object.entries(deptGroups)) {
        const rate = attrition / total;
        if (rate > 0.15) {
            alerts.push({
                id: `dept-attrition-${dept}`,
                type: 'turnover_spike',
                severity: rate > 0.20 ? 'high' : 'medium',
                title: `High Attrition in ${dept}`,
                message: `${dept} has a ${(rate * 100).toFixed(1)}% attrition rate, above the 15% threshold.`,
                department: dept,
                created_at: now,
                is_read: false,
            });
        }
    }

    // ── 3. Departments with high absenteeism ─────────────────
    const absenceGroups = {};
    for (const r of df) {
        const d = r['Department'];
        if (!absenceGroups[d]) absenceGroups[d] = { total: 0, sum: 0 };
        absenceGroups[d].total += 1;
        absenceGroups[d].sum += r['AbsenceDays_Last6M'] || 0;
    }
    for (const [dept, { total, sum }] of Object.entries(absenceGroups)) {
        const avg = sum / total;
        if (avg > 10) {
            alerts.push({
                id: `absence-${dept}`,
                type: 'absenteeism',
                severity: 'medium',
                title: `High Absenteeism in ${dept}`,
                message: `${dept} averages ${avg.toFixed(1)} absence days (last 6 months), exceeding the 10-day threshold.`,
                department: dept,
                created_at: now,
                is_read: false,
            });
        }
    }

    // ── 4. Performance drop alerts ───────────────────────────
    const perfDrops = df.reduce((s, r) => s + (r['PerformanceDropFlag'] || 0), 0);
    if (perfDrops > 0) {
        alerts.push({
            id: 'performance-drops',
            type: 'performance_drop',
            severity: 'medium',
            title: `${Math.round(perfDrops)} Employees Show Performance Decline`,
            message: `${Math.round(perfDrops)} employees have been flagged with declining performance ratings.`,
            department: null,
            created_at: now,
            is_read: false,
        });
    }

    return alerts;
}
