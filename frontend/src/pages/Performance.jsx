import { useState, useEffect } from 'react';
import API from '../api/client';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';

const BAND_COLORS = { 'High Performer': 'var(--accent-green)', 'Solid Performer': 'var(--accent-purple)', 'At Risk': 'var(--accent-red)' };
const STRAIN_COLORS = { 'Low Risk': 'var(--accent-green)', 'Medium Risk': 'var(--accent-amber)', 'High Risk': 'var(--accent-red)' };

function CurrentPerformanceTab() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        API.get('/dashboard/performance')
            .then((r) => setData(r.data))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="loading"><div className="spinner" /><span className="loading-text">Loading...</span></div>;

    return (
        <div className="tab-pane fade-in">
            <div className="kpi-grid">
                <div className="kpi-card kpi-amber">
                    <div className="kpi-icon">⭐</div>
                    <div className="kpi-label">Avg Rating</div>
                    <div className="kpi-value">{data.avg_overall?.toFixed(1)}</div>
                    <div className="kpi-sub">Out of 5.0</div>
                </div>
                <div className="kpi-card kpi-green">
                    <div className="kpi-icon">🏆</div>
                    <div className="kpi-label">High Performers</div>
                    <div className="kpi-value">{(data.high_performer_pct * 100).toFixed(1)}%</div>
                    <div className="kpi-sub">Of workforce</div>
                </div>
            </div>

            <div className="chart-grid">
                <div className="chart-card">
                    <h3><span className="chart-icon">📊</span> Rating Distribution</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={data.rating_distribution}>
                            <XAxis dataKey="PerformanceRating" stroke="var(--text-secondary)" fontSize={12} />
                            <YAxis stroke="var(--text-secondary)" fontSize={11} />
                            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: 8, color: 'var(--text-primary)' }} />
                            <Bar dataKey="count" fill="var(--accent-amber)" radius={[9999, 9999, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-card">
                    <h3><span className="chart-icon">🏢</span> Avg Rating by Department</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={data.by_department} layout="vertical" margin={{ left: 20 }}>
                            <XAxis type="number" stroke="var(--text-secondary)" fontSize={11} domain={[0, 5]} />
                            <YAxis dataKey="Department" type="category" stroke="var(--text-secondary)" fontSize={11} width={120} />
                            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: 12, color: 'var(--text-primary)' }} />
                            <Bar dataKey="avg_rating" fill="var(--accent-purple)" radius={[0, 9999, 9999, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="chart-grid">
                <div className="chart-card">
                    <h3><span className="chart-icon">🏆</span> Top 10 Performers</h3>
                    <table className="data-table">
                        <thead>
                            <tr><th>ID</th><th>Department</th><th>Job Title</th><th>Score</th><th>Tenure</th></tr>
                        </thead>
                        <tbody>
                            {data.top_performers?.map((e) => (
                                <tr key={e.EmployeeID}>
                                    <td>{e.EmployeeID}</td>
                                    <td>{e.Department}</td>
                                    <td>{e.JobTitle}</td>
                                    <td className="text-green"><strong>{e.AvgOverallScore?.toFixed(1)}</strong></td>
                                    <td>{e.TenureYears}y</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="chart-card">
                    <h3><span className="chart-icon">⚠️</span> Bottom 10 Performers</h3>
                    <table className="data-table">
                        <thead>
                            <tr><th>ID</th><th>Department</th><th>Job Title</th><th>Score</th><th>Tenure</th></tr>
                        </thead>
                        <tbody>
                            {data.bottom_performers?.map((e) => (
                                <tr key={e.EmployeeID}>
                                    <td>{e.EmployeeID}</td>
                                    <td>{e.Department}</td>
                                    <td>{e.JobTitle}</td>
                                    <td className="text-red"><strong>{e.AvgOverallScore?.toFixed(1)}</strong></td>
                                    <td>{e.TenureYears}y</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function PredictedPerformanceTab() {
    const [performance, setPerformance] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        API.get('/predictions/performance')
            .then((r) => setPerformance(r.data))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="loading"><div className="spinner" /><span className="loading-text">Running AI models…</span></div>;

    const bandPie = [
        { name: 'High Performer', value: performance.band_summary.high_performer },
        { name: 'Solid Performer', value: performance.band_summary.solid_performer },
        { name: 'At Risk', value: performance.band_summary.at_risk },
    ];

    return (
        <div className="tab-pane fade-in">
            <div className="kpi-grid">
                <div className="kpi-card kpi-green">
                    <div className="kpi-icon">🏆</div>
                    <div className="kpi-label">High Performers</div>
                    <div className="kpi-value">{performance.band_summary.high_performer}</div>
                    <div className="kpi-sub">Predicted ≥ 4.0</div>
                </div>
                <div className="kpi-card kpi-amber">
                    <div className="kpi-icon">💼</div>
                    <div className="kpi-label">Solid Performers</div>
                    <div className="kpi-value">{performance.band_summary.solid_performer}</div>
                    <div className="kpi-sub">Predicted 3.0 – 3.99</div>
                </div>
                <div className="kpi-card kpi-red">
                    <div className="kpi-icon">⚠️</div>
                    <div className="kpi-label">At Risk</div>
                    <div className="kpi-value">{performance.band_summary.at_risk}</div>
                    <div className="kpi-sub">Predicted &lt; 3.0</div>
                </div>
            </div>

            <div className="chart-grid">
                <div className="chart-card">
                    <h3><span className="chart-icon">📊</span>Performance Band Distribution</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie data={bandPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={50} label>
                                {bandPie.map((d) => <Cell key={d.name} fill={BAND_COLORS[d.name]} />)}
                            </Pie>
                            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: 8, color: 'var(--text-primary)' }} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="chart-card">
                    <h3><span className="chart-icon">🔑</span>Top Predictors of Performance</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={performance.feature_importance?.slice(0, 8)} layout="vertical" margin={{ left: 20 }}>
                            <XAxis type="number" stroke="var(--text-secondary)" fontSize={11} />
                            <YAxis dataKey="feature" type="category" stroke="var(--text-secondary)" fontSize={10} width={140} />
                            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: 8, color: 'var(--text-primary)' }} />
                            <Bar dataKey="importance" fill="var(--accent-green)" radius={[0, 9999, 9999, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="chart-card">
                <h3><span className="chart-icon">🏢</span>Department – At Risk %</h3>
                <table className="data-table">
                    <thead><tr><th>Department</th><th>Employees</th><th>Avg Predicted</th><th>At Risk</th><th>At Risk %</th></tr></thead>
                    <tbody>
                        {performance.department_summary?.map((d, i) => (
                            <tr key={i}>
                                <td>{d.Department}</td>
                                <td>{d.Employees}</td>
                                <td>{d.AvgPredicted?.toFixed(2)}</td>
                                <td className="text-red"><strong>{d.AtRisk}</strong></td>
                                <td>
                                    <span className={`badge ${d.AtRiskPct > 30 ? 'badge-high' : d.AtRiskPct > 15 ? 'badge-medium' : 'badge-low'}`}>
                                        {d.AtRiskPct}%
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {performance.model_metrics && (
                    <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(16,185,129,0.06)', borderRadius: 8, fontSize: 12, color: 'var(--text-muted)' }}>
                        📈 Model: RandomForestRegressor · R² = {performance.model_metrics.r2} · MAE = {performance.model_metrics.mae} · RMSE = {performance.model_metrics.rmse}
                    </div>
                )}
            </div>
        </div>
    );
}

function BehavioralRiskTab() {
    const [behavioral, setBehavioral] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        API.get('/predictions/behavioral-risk')
            .then((r) => setBehavioral(r.data))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="loading"><div className="spinner" /><span className="loading-text">Running AI models…</span></div>;

    const strainPie = Object.entries(behavioral.summary).map(([k, v]) => ({ name: k, value: v }));

    return (
        <div className="tab-pane fade-in">
            <div className="kpi-grid">
                {Object.entries(behavioral.summary).map(([level, count]) => (
                    <div key={level} className={`kpi-card ${level === 'High Risk' ? 'kpi-red' : level === 'Medium Risk' ? 'kpi-amber' : 'kpi-green'}`}>
                        <div className="kpi-icon">{level === 'High Risk' ? '🔴' : level === 'Medium Risk' ? '🟡' : '🟢'}</div>
                        <div className="kpi-label">{level}</div>
                        <div className="kpi-value">{count}</div>
                    </div>
                ))}
            </div>

            <div className="chart-grid">
                <div className="chart-card">
                    <h3><span className="chart-icon">📊</span>Risk Distribution</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie data={strainPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={50} label>
                                {strainPie.map((d) => <Cell key={d.name} fill={STRAIN_COLORS[d.name] || 'var(--accent-purple)'} />)}
                            </Pie>
                            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: 8, color: 'var(--text-primary)' }} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="chart-card">
                    <h3><span className="chart-icon">📋</span>Decision States</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={Object.entries(behavioral.decision_states).map(([k, v]) => ({ state: k, count: v }))} layout="vertical" margin={{ left: 20 }}>
                            <XAxis type="number" stroke="var(--text-secondary)" fontSize={11} />
                            <YAxis dataKey="state" type="category" stroke="var(--text-secondary)" fontSize={9} width={200} />
                            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: 8, color: 'var(--text-primary)' }} />
                            <Bar dataKey="count" fill="var(--accent-purple)" radius={[0, 9999, 9999, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="chart-card">
                <h3><span className="chart-icon">🏢</span>High Risk % by Department</h3>
                <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={behavioral.by_department} layout="vertical" margin={{ left: 20 }}>
                            <XAxis type="number" stroke="var(--text-secondary)" fontSize={11} unit="%" domain={[0, 30]} />
                            <YAxis dataKey="Department" type="category" stroke="var(--text-secondary)" fontSize={10} width={150} />
                            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: 12, color: 'var(--text-primary)' }}
                                formatter={(v) => `${v}%`} />
                            <Bar dataKey="high_risk_pct" fill="var(--accent-red)" radius={[0, 9999, 9999, 0]} />
                        </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export default function Performance() {
    const [activeTab, setActiveTab] = useState('current');

    return (
        <>
            <div className="page-header">
                <h1>⭐ Performance Analytics</h1>
                <p>Track current performance metrics, AI-predicted outcomes, and behavioral risk factors</p>
            </div>

            <div className="tabs-container">
                <div className="tabs">
                    <button className={`tab-btn ${activeTab === 'current' ? 'active' : ''}`} onClick={() => setActiveTab('current')}>Current Performance</button>
                    <button className={`tab-btn ${activeTab === 'predicted' ? 'active' : ''}`} onClick={() => setActiveTab('predicted')}>Predicted Performance</button>
                    <button className={`tab-btn ${activeTab === 'behavioral' ? 'active' : ''}`} onClick={() => setActiveTab('behavioral')}>Behavioral Risk</button>
                </div>
            </div>

            <div className="tab-content">
                {activeTab === 'current' && <CurrentPerformanceTab />}
                {activeTab === 'predicted' && <PredictedPerformanceTab />}
                {activeTab === 'behavioral' && <BehavioralRiskTab />}
            </div>
        </>
    );
}
