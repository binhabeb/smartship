'use client';
import { use } from 'react';
import { Locale } from '@/lib/translations';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import { FadeInView } from '@/components/Animations';

export default function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
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
              <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16 }}>{isAr ? 'شروط الخدمة' : 'Terms of Service'}</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>{isAr ? 'آخر تحديث: مايو 2026' : 'Last updated: May 2026'}</p>
            </div>
          </FadeInView>

          <FadeInView delay={0.2}>
            <div className="glass-card" style={{ padding: 40, display: 'flex', flexDirection: 'column', gap: 24, lineHeight: 1.8 }}>
              <section>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)', marginBottom: 12 }}>{isAr ? '1. قبول الشروط' : '1. Acceptance of Terms'}</h2>
                <p style={{ color: 'var(--text-secondary)' }}>
                  {isAr 
                    ? 'باستخدامك لموقع وخدمات SmartShip (المقدمة من شركة بن حبيب)، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي جزء من هذه الشروط، يرجى عدم استخدام خدماتنا.'
                    : 'By using the SmartShip website and services (provided by Bin Habeb Company), you agree to be bound by these terms and conditions. If you do not agree to any part of these terms, please do not use our services.'}
                </p>
              </section>

              <section>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)', marginBottom: 12 }}>{isAr ? '2. وصف الخدمة' : '2. Description of Service'}</h2>
                <p style={{ color: 'var(--text-secondary)' }}>
                  {isAr 
                    ? 'نقدم خدمات الاستيراد، الشحن البحري والجوي، التخليص الجمركي، والتخزين. نحن نعمل كوسيط بينك وبين الموردين وشركات النقل لضمان وصول بضائعك بأمان.'
                    : 'We provide import, sea and air freight, customs clearance, and warehousing services. We act as an intermediary between you and suppliers and transport companies to ensure your goods arrive safely.'}
                </p>
              </section>

              <section>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)', marginBottom: 12 }}>{isAr ? '3. المسؤولية والتعويض' : '3. Liability and Compensation'}</h2>
                <p style={{ color: 'var(--text-secondary)' }}>
                  {isAr 
                    ? 'نحن نتحمل مسؤولية البضائع أثناء وجودها في مستودعاتنا أو تحت إدارتنا المباشرة. لا نتحمل مسؤولية التأخير الناتج عن ظروف قاهرة، الجمارك، أو أطراف ثالثة. يتم التعويض عن التلف وفقاً للسياسات المتفق عليها في عقد الشحن.'
                    : 'We are responsible for goods while in our warehouses or under our direct management. We are not liable for delays caused by force majeure, customs, or third parties. Compensation for damage is per the policies agreed upon in the shipping contract.'}
                </p>
              </section>

              <section>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)', marginBottom: 12 }}>{isAr ? '4. الرسوم والدفع' : '4. Fees and Payment'}</h2>
                <p style={{ color: 'var(--text-secondary)' }}>
                  {isAr 
                    ? 'تعتمد رسوم الشحن على الوزن، الحجم، والوجهة. يجب دفع الرسوم المتفق عليها وفقاً للجدول الزمني المحدد في الفاتورة. نحتفظ بالحق في احتجاز البضائع حتى اكتمال الدفع.'
                    : 'Shipping fees depend on weight, volume, and destination. Agreed fees must be paid according to the schedule specified in the invoice. We reserve the right to withhold goods until payment is complete.'}
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
