'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/dashboard/fleet-report', label: 'Overview' },
  { href: '/dashboard/fleet-report/mileage', label: 'Mileage' },
  { href: '/dashboard/fleet-report/week', label: 'This week' },
  { href: '/dashboard/fleet-report/compliance', label: 'Who checked' },
];

export default function FleetReportSubnav() {
  const pathname = usePathname();

  return (
    <nav
      className="flex flex-wrap gap-x-1 mb-6 border-b border-zinc-200 dark:border-white/10"
      aria-label="Fleet report sections"
    >
      {links.map(({ href, label }) => {
        const isOverview = href === '/dashboard/fleet-report';
        const active = isOverview
          ? pathname === '/dashboard/fleet-report' || pathname === '/dashboard/fleet-report/'
          : pathname === href || pathname?.startsWith(`${href}/`);

        return (
          <Link
            key={href}
            href={href}
            className={`-mb-px inline-flex items-center px-3 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              active
                ? 'border-blue-600 text-blue-700 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-900 hover:border-zinc-300 dark:text-white/55 dark:hover:text-white dark:hover:border-white/20'
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
