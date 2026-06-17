import { useState, useEffect } from 'react';
import API from '../api/client';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';

const TURNOVER_COLORS = ['var(--text-primary)', '#1E3A8A', 'var(--accent-purple)', '#60A5FA', '#93C5FD', '#DBEAFE'];
const ABSENT_COLORS = ['var(--accent-green)', 'var(--accent-purple)', 'var(--accent-amber)', 'var(--accent-red)'];

function TurnoverTab() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        API.get('/dashboard/turnover')
            .then((r) => setData(r.data))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="loading"><div className="spinner" /><span className="loading-text">Loading Turnover Data...</span></div>;

    return (
        <div className="tab-pane fade-in">
            <div className="kpi-grid">
                <div className="kpi-card kpi-blue">
                    <div className="kpi-icon">👥</div>
                    <div className="kpi-label">Total Workforce</div>
                    <div className="kpi-value">{data.total?.toLocaleString()}</div>
                </div>
                <div className="kpi-card kpi-red">
                    <div className="kpi-icon">🚪</div>
                    <div className="kpi-label">Turnover Rate</div>
                    <div className="kpi-value">{(data.turnover_rate * 100).toFixed(1)}%</div>
                    <div className="kpi-sub">{data.left} employees left</div>
                </div>
                <div className="kpi-card kpi-green">
                    <div className="kpi-icon">🤝</div>
                    <div className="kpi-label">Retention Rate</div>
                    <div className="kpi-value">{(data.retention_rate * 100).toFixed(1)}%</div>
                    <div className="kpi-sub">{data.stayed} employees stayed</div>
                </div>
            </div>

            <div className="chart-grid">
                <div className="chart-card">
                    <h3><span className="chart-icon">📊</span> Turnover by Department</h3>
                    <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={data.by_department}>
                            <XAxis dataKey="Department" stroke="var(--text-secondary)" fontSize={10} angle={-20} textAnchor="end" height={60} />
                            <YAxis stroke="var(--text-secondary)" fontSize={11} />
                            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: 8, color: 'var(--text-primary)' }} />
                            <Bar dataKey="left" fill="var(--accent-red)" name="Left" radius={[9999, 9999, 0, 0]} />
                            <Bar dataKey="total" fill="#1E3A8A" name="Total" radius={[9999, 9999, 0, 0]} opacity={0.4} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-card">
                    <h3><span className="chart-icon">📅</span> Turnover by Tenure</h3>
                    <ResponsiveContainer width="100%" height={320}>
                        <PieChart>
                            <Pie
                                data={data.by_tenure}
                                dataKey="left"
                                nameKey="tenure_bucket"
                                cx="50%" cy="50%"
                                outerRadius={110}
                                innerRadius={50}
                                paddingAngle={3}
                                label={({ tenure_bucket, rate }) => `${tenure_bucket}: ${(rate * 100).toFixed(0)}%`}
                                fontSize={11}
                            >
                                {data.by_tenure.map((_, i) => (
                                    <Cell key={i} fill={TURNOVER_COLORS[i % TURNOVER_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: 8, color: 'var(--text-primary)' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="chart-card">
                <h3><span className="chart-icon">📋</span> Department Breakdown</h3>
                <table className="data-table">
                    <thead>
                        <tr><th>Department</th><th>Total</th><th>Left</th><th>Turnover Rate</th></tr>
                    </thead>
                    <tbody>
                        {data.by_department.map((d) => (
                            <tr key={d.Department}>
                                <td><strong>{d.Department}</strong></td>
                                <td>{d.total}</td>
                                <td>{d.left}</td>
                                <td className={d.rate > 0.2 ? 'text-red' : 'text-green'}>
                                    {(d.rate * 100).toFixed(1)}%
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
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

    if (loading) return <div className="loading"><div className="spinner" /><span className="loading-text">Loading Absenteeism Data...</span></div>;

    return (
        <div className="tab-pane fade-in">
            <div className="kpi-grid">
                <div className="kpi-card kpi-amber">
                    <div className="kpi-icon">📅</div>
                    <div className="kpi-label">Avg Absence Days</div>
                    <div className="kpi-value">{data.avg_absence_days}</div>
                    <div className="kpi-sub">Last 6 months</div>
                </div>
                <div className="kpi-card kpi-red">
                    <div className="kpi-icon">⚠️</div>
                    <div className="kpi-label">High Absence Rate</div>
                    <div className="kpi-value">{(data.high_absence_pct * 100).toFixed(1)}%</div>
                    <div className="kpi-sub">Employees flagged</div>
                </div>
            </div>

            <div className="chart-grid">
                <div className="chart-card">
                    <h3><span className="chart-icon">📊</span> Absence by Department</h3>
                    <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={data.by_department}>
                            <XAxis dataKey="Department" stroke="var(--text-secondary)" fontSize={10} angle={-20} textAnchor="end" height={60} />
                            <YAxis stroke="var(--text-secondary)" fontSize={11} />
                            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: 8, color: 'var(--text-primary)' }} />
                            <Bar dataKey="avg_absence" fill="var(--accent-amber)" name="Avg Absence Days" radius={[9999, 9999, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-card">
                    <h3><span className="chart-icon">📈</span> Absence Distribution</h3>
                    <ResponsiveContainer width="100%" height={320}>
                        <PieChart>
                            <Pie
                                data={data.distribution}
                                dataKey="count"
                                nameKey="bucket"
                                cx="50%" cy="50%"
                                outerRadius={110} innerRadius={50}
                                paddingAngle={3}
                                label={({ bucket, count }) => `${bucket}: ${count}`}
                                fontSize={11}
                            >
                                {data.distribution.map((_, i) => (
                                    <Cell key={i} fill={ABSENT_COLORS[i % ABSENT_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: 8, color: 'var(--text-primary)' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="chart-card">
                <h3><span className="chart-icon">📋</span> Department Absenteeism Details</h3>
                <table className="data-table">
                    <thead>
                        <tr><th>Department</th><th>Avg Absence Days</th><th>Avg Frequency</th><th>High Absence %</th></tr>
                    </thead>
                    <tbody>
                        {data.by_department.map((d) => (
                            <tr key={d.Department}>
                                <td><strong>{d.Department}</strong></td>
                                <td>{d.avg_absence}</td>
                                <td>{d.avg_frequency}</td>
                                <td className={d.high_absence_pct > 0.3 ? 'text-red' : 'text-green'}>
                                    {(d.high_absence_pct * 100).toFixed(1)}%
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
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

    if (loading) return <div className="loading"><div className="spinner" /><span className="loading-text">Checking alerts...</span></div>;

    return (
        <div className="tab-pane fade-in">
            <div className="kpi-grid">
                <div className="kpi-card kpi-red">
                    <div className="kpi-icon">🔴</div>
                    <div className="kpi-label">High Severity</div>
                    <div className="kpi-value">{alerts.filter(a => a.severity === 'high').length}</div>
                </div>
                <div className="kpi-card kpi-amber">
                    <div className="kpi-icon">🟡</div>
                    <div className="kpi-label">Medium Severity</div>
                    <div className="kpi-value">{alerts.filter(a => a.severity === 'medium').length}</div>
                </div>
                <div className="kpi-card kpi-green">
                    <div className="kpi-icon">🟢</div>
                    <div className="kpi-label">Low Severity</div>
                    <div className="kpi-value">{alerts.filter(a => a.severity === 'low').length}</div>
                </div>
            </div>

            <div className="card">
                {alerts.length === 0 ? (
                    <p style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                        ✅ No alerts at this time. All metrics are within normal thresholds.
                    </p>
                ) : (
                    alerts.map((alert) => (
                        <div className="alert-item" key={alert.id}>
                            <div className={`alert-icon ${alert.severity}`}>
                                {alert.severity === 'high' ? '🔴' : alert.severity === 'medium' ? '🟡' : '🟢'}
                            </div>
                            <div className="alert-content">
                                <h4>{alert.title}</h4>
                                <p>{alert.message}</p>
                                {alert.department && (
                                    <span className="badge badge-info" style={{ marginTop: 8 }}>
                                        {alert.department}
                                    </span>
                                )}
                            </div>
                            <span className="alert-time">{alert.type.replace(/_/g, ' ')}</span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default function RiskAlerts() {
    const [activeTab, setActiveTab] = useState('turnover');

    return (
        <>
            <div className="page-header">
                <h1>⚠️ Risk & Alerts</h1>
                <p>Monitor company risks, retention metrics, and system alerts in one unified view.</p>
            </div>

            <div className="tabs-container">
                <div className="tabs">
                    <button className={`tab-btn ${activeTab === 'turnover' ? 'active' : ''}`} onClick={() => setActiveTab('turnover')}>Turnover & Retention</button>
                    <button className={`tab-btn ${activeTab === 'absenteeism' ? 'active' : ''}`} onClick={() => setActiveTab('absenteeism')}>Absenteeism</button>
                    <button className={`tab-btn ${activeTab === 'alerts' ? 'active' : ''}`} onClick={() => setActiveTab('alerts')}>System Alerts</button>
                </div>
            </div>

            <div className="tab-content">
                {activeTab === 'turnover' && <TurnoverTab />}
                {activeTab === 'absenteeism' && <AbsenteeismTab />}
                {activeTab === 'alerts' && <AlertsTab />}
            </div>
        </>
    );
}
