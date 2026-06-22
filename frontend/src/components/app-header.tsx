import { useState, useEffect } from "react";
import { Bell, Search, Command } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import API from "../api/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
}

const issueDate = new Date().toLocaleDateString("en-US", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});

export function AppHeader({ title, subtitle }: AppHeaderProps) {
  const { user, logout } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/alerts/').then(r => setAlerts(r.data)).catch(console.error);
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-rule bg-paper/85 backdrop-blur-md">
      {/* Top control strip */}
      <div className="flex h-12 items-center gap-3 px-4 md:px-8 border-b border-rule/60">
        <SidebarTrigger className="-ml-1" />

        <div className="ml-auto flex items-center gap-2">

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-none">
                <Bell className="h-4 w-4" />
                {alerts.length > 0 && (
                  <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-rose-500" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 rounded-xl p-0 overflow-hidden shadow-xl border border-rule">
              <div className="p-4 border-b border-rule bg-paper/50">
                <h3 className="font-display text-xl leading-none text-ink">Notifications</h3>
                <p className="eyebrow text-muted-foreground mt-2">You have {alerts.length} unread alerts</p>
              </div>
              <div className="max-h-[300px] overflow-y-auto flex flex-col">
                {alerts.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">No new alerts</div>
                ) : (
                  alerts.slice(0, 5).map((alert: any) => {
                    const isHigh = alert.severity === 'high';
                    const isMedium = alert.severity === 'medium';
                    const bgColor = isHigh ? 'bg-rose-500' : isMedium ? 'bg-amber-500' : 'bg-emerald-500';
                    const textColor = isHigh ? 'text-rose-500' : isMedium ? 'text-amber-500' : 'text-emerald-500';
                    const shadow = isHigh ? 'shadow-[0_0_8px_rgba(244,63,94,0.6)]' : '';
                    const label = alert.type ? alert.type.replace(/_/g, ' ') : alert.severity;
                    
                    return (
                      <DropdownMenuItem key={alert.id} className="flex flex-col items-start gap-1 p-4 cursor-pointer border-b border-rule last:border-0 rounded-none focus:bg-accent/50">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`h-2 w-2 rounded-full ${bgColor} ${shadow}`} />
                          <span className={`font-mono text-[10px] uppercase tracking-widest ${textColor}`}>{label}</span>
                        </div>
                        <p className="font-medium text-sm text-ink">{alert.title}</p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{alert.message}</p>
                      </DropdownMenuItem>
                    );
                  })
                )}
              </div>
              <div className="p-2 border-t border-rule bg-paper/50">
                <Button variant="ghost" onClick={() => navigate('/risk-alerts#alerts')} className="w-full text-xs h-8 font-medium">View all notifications</Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 outline-none">
                <Avatar className="h-8 w-8 rounded-sm">
                  <AvatarFallback className="rounded-sm bg-ink font-display text-sm text-background">
                    {user?.full_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-none">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="font-display text-base leading-tight">{user?.full_name || "User"}</span>
                  <span className="eyebrow mt-1">{user?.role === 'hr' ? 'HR Admin' : 'Manager'}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Account settings</DropdownMenuItem>
              <DropdownMenuItem>Billing</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive cursor-pointer">
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Masthead */}
      <div className="px-4 md:px-8 py-5 flex items-end justify-between gap-6">
        <div className="min-w-0">
          <h1 className="font-display text-4xl md:text-5xl leading-[0.95] text-ink tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground italic font-display">
              — {subtitle}
            </p>
          )}
        </div>
      </div>
    </header>
  );
}
