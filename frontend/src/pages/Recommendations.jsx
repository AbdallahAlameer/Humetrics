import { useState, useEffect } from 'react';
import API from '../api/client';
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, Legend
} from 'recharts';

const ACTION_COLORS = {
    'Retention & Career Discussion': 'var(--accent-red)',
    'Compensation / Promotion Review': 'var(--accent-purple)',
    'Career Risk – Compensation Issue': 'var(--accent-purple)',
    'Training & Development Plan': 'var(--accent-purple)',
    'Workload or Manager Review': 'var(--accent-amber)',
    'No Immediate Action / Monitor': 'var(--accent-green)',
};
const PRIORITY_COLORS = { 'Immediate Action': 'var(--accent-red)', 'Planned Action': 'var(--accent-amber)', Monitor: 'var(--accent-green)' };
const GENDER_COLORS = { Female: 'var(--accent-purple)', Male: 'var(--accent-purple)', 'Non-binary': 'var(--accent-green)' };

function ActionTab() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        API.get('/recommendations/')
            .then((r) => setData(r.data))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="loading"><div className="spinner" /><span className="loading-text">Generating recommendations...</span></div>;

    const actionPie = Object.entries(data.action_summary).map(([k, v]) => ({ name: k, value: v }));
    const priorityPie = Object.entries(data.priority_summary).map(([k, v]) => ({ name: k, value: v }));
    const filtered = filter === 'all' ? data.recommendations : data.recommendations.filter((r) => r.PriorityLevel === filter);

    return (
        <div className="tab-pane fade-in">
            <div className="chart-grid">
                <div className="chart-card">
                    <h3><span className="chart-icon">📊</span> Actions Distribution</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie data={actionPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={50}
                                label={({ name, value }) => `${value}`} fontSize={11}>
                                {actionPie.map((d) => <Cell key={d.name} fill={ACTION_COLORS[d.name] || 'var(--accent-purple)'} />)}
                            </Pie>
                            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: 8, color: 'var(--text-primary)' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="chart-card">
                    <h3><span className="chart-icon">🎯</span> Priority Breakdown</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie data={priorityPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={50}
                                label={({ name, value }) => `${name}: ${value}`} fontSize={11}>
                                {priorityPie.map((d) => <Cell key={d.name} fill={PRIORITY_COLORS[d.name] || 'var(--accent-purple)'} />)}
                            </Pie>
                            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: 8, color: 'var(--text-primary)' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="card" style={{ marginBottom: 24 }}>
                <div className="flex-between">
                    <h3>Action Cards</h3>
                    <div style={{ display: 'flex', gap: 6 }}>
                        {['all', 'Immediate Action', 'Planned Action', 'Monitor'].map((f) => (
                            <button key={f} onClick={() => setFilter(f)} style={{
                                padding: '6px 14px', borderRadius: 8, border: '1px solid',
                                borderColor: filter === f ? 'var(--accent-blue)' : 'var(--border-glass)',
                                background: filter === f ? 'rgba(59,130,246,0.12)' : 'transparent',
                                color: filter === f ? 'var(--accent-blue)' : 'var(--text-secondary)',
                                cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
                            }}>{f === 'all' ? 'All' : f}</button>
                        ))}
                    </div>
                </div>
            </div>

            {filtered.slice(0, 50).map((rec, i) => (
                <div className="rec-card" key={i}>
                    <div className="rec-card-header">
                        <strong className="emp-name">{rec.EmployeeID}</strong>
                        <span className="emp-dept">{rec.Department} · {rec.JobTitle}</span>
                        <span className={`badge ${rec.PriorityLevel === 'Immediate Action' ? 'badge-high' : rec.PriorityLevel === 'Planned Action' ? 'badge-medium' : 'badge-low'}`} style={{ marginLeft: 'auto' }}>
                            {rec.PriorityLevel}
                        </span>
                    </div>
                    <div className="rec-card-body">
                        <p><strong>State:</strong> {rec.DecisionState} · <strong>Strain:</strong> {rec.StrainLevel}</p>
                        <p style={{ marginTop: 6, color: 'var(--text-muted)' }}>{rec.Reason}</p>
                    </div>
                    <div className="rec-action">💡 {rec.RecommendedAction}</div>
                </div>
            ))}
        </div>
    );
}

function PayEquityTab() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        API.get('/predictions/pay-equity')
            .then((r) => setData(r.data))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="loading"><div className="spinner" /><span className="loading-text">Analyzing pay equity…</span></div>;
    if (!data) return null;

    const { summary, gender_equity, department_equity, top_underpaid, by_job_level } = data;

    const equityPie = [
        { name: 'Underpaid (>15% below)', value: summary.underpaid, color: 'var(--accent-red)' },
        { name: 'Within Range', value: summary.in_range, color: 'var(--accent-green)' },
        { name: 'Overpaid (>15% above)', value: summary.overpaid, color: 'var(--accent-amber)' },
    ];

    return (
        <div className="tab-pane fade-in">
            <div className="kpi-grid">
                <div className="kpi-card kpi-red">
                    <div className="kpi-icon">📉</div>
                    <div className="kpi-label">Underpaid</div>
                    <div className="kpi-value">{summary.underpaid}</div>
                    <div className="kpi-sub">{summary.underpaid_pct}% of workforce</div>
                </div>
                <div className="kpi-card kpi-green">
                    <div className="kpi-icon">✅</div>
                    <div className="kpi-label">Within Range</div>
                    <div className="kpi-value">{summary.in_range}</div>
                    <div className="kpi-sub">Fair compensation</div>
                </div>
                <div className="kpi-card kpi-amber">
                    <div className="kpi-icon">📈</div>
                    <div className="kpi-label">Overpaid</div>
                    <div className="kpi-value">{summary.overpaid}</div>
                    <div className="kpi-sub">{summary.overpaid_pct}% of workforce</div>
                </div>
                <div className="kpi-card" style={{ borderColor: 'rgba(139,92,246,0.3)', background: 'rgba(139,92,246,0.07)' }}>
                    <div className="kpi-icon">🔬</div>
                    <div className="kpi-label">Model R²</div>
                    <div className="kpi-value">{(summary.model_r2 * 100).toFixed(1)}%</div>
                    <div className="kpi-sub">Salary explained by role/level</div>
                </div>
            </div>

            <div className="chart-grid">
                <div className="chart-card">
                    <h3><span className="chart-icon">📊</span>Compensation Distribution</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie data={equityPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={50} label>
                                {equityPie.map((d) => <Cell key={d.name} fill={d.color} />)}
                            </Pie>
                            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: 8, color: 'var(--text-primary)' }} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-card">
                    <h3><span className="chart-icon">🏢</span>Underpaid % by Department</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={department_equity} layout="vertical" margin={{ left: 20 }}>
                            <XAxis type="number" stroke="var(--text-secondary)" fontSize={11} unit="%" />
                            <YAxis dataKey="Department" type="category" stroke="var(--text-secondary)" fontSize={10} width={150} />
                            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: 8, color: 'var(--text-primary)' }}
                                formatter={(v) => `${v}%`} />
                            <Bar dataKey="UnderpaidPct" fill="var(--accent-red)" radius={[0, 9999, 9999, 0]} name="Underpaid %" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="chart-card" style={{ marginBottom: 24 }}>
                <h3><span className="chart-icon">👥</span>Pay Equity by Gender</h3>
                <div style={{ display: 'flex', gap: 24, marginBottom: 12, fontSize: 13, color: 'var(--text-muted)' }}>
                    <span>Raw gender pay gap (F–M): <strong style={{ color: summary.raw_gender_gap >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                        {summary.raw_gender_gap >= 0 ? '+' : ''}{summary.raw_gender_gap?.toLocaleString()} ({summary.raw_gender_gap_pct >= 0 ? '+' : ''}{summary.raw_gender_gap_pct}%)
                    </strong></span>
                </div>
                <table className="data-table">
                    <thead><tr><th>Gender</th><th>Total</th><th>Underpaid</th><th>Overpaid</th><th>Avg Gap %</th><th>Underpaid %</th></tr></thead>
                    <tbody>
                        {gender_equity?.map((g, i) => (
                            <tr key={i}>
                                <td><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: GENDER_COLORS[g.Gender] || 'var(--text-secondary)', marginRight: 8 }} />{g.Gender}</td>
                                <td>{g.Total}</td>
                                <td className="text-red"><strong>{g.Underpaid}</strong></td>
                                <td>{g.Overpaid}</td>
                                <td style={{ color: g.AvgGapPct >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>{g.AvgGapPct >= 0 ? '+' : ''}{g.AvgGapPct}%</td>
                                <td><span className={`badge ${g.UnderpaidPct > 27 ? 'badge-high' : g.UnderpaidPct > 20 ? 'badge-medium' : 'badge-low'}`}>{g.UnderpaidPct}%</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {by_job_level && by_job_level.length > 0 && (
                <div className="chart-card" style={{ marginBottom: 24 }}>
                    <h3><span className="chart-icon">📋</span>Salary by Job Level × Gender</h3>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Job Level</th>
                                {by_job_level[0]?.Female !== undefined && <th>Female Avg</th>}
                                {by_job_level[0]?.Male !== undefined && <th>Male Avg</th>}
                                {by_job_level[0]?.['Gap (F-M)'] !== undefined && <th>Gap (F–M)</th>}
                                {by_job_level[0]?.['Gap %'] !== undefined && <th>Gap %</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {by_job_level.map((row, i) => (
                                <tr key={i}>
                                    <td><strong>Level {row.JobLevel}</strong></td>
                                    {row.Female !== undefined && <td>${row.Female?.toLocaleString()}</td>}
                                    {row.Male !== undefined && <td>${row.Male?.toLocaleString()}</td>}
                                    {row['Gap (F-M)'] !== undefined && (
                                        <td style={{ color: row['Gap (F-M)'] >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                                            {row['Gap (F-M)'] >= 0 ? '+' : ''}{row['Gap (F-M)']?.toLocaleString()}
                                        </td>
                                    )}
                                    {row['Gap %'] !== undefined && (
                                        <td style={{ color: row['Gap %'] >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                                            {row['Gap %'] >= 0 ? '+' : ''}{row['Gap %']}%
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
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

    if (loading) return <div className="loading"><div className="spinner" /><span className="loading-text">Analyzing training impact…</span></div>;
    if (!data) return null;

    const { summary, trained_vs_untrained, by_recency, department_summary } = data;

    const recencyEngagement = by_recency?.map((r) => ({
        period: r.TrainingRecency,
        Engagement: r.AvgEngagement,
        Performance: r.AvgOverallScore,
        Burnout: r.AvgBurnout,
    }));

    return (
        <div className="tab-pane fade-in">
            <div className="kpi-grid">
                <div className="kpi-card kpi-red">
                    <div className="kpi-icon">⚠️</div>
                    <div className="kpi-label">Need Training</div>
                    <div className="kpi-value">{summary.needs_training?.toLocaleString()}</div>
                    <div className="kpi-sub">{summary.needs_training_pct}% of workforce</div>
                </div>
                <div className="kpi-card kpi-amber">
                    <div className="kpi-icon">🚫</div>
                    <div className="kpi-label">Never Trained</div>
                    <div className="kpi-value">{summary.never_trained?.toLocaleString()}</div>
                    <div className="kpi-sub">NoTrainingFlag = 1</div>
                </div>
                <div className="kpi-card kpi-green">
                    <div className="kpi-icon">🏅</div>
                    <div className="kpi-label">Optimal Sessions</div>
                    <div className="kpi-value">{summary.best_training_count}</div>
                    <div className="kpi-sub">Avg engagement {summary.best_engagement_at_optimal}</div>
                </div>
                <div className="kpi-card" style={{ borderColor: 'rgba(59,130,246,0.3)', background: 'rgba(59,130,246,0.07)' }}>
                    <div className="kpi-icon">📅</div>
                    <div className="kpi-label">&gt;1 Year Gap</div>
                    <div className="kpi-value">{summary.over_1yr_since_training?.toLocaleString()}</div>
                    <div className="kpi-sub">No training in 12+ months</div>
                </div>
            </div>

            <div className="chart-card" style={{ marginBottom: 24 }}>
                <h3><span className="chart-icon">📊</span>Trained vs Untrained Outcomes</h3>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                    <span className="badge badge-low">Trained: {summary.trained?.toLocaleString()}</span>
                    <span className="badge badge-medium">Untrained: {summary.untrained?.toLocaleString()}</span>
                </div>
                <table className="data-table">
                    <thead><tr><th>Outcome</th><th>Trained Mean</th><th>Untrained Mean</th><th>Difference</th></tr></thead>
                    <tbody>
                        {trained_vs_untrained?.map((row, i) => (
                            <tr key={i}>
                                <td><strong>{row.outcome.replace('_', ' ')}</strong></td>
                                <td>{row.trained_mean}</td>
                                <td>{row.untrained_mean}</td>
                                <td style={{ color: row.difference > 0 ? 'var(--accent-green)' : row.difference < 0 ? 'var(--accent-red)' : 'inherit' }}>
                                    <strong>{row.difference > 0 ? '+' : ''}{row.difference}</strong>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="chart-grid">
                <div className="chart-card">
                    <h3><span className="chart-icon">📈</span>Engagement by Recency</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={recencyEngagement} margin={{ left: 0, bottom: 30 }}>
                            <XAxis dataKey="period" stroke="var(--text-secondary)" fontSize={10} angle={-25} textAnchor="end" height={70} />
                            <YAxis stroke="var(--text-secondary)" fontSize={11} />
                            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: 8, color: 'var(--text-primary)' }} />
                            <Legend />
                            <Bar dataKey="Engagement" fill="var(--accent-green)" radius={[9999, 9999, 0, 0]} />
                            <Bar dataKey="Performance" fill="#1E3A8A" radius={[9999, 9999, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-card">
                    <h3><span className="chart-icon">🏢</span>Training Needs by Department (%)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={department_summary} layout="vertical" margin={{ left: 20 }}>
                            <XAxis type="number" stroke="var(--text-secondary)" fontSize={11} unit="%" domain={[0, 70]} />
                            <YAxis dataKey="Department" type="category" stroke="var(--text-secondary)" fontSize={10} width={150} />
                            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: 8, color: 'var(--text-primary)' }}
                                formatter={(v) => `${v}%`} />
                            <Bar dataKey="NeedsPct" fill="var(--accent-amber)" radius={[0, 9999, 9999, 0]} name="Needs Training %" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="chart-card">
                <h3><span className="chart-icon">📋</span>Department Training Summary</h3>
                <table className="data-table">
                    <thead>
                        <tr><th>Department</th><th>Employees</th><th>Avg Sessions</th><th>Untrained %</th><th>Avg Engagement</th><th>Needs Training</th><th>Needs %</th></tr>
                    </thead>
                    <tbody>
                        {department_summary?.map((d, i) => (
                            <tr key={i}>
                                <td><strong>{d.Department}</strong></td>
                                <td>{d.Employees}</td>
                                <td>{d.AvgTrainingCount?.toFixed(2)}</td>
                                <td>{d.PctUntrained}%</td>
                                <td>{d.AvgEngagement?.toFixed(3)}</td>
                                <td>{d.NeedsTraining}</td>
                                <td>
                                    <span className={`badge ${d.NeedsPct > 58 ? 'badge-high' : d.NeedsPct > 55 ? 'badge-medium' : 'badge-low'}`}>
                                        {d.NeedsPct}%
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default function Recommendations() {
    const [activeTab, setActiveTab] = useState('actions');

    return (
        <>
            <div className="page-header">
                <h1>💡 AI Recommendations & Insights</h1>
                <p>AI-generated action plans, pay equity analysis, and training impact insights</p>
            </div>

            <div className="tabs-container">
                <div className="tabs">
                    <button className={`tab-btn ${activeTab === 'actions' ? 'active' : ''}`} onClick={() => setActiveTab('actions')}>Action Plans</button>
                    <button className={`tab-btn ${activeTab === 'pay_equity' ? 'active' : ''}`} onClick={() => setActiveTab('pay_equity')}>Pay Equity</button>
                    <button className={`tab-btn ${activeTab === 'training' ? 'active' : ''}`} onClick={() => setActiveTab('training')}>Training Impact</button>
                </div>
            </div>

            <div className="tab-content">
                {activeTab === 'actions' && <ActionTab />}
                {activeTab === 'pay_equity' && <PayEquityTab />}
                {activeTab === 'training' && <TrainingTab />}
            </div>
        </>
    );
}
