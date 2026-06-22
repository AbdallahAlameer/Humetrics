import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../api/client';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AlertTriangle, CheckCircle2, ShieldAlert, AlertCircle } from "lucide-react";
import { EmployeeDetailPanel } from '../components/EmployeeDetailPanel';

const TURNOVER_COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)', 'var(--muted-foreground)'];
const ABSENT_COLORS = ['var(--chart-2)', 'var(--chart-1)', 'var(--chart-4)', 'var(--chart-5)'];

function TurnoverTab() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        API.get('/dashboard/turnover')
            .then((r) => setData(r.data))
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex h-64 items-center justify-center flex-col gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-rule border-t-primary" />
            <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Loading...</span>
        </div>
    );
    if (error) return <div className="p-8 text-destructive">Error: {error}</div>;
    if (!data) return <div className="p-8">No data received from API.</div>;

    return (
        <div className="flex flex-col gap-8 rise">
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-rule pb-6">
                <div 
                    className="relative px-6 py-8 rounded-2xl shadow-lg border border-zinc-800/50 group"
                    style={{ backgroundColor: "#141210" }}
                >
                    <p className="font-mono text-sm uppercase tracking-widest text-zinc-400 mb-2">Total Workforce</p>
                    <div className="font-display text-4xl text-white">{data.total?.toLocaleString()}</div>
                    <p className="mt-3 font-display italic text-base text-zinc-500">Active records</p>
                </div>
                <div 
                    className="relative px-6 py-8 rounded-2xl shadow-lg border border-zinc-800/50 group"
                    style={{ backgroundColor: "#141210" }}
                >
                    <p className="font-mono text-sm uppercase tracking-widest text-rose-400 mb-2">Turnover Rate</p>
                    <div className="font-display text-4xl text-white">{(data.turnover_rate * 100).toFixed(1)}%</div>
                    <p className="mt-3 font-display italic text-base text-zinc-500">{data.left} employees left</p>
                </div>
                <div 
                    className="relative px-6 py-8 rounded-2xl shadow-lg border border-zinc-800/50 group"
                    style={{ backgroundColor: "#141210" }}
                >
                    <p className="font-mono text-sm uppercase tracking-widest text-emerald-400 mb-2">Retention Rate</p>
                    <div className="font-display text-4xl text-white">{(data.retention_rate * 100).toFixed(1)}%</div>
                    <p className="mt-3 font-display italic text-base text-zinc-500">{data.stayed} employees stayed</p>
                </div>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="border border-rule bg-card p-6">
                    <h3 className="font-display text-xl text-ink mb-6">Turnover by Department</h3>
                    <ChartContainer config={{ left: { label: "Left", color: "var(--chart-5)" }, total: { label: "Total", color: "var(--chart-1)" } }} className="h-[320px] w-full">
                        <BarChart data={data.by_department} margin={{ left: 0, right: 10, top: 10, bottom: 40 }}>
                            <CartesianGrid vertical={false} stroke="var(--rule)" strokeDasharray="2 4" />
                            <XAxis dataKey="Department" tickLine={false} axisLine={false} tickMargin={10} fontSize={10} angle={-30} textAnchor="end" tick={{ fill: "var(--muted-foreground)" }} />
                            <YAxis tickLine={false} axisLine={false} fontSize={11} tick={{ fill: "var(--muted-foreground)" }} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="left" fill="var(--color-left)" radius={[2, 2, 0, 0]} />
                            <Bar dataKey="total" fill="var(--color-total)" fillOpacity={0.2} radius={[2, 2, 0, 0]} />
                        </BarChart>
                    </ChartContainer>
                </div>

                <div className="border border-rule bg-card p-6">
                    <h3 className="font-display text-xl text-ink mb-6">Turnover by Tenure</h3>
                    <ChartContainer config={{}} className="h-[320px] w-full">
                        <PieChart>
                            <Pie
                                data={data.by_tenure}
                                dataKey="left"
                                nameKey="tenure_bucket"
                                cx="50%" cy="50%"
                                outerRadius={110}
                                innerRadius={60}
                                stroke="var(--bg-card)"
                                strokeWidth={2}
                            >
                                {data.by_tenure.map((_, i) => (
                                    <Cell key={i} fill={TURNOVER_COLORS[i % TURNOVER_COLORS.length]} />
                                ))}
                            </Pie>
                            <ChartTooltip content={<ChartTooltipContent />} />
                        </PieChart>
                    </ChartContainer>
                </div>
            </section>

            <section className="border border-rule bg-card overflow-hidden">
                <div className="p-4 border-b border-rule bg-paper/50">
                    <h3 className="font-display text-xl text-ink">Department Breakdown</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead>
                            <tr className="border-b border-rule bg-paper/20">
                                <th className="py-3 px-4 font-mono text-[10px] uppercase tracking-wider text-muted-foreground whitespace-nowrap">Department</th>
                                <th className="py-3 px-4 font-mono text-[10px] uppercase tracking-wider text-muted-foreground whitespace-nowrap text-right">Total</th>
                                <th className="py-3 px-4 font-mono text-[10px] uppercase tracking-wider text-muted-foreground whitespace-nowrap text-right">Left</th>
                                <th className="py-3 px-4 font-mono text-[10px] uppercase tracking-wider text-muted-foreground whitespace-nowrap text-right">Turnover Rate</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-rule/50">
                            {data.by_department.map((d) => (
                                <tr key={d.Department} className="hover:bg-accent/10">
                                    <td className="py-3 px-4 font-medium text-ink">{d.Department}</td>
                                    <td className="py-3 px-4 font-numeric tabular-nums text-right text-muted-foreground">{d.total}</td>
                                    <td className="py-3 px-4 font-numeric tabular-nums text-right text-ink">{d.left}</td>
                                    <td className={`py-3 px-4 font-numeric tabular-nums text-right font-medium ${d.rate > 0.2 ? 'text-destructive' : 'text-success'}`}>
                                        {(d.rate * 100).toFixed(1)}%
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

function AbsenteeismTab() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        API.get('/dashboard/absenteeism')
            .then((r) => setData(r.data))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex h-64 items-center justify-center flex-col gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-rule border-t-primary" />
            <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Loading...</span>
        </div>
    );
    if (!data) return null;

    return (
        <div className="flex flex-col gap-8 rise">
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-rule pb-6">
                <div 
                    className="relative px-6 py-8 rounded-2xl shadow-lg border border-zinc-800/50 group"
                    style={{ backgroundColor: "#141210" }}
                >
                    <p className="font-mono text-sm uppercase tracking-widest text-amber-400 mb-2">Avg Absence Days</p>
                    <div className="font-display text-4xl text-white">{data.avg_absence_days}</div>
                    <p className="mt-3 font-display italic text-base text-zinc-500">Last 6 months</p>
                </div>
                <div 
                    className="relative px-6 py-8 rounded-2xl shadow-lg border border-zinc-800/50 group"
                    style={{ backgroundColor: "#141210" }}
                >
                    <p className="font-mono text-sm uppercase tracking-widest text-rose-400 mb-2">High Absence Rate</p>
                    <div className="font-display text-4xl text-white">{(data.high_absence_pct * 100).toFixed(1)}%</div>
                    <p className="mt-3 font-display italic text-base text-zinc-500">Employees flagged</p>
                </div>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="border border-rule bg-card p-6">
                    <h3 className="font-display text-xl text-ink mb-6">Absence by Department</h3>
                    <ChartContainer config={{ avg_absence: { label: "Avg Absence", color: "var(--chart-4)" } }} className="h-[320px] w-full">
                        <BarChart data={data.by_department} layout="vertical" margin={{ left: 0, right: 10, top: 0, bottom: 0 }}>
                            <CartesianGrid horizontal={true} vertical={false} stroke="var(--rule)" strokeDasharray="2 4" />
                            <XAxis type="number" hide={true} />
                            <YAxis type="category" dataKey="Department" tickLine={false} axisLine={false} fontSize={11} width={100} tick={{ fill: "var(--muted-foreground)" }} />
                            <ChartTooltip content={<ChartTooltipContent />} cursor={{fill: 'var(--accent)', opacity: 0.1}} />
                            <Bar dataKey="avg_absence" fill="var(--color-avg_absence)" radius={[0, 4, 4, 0]} barSize={24}>
                                {data.by_department.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={ABSENT_COLORS[index % ABSENT_COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ChartContainer>
                </div>

                <div className="border border-rule bg-card p-6">
                    <h3 className="font-display text-xl text-ink mb-6">Absence Distribution</h3>
                    <ChartContainer config={{}} className="h-[320px] w-full">
                        <PieChart>
                            <Pie
                                data={data.distribution}
                                dataKey="count"
                                nameKey="bucket"
                                cx="50%" cy="50%"
                                outerRadius={110} innerRadius={60}
                                stroke="var(--bg-card)"
                                strokeWidth={2}
                            >
                                {data.distribution.map((_, i) => (
                                    <Cell key={i} fill={ABSENT_COLORS[i % ABSENT_COLORS.length]} />
                                ))}
                            </Pie>
                            <ChartTooltip content={<ChartTooltipContent />} />
                        </PieChart>
                    </ChartContainer>
                </div>
            </section>

            <section className="border border-rule bg-card overflow-hidden">
                <div className="p-4 border-b border-rule bg-paper/50">
                    <h3 className="font-display text-xl text-ink">Department Absenteeism Details</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead>
                            <tr className="border-b border-rule bg-paper/20">
                                <th className="py-3 px-4 font-mono text-[10px] uppercase tracking-wider text-muted-foreground whitespace-nowrap">Department</th>
                                <th className="py-3 px-4 font-mono text-[10px] uppercase tracking-wider text-muted-foreground whitespace-nowrap text-right">Avg Absence Days</th>
                                <th className="py-3 px-4 font-mono text-[10px] uppercase tracking-wider text-muted-foreground whitespace-nowrap text-right">Avg Frequency</th>
                                <th className="py-3 px-4 font-mono text-[10px] uppercase tracking-wider text-muted-foreground whitespace-nowrap text-right">High Absence %</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-rule/50">
                            {data.by_department.map((d) => (
                                <tr key={d.Department} className="hover:bg-accent/10">
                                    <td className="py-3 px-4 font-medium text-ink">{d.Department}</td>
                                    <td className="py-3 px-4 font-numeric tabular-nums text-right text-muted-foreground">{d.avg_absence}</td>
                                    <td className="py-3 px-4 font-numeric tabular-nums text-right text-ink">{d.avg_frequency}</td>
                                    <td className={`py-3 px-4 font-numeric tabular-nums text-right font-medium ${d.high_absence_pct > 0.3 ? 'text-destructive' : 'text-success'}`}>
                                        {(d.high_absence_pct * 100).toFixed(1)}%
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

function AlertsTab() {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        API.get('/alerts/')
            .then((r) => setAlerts(r.data))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex h-64 items-center justify-center flex-col gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-rule border-t-primary" />
            <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Checking alerts...</span>
        </div>
    );

    return (
        <div className="flex flex-col gap-8 rise">
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-rule pb-6">
                <div 
                    className="relative px-6 py-8 rounded-2xl shadow-lg border border-zinc-800/50 group"
                    style={{ backgroundColor: "#141210" }}
                >
                    <p className="font-mono text-sm uppercase tracking-widest text-rose-400 mb-2 flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> High Severity</p>
                    <div className="font-display text-4xl text-white">{alerts.filter(a => a.severity === 'high').length}</div>
                </div>
                <div 
                    className="relative px-6 py-8 rounded-2xl shadow-lg border border-zinc-800/50 group"
                    style={{ backgroundColor: "#141210" }}
                >
                    <p className="font-mono text-sm uppercase tracking-widest text-amber-400 mb-2 flex items-center gap-2"><AlertCircle className="h-4 w-4" /> Medium Severity</p>
                    <div className="font-display text-4xl text-white">{alerts.filter(a => a.severity === 'medium').length}</div>
                </div>
                <div 
                    className="relative px-6 py-8 rounded-2xl shadow-lg border border-zinc-800/50 group"
                    style={{ backgroundColor: "#141210" }}
                >
                    <p className="font-mono text-sm uppercase tracking-widest text-emerald-400 mb-2 flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Low Severity</p>
                    <div className="font-display text-4xl text-white">{alerts.filter(a => a.severity === 'low').length}</div>
                </div>
            </section>

            <section className="border border-rule bg-card overflow-hidden">
                {alerts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-16 text-center">
                        <div className="h-16 w-16 bg-success/10 text-success rounded-full flex items-center justify-center mb-4">
                            <CheckCircle2 className="h-8 w-8" />
                        </div>
                        <h3 className="font-display text-2xl text-ink mb-2">No active alerts</h3>
                        <p className="text-muted-foreground">All metrics are within normal thresholds at this time.</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-rule/50">
                        {alerts.map((alert) => {
                            const isHigh = alert.severity === 'high';
                            const isMedium = alert.severity === 'medium';
                            const Icon = isHigh ? AlertTriangle : isMedium ? AlertCircle : CheckCircle2;
                            const colorClass = isHigh ? 'text-destructive bg-destructive/10 border-destructive/20' : isMedium ? 'text-warning-foreground bg-warning/10 border-warning/20' : 'text-success bg-success/10 border-success/20';
                            
                            return (
                                <li key={alert.id} className="p-6 hover:bg-accent/5 transition-colors grid grid-cols-[auto_1fr_auto] gap-4 items-start">
                                    <div className={`p-3 rounded-sm border ${colorClass}`}>
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-display text-lg text-ink mb-1">{alert.title}</h4>
                                        <p className="text-muted-foreground text-sm leading-relaxed max-w-3xl">{alert.message}</p>
                                        {alert.department && (
                                            <span className="inline-block mt-3 font-mono text-[10px] px-2 py-1 bg-primary/10 text-primary border border-primary/20 rounded-sm">
                                                {alert.department}
                                            </span>
                                        )}
                                    </div>
                                    <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">{alert.type.replace(/_/g, ' ')}</span>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </section>
        </div>
    );
}

function PredictiveRiskTab() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    useEffect(() => {
        API.get('/predictions/behavioral-risk')
            .then((r) => setData(r.data))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex h-64 items-center justify-center flex-col gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-rule border-t-primary" />
            <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Loading...</span>
        </div>
    );
    if (!data) return null;

    const { employees, risk_profile, by_department, summary } = data;
    
    // Sort employees by BehavioralRiskScore descending
    const sortedEmployees = [...employees].sort((a, b) => b.BehavioralRiskScore - a.BehavioralRiskScore).slice(0, 50);

    const riskPie = [
        { name: 'High Risk', value: summary['High Risk'] || 0, color: 'var(--chart-5)' },
        { name: 'Medium Risk', value: summary['Medium Risk'] || 0, color: 'var(--chart-4)' },
        { name: 'Low Risk', value: summary['Low Risk'] || 0, color: 'var(--chart-1)' },
    ];

    return (
        <div className="flex flex-col gap-8 rise">
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-rule pb-6">
                <div 
                    className="relative px-6 py-8 rounded-2xl shadow-lg border border-zinc-800/50 group"
                    style={{ backgroundColor: "#141210" }}
                >
                    <p className="font-mono text-sm uppercase tracking-widest text-rose-400 mb-2">High Risk</p>
                    <div className="font-display text-4xl text-white">{risk_profile.high_risk_pct}%</div>
                    <p className="mt-3 font-display italic text-base text-zinc-500">Of total workforce</p>
                </div>
                <div 
                    className="relative px-6 py-8 rounded-2xl shadow-lg border border-zinc-800/50 group"
                    style={{ backgroundColor: "#141210" }}
                >
                    <p className="font-mono text-sm uppercase tracking-widest text-amber-400 mb-2">Medium Risk</p>
                    <div className="font-display text-4xl text-white">{risk_profile.medium_risk_pct}%</div>
                    <p className="mt-3 font-display italic text-base text-zinc-500">Of total workforce</p>
                </div>
                <div 
                    className="relative px-6 py-8 rounded-2xl shadow-lg border border-zinc-800/50 group"
                    style={{ backgroundColor: "#141210" }}
                >
                    <p className="font-mono text-sm uppercase tracking-widest text-emerald-400 mb-2">Low Risk</p>
                    <div className="font-display text-4xl text-white">{risk_profile.low_risk_pct}%</div>
                    <p className="mt-3 font-display italic text-base text-zinc-500">Of total workforce</p>
                </div>
            </section>


            <section className="border border-rule bg-card overflow-hidden">
                <div className="p-4 border-b border-rule bg-paper/50">
                    <h3 className="font-display text-xl text-ink">Highest Risk Employees</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead>
                            <tr className="border-b border-rule bg-paper/20">
                                <th className="py-3 px-4 font-mono text-[10px] uppercase tracking-wider text-muted-foreground whitespace-nowrap">Employee</th>
                                <th className="py-3 px-4 font-mono text-[10px] uppercase tracking-wider text-muted-foreground whitespace-nowrap">Department</th>
                                <th className="py-3 px-4 font-mono text-[10px] uppercase tracking-wider text-muted-foreground whitespace-nowrap">Job Title</th>
                                <th className="py-3 px-4 font-mono text-[10px] uppercase tracking-wider text-muted-foreground whitespace-nowrap text-right">Risk Score</th>
                                <th className="py-3 px-4 font-mono text-[10px] uppercase tracking-wider text-muted-foreground whitespace-nowrap">Risk Bucket</th>
                                <th className="py-3 px-4 font-mono text-[10px] uppercase tracking-wider text-muted-foreground whitespace-nowrap">Decision State</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-rule/50">
                            {sortedEmployees.map((emp, i) => (
                                <tr key={i} onClick={() => setSelectedEmployee(emp)} className="hover:bg-accent/20 transition-colors cursor-pointer group">
                                    <td className="py-3 px-4 font-medium text-primary group-hover:underline underline-offset-4">{emp.EmployeeID}</td>
                                    <td className="py-3 px-4 text-muted-foreground">{emp.Department}</td>
                                    <td className="py-3 px-4 text-muted-foreground">{emp.JobTitle}</td>
                                    <td className="py-3 px-4 font-numeric tabular-nums text-right text-ink font-medium">
                                        {(emp.BehavioralRiskScore * 100).toFixed(0)}%
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className={`font-mono text-[10px] px-2 py-0.5 border rounded-sm ${emp.RiskBucket === 'High Risk' ? 'bg-destructive/10 text-destructive border-destructive/30' : emp.RiskBucket === 'Medium Risk' ? 'bg-warning/10 text-warning-foreground border-warning/30' : 'bg-success/10 text-success border-success/30'}`}>
                                            {emp.RiskBucket}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-muted-foreground">{emp.DecisionState}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
            
            <EmployeeDetailPanel employee={selectedEmployee} onClose={() => setSelectedEmployee(null)} />
        </div>
    );
}

export default function RiskAlerts() {
    const location = useLocation();
    const navigate = useNavigate();
    const activeTab = location.hash ? location.hash.replace('#', '') : 'turnover';

    return (
        <div className="flex flex-col gap-6">
            <Tabs value={activeTab} onValueChange={(val) => navigate(`${location.pathname}#${val}`)} className="w-full">
                <TabsList 
                    className="grid w-full grid-cols-4 max-w-[800px] mb-8 border border-zinc-800/50 rounded-xl h-12 p-1 shadow-lg"
                    style={{ backgroundColor: "#141210" }}
                >
                    <TabsTrigger value="turnover" className="rounded-lg data-[state=active]:bg-zinc-800/80 data-[state=active]:text-white data-[state=active]:shadow-md font-mono text-xs uppercase tracking-wider text-zinc-500 transition-all">Turnover</TabsTrigger>
                    <TabsTrigger value="predictive" className="rounded-lg data-[state=active]:bg-zinc-800/80 data-[state=active]:text-white data-[state=active]:shadow-md font-mono text-xs uppercase tracking-wider text-zinc-500 transition-all">Predictive Risk</TabsTrigger>
                    <TabsTrigger value="absenteeism" className="rounded-lg data-[state=active]:bg-zinc-800/80 data-[state=active]:text-white data-[state=active]:shadow-md font-mono text-xs uppercase tracking-wider text-zinc-500 transition-all">Absenteeism</TabsTrigger>
                    <TabsTrigger value="alerts" className="rounded-lg data-[state=active]:bg-zinc-800/80 data-[state=active]:text-white data-[state=active]:shadow-md font-mono text-xs uppercase tracking-wider text-zinc-500 transition-all">System Alerts</TabsTrigger>
                </TabsList>
                <TabsContent value="turnover"><TurnoverTab /></TabsContent>
                <TabsContent value="predictive"><PredictiveRiskTab /></TabsContent>
                <TabsContent value="absenteeism"><AbsenteeismTab /></TabsContent>
                <TabsContent value="alerts"><AlertsTab /></TabsContent>
            </Tabs>
        </div>
    );
}
