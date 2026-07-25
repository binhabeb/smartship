'use client';
import { use, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { QRCodeSVG } from 'qrcode.react';

export default function LabelPrintPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = use(params);
  const [label, setLabel] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const [{ data: labelData }, { data: settingsData }] = await Promise.all([
        supabase.from('shipping_labels').select('*').eq('id', id).single(),
        supabase.from('site_settings').select('*').single(),
      ]);
      if (labelData) setLabel(labelData);
      if (settingsData) setSettings(settingsData);
      setLoading(false);
    }
    fetch();
  }, [id]);

  useEffect(() => {
    if (!loading && label) {
      // small delay so the browser renders QR before print
      const t = setTimeout(() => window.print(), 600);
      return () => clearTimeout(t);
    }
  }, [loading, label]);

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#fff', color: '#333' }}>Loading…</div>;
  if (!label) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#fff', color: '#333' }}>Label not found</div>;

  const trackingUrl = `https://www.binhabeb.com/${locale}/tracking?id=${label.shipment_id}`;
  const chinaPhone = settings?.contact_phone || '+86 193 8307 9080';
  const adenPhone = '+967 783 326 838';
  const formatDate = (d: string) => {
    if (!d) return '—';
    const dt = new Date(d);
    return `${String(dt.getDate()).padStart(2, '0')} / ${String(dt.getMonth() + 1).padStart(2, '0')} / ${dt.getFullYear()}`;
  };

  const methodAr: Record<string, string> = { 'SEA FREIGHT': 'شحن بحري', 'AIR FREIGHT': 'شحن جوي', 'EXPRESS': 'شحن سريع' };

  // Colors
  const NAVY = '#1B2A4A';
  const ORANGE = '#E8731A';
  const LIGHT_BG = '#F4F6F8';
  const WHITE = '#FFFFFF';

  return (
    <>
      <style>{`
        @page { size: A5 landscape; margin: 0; }
        @media print {
          body { margin: 0 !important; padding: 0 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .no-print { display: none !important; }
        }
        @media screen {
          body { background: #e0e0e0 !important; }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>

      {/* Print / Back buttons – hidden on print */}
      <div className="no-print" style={{ display: 'flex', gap: 12, justifyContent: 'center', padding: 16, background: '#1a1a2e' }}>
        <button onClick={() => window.print()} style={{ padding: '10px 28px', borderRadius: 10, border: 'none', background: ORANGE, color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
          🖨️ طباعة / تحميل PDF
        </button>
        <button onClick={() => window.close()} style={{ padding: '10px 28px', borderRadius: 10, border: '1px solid #555', background: 'transparent', color: '#ccc', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
          ✕ إغلاق
        </button>
      </div>

      {/* ===== LABEL CARD (A5 Landscape: 210mm × 148mm) ===== */}
      <div style={{
        width: '210mm', height: '148mm', margin: '20px auto', background: WHITE, fontFamily: "'Segoe UI', Tahoma, Arial, sans-serif",
        position: 'relative', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
        display: 'flex', flexDirection: 'column',
      }}>

        {/* ── TOP HEADER BAR ── */}
        <div style={{
          background: `linear-gradient(135deg, ${NAVY} 0%, #243B5E 100%)`,
          color: WHITE, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 20px', height: 62,
        }}>
          {/* Logo area */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 900, color: ORANGE }}>B</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: 0.5 }}>Bin Habeb</div>
              <div style={{ fontSize: 9, fontWeight: 600, color: ORANGE }}>Trading & Import</div>
              <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.6)' }}>بن حبيب للتجارة والاستيراد</div>
            </div>
          </div>

          {/* Trust badges */}
          <div style={{ display: 'flex', gap: 24 }}>
            {[
              { icon: '✓', ar: 'ثقة', en: 'Trust' },
              { icon: '⚡', ar: 'سرعة', en: 'Speed' },
              { icon: '★', ar: 'احترافية', en: 'Pro' },
            ].map((b, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(232,115,26,0.15)', border: `1px solid ${ORANGE}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: ORANGE, margin: '0 auto 2px' }}>{b.icon}</div>
                <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.7)' }}>{b.ar}</div>
                <div style={{ fontSize: 6, color: 'rgba(255,255,255,0.4)' }}>{b.en}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── MAIN BODY ── */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {/* LEFT PANEL – Cargo No + QR */}
          <div style={{
            width: 195, background: LIGHT_BG, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', padding: '12px 10px', borderRight: `3px solid ${ORANGE}`,
          }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#666', marginBottom: 2 }}>رقم الشحنة</div>
            <div style={{ fontSize: 8, color: '#999', marginBottom: 6 }}>CARGO NO.</div>
            <div style={{ fontSize: 34, fontWeight: 900, color: NAVY, letterSpacing: 1, lineHeight: 1 }}>{label.label_number}</div>
            <div style={{ margin: '8px 0', background: '#fff', padding: 6, borderRadius: 6, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
              <QRCodeSVG value={trackingUrl} size={68} level="M" />
            </div>
            <div style={{ fontSize: 7, fontWeight: 700, color: ORANGE, textTransform: 'uppercase', letterSpacing: 1 }}>SCAN TO TRACK</div>
            <div style={{ fontSize: 7, color: '#999', marginTop: 4 }}>SMARTSHIP-{label.label_number}-{(label.destination || 'DEST').split(' ')[0].toUpperCase()}</div>
          </div>

          {/* RIGHT PANEL – Details table */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Details Grid */}
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr', gridAutoRows: 'minmax(0, 1fr)' }}>
              {[
                { en: 'CUSTOMER NAME', ar: 'اسم العميل', val: label.customer_name, icon: '👤' },
                { en: 'CUSTOMER NO.', ar: 'رقم العميل', val: label.customer_phone || '—', icon: '📱' },
                { en: 'DESTINATION', ar: 'الوجهة', val: label.destination || '—', icon: '📍' },
                { en: 'GOODS TYPE', ar: 'نوع البضاعة', val: label.product || '—', icon: '📦' },
                { en: 'ORIGIN', ar: 'بلد المنشأ', val: label.origin || 'China', icon: '🌍' },
                { en: 'WEIGHT', ar: 'الوزن', val: label.weight_kg ? `${label.weight_kg} KG` : '—', icon: '⚖️' },
                { en: 'VOLUME', ar: 'الحجم', val: label.volume_cbm ? `${label.volume_cbm} CBM` : '—', icon: '📐' },
                { en: 'PACKAGE', ar: 'عدد الطرود', val: label.package_count ? `${label.package_count} PCS` : '—', icon: '📦' },
              ].map((row, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', padding: '0 14px',
                  borderBottom: i < 7 ? '1px solid #E8E8E8' : 'none',
                  background: i % 2 === 0 ? '#fff' : '#FAFBFC',
                }}>
                  <div style={{ width: 130, fontSize: 7.5, color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3 }}>{row.en}</div>
                  <div style={{ flex: 1, fontSize: 10, fontWeight: 700, color: NAVY }}>{row.val}</div>
                  <div style={{ width: 100, fontSize: 8, color: '#999', textAlign: 'right', fontWeight: 600 }}>{row.ar}</div>
                  <div style={{ width: 22, textAlign: 'center', fontSize: 11, marginRight: -4 }}>{row.icon}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── SHIPMENT INFO BAR ── */}
        <div style={{
          display: 'flex', background: LIGHT_BG, borderTop: `2px solid ${ORANGE}`, borderBottom: '1px solid #E0E0E0',
        }}>
          {[
            { icon: '📅', ar: 'تاريخ الشحن', en: 'SHIPMENT DATE', val: formatDate(label.shipment_date) },
            { icon: '🚢', ar: 'طريقة الشحن', en: 'SHIPMENT METHOD', val: label.shipment_method || 'SEA FREIGHT' },
            { icon: '📝', ar: 'ملاحظات', en: 'REMARKS', val: label.remarks || (methodAr[label.shipment_method] === 'شحن بحري' ? 'يُحفظ بعيداً عن الرطوبة والحرارة' : '—') },
          ].map((item, i) => (
            <div key={i} style={{
              flex: i === 2 ? 2 : 1, padding: '7px 14px', display: 'flex', alignItems: 'center', gap: 8,
              borderRight: i < 2 ? '1px solid #ddd' : 'none',
            }}>
              <div style={{ fontSize: 14 }}>{item.icon}</div>
              <div>
                <div style={{ fontSize: 7, color: '#999', fontWeight: 600 }}>{item.ar}</div>
                <div style={{ fontSize: 6, color: '#bbb', textTransform: 'uppercase' }}>{item.en}</div>
                <div style={{ fontSize: 9, fontWeight: 700, color: NAVY, marginTop: 1 }}>{item.val}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── CONTACT BAR ── */}
        <div style={{
          display: 'flex', background: NAVY, color: WHITE, alignItems: 'stretch',
        }}>
          {/* China Office */}
          <div style={{ flex: 1, padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 8, borderRight: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: 13 }}>📞</div>
            <div>
              <div style={{ fontSize: 8, fontWeight: 700, color: ORANGE }}>مكتب الصين</div>
              <div style={{ fontSize: 6, color: 'rgba(255,255,255,0.5)' }}>CHINA OFFICE</div>
              <div style={{ fontSize: 9, fontWeight: 600, marginTop: 1 }} dir="ltr">{chinaPhone}</div>
            </div>
          </div>
          {/* Aden Rep */}
          <div style={{ flex: 1, padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 8, borderRight: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: 13 }}>👤</div>
            <div>
              <div style={{ fontSize: 8, fontWeight: 700, color: ORANGE }}>مندوب عدن</div>
              <div style={{ fontSize: 6, color: 'rgba(255,255,255,0.5)' }}>ADEN REPRESENTATIVE</div>
              <div style={{ fontSize: 9, fontWeight: 600, marginTop: 1 }} dir="ltr">{adenPhone}</div>
            </div>
          </div>
          {/* Website & Email */}
          <div style={{ flex: 1.2, padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 8, borderRight: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: 13 }}>🌐</div>
            <div>
              <div style={{ fontSize: 9, fontWeight: 600 }}>binhabeb.com</div>
              <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.6)' }}>info@binhabeb.com</div>
            </div>
          </div>
          {/* Sea & Air */}
          <div style={{ padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 6, background: ORANGE }}>
            <div>
              <div style={{ fontSize: 9, fontWeight: 800 }}>نقل بحري وجوي</div>
              <div style={{ fontSize: 7, fontWeight: 600, opacity: 0.85 }}>SEA & AIR FREIGHT</div>
            </div>
            <div style={{ fontSize: 16 }}>🚢</div>
          </div>
        </div>

        {/* ── BOTTOM HANDLING ICONS ── */}
        <div style={{
          display: 'flex', alignItems: 'center', background: '#FAFAFA', borderTop: '1px solid #E8E8E8', padding: '4px 0',
        }}>
          {[
            { icon: '⬆️', ar: 'أعلى', en: 'THIS SIDE UP' },
            { icon: '💧', ar: 'يحفظ جافاً', en: 'KEEP DRY' },
            { icon: '⚠️', ar: 'قابل للكسر', en: 'FRAGILE' },
            { icon: '🤲', ar: 'يتعامل بحذر', en: 'HANDLE WITH CARE' },
          ].map((h, i) => (
            <div key={i} style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '3px 6px',
              borderRight: '1px solid #E8E8E8',
            }}>
              <span style={{ fontSize: 11 }}>{h.icon}</span>
              <div>
                <div style={{ fontSize: 6.5, fontWeight: 700, color: '#555' }}>{h.ar}</div>
                <div style={{ fontSize: 5.5, color: '#999' }}>{h.en}</div>
              </div>
            </div>
          ))}
          {/* Receiver Signature */}
          <div style={{ flex: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '3px 10px' }}>
            <div style={{ flex: 1, borderBottom: '1px solid #ccc', height: 12 }} />
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 7, fontWeight: 700, color: '#555' }}>توقيع المستلم</div>
              <div style={{ fontSize: 5.5, color: '#999' }}>RECEIVER SIGNATURE</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
