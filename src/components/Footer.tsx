'use client';
import Link from 'next/link';
import Image from 'next/image';
import { getTranslations, Locale } from '@/lib/translations';
import { useState } from 'react';
import Calculator from '@/components/Calculator';

export default function Footer({ locale }: { locale: Locale }) {
  const t = getTranslations(locale);
  const [calcOpen, setCalcOpen] = useState(false);
  return (
    <footer className="desktop-only" style={{
      background: 'var(--bg-surface)', borderTop: '1px solid var(--glass-border)',
      padding: '60px 32px 24px',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 40 }}>
        {/* Brand */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Image src="/logo.png" alt="Bin Habeb Logo" width={144} height={48} style={{ height: 48, width: 'auto', objectFit: 'contain' }} />
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.8 }}>{t.footer.brandDesc}</p>
          <p style={{ color: 'var(--text-tertiary)', fontSize: 12, marginTop: 12 }}>{t.footer.poweredBy}</p>
        </div>
        {/* Quick Links */}
        <div>
          <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20, color: 'var(--text-primary)' }}>{t.footer.quickLinks}</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Link href={`/${locale}/request`} style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 14 }}>{t.nav.request}</Link>
            <Link href={`/${locale}/tracking`} style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 14 }}>{t.nav.tracking}</Link>
            <Link href={`/${locale}/services`} style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 14 }}>{t.nav.services}</Link>
            <Link href={`/${locale}/about`} style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 14 }}>{t.nav.about}</Link>
            <button onClick={() => setCalcOpen(true)} style={{ color: 'var(--primary)', background: 'none', border: 'none', padding: 0, margin: 0, textAlign: 'left', fontSize: 14, cursor: 'pointer' }}>
              {t.common?.calculator || 'Calculator'}
            </button>
          </div>
        </div>
        {/* Support */}
        <div>
          <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20, color: 'var(--text-primary)' }}>{t.footer.support}</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Link href={`/${locale}/contact`} style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 14 }}>{t.footer.contactUs}</Link>
            <Link href={`/${locale}/#faq`} style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 14 }}>{t.footer.faqLink}</Link>
            <Link href={`/${locale}/privacy`} style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 14 }}>{t.footer.privacy}</Link>
            <Link href={`/${locale}/terms`} style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 14 }}>{t.footer.terms}</Link>
          </div>
        </div>
        {/* Social */}
        <div>
          <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20, color: 'var(--text-primary)' }}>{t.footer.social}</h4>
          <div style={{ display: 'flex', gap: 12 }}>
            {['𝕏', 'in', 'f', '📸'].map((icon, i) => (
              <a key={i} href="#" style={{
                width: 40, height: 40, borderRadius: '50%',
                background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 14,
                transition: 'all var(--transition-fast)',
              }}>{icon}</a>
            ))}
          </div>
        </div>
      </div>
      {/* Bottom */}
      <div style={{
        maxWidth: 1200, margin: '40px auto 0', paddingTop: 24,
        borderTop: '1px solid var(--glass-border)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
      }}>
        <span style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>{t.footer.copyright}</span>
        <span style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>{t.footer.designedWith}</span>
      </div>
      <Calculator locale={locale} isOpen={calcOpen} onClose={() => setCalcOpen(false)} />
    </footer>
  );
}
