'use client';
import { use } from 'react';
import { getTranslations, Locale } from '@/lib/translations';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import { FadeInView } from '@/components/Animations';

export default function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const loc = (locale === 'ar' ? 'ar' : 'en') as Locale;
  const isAr = loc === 'ar';

  return (
    <>
      <Header locale={loc} />
      <main style={{ paddingTop: 'calc(var(--header-height) + 60px)', minHeight: '100vh', padding: '140px 32px 100px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <FadeInView>
            <div style={{ textAlign: 'center', marginBottom: 60 }}>
              <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16 }}>{isAr ? 'تواصل معنا' : 'Contact Us'}</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: 18 }}>{isAr ? 'نحن هنا للإجابة على جميع استفساراتك وخدمتك بأفضل شكل' : 'We are here to answer all your inquiries and serve you best'}</p>
            </div>
          </FadeInView>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 30 }}>
            {/* Contact Info */}
            <FadeInView delay={0.2}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div className="glass-card" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ fontSize: 32 }}>📍</div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>{isAr ? 'العنوان' : 'Address'}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{isAr ? 'صنعاء، اليمن' : 'Sanaa, Yemen'}</div>
                  </div>
                </div>
                <div className="glass-card" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ fontSize: 32 }}>📞</div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>{isAr ? 'رقم الهاتف' : 'Phone Number'}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 14, direction: 'ltr' }}>+966 50 123 4567</div>
                  </div>
                </div>
                <div className="glass-card" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ fontSize: 32 }}>✉️</div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>{isAr ? 'البريد الإلكتروني' : 'Email'}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>info@smartship.com</div>
                  </div>
                </div>
                <a href="https://wa.me/966501234567" className="btn-primary" style={{ textDecoration: 'none', textAlign: 'center', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                  💬 {isAr ? 'تواصل عبر واتساب' : 'Contact via WhatsApp'}
                </a>
              </div>
            </FadeInView>

            {/* Contact Form */}
            <FadeInView delay={0.4}>
              <div className="glass-card" style={{ padding: 32 }}>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>{isAr ? 'أرسل لنا رسالة' : 'Send us a message'}</h3>
                <form style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, fontSize: 14 }}>{isAr ? 'الاسم الكامل' : 'Full Name'}</label>
                    <input type="text" className="input-field" placeholder={isAr ? 'أدخل اسمك' : 'Enter your name'} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, fontSize: 14 }}>{isAr ? 'البريد الإلكتروني' : 'Email Address'}</label>
                    <input type="email" className="input-field" placeholder={isAr ? 'أدخل بريدك الإلكتروني' : 'Enter your email'} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, fontSize: 14 }}>{isAr ? 'الرسالة' : 'Message'}</label>
                    <textarea className="input-field" rows={4} placeholder={isAr ? 'كيف يمكننا مساعدتك؟' : 'How can we help you?'} style={{ resize: 'vertical' }}></textarea>
                  </div>
                  <button type="button" className="btn-primary" style={{ marginTop: 8 }}>{isAr ? 'إرسال الرسالة' : 'Send Message'}</button>
                </form>
              </div>
            </FadeInView>
          </div>
        </div>
      </main>
      <Footer locale={loc} />
      <BottomNav locale={loc} />
    </>
  );
}
