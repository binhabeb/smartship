'use client';
import { use } from 'react';
import { Locale } from '@/lib/translations';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import { FadeInView } from '@/components/Animations';

export default function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const loc = (locale === 'ar' ? 'ar' : 'en') as Locale;
  const isAr = loc === 'ar';

  return (
    <>
      <Header locale={loc} />
      <main style={{ paddingTop: 'calc(var(--header-height) + 60px)', minHeight: '100vh', padding: '140px 32px 100px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <FadeInView>
            <div style={{ textAlign: 'center', marginBottom: 60 }}>
              <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16 }}>{isAr ? 'سياسة الخصوصية' : 'Privacy Policy'}</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>{isAr ? 'آخر تحديث: مايو 2026' : 'Last updated: May 2026'}</p>
            </div>
          </FadeInView>

          <FadeInView delay={0.2}>
            <div className="glass-card" style={{ padding: 40, display: 'flex', flexDirection: 'column', gap: 24, lineHeight: 1.8 }}>
              <section>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)', marginBottom: 12 }}>{isAr ? '1. جمع المعلومات' : '1. Information Collection'}</h2>
                <p style={{ color: 'var(--text-secondary)' }}>
                  {isAr 
                    ? 'نقوم بجمع المعلومات الشخصية التي تقدمها لنا طواعية عند تسجيل حساب، أو تقديم طلب استيراد، أو التواصل معنا. قد تشمل هذه المعلومات الاسم، البريد الإلكتروني، رقم الهاتف، وعنوان الشحن.'
                    : 'We collect personal information that you voluntarily provide to us when registering an account, submitting an import request, or contacting us. This information may include your name, email, phone number, and shipping address.'}
                </p>
              </section>

              <section>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)', marginBottom: 12 }}>{isAr ? '2. استخدام المعلومات' : '2. Use of Information'}</h2>
                <p style={{ color: 'var(--text-secondary)' }}>
                  {isAr 
                    ? 'نستخدم معلوماتك لمعالجة طلباتك، وإدارة شحناتك، وتحسين خدماتنا، والتواصل معك بخصوص التحديثات الهامة أو العروض الترويجية.'
                    : 'We use your information to process your requests, manage your shipments, improve our services, and communicate with you regarding important updates or promotional offers.'}
                </p>
              </section>

              <section>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)', marginBottom: 12 }}>{isAr ? '3. حماية البيانات' : '3. Data Protection'}</h2>
                <p style={{ color: 'var(--text-secondary)' }}>
                  {isAr 
                    ? 'نحن نتخذ إجراءات أمنية صارمة لحماية معلوماتك الشخصية من الوصول غير المصرح به أو التغيير أو الإفصاح أو الإتلاف. بياناتك مشفرة ومحفوظة في خوادم آمنة.'
                    : 'We take strict security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. Your data is encrypted and stored on secure servers.'}
                </p>
              </section>

              <section>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)', marginBottom: 12 }}>{isAr ? '4. مشاركة المعلومات' : '4. Information Sharing'}</h2>
                <p style={{ color: 'var(--text-secondary)' }}>
                  {isAr 
                    ? 'لا نقوم ببيع أو تأجير معلوماتك الشخصية لأطراف ثالثة. قد نشارك معلوماتك فقط مع شركائنا الموثوقين (مثل شركات الشحن والتخليص الجمركي) بالقدر اللازم لتنفيذ خدماتنا.'
                    : 'We do not sell or rent your personal information to third parties. We may only share your information with our trusted partners (such as shipping and customs clearance companies) to the extent necessary to perform our services.'}
                </p>
              </section>
            </div>
          </FadeInView>
        </div>
      </main>
      <Footer locale={loc} />
      <BottomNav locale={loc} />
    </>
  );
}
