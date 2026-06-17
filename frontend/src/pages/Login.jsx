import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/client';

export default function Login() {
    const { login, loading } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [department, setDepartment] = useState('');
    const [departments, setDepartments] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        API.get('/auth/departments')
            .then(res => setDepartments(res.data))
            .catch(err => console.error('Failed to load departments', err));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (username === 'manager' && !department) {
            setError('Please select a department');
            return;
        }
        const res = await login(username, password, department);
        if (res.success) navigate('/');
        else setError(res.error);
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <h1>HR Analytics</h1>
                <p className="subtitle">AI-Powered Workforce Intelligence Platform</p>

                {error && <div className="login-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Username</label>
                        <input
                            type="text" value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter username"
                            autoComplete="username"
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password" value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            autoComplete="current-password"
                        />
                    </div>
                    
                    {username === 'manager' && (
                        <div className="form-group">
                            <label>Department</label>
                            <select value={department} onChange={(e) => setDepartment(e.target.value)} required>
                                <option value="">Select a Department...</option>
                                {departments.map(d => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                <div className="demo-creds">
                    <h4>Demo Credentials</h4>
                    <p><strong>HR:</strong> <code>hr</code> / <code>hr123</code></p>
                    <p><strong>Manager:</strong> <code>manager</code> / <code>manager123</code></p>
                </div>
            </div>
        </div>
    );
}
