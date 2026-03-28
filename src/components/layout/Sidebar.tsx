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
  LogOut,
  Sprout,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useAppStore } from "@/store/useAppStore";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { usePermission } from "@/hooks/usePermission";
import type { Resource } from "@/lib/utils/permissions";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  resource: Resource;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, resource: "dashboard" },
  { href: "/crm", label: "CRM", icon: Users, resource: "crm" },
  { href: "/conversations", label: "Conversas", icon: MessageSquare, resource: "conversations" },
  { href: "/email-marketing", label: "Email Marketing", icon: Mail, resource: "email_marketing" },
  { href: "/ads", label: "ADS", icon: Megaphone, resource: "ads" },
  { href: "/financial", label: "Financeiro", icon: DollarSign, resource: "financial" },
  { href: "/contracts", label: "Contratos", icon: FileText, resource: "contracts" },
  { href: "/settings", label: "Configurações", icon: Settings, resource: "settings" },
];

function NavItemComponent({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
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
        <div className={cn("flex items-center gap-2 px-3 py-4 border-b border-sidebar-border", !sidebarOpen && "justify-center")}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-sidebar-primary">
            <Sprout className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          {sidebarOpen && (
            <span className="text-sm font-semibold text-sidebar-foreground leading-tight">
              Target Agrotech<br />
              <span className="text-xs font-normal text-sidebar-foreground/60">CRM</span>
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <NavItemComponent key={item.href} item={item} collapsed={!sidebarOpen} />
          ))}
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
