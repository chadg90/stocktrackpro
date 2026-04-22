'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ClipboardList, Gauge, CalendarDays, UserCheck } from 'lucide-react';

const links = [
  { href: '/dashboard/fleet-report', label: 'Overview', icon: ClipboardList },
  { href: '/dashboard/fleet-report/mileage', label: 'Mileage & anomalies', icon: Gauge },
  { href: '/dashboard/fleet-report/week', label: 'This week', icon: CalendarDays },
  { href: '/dashboard/fleet-report/compliance', label: 'Who checked', icon: UserCheck },
];

export default function FleetReportSubnav() {
  const pathname = usePathname();

  return (
    <nav
      className="flex flex-wrap gap-2 mb-8 border-b border-zinc-200 dark:border-white/10 pb-4"
      aria-label="Fleet report sections"
    >
      {links.map(({ href, label, icon: Icon }) => {
        const isOverview = href === '/dashboard/fleet-report';
        const active = isOverview
          ? pathname === '/dashboard/fleet-report' || pathname === '/dashboard/fleet-report/'
          : pathname === href || pathname?.startsWith(`${href}/`);

        return (
          <Link
            key={href}
            href={href}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
              active
                ? 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/40'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 border-transparent dark:text-white/70 dark:hover:text-white dark:hover:bg-white/5'
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
