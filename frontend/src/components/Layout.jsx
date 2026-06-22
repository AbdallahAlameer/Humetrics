import { Outlet, useLocation } from 'react-router-dom';
import { AppShell } from './app-shell';

const pageMeta = {
  '/': { title: 'The Overview', subtitle: 'A live broadsheet of people, performance and pipeline.' },
  '/employees': { title: 'Employees', subtitle: 'Directory and organizational structure.' },
  '/performance': { title: 'Performance', subtitle: 'Review cycles and metrics.' },
  '/recommendations': { title: 'Recommendations', subtitle: 'AI-driven insights for HR action.' },
  '/risk-alerts': { title: 'Risk & Alerts', subtitle: 'Flight risks and compliance notices.' },
  '/upload': { title: 'Upload Data', subtitle: 'Ingest new employee datasets.' },
  '/settings': { title: 'Settings', subtitle: 'Application and notification preferences.' },
  '/help': { title: 'Help & Documentation', subtitle: 'AI explainability and platform guides.' },
};

export default function Layout() {
  const location = useLocation();
  const meta = pageMeta[location.pathname] || { title: 'Dashboard' };

  return (
    <AppShell title={meta.title} subtitle={meta.subtitle}>
      <Outlet />
    </AppShell>
  );
}
