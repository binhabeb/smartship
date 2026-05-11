'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { getTranslations, Locale } from '@/lib/translations';
import { motion, AnimatePresence } from 'framer-motion';
import Calculator from '@/components/Calculator';
import { Calculator as CalcIcon } from 'lucide-react';

export default function Header({ locale }: { locale: Locale }) {
  const t = getTranslations(locale);
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [calcOpen, setCalcOpen] = useState(false);
  const isAr = locale === 'ar';
  const otherLocale = isAr ? 'en' : 'ar';
  const switchedPath = pathname.replace(`/${locale}`, `/${otherLocale}`);

  const navLinks = [
    { href: `/${locale}`, label: t.nav.home },
    { href: `/${locale}/services`, label: t.nav.services },
    { href: `/${locale}/about`, label: t.nav.about },
    { href: `/${locale}/tracking`, label: t.nav.tracking },
    { href: `/${locale}/request`, label: t.nav.request },
  ];

  return (
    <header className="glass-panel" style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      height: 'var(--header-height)', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', padding: '0 32px',
    }}>
      {/* Logo */}
      <Link href={`/${locale}`} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
        <Image src="/logo.png" alt="Bin Habeb Logo" width={120} height={40} style={{ height: 40, width: 'auto', objectFit: 'contain' }} priority />
      </Link>

      {/* Desktop Nav */}
      <nav className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {navLinks.map(link => {
          const active = pathname === link.href || (link.href !== `/${locale}` && pathname.startsWith(link.href));
          return (
            <Link key={link.href} href={link.href} style={{
              padding: '8px 16px', borderRadius: 'var(--radius-md)',
              color: active ? 'var(--primary)' : 'var(--text-secondary)',
              textDecoration: 'none', fontSize: 14, fontWeight: 500,
              background: active ? 'rgba(0,122,255,0.1)' : 'transparent',
              transition: 'all var(--transition-fast)',
            }}>{link.label}</Link>
          );
        })}
      </nav>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Language Toggle */}
        <Link href={switchedPath || `/${otherLocale}`} style={{
          padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
          background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
          color: 'var(--text-primary)', textDecoration: 'none',
          transition: 'all var(--transition-fast)', display: 'flex', alignItems: 'center', gap: 6,
        }}>
          🌐 {isAr ? 'EN' : 'عربي'}
        </Link>

        {/* Calculator */}
        <button onClick={() => setCalcOpen(true)} style={{
          padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
          background: 'var(--primary)', color: 'white', border: 'none',
          display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
        }}>
          <CalcIcon size={16} /> <span className="desktop-only">{t.common?.calculator || 'Calculator'}</span>
        </button>

        {/* Admin Login */}
        <Link href={`/${locale}/admin/login`} className="desktop-only btn-secondary" style={{
          padding: '8px 18px', fontSize: 13, textDecoration: 'none',
        }}>
          {t.nav.adminLogin}
        </Link>

        {/* Mobile Hamburger */}
        <button className="mobile-only" onClick={() => setMenuOpen(!menuOpen)} style={{
          background: 'none', border: 'none', color: 'var(--text-primary)',
          cursor: 'pointer', padding: 8, fontSize: 24,
        }}>
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'absolute', top: 'var(--header-height)', left: 0, right: 0,
              background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(20px)',
              borderBottom: '1px solid var(--glass-border)', padding: '16px 24px',
              display: 'flex', flexDirection: 'column', gap: 4,
            }}
          >
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} style={{
                padding: '14px 16px', borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)', textDecoration: 'none',
                fontSize: 16, fontWeight: 500, display: 'block',
              }}>{link.label}</Link>
            ))}
            <Link href={`/${locale}/admin/login`} onClick={() => setMenuOpen(false)} style={{
              padding: '14px 16px', borderRadius: 'var(--radius-md)',
              color: 'var(--primary)', textDecoration: 'none',
              fontSize: 16, fontWeight: 500, display: 'block',
            }}>{t.nav.adminLogin}</Link>
          </motion.div>
        )}
      </AnimatePresence>

      <Calculator locale={locale} isOpen={calcOpen} onClose={() => setCalcOpen(false)} />
    </header>
  );
}
