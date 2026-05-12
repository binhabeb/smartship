'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getTranslations, Locale } from '@/lib/translations';

export default function BottomNav({ locale }: { locale: Locale }) {
  const t = getTranslations(locale);
  const pathname = usePathname();

  const items = [
    { href: `/${locale}`, label: t.nav.home, icon: '🏠', key: 'home' },
    { href: `/${locale}/tracking`, label: t.nav.tracking, icon: '📍', key: 'tracking' },
    { href: `/${locale}/calculator`, label: t.common.calculator, icon: '🧮', key: 'calculator' },
    { href: `/${locale}/request`, label: t.nav.newRequest, icon: '➕', key: 'request' },
    { href: `/${locale}/about`, label: t.nav.more, icon: '⋯', key: 'more' },
  ];

  return (
    <nav className="bottom-nav mobile-only">
      {items.map(item => {
        const isActive = pathname === item.href;
        const isCenter = item.key === 'calculator';
        return (
          <Link key={item.key} href={item.href} className={`bottom-nav-item ${isActive ? 'active' : ''}`} style={{ textDecoration: 'none' }}>
            <span className={`bottom-nav-icon ${isCenter ? 'active-icon' : ''}`} style={{ fontSize: isCenter ? 18 : 20 }}>
              {item.icon}
            </span>
            <span style={{ fontSize: '10px', marginTop: isCenter ? '12px' : '0' }}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
