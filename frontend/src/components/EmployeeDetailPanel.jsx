import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import API from '../api/client';
import { X, User, TrendingUp, Clock, BookOpen, DollarSign, AlertTriangle, Activity, Award } from "lucide-react";
import { useCurrency } from '../context/CurrencyContext';

/* ── Helpers ──────────────────────────────────────────────────────── */

function ratingColor(rating) {
    if (rating >= 4) return 'text-success';
    if (rating >= 3) return 'text-warning';
    return 'text-destructive';
}

function ratingLabel(rating) {
    if (rating >= 4.5) return 'Outstanding';
    if (rating >= 4) return 'Excellent';
    if (rating >= 3) return 'Good';
    if (rating >= 2) return 'Fair';
    return 'Needs Improvement';
}

function burnoutLevel(score) {
    if (score >= 0.7) return { label: 'High', color: 'text-destructive', bg: 'bg-destructive' };
    if (score >= 0.4) return { label: 'Moderate', color: 'text-warning', bg: 'bg-warning' };
    return { label: 'Low', color: 'text-success', bg: 'bg-success' };
}

function getInitials(id) {
    const letters = id?.replace(/[^A-Za-z]/g, '') || 'E';
    return letters.slice(0, 2).toUpperCase();
}

/* ── Stat Card (small metric block) ───────────────────────────────── */
function StatBlock({ label, value, sub, icon: Icon }) {
    return (
        <div className="flex items-start gap-3 p-3 border border-rule/50 bg-paper/50">
            {Icon && (
                <div className="mt-0.5 p-1.5 bg-accent/30 text-muted-foreground">
                    <Icon className="h-3.5 w-3.5" />
                </div>
            )}
            <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground leading-tight">{label}</p>
                <p className="text-sm font-semibold text-ink mt-0.5 truncate">{value}</p>
                {sub && <p className="font-mono text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}

/* ── Progress bar ────────────────────────────────────────────────── */
function ProgressBar({ value, max = 5, colorClass = 'bg-primary' }) {
    const pct = Math.min(Math.max((value / max) * 100, 0), 100);
    return (
        <div className="h-1.5 w-full bg-rule/30 rounded-full overflow-hidden">
            <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${colorClass}`}
                style={{ width: `${pct}%` }}
            />
        </div>
    );
}

/* ── Section heading ──────────────────────────────────────────────── */
function SectionHeading({ icon: Icon, title }) {
    return (
        <div className="flex items-center gap-2 mb-3 mt-1">
            <Icon className="h-4 w-4 text-primary" />
            <h3 className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground font-medium">{title}</h3>
            <div className="flex-1 border-t border-rule/40" />
        </div>
    );
}

/* ── Employee Detail Panel ───────────────────────────────────────── */
export function EmployeeDetailPanel({ employee, onClose }) {
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const { formatCurrency } = useCurrency();

    useEffect(() => {
        if (!employee) return;
        setLoading(true);
        API.get(`/employees/${employee.EmployeeID}`)
            .then((r) => setDetail(r.data))
            .catch(() => setDetail(employee))  // fallback to list data
            .finally(() => setLoading(false));
    }, [employee]);

    if (!employee) return null;

    const e = detail || employee;
    const burnout = burnoutLevel(e.BurnoutRiskScore);

    return createPortal(
        <div
            className="fixed inset-0 bg-ink/60 backdrop-blur-sm flex items-stretch justify-end z-[100] transition-all duration-300"
            onClick={onClose}
        >
            {/* Slide-over panel */}
            <div
                className="bg-background w-full max-w-[520px] h-full border-l border-rule flex flex-col shadow-2xl overflow-hidden"
                style={{ animation: 'slide-in-right 0.35s cubic-bezier(0.2, 0.7, 0.2, 1) both' }}
                onClick={(ev) => ev.stopPropagation()}
            >
                {/* ── Header ──────────────────────────── */}
                <div className="relative px-6 pt-6 pb-5 border-b border-rule bg-paper/80">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-1.5 text-muted-foreground hover:text-ink hover:bg-accent/30 transition-colors"
                        aria-label="Close"
                    >
                        <X className="h-4 w-4" />
                    </button>

                    <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className={`h-14 w-14 rounded-full flex items-center justify-center text-lg font-bold tracking-tight shrink-0 ${
                            e.AttritionFlag
                                ? 'bg-destructive/15 text-destructive border-2 border-destructive/30'
                                : 'bg-primary/15 text-primary border-2 border-primary/30'
                        }`}>
                            {getInitials(e.EmployeeID)}
                        </div>

                        <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h2 className="text-xl font-bold text-ink tracking-tight">{e.EmployeeID}</h2>
                                <span className={`font-mono text-[10px] px-2 py-0.5 border rounded-sm ${
                                    e.AttritionFlag
                                        ? 'bg-destructive/10 text-destructive border-destructive/30'
                                        : 'bg-success/10 text-success border-success/30'
                                }`}>
                                    {e.AttritionFlag ? 'Left' : 'Active'}
                                </span>
                            </div>
                            <p className="text-sm text-ink mt-0.5">{e.JobTitle}</p>
                            <p className="font-mono text-[11px] text-muted-foreground">{e.Department}</p>
                        </div>
                    </div>
                </div>

                {/* ── Scrollable content ──────────────── */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                    {loading ? (
                        <div className="flex h-40 items-center justify-center flex-col gap-3">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-rule border-t-primary" />
                            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Loading profile...</span>
                        </div>
                    ) : (
                        <>
                            {/* ── Personal Info ──────────── */}
                            <section>
                                <SectionHeading icon={User} title="Personal Information" />
                                <div className="grid grid-cols-2 gap-2">
                                    <StatBlock label="Gender" value={e.Gender} icon={User} />
                                    <StatBlock label="Tenure" value={`${e.TenureYears} years`} sub={e.EarlyTenureFlag ? '⚡ Early tenure' : null} icon={Clock} />
                                </div>
                            </section>

                            {/* ── Performance ────────────── */}
                            <section>
                                <SectionHeading icon={TrendingUp} title="Performance" />
                                <div className="space-y-3">
                                    {/* Rating spotlight */}
                                    <div className="flex items-center justify-between p-3 border border-rule/50 bg-paper/50">
                                        <div>
                                            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Performance Rating</p>
                                            <div className="flex items-baseline gap-2 mt-1">
                                                <span className={`text-2xl font-bold font-numeric ${ratingColor(e.PerformanceRating)}`}>
                                                    {e.PerformanceRating}
                                                </span>
                                                <span className="text-xs text-muted-foreground">/ 5</span>
                                                <span className={`text-xs font-medium ${ratingColor(e.PerformanceRating)}`}>
                                                    {ratingLabel(e.PerformanceRating)}
                                                </span>
                                            </div>
                                            <ProgressBar value={e.PerformanceRating} max={5} colorClass={e.PerformanceRating >= 4 ? 'bg-success' : e.PerformanceRating >= 3 ? 'bg-warning' : 'bg-destructive'} />
                                        </div>
                                        {e.HighPerformerFlag ? (
                                            <div className="p-2 bg-success/10 border border-success/20 text-success">
                                                <Award className="h-5 w-5" />
                                            </div>
                                        ) : null}
                                    </div>

                                    {/* Sub-scores grid */}
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="p-2.5 border border-rule/50 bg-paper/50 text-center">
                                            <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Communication</p>
                                            <p className="text-base font-bold font-numeric text-ink mt-1">{e.AvgCommunication?.toFixed?.(1) ?? '—'}</p>
                                            <ProgressBar value={e.AvgCommunication || 0} max={5} colorClass="bg-chart-5" />
                                        </div>
                                        <div className="p-2.5 border border-rule/50 bg-paper/50 text-center">
                                            <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Teamwork</p>
                                            <p className="text-base font-bold font-numeric text-ink mt-1">{e.AvgTeamwork?.toFixed?.(1) ?? '—'}</p>
                                            <ProgressBar value={e.AvgTeamwork || 0} max={5} colorClass="bg-chart-4" />
                                        </div>
                                        <div className="p-2.5 border border-rule/50 bg-paper/50 text-center">
                                            <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Problem Solving</p>
                                            <p className="text-base font-bold font-numeric text-ink mt-1">{e.AvgProblemSolving?.toFixed?.(1) ?? '—'}</p>
                                            <ProgressBar value={e.AvgProblemSolving || 0} max={5} colorClass="bg-chart-3" />
                                        </div>
                                    </div>

                                    {/* Score history */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <StatBlock label="Avg Overall Score" value={e.AvgOverallScore?.toFixed?.(1) ?? '—'} icon={Activity} />
                                        <StatBlock label="Last Overall Score" value={e.LastOverallScore?.toFixed?.(1) ?? '—'} sub={e.PerformanceDropFlag ? '⚠ Performance drop' : null} icon={TrendingUp} />
                                    </div>
                                </div>
                            </section>

                            {/* ── Engagement & Wellbeing ────── */}
                            <section>
                                <SectionHeading icon={Activity} title="Engagement & Wellbeing" />
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="p-3 border border-rule/50 bg-paper/50">
                                        <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Engagement Score</p>
                                        <p className="text-xl font-bold font-numeric text-ink mt-1">{e.EngagementScore?.toFixed?.(2) ?? '—'}</p>
                                    </div>
                                    <div className="p-3 border border-rule/50 bg-paper/50">
                                        <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Burnout Risk</p>
                                        <div className="flex items-baseline gap-2 mt-1">
                                            <p className={`text-xl font-bold font-numeric ${burnout.color}`}>
                                                {e.BurnoutRiskScore?.toFixed?.(2) ?? '—'}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <div className={`h-1.5 w-1.5 rounded-full ${burnout.bg}`} />
                                            <span className={`font-mono text-[10px] ${burnout.color}`}>{burnout.label} Risk</span>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* ── Attendance ─────────────── */}
                            <section>
                                <SectionHeading icon={Clock} title="Attendance (Last 6 Months)" />
                                <div className="grid grid-cols-3 gap-2">
                                    <StatBlock label="Absence Days" value={e.AbsenceDays_Last6M ?? '—'} icon={Clock} />
                                    <StatBlock label="Frequency" value={e.AbsenceFrequency_Last6M ?? '—'} icon={Activity} />
                                    <StatBlock
                                        label="Flags"
                                        value={
                                            [
                                                e.HighAbsenceFlag ? 'High Abs.' : null,
                                                e.LongLeaveFlag ? 'Long Leave' : null,
                                            ].filter(Boolean).join(', ') || 'None'
                                        }
                                        icon={AlertTriangle}
                                    />
                                </div>
                            </section>

                            {/* ── Training & Development ──── */}
                            <section>
                                <SectionHeading icon={BookOpen} title="Training & Development" />
                                <div className="grid grid-cols-2 gap-2">
                                    <StatBlock label="Training Count" value={e.TrainingCount ?? '—'} sub={e.NoTrainingFlag ? '⚠ No training' : null} icon={BookOpen} />
                                    <StatBlock label="Days Since Training" value={e.DaysSinceLastTraining ?? '—'} icon={Clock} />
                                </div>
                                {e.CareerStagnationFlag ? (
                                    <div className="mt-2 p-2.5 bg-warning/10 border border-warning/20 flex items-center gap-2">
                                        <AlertTriangle className="h-3.5 w-3.5 text-warning shrink-0" />
                                        <span className="font-mono text-[10px] text-warning uppercase tracking-wider">Career stagnation detected</span>
                                    </div>
                                ) : null}
                            </section>

                            {/* ── Compensation ────────────── */}
                            <section>
                                <SectionHeading icon={DollarSign} title="Compensation" />
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="p-3 border border-rule/50 bg-paper/50">
                                        <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Annual Salary</p>
                                        <p className="text-xl font-bold font-numeric text-ink mt-1">{formatCurrency(e.Salary)}</p>
                                    </div>
                                    <div className="p-3 border border-rule/50 bg-paper/50">
                                        <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Yrs Since Raise</p>
                                        <p className={`text-xl font-bold font-numeric mt-1 ${e.PayStagnationFlag ? 'text-destructive' : 'text-ink'}`}>
                                            {e.YearsSinceLastRaise ?? '—'}
                                        </p>
                                        {e.PayStagnationFlag ? (
                                            <div className="flex items-center gap-1 mt-1">
                                                <div className="h-1.5 w-1.5 rounded-full bg-destructive" />
                                                <span className="font-mono text-[10px] text-destructive">Pay stagnation</span>
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                                <div className="mt-2">
                                    <StatBlock label="Salary Changes" value={e.SalaryChangeCount ?? '—'} icon={DollarSign} />
                                </div>
                            </section>
                        </>
                    )}
                </div>

                {/* ── Footer ──────────────────────────── */}
                <div className="px-6 py-4 border-t border-rule bg-paper/50">
                    <button
                        onClick={onClose}
                        className="w-full py-2.5 px-4 bg-primary text-primary-foreground font-mono text-xs uppercase tracking-widest hover:opacity-90 transition-opacity"
                    >
                        Close Profile
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
