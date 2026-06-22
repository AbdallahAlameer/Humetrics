import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Users,
  Sparkles,
  TrendingUp,
  CalendarX,
  Upload,
  Settings,
  LifeBuoy,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const mainItems = [
  { n: "01", title: "Overview", url: "/", icon: LayoutDashboard },
  { n: "02", title: "Employees", url: "/employees", icon: Users },
  { n: "03", title: "Performance", url: "/performance", icon: TrendingUp },
  { n: "04", title: "Recommendations", url: "/recommendations", icon: Sparkles },
  { n: "05", title: "Risk & Alerts", url: "/risk-alerts", icon: CalendarX },
  { n: "06", title: "Upload Data", url: "/upload", icon: Upload },
];

const secondaryItems = [
  { title: "Settings", url: "/settings", icon: Settings },
  { title: "Help", url: "/help", icon: LifeBuoy },
];

export function AppSidebar() {
  const { user } = useAuth();
  const location = useLocation();
  const pathname = location.pathname;
  const isActive = (url: string) =>
    url === "/" ? pathname === "/" : pathname.startsWith(url);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-2 py-3">
          <img src="/logo.svg" alt="Humetrics" className="h-8 w-auto object-contain shrink-0" />
          <div className="flex flex-col leading-none justify-center group-data-[collapsible=icon]:hidden">
            <span className="font-display text-xl tracking-tight text-sidebar-foreground mt-1">
              Humetrics
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="font-mono text-xs uppercase tracking-widest text-sidebar-foreground/50 pb-2">
            The Desk
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-4">
              {mainItems
                .filter(item => !(user?.role !== 'hr' && item.url === '/upload'))
                .map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                    className="data-[active=true]:bg-sidebar-accent data-[active=true]:before:absolute data-[active=true]:before:left-0 data-[active=true]:before:top-1/2 data-[active=true]:before:h-5 data-[active=true]:before:w-[3px] data-[active=true]:before:-translate-y-1/2 data-[active=true]:before:bg-sidebar-primary relative"
                  >
                    <Link to={item.url} className="flex items-center gap-4 py-3">
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium tracking-tight text-base">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel className="font-mono text-xs uppercase tracking-widest text-sidebar-foreground/50 pb-2">
            Masthead
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-4">
              {secondaryItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <Link to={item.url} className="flex items-center gap-4 py-3">
                      <item.icon className="h-5 w-5" />
                      <span className="text-base">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-2 py-2 group-data-[collapsible=icon]:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-sidebar-accent font-display text-base text-sidebar-accent-foreground uppercase">
            {user?.full_name?.charAt(0) || "U"}
          </div>
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-sm font-medium text-sidebar-foreground">
              {user?.full_name || "User"}
            </span>
            <span className="truncate eyebrow text-sidebar-foreground/55">
              {user?.role === 'hr' ? 'HR Admin' : 'Manager'}
            </span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
