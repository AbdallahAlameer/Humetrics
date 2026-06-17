// HR KPI / metrics calculations — pure JS port of metrics_service.py
import { getMainDf, getIbmDf } from './dataService.js';

// ── helpers ────────────────────────────────────────────────────
function groupBy(rows, key) {
    return rows.reduce((acc, row) => {
        const k = row[key];
        if (!acc[k]) acc[k] = [];
        acc[k].push(row);
        return acc;
    }, {});
}

function mean(arr) {
    if (!arr.length) return 0;
    return arr.reduce((s, v) => s + (v || 0), 0) / arr.length;
}

function round(v, d = 4) {
    return parseFloat(v.toFixed(d));
}

// ── Executive overview KPIs ────────────────────────────────────
export async function executiveKpis(dept = null) {
    const df = await getMainDf(dept);
    const total = df.length;
    const attritionCount = df.reduce((s, r) => s + (r['AttritionFlag'] || 0), 0);
    const attritionRate = total ? round(attritionCount / total) : 0;
    const avgTenure = round(mean(df.map(r => r['TenureYears'])), 2);
    const avgSalary = round(mean(df.map(r => r['Salary'])), 2);
    const avgEngagement = round(mean(df.map(r => r['EngagementScore'])), 2);
    const avgPerformance = round(mean(df.map(r => r['PerformanceRating'])), 2);
    const deptCount = new Set(df.map(r => r['Department'])).size;

    return {
        total_employees: total,
        attrition_count: Math.round(attritionCount),
        attrition_rate: attritionRate,
        avg_tenure: avgTenure,
        avg_salary: avgSalary,
        avg_engagement: avgEngagement,
        avg_performance: avgPerformance,
        departments: deptCount,
    };
}

// ── Department breakdown ──────────────────────────────────────
export async function departmentBreakdown(dept = null) {
    const df = await getMainDf(dept);
    const groups = groupBy(df, 'Department');
    return Object.entries(groups).map(([dept, rows]) => {
        const headcount = rows.length;
        const attrition = rows.reduce((s, r) => s + (r['AttritionFlag'] || 0), 0);
        return {
            Department: dept,
            headcount,
            attrition: Math.round(attrition),
            avg_salary: round(mean(rows.map(r => r['Salary'])), 4),
            avg_tenure: round(mean(rows.map(r => r['TenureYears'])), 4),
            avg_engagement: round(mean(rows.map(r => r['EngagementScore'])), 4),
            avg_performance: round(mean(rows.map(r => r['PerformanceRating'])), 4),
            attrition_rate: round(attrition / headcount),
        };
    });
}

// ── Turnover & Retention ──────────────────────────────────────
export async function turnoverMetrics(dept = null) {
    const df = await getMainDf(dept);
    const total = df.length;
    const left = df.reduce((s, r) => s + (r['AttritionFlag'] || 0), 0);
    const stayed = total - left;
    const turnoverRate = total ? round(left / total) : 0;
    const retentionRate = total ? round(stayed / total) : 0;

    // By department
    const deptGroups = groupBy(df, 'Department');
    const byDepartment = Object.entries(deptGroups).map(([dept, rows]) => {
        const t = rows.length;
        const l = rows.reduce((s, r) => s + (r['AttritionFlag'] || 0), 0);
        return { Department: dept, left: Math.round(l), total: t, rate: round(l / t) };
    });

    // By tenure bucket
    const tenureBuckets = [
        { label: '<1yr', min: 0, max: 1 },
        { label: '1-3yr', min: 1, max: 3 },
        { label: '3-5yr', min: 3, max: 5 },
        { label: '5-10yr', min: 5, max: 10 },
        { label: '10+yr', min: 10, max: Infinity },
    ];
    const byTenure = tenureBuckets.map(({ label, min, max }) => {
        const rows = df.filter(r => r['TenureYears'] >= min && r['TenureYears'] < max);
        const t = rows.length;
        const l = rows.reduce((s, r) => s + (r['AttritionFlag'] || 0), 0);
        return { tenure_bucket: label, left: Math.round(l), total: t, rate: t ? round(l / t) : 0 };
    });

    return {
        total,
        left: Math.round(left),
        stayed,
        turnover_rate: turnoverRate,
        retention_rate: retentionRate,
        by_department: byDepartment,
        by_tenure: byTenure,
    };
}

