import { useState, useEffect } from 'react';
import API from '../api/client';

export default function Employees() {
    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [search, setSearch] = useState('');
    const [dept, setDept] = useState('');
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        API.get('/employees/departments').then((r) => setDepartments(r.data));
    }, []);

    useEffect(() => {
        setLoading(true);
        const params = {};
        if (search) params.search = search;
        if (dept) params.department = dept;
        API.get('/employees/', { params })
            .then((r) => setEmployees(r.data))
            .finally(() => setLoading(false));
    }, [search, dept]);

    return (
        <>
            <div className="page-header">
                <h1>👥 Employee Directory</h1>
                <p>Browse and search the workforce</p>
            </div>

            <div className="card" style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <input
                        type="text" placeholder="Search by ID, name, or title..."
                        value={search} onChange={(e) => setSearch(e.target.value)}
                        style={{
                            flex: 1, minWidth: 200, padding: '10px 16px', borderRadius: 10,
                            border: '1px solid var(--border-glass)', background: 'rgba(255,255,255,0.04)',
                            color: 'var(--text-primary)', fontSize: 14, fontFamily: 'inherit', outline: 'none',
                        }}
                    />
                    <select value={dept} onChange={(e) => setDept(e.target.value)} style={{
                        padding: '10px 16px', borderRadius: 10,
                        border: '1px solid var(--border-glass)', background: 'var(--bg-secondary)',
                        color: 'var(--text-primary)', fontSize: 14, fontFamily: 'inherit',
                    }}>
                        <option value="">All Departments</option>
                        {departments.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
            </div>

            {/* Employee detail modal */}
            {selected && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
                }} onClick={() => setSelected(null)}>
                    <div className="card" style={{ maxWidth: 600, width: '90%', maxHeight: '80vh', overflow: 'auto' }} onClick={(e) => e.stopPropagation()}>
                        <div className="flex-between" style={{ marginBottom: 20 }}>
                            <h2>{selected.EmployeeID}</h2>
                            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 24, cursor: 'pointer' }}>✕</button>
                        </div>
                        <table className="data-table">
                            <tbody>
                                {Object.entries(selected).map(([k, v]) => (
                                    <tr key={k}>
                                        <td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{k}</td>
                                        <td>{typeof v === 'number' ? (Number.isInteger(v) ? v : v.toFixed(3)) : String(v)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="loading"><div className="spinner" /><span className="loading-text">Loading...</span></div>
            ) : (
                <div className="chart-card">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Employee ID</th><th>Department</th><th>Job Title</th>
                                <th>Gender</th><th>Salary</th><th>Tenure</th><th>Rating</th><th>Attrition</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map((e) => (
                                <tr key={e.EmployeeID} onClick={() => setSelected(e)} style={{ cursor: 'pointer' }}>
                                    <td><strong className="text-blue">{e.EmployeeID}</strong></td>
                                    <td>{e.Department}</td>
                                    <td>{e.JobTitle}</td>
                                    <td>{e.Gender}</td>
                                    <td>${(e.Salary / 1000).toFixed(0)}K</td>
                                    <td>{e.TenureYears}y</td>
                                    <td>{e.PerformanceRating}</td>
                                    <td>
                                        <span className={`badge ${e.AttritionFlag ? 'badge-high' : 'badge-low'}`}>
                                            {e.AttritionFlag ? 'Left' : 'Active'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
}
