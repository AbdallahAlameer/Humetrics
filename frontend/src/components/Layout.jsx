import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = [
    {
        section: 'Overview', items: [
            { to: '/', icon: '📊', label: 'Executive Overview' },
        ]
    },
    {
        section: 'Insights', items: [
            { to: '/performance', icon: '⭐', label: 'Performance' },
            { to: '/recommendations', icon: '💡', label: 'Recommendations' },
            { to: '/risk-alerts', icon: '⚠️', label: 'Risk & Alerts' },
        ]
    },
    {
        section: 'System', items: [
            { to: '/employees', icon: '👥', label: 'Employees' },
            { to: '/upload', icon: '📤', label: 'Upload Data' },
        ]
    },
];

export default function Layout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => { logout(); navigate('/login'); };

    return (
        <div className="app-layout">
            <aside className="sidebar">
                <div className="sidebar-brand">
                    <div className="sidebar-brand-icon">📊</div>
                    <div>
                        <h2>HR Analytics</h2>
                        <span>AI-Powered Platform</span>
                    </div>
                </div>

                <div className="sidebar-user" style={{ marginTop: 0, marginBottom: 24, padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '20px', border: '1px solid var(--border-glass)' }}>
                    <div className="sidebar-user-avatar">
                        {user?.full_name?.charAt(0) || 'U'}
                    </div>
                    <div className="sidebar-user-info">
                        <div className="name">{user?.full_name}</div>
                        <div className="role" style={{ color: 'var(--accent-blue)' }}>PRO</div>
                    </div>
                    <button className="sidebar-logout" onClick={handleLogout} title="Logout">
                        ⏻
                    </button>
                </div>

                {NAV.map((sec) => {
                    const items = sec.items.filter(item => user?.role === 'hr' || item.to !== '/upload');
                    if (items.length === 0) return null;
                    return (
                        <div className="sidebar-section" key={sec.section}>
                            <div className="sidebar-section-title">{sec.section}</div>
                            {items.map((item) => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    end={item.to === '/'}
                                    className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
                                >
                                    <span className="icon">{item.icon}</span>
                                    {item.label}
                                </NavLink>
                            ))}
                        </div>
                    );
                })}

            </aside>

            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
}
