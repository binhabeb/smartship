'use client';
import { use } from 'react';
import { getTranslations, Locale } from '@/lib/translations';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import { FadeInView, AnimatedCounter } from '@/components/Animations';

export default function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const loc = (locale === 'ar' ? 'ar' : 'en') as Locale;
  const t = getTranslations(loc);

  return (
    <>
      <Header locale={loc} />
      <main style={{ paddingTop: 'calc(var(--header-height) + 60px)', minHeight: '100vh', padding: '140px 32px 100px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <FadeInView>
            <div style={{ textAlign: 'center', marginBottom: 60 }}>
              <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16 }}>{t.about.title}</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: 18 }}>{t.about.subtitle}</p>
            </div>
          </FadeInView>
          <FadeInView delay={0.2}>
            <div className="glass-card" style={{ padding: 40, marginBottom: 40 }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: 16, lineHeight: 2 }}>{t.about.description}</p>
            </div>
          </FadeInView>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 40 }}>
            <FadeInView delay={0.3}>
              <div className="glass-card" style={{ padding: 32, borderTop: '3px solid var(--primary)' }}>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>🎯 {t.about.mission}</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>{t.about.missionDesc}</p>
              </div>
            </FadeInView>
            <FadeInView delay={0.4}>
              <div className="glass-card" style={{ padding: 32, borderTop: '3px solid var(--success)' }}>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>🔭 {t.about.vision}</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>{t.about.visionDesc}</p>
              </div>
            </FadeInView>
          </div>
          {/* Route visualization */}
          <FadeInView delay={0.5}>
            <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, fontSize: 48, flexWrap: 'wrap', direction: 'ltr' }}>
                <span>🇾🇪</span>
                <span style={{ color: 'var(--primary)', fontSize: 24 }}>←</span>
                <span>📋</span>
                <span style={{ color: 'var(--primary)', fontSize: 24 }}>←</span>
                <span>🚢</span>
                <span style={{ color: 'var(--primary)', fontSize: 24 }}>←</span>
                <span>📦</span>
                <span style={{ color: 'var(--primary)', fontSize: 24 }}>←</span>
                <span>🇨🇳</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', marginTop: 20, fontSize: 15 }}>
                {loc === 'ar' ? 'شراء ← تجميع ← شحن ← تخليص ← استلام' : 'Purchase → Consolidate → Ship → Customs → Deliver'}
              </p>
            </div>
          </FadeInView>
        </div>
      </main>
      <Footer locale={loc} />
      <BottomNav locale={loc} />
    </>
  );
}
