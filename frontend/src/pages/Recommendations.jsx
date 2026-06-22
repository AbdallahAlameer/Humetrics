import { useState, useEffect } from 'react';
import API from '../api/client';
import {
    PieChart, Pie, Cell, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Lightbulb, TrendingUp, TrendingDown, Minus, ArrowRight } from "lucide-react";
import { useCurrency } from '../context/CurrencyContext';

const ACTION_COLORS = {
    'Retention & Career Discussion': 'var(--chart-5)',
    'Compensation / Promotion Review': 'var(--chart-2)',
    'Career Risk – Compensation Issue': 'var(--chart-2)',
    'Training & Development Plan': 'var(--chart-4)',
    'Workload or Manager Review': 'var(--chart-3)',
    'No Immediate Action / Monitor': 'var(--chart-1)',
};
const PRIORITY_COLORS = { 'Immediate Action': 'var(--chart-5)', 'Planned Action': 'var(--chart-4)', Monitor: 'var(--chart-1)' };

function ActionTab() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        API.get('/recommendations/')
            .then((r) => setData(r.data))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex h-64 items-center justify-center flex-col gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-rule border-t-primary" />
            <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Generating recommendations...</span>
        </div>
    );

    const actionPie = Object.entries(data.action_summary).map(([k, v]) => ({ name: k, value: v }));
    const priorityPie = Object.entries(data.priority_summary).map(([k, v]) => ({ name: k, value: v }));
    const filtered = filter === 'all' ? data.recommendations : data.recommendations.filter((r) => r.PriorityLevel === filter);

    return (
        <div className="flex flex-col gap-8 rise">
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="border border-rule bg-card p-6">
                    <h3 className="font-display text-xl text-ink mb-6">Actions Distribution</h3>
                    <ChartContainer config={{}} className="h-[280px] w-full">
                        <BarChart data={actionPie} layout="vertical" margin={{ left: 0, right: 20, top: 0, bottom: 0 }}>
                            <CartesianGrid horizontal={true} vertical={false} stroke="var(--rule)" strokeDasharray="2 4" />
                            <XAxis type="number" hide={true} />
                            <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} width={180} />
                            <ChartTooltip content={<ChartTooltipContent />} cursor={{fill: 'var(--accent)', opacity: 0.1}} />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                                {actionPie.map((d) => (
                                    <Cell key={d.name} fill={ACTION_COLORS[d.name] || 'var(--chart-1)'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ChartContainer>
                </div>
                <div className="border border-rule bg-card p-6">
                    <h3 className="font-display text-xl text-ink mb-6">Priority Breakdown</h3>
                    <ChartContainer config={{}} className="h-[280px] w-full">
                        <PieChart>
                            <Pie data={priorityPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={60} stroke="var(--bg-card)" strokeWidth={2}>
                                {priorityPie.map((d) => <Cell key={d.name} fill={PRIORITY_COLORS[d.name] || 'var(--chart-1)'} />)}
                            </Pie>
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                    </ChartContainer>
                </div>
            </section>

            <section className="border border-rule bg-card overflow-hidden">
                <div className="p-4 border-b border-rule bg-paper/50 flex flex-wrap items-center justify-between gap-4">
                    <h3 className="font-display text-xl text-ink">Action Cards</h3>
                    <div className="flex flex-wrap gap-2">
                        {['all', 'Immediate Action', 'Planned Action', 'Monitor'].map((f) => (
                            <button key={f} onClick={() => setFilter(f)} className={`font-mono text-[10px] px-3 py-1.5 uppercase tracking-wider rounded-sm transition-colors border ${filter === f ? 'bg-primary text-primary-foreground border-primary' : 'bg-transparent text-muted-foreground border-rule hover:bg-accent/10 hover:text-ink'}`}>
                                {f === 'all' ? 'All Actions' : f}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="divide-y divide-rule/50">
                    {filtered.slice(0, 50).map((rec, i) => (
                        <div key={i} className="p-6 hover:bg-accent/5 transition-colors">
                            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                                <div>
                                    <h4 className="font-display text-2xl text-ink flex items-center gap-3">
                                        {rec.EmployeeID}
                                        <span className={`font-mono text-[10px] px-2 py-0.5 border rounded-sm tracking-wider uppercase ${rec.PriorityLevel === 'Immediate Action' ? 'bg-destructive/10 text-destructive border-destructive/30' : rec.PriorityLevel === 'Planned Action' ? 'bg-warning/10 text-warning-foreground border-warning/30' : 'bg-success/10 text-success border-success/30'}`}>
                                            {rec.PriorityLevel}
                                        </span>
                                    </h4>
                                    <p className="text-muted-foreground mt-1 text-sm">{rec.Department} · {rec.JobTitle}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="bg-paper p-3 border border-rule/50 rounded-sm">
                                    <p className="eyebrow text-muted-foreground mb-1">State</p>
                                    <p className="font-medium text-ink">{rec.DecisionState}</p>
                                </div>
                                <div className="bg-paper p-3 border border-rule/50 rounded-sm">
                                    <p className="eyebrow text-muted-foreground mb-1">Strain</p>
                                    <p className="font-medium text-ink">{rec.StrainLevel}</p>
                                </div>
                            </div>
                            <p className="text-muted-foreground text-sm mb-4 leading-relaxed italic border-l-2 border-rule pl-4 py-1">{rec.Reason}</p>
                            <div className="flex items-start gap-3 bg-primary/5 border border-primary/20 p-4 rounded-sm">
                                <Lightbulb className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                <div>
                                    <p className="eyebrow text-primary mb-1">Recommended Action</p>
                                    <p className="font-medium text-ink">{rec.RecommendedAction}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                    {filtered.length === 0 && (
                        <div className="p-12 text-center text-muted-foreground italic">No actions found for this priority level.</div>
                    )}
                </div>
            </section>
        </div>
    );
}

function PayEquityTab() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const { formatCurrency } = useCurrency();

    useEffect(() => {
        API.get('/predictions/pay-equity')
            .then((r) => setData(r.data))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex h-64 items-center justify-center flex-col gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-rule border-t-primary" />
            <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Analyzing pay equity...</span>
        </div>
    );
    if (!data) return null;

    const { summary, gender_equity, department_equity, by_job_level } = data;

    const equityPie = [
        { name: 'Underpaid (>15% below)', value: summary.underpaid, color: 'var(--chart-5)' },
        { name: 'Within Range', value: summary.in_range, color: 'var(--chart-2)' },
        { name: 'Overpaid (>15% above)', value: summary.overpaid, color: 'var(--chart-4)' },
    ];

    return (
        <div className="flex flex-col gap-8 rise">
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-rule pb-6">
                <div 
                    className="relative px-6 py-8 rounded-2xl shadow-lg border border-zinc-800/50 group"
                    style={{ backgroundColor: "#141210" }}
                >
                    <p className="font-mono text-sm uppercase tracking-widest text-rose-400 mb-2">Underpaid</p>
                    <div className="font-display text-4xl text-white">{summary.underpaid}</div>
                    <p className="mt-3 font-display italic text-base text-zinc-500">{summary.underpaid_pct}% of workforce</p>
                </div>
                <div 
                    className="relative px-6 py-8 rounded-2xl shadow-lg border border-zinc-800/50 group"
                    style={{ backgroundColor: "#141210" }}
                >
                    <p className="font-mono text-sm uppercase tracking-widest text-emerald-400 mb-2">Within Range</p>
                    <div className="font-display text-4xl text-white">{summary.in_range}</div>
                    <p className="mt-3 font-display italic text-base text-zinc-500">Fair compensation</p>
                </div>
                <div 
                    className="relative px-6 py-8 rounded-2xl shadow-lg border border-zinc-800/50 group"
                    style={{ backgroundColor: "#141210" }}
                >
                    <p className="font-mono text-sm uppercase tracking-widest text-amber-400 mb-2">Overpaid</p>
                    <div className="font-display text-4xl text-white">{summary.overpaid}</div>
                    <p className="mt-3 font-display italic text-base text-zinc-500">{summary.overpaid_pct}% of workforce</p>
                </div>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="border border-rule bg-card p-6">
                    <h3 className="font-display text-xl text-ink mb-6">Compensation Distribution</h3>
                    <ChartContainer config={{}} className="h-[280px] w-full">
                        <PieChart>
                            <Pie data={equityPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={60} stroke="var(--bg-card)" strokeWidth={2}>
                                {equityPie.map((d) => <Cell key={d.name} fill={d.color} />)}
                            </Pie>
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                    </ChartContainer>
                </div>
                <div className="border border-rule bg-card p-6">
                    <h3 className="font-display text-xl text-ink mb-6">Underpaid % by Department</h3>
                    <ChartContainer config={{ UnderpaidPct: { label: "Underpaid %", color: "var(--chart-5)" } }} className="h-[280px] w-full">
                        <BarChart data={department_equity} layout="vertical" margin={{ left: 0, right: 10, top: 0, bottom: 0 }}>
                            <CartesianGrid horizontal={false} stroke="var(--rule)" strokeDasharray="2 4" />
                            <XAxis type="number" tickLine={false} axisLine={false} fontSize={11} unit="%" tick={{ fill: "var(--muted-foreground)" }} />
                            <YAxis dataKey="Department" type="category" tickLine={false} axisLine={false} fontSize={10} width={120} tick={{ fill: "var(--muted-foreground)" }} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="UnderpaidPct" fill="var(--color-UnderpaidPct)" radius={[0, 2, 2, 0]} />
                        </BarChart>
                    </ChartContainer>
                </div>
            </section>

            <section className="border border-rule bg-card overflow-hidden">
                <div className="p-4 border-b border-rule bg-paper/50 flex flex-wrap items-center justify-between gap-4">
                    <h3 className="font-display text-xl text-ink">Pay Equity by Gender</h3>
                    <div className="flex items-center gap-2 bg-paper px-3 py-1.5 border border-rule rounded-sm font-mono text-xs">
                        <span className="text-muted-foreground">Raw gender gap (F-M):</span>
                        <span className={summary.raw_gender_gap >= 0 ? "text-success" : "text-destructive"}>
                            {summary.raw_gender_gap >= 0 ? '+' : ''}{formatCurrency(summary.raw_gender_gap)} ({summary.raw_gender_gap_pct >= 0 ? '+' : ''}{summary.raw_gender_gap_pct}%)
                        </span>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead>
                            <tr className="border-b border-rule bg-paper/20">
                                <th className="py-3 px-4 font-mono text-[10px] uppercase tracking-wider text-muted-foreground whitespace-nowrap">Gender</th>
                                <th className="py-3 px-4 font-mono text-[10px] uppercase tracking-wider text-muted-foreground whitespace-nowrap text-right">Total</th>
                                <th className="py-3 px-4 font-mono text-[10px] uppercase tracking-wider text-muted-foreground whitespace-nowrap text-right">Underpaid</th>
                                <th className="py-3 px-4 font-mono text-[10px] uppercase tracking-wider text-muted-foreground whitespace-nowrap text-right">Overpaid</th>
                                <th className="py-3 px-4 font-mono text-[10px] uppercase tracking-wider text-muted-foreground whitespace-nowrap text-right">Avg Gap %</th>
                                <th className="py-3 px-4 font-mono text-[10px] uppercase tracking-wider text-muted-foreground whitespace-nowrap">Underpaid %</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-rule/50">
                            {gender_equity?.map((g, i) => (
                                <tr key={i} className="hover:bg-accent/10">
                                    <td className="py-3 px-4 font-medium text-ink flex items-center gap-2">
                                        <span className={`h-2 w-2 rounded-full ${g.Gender === 'Female' ? 'bg-chart-2' : g.Gender === 'Male' ? 'bg-chart-1' : 'bg-chart-3'}`} />
                                        {g.Gender}
                                    </td>
                                    <td className="py-3 px-4 font-numeric tabular-nums text-right text-muted-foreground">{g.Total}</td>
                                    <td className="py-3 px-4 font-numeric tabular-nums text-right text-destructive font-medium">{g.Underpaid}</td>
                                    <td className="py-3 px-4 font-numeric tabular-nums text-right text-muted-foreground">{g.Overpaid}</td>
                                    <td className={`py-3 px-4 font-numeric tabular-nums text-right ${g.AvgGapPct >= 0 ? 'text-success' : 'text-destructive'}`}>
                                        {g.AvgGapPct >= 0 ? '+' : ''}{g.AvgGapPct}%
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className={`font-numeric text-[10px] px-2 py-0.5 border rounded-sm ${g.UnderpaidPct > 27 ? 'bg-destructive/10 text-destructive border-destructive/30' : g.UnderpaidPct > 20 ? 'bg-warning/10 text-warning-foreground border-warning/30' : 'bg-success/10 text-success border-success/30'}`}>
                                            {g.UnderpaidPct}%
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {by_job_level && by_job_level.length > 0 && (
                <section className="border border-rule bg-card overflow-hidden">
                    <div className="p-4 border-b border-rule bg-paper/50">
                        <h3 className="font-display text-xl text-ink">Salary by Job Level × Gender</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse">
                            <thead>
                                <tr className="border-b border-rule bg-paper/20">
                                    <th className="py-3 px-4 font-mono text-[10px] uppercase tracking-wider text-muted-foreground whitespace-nowrap">Job Level</th>
                                    {by_job_level[0]?.Female !== undefined && <th className="py-3 px-4 font-mono text-[10px] uppercase tracking-wider text-muted-foreground whitespace-nowrap text-right">Female Avg</th>}
                                    {by_job_level[0]?.Male !== undefined && <th className="py-3 px-4 font-mono text-[10px] uppercase tracking-wider text-muted-foreground whitespace-nowrap text-right">Male Avg</th>}
                                    {by_job_level[0]?.['Gap (F-M)'] !== undefined && <th className="py-3 px-4 font-mono text-[10px] uppercase tracking-wider text-muted-foreground whitespace-nowrap text-right">Gap (F-M)</th>}
                                    {by_job_level[0]?.['Gap %'] !== undefined && <th className="py-3 px-4 font-mono text-[10px] uppercase tracking-wider text-muted-foreground whitespace-nowrap text-right">Gap %</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-rule/50">
                                {by_job_level.map((row, i) => (
                                    <tr key={i} className="hover:bg-accent/10">
                                        <td className="py-3 px-4 font-medium text-ink">Level {row.JobLevel}</td>
                                        {row.Female !== undefined && <td className="py-3 px-4 font-numeric tabular-nums text-right text-muted-foreground">{formatCurrency(row.Female)}</td>}
                                        {row.Male !== undefined && <td className="py-3 px-4 font-numeric tabular-nums text-right text-muted-foreground">{formatCurrency(row.Male)}</td>}
                                        {row['Gap (F-M)'] !== undefined && (
                                            <td className={`py-3 px-4 font-numeric tabular-nums text-right ${row['Gap (F-M)'] >= 0 ? 'text-success' : 'text-destructive'}`}>
                                                {row['Gap (F-M)'] >= 0 ? '+' : ''}{formatCurrency(row['Gap (F-M)'])}
                                            </td>
                                        )}
                                        {row['Gap %'] !== undefined && (
                                            <td className={`py-3 px-4 font-numeric tabular-nums text-right ${row['Gap %'] >= 0 ? 'text-success' : 'text-destructive'}`}>
                                                {row['Gap %'] >= 0 ? '+' : ''}{row['Gap %']}%
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}
        </div>
    );
}

function TrainingTab() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        API.get('/predictions/training-impact')
            .then((r) => setData(r.data))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex h-64 items-center justify-center flex-col gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-rule border-t-primary" />
            <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Analyzing training impact...</span>
        </div>
    );
    if (!data) return null;

    const { summary, trained_vs_untrained, by_recency, department_summary } = data;

    const recencyEngagement = by_recency?.map((r) => ({
        period: r.TrainingRecency,
        Engagement: r.AvgEngagement,
        Performance: r.AvgOverallScore,
        Burnout: r.AvgBurnout,
    }));

    return (
        <div className="flex flex-col gap-8 rise">
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 border-b border-rule pb-6">
                <div 
                    className="relative px-6 py-8 rounded-2xl shadow-lg border border-zinc-800/50 group"
                    style={{ backgroundColor: "#141210" }}
                >
                    <p className="font-mono text-sm uppercase tracking-widest text-rose-400 mb-2">Need Training</p>
                    <div className="font-display text-4xl text-white">{summary.needs_training?.toLocaleString()}</div>
                    <p className="mt-3 font-display italic text-base text-zinc-500">{summary.needs_training_pct}% of workforce</p>
                </div>
                <div 
                    className="relative px-6 py-8 rounded-2xl shadow-lg border border-zinc-800/50 group"
                    style={{ backgroundColor: "#141210" }}
                >
                    <p className="font-mono text-sm uppercase tracking-widest text-amber-400 mb-2">Never Trained</p>
                    <div className="font-display text-4xl text-white">{summary.never_trained?.toLocaleString()}</div>
                    <p className="mt-3 font-display italic text-base text-zinc-500">NoTrainingFlag = 1</p>
                </div>
                <div 
                    className="relative px-6 py-8 rounded-2xl shadow-lg border border-zinc-800/50 group"
                    style={{ backgroundColor: "#141210" }}
                >
                    <p className="font-mono text-sm uppercase tracking-widest text-emerald-400 mb-2">Optimal Sessions</p>
                    <div className="font-display text-4xl text-white">{summary.best_training_count}</div>
                    <p className="mt-3 font-display italic text-base text-zinc-500">Avg engagement {summary.best_engagement_at_optimal}</p>
                </div>
                <div 
                    className="relative px-6 py-8 rounded-2xl shadow-lg border border-zinc-800/50 group"
                    style={{ backgroundColor: "#141210" }}
                >
                    <p className="font-mono text-sm uppercase tracking-widest text-indigo-400 mb-2">&gt;1 Year Gap</p>
                    <div className="font-display text-4xl text-white">{summary.over_1yr_since_training?.toLocaleString()}</div>
                    <p className="mt-3 font-display italic text-base text-zinc-500">No training in 12+ months</p>
                </div>
            </section>

            <section className="border border-rule bg-card overflow-hidden">
                <div className="p-4 border-b border-rule bg-paper/50 flex flex-wrap items-center justify-between gap-4">
                    <h3 className="font-display text-xl text-ink">Trained vs Untrained Outcomes</h3>
                    <div className="flex flex-wrap gap-2">
                        <span className="font-mono text-[10px] px-2 py-1 bg-success/10 text-success border border-success/30 rounded-sm">Trained: {summary.trained?.toLocaleString()}</span>
                        <span className="font-mono text-[10px] px-2 py-1 bg-warning/10 text-warning-foreground border border-warning/30 rounded-sm">Untrained: {summary.untrained?.toLocaleString()}</span>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead>
                            <tr className="border-b border-rule bg-paper/20">
                                <th className="py-3 px-4 font-mono text-[10px] uppercase tracking-wider text-muted-foreground whitespace-nowrap">Outcome</th>
                                <th className="py-3 px-4 font-mono text-[10px] uppercase tracking-wider text-muted-foreground whitespace-nowrap text-right">Trained Mean</th>
                                <th className="py-3 px-4 font-mono text-[10px] uppercase tracking-wider text-muted-foreground whitespace-nowrap text-right">Untrained Mean</th>
                                <th className="py-3 px-4 font-mono text-[10px] uppercase tracking-wider text-muted-foreground whitespace-nowrap text-right">Difference</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-rule/50">
                            {trained_vs_untrained?.map((row, i) => (
                                <tr key={i} className="hover:bg-accent/10">
                                    <td className="py-3 px-4 font-medium text-ink capitalize">{row.outcome.replace(/_/g, ' ')}</td>
                                    <td className="py-3 px-4 font-numeric tabular-nums text-right text-muted-foreground">{row.trained_mean}</td>
                                    <td className="py-3 px-4 font-numeric tabular-nums text-right text-muted-foreground">{row.untrained_mean}</td>
                                    <td className={`py-3 px-4 font-numeric tabular-nums text-right font-medium ${row.difference > 0 ? 'text-success' : row.difference < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                                        {row.difference > 0 ? '+' : ''}{row.difference}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="border border-rule bg-card p-6">
                    <h3 className="font-display text-xl text-ink mb-6">Engagement by Recency</h3>
                    <ChartContainer config={{ Engagement: { label: "Engagement", color: "var(--chart-2)" }, Performance: { label: "Performance", color: "var(--chart-1)" } }} className="h-[300px] w-full">
                        <BarChart data={recencyEngagement} margin={{ left: 0, right: 10, top: 10, bottom: 40 }}>
                            <CartesianGrid vertical={false} stroke="var(--rule)" strokeDasharray="2 4" />
                            <XAxis dataKey="period" tickLine={false} axisLine={false} tickMargin={10} fontSize={10} angle={-25} textAnchor="end" tick={{ fill: "var(--muted-foreground)" }} />
                            <YAxis tickLine={false} axisLine={false} fontSize={11} tick={{ fill: "var(--muted-foreground)" }} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Legend verticalAlign="top" height={36} />
                            <Bar dataKey="Engagement" fill="var(--color-Engagement)" radius={[2, 2, 0, 0]} />
                            <Bar dataKey="Performance" fill="var(--color-Performance)" radius={[2, 2, 0, 0]} />
                        </BarChart>
                    </ChartContainer>
                </div>

                <div className="border border-rule bg-card p-6">
                    <h3 className="font-display text-xl text-ink mb-6">Training Needs by Department (%)</h3>
                    <ChartContainer config={{ NeedsPct: { label: "Needs Training %", color: "var(--chart-4)" } }} className="h-[300px] w-full">
                        <BarChart data={department_summary} layout="vertical" margin={{ left: 0, right: 10, top: 0, bottom: 0 }}>
                            <CartesianGrid horizontal={false} stroke="var(--rule)" strokeDasharray="2 4" />
                            <XAxis type="number" tickLine={false} axisLine={false} fontSize={11} unit="%" domain={[0, 70]} tick={{ fill: "var(--muted-foreground)" }} />
                            <YAxis dataKey="Department" type="category" tickLine={false} axisLine={false} fontSize={10} width={120} tick={{ fill: "var(--muted-foreground)" }} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="NeedsPct" fill="var(--color-NeedsPct)" radius={[0, 2, 2, 0]} />
                        </BarChart>
                    </ChartContainer>
                </div>
            </section>

            <section className="border border-rule bg-card overflow-hidden">
                <div className="p-4 border-b border-rule bg-paper/50">
                    <h3 className="font-display text-xl text-ink">Department Training Summary</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead>
                            <tr className="border-b border-rule bg-paper/20">
                                <th className="py-3 px-4 font-mono text-[10px] uppercase tracking-wider text-muted-foreground whitespace-nowrap">Department</th>
                                <th className="py-3 px-4 font-mono text-[10px] uppercase tracking-wider text-muted-foreground whitespace-nowrap text-right">Employees</th>
                                <th className="py-3 px-4 font-mono text-[10px] uppercase tracking-wider text-muted-foreground whitespace-nowrap text-right">Avg Sessions</th>
                                <th className="py-3 px-4 font-mono text-[10px] uppercase tracking-wider text-muted-foreground whitespace-nowrap text-right">Untrained %</th>
                                <th className="py-3 px-4 font-mono text-[10px] uppercase tracking-wider text-muted-foreground whitespace-nowrap text-right">Avg Engagement</th>
                                <th className="py-3 px-4 font-mono text-[10px] uppercase tracking-wider text-muted-foreground whitespace-nowrap text-right">Needs Training</th>
                                <th className="py-3 px-4 font-mono text-[10px] uppercase tracking-wider text-muted-foreground whitespace-nowrap">Needs %</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-rule/50">
                            {department_summary?.map((d, i) => (
                                <tr key={i} className="hover:bg-accent/10">
                                    <td className="py-3 px-4 font-medium text-ink">{d.Department}</td>
                                    <td className="py-3 px-4 font-numeric tabular-nums text-right text-muted-foreground">{d.Employees}</td>
                                    <td className="py-3 px-4 font-numeric tabular-nums text-right text-muted-foreground">{d.AvgTrainingCount?.toFixed(2)}</td>
                                    <td className="py-3 px-4 font-numeric tabular-nums text-right text-muted-foreground">{d.PctUntrained}%</td>
                                    <td className="py-3 px-4 font-numeric tabular-nums text-right text-muted-foreground">{d.AvgEngagement?.toFixed(3)}</td>
                                    <td className="py-3 px-4 font-numeric tabular-nums text-right text-warning-foreground font-medium">{d.NeedsTraining}</td>
                                    <td className="py-3 px-4">
                                        <span className={`font-numeric text-[10px] px-2 py-0.5 border rounded-sm ${d.NeedsPct > 58 ? 'bg-destructive/10 text-destructive border-destructive/30' : d.NeedsPct > 55 ? 'bg-warning/10 text-warning-foreground border-warning/30' : 'bg-success/10 text-success border-success/30'}`}>
                                            {d.NeedsPct}%
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}

export default function Recommendations() {
    return (
        <div className="flex flex-col gap-6">
            <Tabs defaultValue="actions" className="w-full">
                <TabsList 
                    className="grid w-full grid-cols-3 max-w-[600px] mb-8 border border-zinc-800/50 rounded-xl h-12 p-1 shadow-lg"
                    style={{ backgroundColor: "#141210" }}
                >
                    <TabsTrigger value="actions" className="rounded-lg data-[state=active]:bg-zinc-800 data-[state=active]:text-white data-[state=active]:shadow-sm text-zinc-400 hover:text-zinc-200 font-mono text-xs uppercase tracking-wider">Action Plans</TabsTrigger>
                    <TabsTrigger value="pay_equity" className="rounded-lg data-[state=active]:bg-zinc-800 data-[state=active]:text-white data-[state=active]:shadow-sm text-zinc-400 hover:text-zinc-200 font-mono text-xs uppercase tracking-wider">Pay Equity</TabsTrigger>
                    <TabsTrigger value="training" className="rounded-lg data-[state=active]:bg-zinc-800 data-[state=active]:text-white data-[state=active]:shadow-sm text-zinc-400 hover:text-zinc-200 font-mono text-xs uppercase tracking-wider">Training Impact</TabsTrigger>
                </TabsList>
                <TabsContent value="actions"><ActionTab /></TabsContent>
                <TabsContent value="pay_equity"><PayEquityTab /></TabsContent>
                <TabsContent value="training"><TrainingTab /></TabsContent>
            </Tabs>
        </div>
    );
}
