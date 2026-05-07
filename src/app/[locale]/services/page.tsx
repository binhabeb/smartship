'use client';
import { use } from 'react';
import { getTranslations, Locale } from '@/lib/translations';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import { FadeInView } from '@/components/Animations';

export default function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const loc = (locale === 'ar' ? 'ar' : 'en') as Locale;
  const t = getTranslations(loc);

  const services = [
    { icon: '🇨🇳', title: t.services.importFromChina, desc: t.services.importFromChinaDesc, color: '#FF3B30' },
    { icon: '🚢', title: t.services.seaFreight, desc: t.services.seaFreightDesc, color: '#007AFF' },
    { icon: '✈️', title: t.services.airFreight, desc: t.services.airFreightDesc, color: '#AF52DE' },
    { icon: '📋', title: t.services.customsClearance, desc: t.services.customsClearanceDesc, color: '#FF9500' },
    { icon: '🏭', title: t.services.warehousing, desc: t.services.warehousingDesc, color: '#34C759' },
    { icon: '🚚', title: t.services.doorDelivery, desc: t.services.doorDeliveryDesc, color: '#007AFF' },
  ];

  return (
    <>
      <Header locale={loc} />
      <main style={{ paddingTop: 'calc(var(--header-height) + 60px)', minHeight: '100vh', padding: '140px 32px 100px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <FadeInView>
            <div style={{ textAlign: 'center', marginBottom: 60 }}>
              <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16 }}>{t.services.title}</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: 18, maxWidth: 600, margin: '0 auto' }}>{t.services.subtitle}</p>
            </div>
          </FadeInView>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
            {services.map((s, i) => (
              <FadeInView key={i} delay={i * 0.1}>
                <div className="glass-card" style={{ padding: 36, cursor: 'pointer', borderTop: `3px solid ${s.color}` }}>
                  <div style={{ fontSize: 48, marginBottom: 20 }}>{s.icon}</div>
                  <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>{s.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.9 }}>{s.desc}</p>
                </div>
              </FadeInView>
            ))}
          </div>
        </div>
      </main>
      <Footer locale={loc} />
      <BottomNav locale={loc} />
    </>
  );
}
