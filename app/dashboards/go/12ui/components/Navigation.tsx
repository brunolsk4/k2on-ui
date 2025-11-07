"use client"
import { LayoutDashboard, Users, UserX, ListChecks } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const base = "/dashboards/go/12";
const navItems = [
  { title: "Executivo", url: base, icon: LayoutDashboard },
  { title: "Leads Ativos", url: `${base}/leads-ativos`, icon: Users },
  { title: "Leads Perdidos", url: `${base}/leads-perdidos`, icon: UserX },
  { title: "Atividades", url: `${base}/atividades`, icon: ListChecks },
];

export function Navigation() {
  const pathname = usePathname();
  const sp = useSearchParams();
  const id = sp?.get('id');
  return (
    <nav className="flex gap-1 border-b border-border justify-center">
      {navItems.map((item) => {
        const isActive = pathname === item.url || pathname?.endsWith(item.url)
        const cls = `flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
          isActive ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"}`
        return (
          <Link key={item.title} href={id ? `${item.url}?id=${id}` : item.url} className={cls}>
            <item.icon className="h-4 w-4" />
            <span>{item.title}</span>
          </Link>
        )
      })}
    </nav>
  );
}
