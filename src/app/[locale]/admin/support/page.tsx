'use client';
import { use } from 'react';
import { getTranslations, Locale } from '@/lib/translations';

export default function AdminSupportPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const loc = (locale === 'ar' ? 'ar' : 'en') as Locale;
  const t = getTranslations(loc);

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🎧</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>{loc === 'ar' ? 'الدعم الفني والتقني' : 'Technical Support'}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>{loc === 'ar' ? 'نحن هنا لمساعدتك في أي وقت' : 'We are here to help you anytime'}</p>
      </div>

      <div className="glass-card" style={{ padding: 32, marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>💬</span> {loc === 'ar' ? 'تواصل معنا مباشرة' : 'Contact Us Directly'}
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: 14 }}>
          {loc === 'ar' ? 'هل تواجه مشكلة تقنية أو لديك استفسار بخصوص النظام المحاسبي والشحنات؟ فريق التطوير والدعم التقني لـ SmartShip مستعد لخدمتك.' : 'Having a technical issue or inquiry about the system? The SmartShip support team is ready to serve you.'}
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          <a href="https://wa.me/966XXXXXXXXX" target="_blank" className="btn-whatsapp" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, textDecoration: 'none', borderRadius: 12, fontSize: 16 }}>
            <span>📞</span> {loc === 'ar' ? 'دعم الواتساب' : 'WhatsApp Support'}
          </a>
          <a href="mailto:support@smartship.com" className="btn-secondary" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, textDecoration: 'none', borderRadius: 12, fontSize: 16 }}>
            <span>✉️</span> {loc === 'ar' ? 'مراسلة الإدارة' : 'Email Support'}
          </a>
        </div>
      </div>

      <div className="glass-card" style={{ padding: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>📚</span> {loc === 'ar' ? 'الأسئلة الشائعة (دليل النظام)' : 'System Guide (FAQ)'}
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: 'var(--bg-elevated)', padding: 20, borderRadius: 12, border: '1px solid var(--glass-border)' }}>
            <h4 style={{ fontWeight: 700, marginBottom: 8 }}>{loc === 'ar' ? 'كيف أصدر فاتورة لشحنة؟' : 'How to issue an invoice?'}</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6 }}>{loc === 'ar' ? 'من صفحة "الفواتير"، اضغط على "إصدار فاتورة" أو قم بتحويل أي طلب وسيقترح عليك النظام تلقائياً إنشاء الفاتورة وإضافة بنودها.' : 'From the Invoices page, click "Issue Invoice" or convert a request, and the system will prompt you automatically.'}</p>
          </div>
          <div style={{ background: 'var(--bg-elevated)', padding: 20, borderRadius: 12, border: '1px solid var(--glass-border)' }}>
            <h4 style={{ fontWeight: 700, marginBottom: 8 }}>{loc === 'ar' ? 'كيف أعرف أرقام الشحنات الجديدة؟' : 'How to find new shipment IDs?'}</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6 }}>{loc === 'ar' ? 'النظام يقوم بتوليد الأرقام تلقائياً مثل SS-1000 ويتم ربطها مباشرة مع الفواتير برقم التسلسل.' : 'The system automatically generates IDs like SS-1000 and links them to your invoices.'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
