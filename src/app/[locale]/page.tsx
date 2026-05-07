'use client';
import { use, useState } from 'react';
import Link from 'next/link';
import { getTranslations, Locale } from '@/lib/translations';
import { testimonials } from '@/lib/data';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import { AnimatedCounter, FadeInView } from '@/components/Animations';
import { motion } from 'framer-motion';

export default function LandingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const loc = (locale === 'ar' ? 'ar' : 'en') as Locale;
  const t = getTranslations(loc);

  return (
    <>
      <Header locale={loc} />
      <main style={{ paddingTop: 'var(--header-height)' }}>
        <HeroSection t={t} locale={loc} />
        <StatsSection t={t} />
        <ServicesSection t={t} locale={loc} />
        <TrustSection t={t} />
        <TestimonialsSection t={t} locale={loc} />
        <FAQSection t={t} />
        <CTASection t={t} locale={loc} />
      </main>
      <Footer locale={loc} />
      <BottomNav locale={loc} />
      <WhatsAppFAB />
    </>
  );
}

function HeroSection({ t, locale }: { t: ReturnType<typeof getTranslations>; locale: Locale }) {
  const isAr = locale === 'ar';
  
  const heroFeatures = [
    { icon: '📄', title: isAr ? 'تتبع لحظي' : 'Live Tracking', desc: isAr ? 'تتبع شحنتك لحظة بلحظة مع تحديثات فورية' : 'Track your shipment step by step with live updates' },
    { icon: '🏷️', title: isAr ? 'أسعار شفافة' : 'Transparent Pricing', desc: isAr ? 'لا توجد رسوم مخفية، أسعار واضحة ومنافسة' : 'No hidden fees, clear and competitive prices' },
    { icon: '🎧', title: isAr ? 'دعم على مدار الساعة' : '24/7 Support', desc: isAr ? 'فريق دعم متخصص لخدمتك دائماً' : 'Dedicated support team always at your service' },
    { icon: '🛡️', title: isAr ? 'أمان وموثوقية' : 'Secure & Reliable', desc: isAr ? 'شحناتك في أمان مع شركائنا المعتمدين' : 'Your shipments are secure with our certified partners' },
  ];

  return (
    <section className="hero-gradient" style={{ minHeight: '90vh', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '120px 32px 180px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', display: 'flex', alignItems: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} style={{ maxWidth: 700 }}>
          <h1 style={{ fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 800, lineHeight: 1.2, marginBottom: 24, letterSpacing: '-0.02em' }}>
            {t.hero.headline.split(' ').map((word, i) => (
              <span key={i} style={{ color: i < 3 ? 'var(--text-primary)' : 'var(--primary-light)' }}>{word} </span>
            ))}
          </h1>
          <p style={{ fontSize: 18, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 40, maxWidth: 520 }}>
            {t.hero.description}
          </p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Link href={`/${locale}/request`} className="btn-primary" style={{ padding: '16px 36px', fontSize: 16, textDecoration: 'none' }}>
              {t.hero.ctaPrimary}
            </Link>
            <Link href={`/${locale}/tracking`} className="btn-secondary" style={{ padding: '16px 36px', fontSize: 16, textDecoration: 'none', background: 'rgba(0,102,255,0.05)', borderColor: 'rgba(0,102,255,0.3)' }}>
              {t.hero.ctaSecondary}
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Feature Cards overlapping the bottom */}
      <div style={{ width: '100%', marginTop: 80, padding: '0 16px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
          {heroFeatures.map((feature, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + (i * 0.1) }}
              className="glass-card" style={{ padding: 24, textAlign: 'center', background: 'rgba(5,16,36,0.5)', border: '1px solid rgba(0,102,255,0.2)' }}>
              <div style={{ fontSize: 28, marginBottom: 16, color: 'var(--primary)' }}>{feature.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: 'white' }}>{feature.title}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsSection({ t }: { t: ReturnType<typeof getTranslations> }) {
  const stats = [
    { value: 10000, label: t.stats.shipmentsDelivered, icon: '📦' },
    { value: 500, label: t.stats.happyClients, icon: '😊' },
    { value: 15, label: t.stats.countriesServed, icon: '🌍' },
    { value: 8, label: t.stats.yearsExperience, icon: '⭐' },
  ];
  return (
    <section style={{ padding: '60px 32px', background: 'var(--bg-surface)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
        {stats.map((s, i) => (
          <FadeInView key={i} delay={i * 0.1}>
            <div className="glass-card" style={{ padding: 28, textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>{s.icon}</div>
              <AnimatedCounter target={s.value} />
              <div style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 8 }}>{s.label}</div>
            </div>
          </FadeInView>
        ))}
      </div>
    </section>
  );
}

function ServicesSection({ t, locale }: { t: ReturnType<typeof getTranslations>; locale: Locale }) {
  const services = [
    { icon: '🇨🇳', title: t.services.importFromChina, desc: t.services.importFromChinaDesc },
    { icon: '🚢', title: t.services.seaFreight, desc: t.services.seaFreightDesc },
    { icon: '✈️', title: t.services.airFreight, desc: t.services.airFreightDesc },
    { icon: '📋', title: t.services.customsClearance, desc: t.services.customsClearanceDesc },
    { icon: '🏭', title: t.services.warehousing, desc: t.services.warehousingDesc },
    { icon: '🚚', title: t.services.doorDelivery, desc: t.services.doorDeliveryDesc },
  ];
  return (
    <section style={{ padding: '80px 32px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <FadeInView>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12 }}>{t.services.title}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>{t.services.subtitle}</p>
          </div>
        </FadeInView>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          {services.map((s, i) => (
            <FadeInView key={i} delay={i * 0.1}>
              <div className="glass-card" style={{ padding: 32, cursor: 'pointer' }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>{s.icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>{s.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.8 }}>{s.desc}</p>
              </div>
            </FadeInView>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrustSection({ t }: { t: ReturnType<typeof getTranslations> }) {
  const items = [
    { icon: '🛡️', title: t.trust.secureShipping, desc: t.trust.secureShippingDesc },
    { icon: '📍', title: t.trust.liveTracking, desc: t.trust.liveTrackingDesc },
    { icon: '💬', title: t.trust.whatsappSupport, desc: t.trust.whatsappSupportDesc },
    { icon: '✅', title: t.trust.verifiedUpdates, desc: t.trust.verifiedUpdatesDesc },
    { icon: '💰', title: t.trust.transparentPricing, desc: t.trust.transparentPricingDesc },
    { icon: '🔒', title: t.trust.damageCompensation, desc: t.trust.damageCompensationDesc },
  ];
  return (
    <section style={{ padding: '80px 32px', background: 'var(--bg-surface)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <FadeInView>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12 }}>{t.trust.title}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>{t.trust.subtitle}</p>
          </div>
        </FadeInView>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          {items.map((item, i) => (
            <FadeInView key={i} delay={i * 0.08}>
              <div className="glass-card" style={{ padding: 28, display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(0,122,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>{item.icon}</div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{item.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7 }}>{item.desc}</p>
                </div>
              </div>
            </FadeInView>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection({ t, locale }: { t: ReturnType<typeof getTranslations>; locale: Locale }) {
  const items = testimonials[locale];
  return (
    <section style={{ padding: '80px 32px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <FadeInView>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12 }}>{t.testimonials.title}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>{t.testimonials.subtitle}</p>
          </div>
        </FadeInView>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
          {items.map((item, i) => (
            <FadeInView key={i} delay={i * 0.1}>
              <div className="glass-card" style={{ padding: 28 }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                  {Array.from({ length: item.rating }).map((_, j) => (<span key={j} style={{ fontSize: 16 }}>⭐</span>))}
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.8, marginBottom: 20, fontStyle: 'italic' }}>&ldquo;{item.text}&rdquo;</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #0055CC)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 16 }}>{item.name[0]}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{item.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{item.role}</div>
                  </div>
                </div>
              </div>
            </FadeInView>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection({ t }: { t: ReturnType<typeof getTranslations> }) {
  const [open, setOpen] = useState<number | null>(null);
  const faqs = [
    { q: t.faq.q1, a: t.faq.a1 }, { q: t.faq.q2, a: t.faq.a2 },
    { q: t.faq.q3, a: t.faq.a3 }, { q: t.faq.q4, a: t.faq.a4 },
    { q: t.faq.q5, a: t.faq.a5 }, { q: t.faq.q6, a: t.faq.a6 },
  ];
  return (
    <section id="faq" style={{ padding: '80px 32px', background: 'var(--bg-surface)' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <FadeInView>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12 }}>{t.faq.title}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>{t.faq.subtitle}</p>
          </div>
        </FadeInView>
        <div className="glass-card" style={{ overflow: 'hidden', padding: '0 28px' }}>
          {faqs.map((faq, i) => (
            <div key={i} className="accordion-item">
              <button className="accordion-header" onClick={() => setOpen(open === i ? null : i)}>
                <span>{faq.q}</span>
                <span style={{ fontSize: 20, color: 'var(--primary)', transition: 'transform 0.3s', transform: open === i ? 'rotate(45deg)' : 'rotate(0)' }}>+</span>
              </button>
              <div className="accordion-content" style={{ maxHeight: open === i ? 200 : 0, padding: open === i ? '0 0 0 0' : 0 }}>
                <p>{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection({ t, locale }: { t: ReturnType<typeof getTranslations>; locale: Locale }) {
  return (
    <section style={{ padding: '80px 32px', textAlign: 'center' }}>
      <FadeInView>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 16 }}>{t.hero.ctaPrimary}</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 32, lineHeight: 1.8 }}>{t.hero.subheadline}</p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href={`/${locale}/request`} className="btn-primary" style={{ padding: '14px 36px', fontSize: 16, textDecoration: 'none' }}>{t.hero.ctaPrimary}</Link>
            <a href="https://wa.me/966501234567" className="btn-whatsapp" style={{ padding: '14px 36px', fontSize: 16, textDecoration: 'none' }}>💬 {t.hero.ctaExpert}</a>
          </div>
        </div>
      </FadeInView>
    </section>
  );
}

function WhatsAppFAB() {
  return (
    <a href="https://wa.me/966501234567?text=أهلاً شركة بن حبيب، لدي استفسار بخصوص استيراد شحنة من الصين..." className="whatsapp-fab" target="_blank" rel="noopener noreferrer">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.75.75 0 00.917.918l4.458-1.495A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.32 0-4.47-.766-6.203-2.06l-.435-.332-3.26 1.093 1.093-3.26-.332-.435A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
    </a>
  );
}