// ── Performance analytics ─────────────────────────────────────
export async function performanceMetrics(dept = null) {
    const df = await getMainDf(dept);

    // Rating distribution
    const ratingCounts = {};
    for (const r of df) {
        const k = r['PerformanceRating'];
        ratingCounts[k] = (ratingCounts[k] || 0) + 1;
    }
    const ratingDistribution = Object.entries(ratingCounts)
        .sort((a, b) => a[0] - b[0])
        .map(([rating, count]) => ({ PerformanceRating: parseFloat(rating), count }));

    // Top/bottom performers by AvgOverallScore
    const sorted = [...df].sort((a, b) => b['AvgOverallScore'] - a['AvgOverallScore']);
    const fields = ['EmployeeID', 'Department', 'JobTitle', 'AvgOverallScore', 'PerformanceRating', 'TenureYears'];
    const pick = r => Object.fromEntries(fields.map(f => [f, r[f]]));
    const topPerformers = sorted.slice(0, 10).map(pick);
    const bottomPerformers = sorted.slice(-10).reverse().map(pick);

    // Performance by department
    const deptGroups = groupBy(df, 'Department');
    const byDepartment = Object.entries(deptGroups).map(([dept, rows]) => ({
        Department: dept,
        avg_rating: round(mean(rows.map(r => r['PerformanceRating'])), 2),
    }));

    const highPerformerPct = round(df.reduce((s, r) => s + (r['HighPerformerFlag'] || 0), 0) / df.length);

    return {
        rating_distribution: ratingDistribution,
        top_performers: topPerformers,
        bottom_performers: bottomPerformers,
        by_department: byDepartment,
        avg_overall: round(mean(df.map(r => r['PerformanceRating']))),
        high_performer_pct: highPerformerPct,
    };
}

// ── Absenteeism ───────────────────────────────────────────────
export async function absenteeismMetrics(dept = null) {
    const df = await getMainDf(dept);
    const avgAbsence = round(mean(df.map(r => r['AbsenceDays_Last6M'])), 2);
    const highAbsencePct = round(mean(df.map(r => r['HighAbsenceFlag'])));

    const deptGroups = groupBy(df, 'Department');
    const byDepartment = Object.entries(deptGroups).map(([dept, rows]) => ({
        Department: dept,
        avg_absence: round(mean(rows.map(r => r['AbsenceDays_Last6M'])), 2),
        high_absence_pct: round(mean(rows.map(r => r['HighAbsenceFlag'])), 2),
        avg_frequency: round(mean(rows.map(r => r['AbsenceFrequency_Last6M'])), 2),
    }));

    // Distribution buckets: [0-2, 3-6, 7-14, 15+]
    const buckets = [
        { label: '0-2 days', min: 0, max: 3 },
        { label: '3-6 days', min: 3, max: 7 },
        { label: '7-14 days', min: 7, max: 15 },
        { label: '15+ days', min: 15, max: Infinity },
    ];
    const distribution = buckets.map(({ label, min, max }) => ({
        bucket: label,
        count: df.filter(r => r['AbsenceDays_Last6M'] >= min && r['AbsenceDays_Last6M'] < max).length,
    }));

    return {
        avg_absence_days: avgAbsence,
        high_absence_pct: highAbsencePct,
        by_department: byDepartment,
        distribution,
    };
}

// ── Demographics ──────────────────────────────────────────────
export async function demographics(dept = null) {
    const df = await getMainDf(dept);
    const genderDist = {};
    const genderSalarySum = {};
    const genderSalaryCount = {};

    for (const r of df) {
        const g = r['Gender'];
        genderDist[g] = (genderDist[g] || 0) + 1;
        genderSalarySum[g] = (genderSalarySum[g] || 0) + (r['Salary'] || 0);
        genderSalaryCount[g] = (genderSalaryCount[g] || 0) + 1;
    }
    const genderAvgSalary = Object.fromEntries(
        Object.keys(genderSalarySum).map(g => [g, round(genderSalarySum[g] / genderSalaryCount[g], 2)])
    );

    return { gender_distribution: genderDist, gender_avg_salary: genderAvgSalary };
}
