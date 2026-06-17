import { useState, useEffect } from 'react';
import API from '../api/client';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

export default function Overview() {
    const [kpis, setKpis] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            API.get('/dashboard/overview'),
            API.get('/dashboard/departments'),
            API.get('/alerts/')
        ]).then(([kRes, dRes, aRes]) => {
            setKpis(kRes.data);
            
            // Sort departments by attrition rate descending for the risk chart
            const sortedDeps = [...dRes.data].sort((a, b) => b.attrition_rate - a.attrition_rate);
            setDepartments(sortedDeps);
            
            setAlerts(aRes.data);
        }).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="loading"><div className="spinner" /><span className="loading-text">Loading dashboard...</span></div>;

    const highSeverityAlerts = alerts.filter(a => a.severity === 'high').length;
    const attritionPct = (kpis.attrition_rate * 100).toFixed(1);
    const isHighAttrition = kpis.attrition_rate > 0.15;

    return (
        <div className="page-container fade-in">
            <div className="page-header">
                <h1>Executive Overview</h1>
                <p>High-level summary of company-wide HR metrics and department performance.</p>
            </div>

            <div className="kpi-grid">
                <div className="kpi-card kpi-blue">
                    <div className="kpi-icon">👥</div>
                    <div className="kpi-label">Total Headcount</div>
                    <div className="kpi-value">{kpis.total_employees?.toLocaleString()}</div>
                    <div className="kpi-sub">Active employees</div>
                </div>
                <div className={`kpi-card ${isHighAttrition ? 'kpi-red' : 'kpi-green'}`}>
                    <div className="kpi-icon">📉</div>
                    <div className="kpi-label">Overall Attrition Rate</div>
                    <div className="kpi-value">{attritionPct}%</div>
                    <div className="kpi-sub">{isHighAttrition ? 'Needs attention' : 'Healthy retention'}</div>
                </div>
                <div className="kpi-card kpi-amber">
                    <div className="kpi-icon">😊</div>
                    <div className="kpi-label">Avg Engagement Score</div>
                    <div className="kpi-value">{kpis.avg_engagement?.toFixed(2)}</div>
                    <div className="kpi-sub">Company-wide rating</div>
                </div>
                <div className="kpi-card kpi-purple">
                    <div className="kpi-icon">⭐</div>
                    <div className="kpi-label">Avg Performance Score</div>
                    <div className="kpi-value">{kpis.avg_performance?.toFixed(2)}</div>
                    <div className="kpi-sub">Out of 5.0</div>
                </div>
                <div className={`kpi-card ${highSeverityAlerts > 0 ? 'kpi-red' : 'kpi-green'}`}>
                    <div className="kpi-icon">⚠️</div>
                    <div className="kpi-label">Critical Alerts</div>
                    <div className="kpi-value">{highSeverityAlerts}</div>
                    <div className="kpi-sub">High-severity system alerts</div>
                </div>
            </div>

            <div className="chart-grid">
                <div className="chart-card">
                    <h3><span className="chart-icon">📊</span> Headcount by Department</h3>
                    <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={departments} layout="vertical" margin={{ left: 20 }}>
                            <XAxis type="number" stroke="var(--text-secondary)" fontSize={11} />
                            <YAxis dataKey="Department" type="category" stroke="var(--text-secondary)" fontSize={11} width={120} />
                            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: 8, color: 'var(--text-primary)' }} />
                            <Bar dataKey="headcount" fill="var(--accent-purple)" radius={[0, 9999, 9999, 0]} name="Headcount" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-card">
                    <h3><span className="chart-icon">🚨</span> Attrition Rate by Department</h3>
                    <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={departments} layout="vertical" margin={{ left: 20 }}>
                            <XAxis type="number" stroke="var(--text-secondary)" fontSize={11} unit="%" />
                            <YAxis dataKey="Department" type="category" stroke="var(--text-secondary)" fontSize={11} width={120} />
                            <Tooltip 
                                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: 12, color: 'var(--text-primary)' }} 
                                formatter={(value) => [`${(value * 100).toFixed(1)}%`, 'Attrition Rate']}
                            />
                            <Bar dataKey="attrition_rate" radius={[0, 9999, 9999, 0]}>
                                {departments.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.attrition_rate > 0.15 ? 'var(--accent-red)' : entry.attrition_rate > 0.10 ? 'var(--accent-amber)' : 'var(--accent-green)'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="chart-card">
                <h3><span className="chart-icon">💼</span> Department Summary</h3>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Department Name</th>
                            <th>Headcount</th>
                            <th>Attrition Rate</th>
                            <th>Avg Salary</th>
                            <th>Avg Engagement</th>
                            <th>Avg Performance</th>
                        </tr>
                    </thead>
                    <tbody>
                        {departments.map((d) => {
                            const attrPct = (d.attrition_rate * 100).toFixed(1);
                            let attrBadgeClass = 'badge-low';
                            if (d.attrition_rate > 0.15) attrBadgeClass = 'badge-high';
                            else if (d.attrition_rate > 0.10) attrBadgeClass = 'badge-medium';

                            return (
                                <tr key={d.Department}>
                                    <td><strong>{d.Department}</strong></td>
                                    <td>{d.headcount}</td>
                                    <td>
                                        <span className={`badge ${attrBadgeClass}`}>
                                            {attrPct}%
                                        </span>
                                    </td>
                                    <td>${(d.avg_salary / 1000).toFixed(0)}K</td>
                                    <td>{d.avg_engagement?.toFixed(2)}</td>
                                    <td>{d.avg_performance?.toFixed(2)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
