'use client';
import { use, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getTranslations, Locale } from '@/lib/translations';
import Link from 'next/link';

interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
}

interface Invoice {
  id: string;
  customer_name: string;
  shipment_id: string;
  status: 'paid' | 'unpaid';
  amount: number;
  created_at: string;
  items?: InvoiceItem[];
  details?: string;
}

export default function InvoicePublicPage({ params }: { params: Promise<{ locale: string, id: string }> }) {
  const { locale, id } = use(params);
  const loc = (locale === 'ar' ? 'ar' : 'en') as Locale;
  // Removed unused t

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInvoice() {
      setLoading(true);
      const { data } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', id)
        .single();
      
      if (data) setInvoice(data as Invoice);
      setLoading(false);
    }
    fetchInvoice();
  }, [id]);

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="loading-spinner"></div></div>;

  if (!invoice) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🚫</div>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>{loc === 'ar' ? 'الفاتورة غير موجودة' : 'Invoice Not Found'}</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>{loc === 'ar' ? 'عذراً، لم نتمكن من العثور على الفاتورة المطلوبة.' : 'Sorry, we could not find the requested invoice.'}</p>
      <Link href={`/${locale}`} className="btn-primary" style={{ padding: '12px 24px', textDecoration: 'none' }}>
        {loc === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
      </Link>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', padding: '40px 20px', background: 'var(--bg-default)', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 800 }}>
        
        {/* Actions Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }} className="print-hidden">
          <Link href={`/${locale}`} style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
            ← {loc === 'ar' ? 'العودة للموقع' : 'Back to Site'}
          </Link>
          <button onClick={() => window.print()} className="btn-primary" style={{ padding: '8px 24px' }}>
            🖨️ {loc === 'ar' ? 'طباعة / PDF' : 'Print / PDF'}
          </button>
        </div>

        {/* Invoice Document */}
        <div className="glass-card invoice-doc" style={{ padding: '40px', background: 'var(--bg-elevated)', borderRadius: 16, border: '1px solid var(--glass-border)', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
          
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid var(--glass-border)', paddingBottom: 24, marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 900, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 4 }}>
                SmartShip
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                {loc === 'ar' ? 'مؤسسة بن حبيب للتجارة والاستيراد' : 'Bin Habib Trading & Import'}
              </div>
            </div>
            <div style={{ textAlign: 'end' }}>
              <h2 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 8px 0', letterSpacing: 1 }}>{loc === 'ar' ? 'فاتورة' : 'INVOICE'}</h2>
              <div style={{ fontFamily: 'var(--font-en)', fontSize: 16, fontWeight: 700, color: 'var(--primary)' }}>#{invoice.id}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
                {new Date(invoice.created_at).toLocaleDateString(loc === 'ar' ? 'ar-SA' : 'en-US')}
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, marginBottom: 40 }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>{loc === 'ar' ? 'مفوتر إلى:' : 'Billed To:'}</div>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{invoice.customer_name}</div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 12 }}>📦</span> {loc === 'ar' ? 'رقم الشحنة المربوطة:' : 'Shipment Ref:'} <Link href={`/${locale}/tracking?id=${invoice.shipment_id}`} style={{ fontFamily: 'var(--font-en)', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>{invoice.shipment_id}</Link>
              </div>
            </div>
            
            <div style={{ textAlign: 'end' }}>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>{loc === 'ar' ? 'حالة الفاتورة:' : 'Status:'}</div>
              <div style={{ display: 'inline-block', padding: '6px 16px', borderRadius: 20, fontSize: 14, fontWeight: 700, background: invoice.status === 'paid' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: invoice.status === 'paid' ? '#10b981' : '#ef4444' }}>
                {invoice.status === 'paid' ? (loc === 'ar' ? '✅ مدفوعة' : '✅ PAID') : (loc === 'ar' ? '⏳ غير مدفوعة' : '⏳ UNPAID')}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div style={{ marginBottom: 40 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--glass-border)' }}>
                  <th style={{ padding: '12px 8px', textAlign: 'start', color: 'var(--text-secondary)', fontSize: 14 }}>{loc === 'ar' ? 'الوصف' : 'Description'}</th>
                  <th style={{ padding: '12px 8px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 14, width: '100px' }}>{loc === 'ar' ? 'الكمية' : 'Qty'}</th>
                  <th style={{ padding: '12px 8px', textAlign: 'end', color: 'var(--text-secondary)', fontSize: 14, width: '120px' }}>{loc === 'ar' ? 'السعر' : 'Price'}</th>
                  <th style={{ padding: '12px 8px', textAlign: 'end', color: 'var(--text-secondary)', fontSize: 14, width: '120px' }}>{loc === 'ar' ? 'المجموع' : 'Total'}</th>
                </tr>
              </thead>
              <tbody>
                {(invoice.items || [{ description: invoice.details || 'رسوم شحن', quantity: 1, price: invoice.amount }]).map((item, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <td style={{ padding: '16px 8px', fontWeight: 600 }}>{item.description}</td>
                    <td style={{ padding: '16px 8px', textAlign: 'center', fontFamily: 'var(--font-en)' }}>{item.quantity}</td>
                    <td style={{ padding: '16px 8px', textAlign: 'end', fontFamily: 'var(--font-en)' }}>{item.price.toFixed(2)}</td>
                    <td style={{ padding: '16px 8px', textAlign: 'end', fontFamily: 'var(--font-en)', fontWeight: 700 }}>{(item.quantity * item.price).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ width: '300px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 8px', borderBottom: '1px solid var(--glass-border)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{loc === 'ar' ? 'المجموع الفرعي:' : 'Subtotal:'}</span>
                <span style={{ fontFamily: 'var(--font-en)', fontWeight: 600 }}>{invoice.amount.toFixed(2)} SAR</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 8px', borderBottom: '1px solid var(--glass-border)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{loc === 'ar' ? 'الضريبة (0%):' : 'Tax (0%):'}</span>
                <span style={{ fontFamily: 'var(--font-en)', fontWeight: 600 }}>0.00 SAR</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 8px', marginTop: 8, background: 'var(--bg-default)', borderRadius: 8 }}>
                <span style={{ fontWeight: 800, fontSize: 18 }}>{loc === 'ar' ? 'الإجمالي:' : 'Total:'}</span>
                <span style={{ fontFamily: 'var(--font-en)', fontWeight: 900, fontSize: 18, color: 'var(--primary)' }}>{invoice.amount.toFixed(2)} SAR</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ marginTop: 60, paddingTop: 24, borderTop: '1px solid var(--glass-border)', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>
            <p style={{ marginBottom: 4 }}>{loc === 'ar' ? 'شكراً لثقتكم واختياركم بن حبيب للشحن.' : 'Thank you for your business.'}</p>
            <p>{loc === 'ar' ? 'في حال وجود أي استفسارات، يرجى التواصل معنا.' : 'If you have any questions, please contact us.'}</p>
          </div>

        </div>

      </div>

      {/* Global Print Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          .print-hidden { display: none !important; }
          .invoice-doc, .invoice-doc * { visibility: visible; }
          .invoice-doc { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none !important; border: none !important; padding: 0 !important; }
        }
      `}} />
    </div>
  );
}
