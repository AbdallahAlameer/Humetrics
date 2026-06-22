import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import API from '../api/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Login() {
    const { login, loading } = useAuth();
    const { landingPage } = usePreferences();
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
        if (res.success) {
            const landingPath = landingPage === 'overview' ? '/' : `/${landingPage}`;
            navigate(landingPath);
        } else {
            setError(res.error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative grain">
            <div className="absolute inset-0 bg-background bg-[radial-gradient(1200px_600px_at_100%_-10%,color-mix(in_oklab,var(--primary)_8%,transparent),transparent_60%)] opacity-50" />

            <div className="w-full max-w-md bg-paper border border-rule p-10 rise relative z-10 shadow-2xl">
                <header className="mb-10 text-center flex flex-col items-center">
                    <img src="/logo.svg" alt="Humetrics Logo" className="h-50 mb-4 object-contain" />
                    <h1 className="font-display text-4xl leading-tight text-ink">Humetrics</h1>
                    <p className="mt-2 text-sm text-muted-foreground italic font-display">HR Analytics Platform</p>
                </header>

                {error && (
                    <div className="mb-6 p-4 border border-destructive/30 bg-destructive/10 text-destructive text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="eyebrow text-ink">User identification</label>
                        <Input
                            type="text" value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter username"
                            autoComplete="username"
                            className="bg-background rounded-none border-rule focus-visible:ring-0 focus-visible:border-primary font-mono text-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="eyebrow text-ink">Passcode</label>
                        <Input
                            type="password" value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            autoComplete="current-password"
                            className="bg-background rounded-none border-rule focus-visible:ring-0 focus-visible:border-primary font-mono text-sm"
                        />
                    </div>

                    {username === 'manager' && (
                        <div className="space-y-2">
                            <label className="eyebrow text-ink">Department Desk</label>
                            <select
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                                required
                                className="flex h-10 w-full bg-background px-3 py-2 text-sm border border-rule rounded-none focus:outline-none focus:border-primary font-mono"
                            >
                                <option value="">Select a Department...</option>
                                {departments.map(d => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-none bg-ink text-background hover:bg-ink/90 mt-4"
                    >
                        {loading ? 'Authenticating...' : 'Access Records'}
                    </Button>
                </form>

                <div className="mt-10 pt-6 border-t border-rule/50">
                    <h4 className="font-numeric text-[10px] uppercase tracking-widest text-muted-foreground mb-3">Demo Credentials</h4>
                    <div className="space-y-2 font-mono text-xs text-muted-foreground">
                        <p><span className="text-ink">HR:</span> hr / hr123</p>
                        <p><span className="text-ink">Manager:</span> manager / manager123</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
