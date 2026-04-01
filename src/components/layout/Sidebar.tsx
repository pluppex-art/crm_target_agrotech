"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Mail,
  Megaphone,
  DollarSign,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LogOut,
  Sprout,
  TrendingUp,
  BarChart3,
  Briefcase,
  GitBranch,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useAppStore } from "@/store/useAppStore";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { usePermission } from "@/hooks/usePermission";
import { useEffect } from "react";
import type { Resource } from "@/lib/utils/permissions";

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavItemDef {
  type: "item";
  href: string;
  label: string;
  icon: React.ElementType;
  resource: Resource;
}

interface NavGroupDef {
  type: "group";
  id: string;
  label: string;
  icon: React.ElementType;
  resource: Resource;
  children: Array<{ href: string; label: string; icon: React.ElementType }>;
}

type NavEntry = NavItemDef | NavGroupDef;

// ─── Navigation config ────────────────────────────────────────────────────────

const NAV_ENTRIES: NavEntry[] = [
  {
    type: "group",
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    resource: "dashboard",
    children: [
      { href: "/dashboard", label: "Dashboard de Vendas", icon: TrendingUp },
      { href: "/dashboard/financeiro", label: "Dashboard Financeiro", icon: BarChart3 },
    ],
  },
  {
    type: "group",
    id: "vendas",
    label: "Vendas",
    icon: Briefcase,
    resource: "crm",
    children: [
      { href: "/crm", label: "Pipeline", icon: GitBranch },
      { href: "/crm/list", label: "Clientes / Leads", icon: Users },
    ],
  },
  { type: "item", href: "/conversations", label: "Conversas", icon: MessageSquare, resource: "conversations" },
  { type: "item", href: "/email-marketing", label: "Email Marketing", icon: Mail, resource: "email_marketing" },
  { type: "item", href: "/ads", label: "ADS", icon: Megaphone, resource: "ads" },
  { type: "item", href: "/financial", label: "Financeiro", icon: DollarSign, resource: "financial" },
  { type: "item", href: "/contracts", label: "Contratos", icon: FileText, resource: "contracts" },
  { type: "item", href: "/settings", label: "Configurações", icon: Settings, resource: "settings" },
];

// ─── NavItem (leaf) ───────────────────────────────────────────────────────────

function NavItemComponent({ item, collapsed }: { item: NavItemDef; collapsed: boolean }) {
  const pathname = usePathname();
  const allowed = usePermission(item.resource, "view");
  const isActive = pathname.startsWith(item.href);

  if (!allowed) return null;

  const link = (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
        isActive
          ? "bg-sidebar-primary text-sidebar-primary-foreground"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      )}
    >
      <item.icon className="h-5 w-5 shrink-0" />
      {!collapsed && <span>{item.label}</span>}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right">{item.label}</TooltipContent>
      </Tooltip>
    );
  }

  return link;
}

// ─── NavGroup (expandable) ────────────────────────────────────────────────────

function NavGroupComponent({ group, collapsed }: { group: NavGroupDef; collapsed: boolean }) {
  const pathname = usePathname();
  const allowed = usePermission(group.resource, "view");
  const { expandedGroups, toggleGroup, setGroupExpanded, setSidebarOpen } = useAppStore();
  const isExpanded = expandedGroups.includes(group.id);
  const hasActiveChild = group.children.some(
    (c) => pathname === c.href || pathname.startsWith(c.href + "/")
  );

  // Auto-expand when navigating to a child route
  useEffect(() => {
    if (hasActiveChild) {
      setGroupExpanded(group.id, true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (!allowed) return null;

  // Collapsed mode: icon only, click opens sidebar + expands group
  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => {
              setSidebarOpen(true);
              setGroupExpanded(group.id, true);
            }}
            className={cn(
              "flex w-full items-center justify-center rounded-md px-3 py-2.5 transition-colors",
              hasActiveChild
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <group.icon className="h-5 w-5 shrink-0" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">{group.label}</TooltipContent>
      </Tooltip>
    );
  }

  // Expanded sidebar mode
  return (
    <div>
      <button
        onClick={() => toggleGroup(group.id)}
        className={cn(
          "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
          hasActiveChild
            ? "text-sidebar-foreground"
            : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        )}
      >
        <group.icon className="h-5 w-5 shrink-0" />
        <span className="flex-1 text-left">{group.label}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 transition-transform duration-200",
            isExpanded && "rotate-180"
          )}
        />
      </button>

      {isExpanded && (
        <div className="mt-0.5 mb-0.5 ml-5 space-y-0.5 pl-3 border-l border-sidebar-border/40">
          {group.children.map((child) => {
            const isActive = pathname === child.href || pathname.startsWith(child.href + "/");
            return (
              <Link
                key={child.href}
                href={child.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <child.icon className="h-4 w-4 shrink-0" />
                <span>{child.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useAppStore();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "flex flex-col bg-sidebar-background border-r border-sidebar-border transition-all duration-300",
          sidebarOpen ? "w-60" : "w-16"
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            "flex items-center gap-2 px-3 py-4 border-b border-sidebar-border",
            !sidebarOpen && "justify-center"
          )}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-sidebar-primary">
            <Sprout className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          {sidebarOpen && (
            <span className="text-sm font-semibold text-sidebar-foreground leading-tight">
              Target Agrotech
              <br />
              <span className="text-xs font-normal text-sidebar-foreground/60">CRM</span>
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
          {NAV_ENTRIES.map((entry) =>
            entry.type === "group" ? (
              <NavGroupComponent key={entry.id} group={entry} collapsed={!sidebarOpen} />
            ) : (
              <NavItemComponent key={entry.href} item={entry} collapsed={!sidebarOpen} />
            )
          )}
        </nav>

        {/* Bottom actions */}
        <div className="border-t border-sidebar-border px-2 py-3 space-y-0.5">
          <button
            onClick={handleLogout}
            className={cn(
              "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              !sidebarOpen && "justify-center"
            )}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {sidebarOpen && <span>Sair</span>}
          </button>

          <button
            onClick={toggleSidebar}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            {sidebarOpen ? (
              <>
                <ChevronLeft className="h-5 w-5 shrink-0" />
                <span>Recolher</span>
              </>
            ) : (
              <ChevronRight className="h-5 w-5 shrink-0 mx-auto" />
            )}
          </button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
