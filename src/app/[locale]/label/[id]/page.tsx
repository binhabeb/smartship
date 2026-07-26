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
    async function fetchData() {
      const [{ data: labelData }, { data: settingsData }] = await Promise.all([
        supabase.from('shipping_labels').select('*').eq('id', id).single(),
        supabase.from('site_settings').select('*').single(),
      ]);
      if (labelData) setLabel(labelData);
      if (settingsData) setSettings(settingsData);
      setLoading(false);
    }
    fetchData();
  }, [id]);

  if (loading) return <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'#f0f2f5',fontFamily:'Arial' }}>Loading…</div>;
  if (!label) return <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'#f0f2f5',fontFamily:'Arial',color:'#666' }}>Label not found</div>;

  const trackingUrl = `https://www.binhabeb.com/${locale}/tracking?id=${label.shipment_id}`;
  const chinaPhone = settings?.contact_phone || '+86 193 8307 9080';
  const adenPhone = '+967 783 326 838';
  const customerPhone = label.customer_phone || '+967 770 966 517';
  
  const formatDate = (d: string) => {
    if (!d) return '—';
    const dt = new Date(d);
    return `${String(dt.getDate()).padStart(2,'0')} / ${String(dt.getMonth()+1).padStart(2,'0')} / ${dt.getFullYear()}`;
  };

  const NAVY = '#1B2A4A';
  const ORANGE = '#E8731A';

  const labelNumParts = label.label_number.split('-');
  const labelPrefix = labelNumParts[0] + '-';
  const labelNumber = labelNumParts.slice(1).join('-');
  const destWord = (label.destination || 'ADEN').split(' ')[0].split('-')[0].toUpperCase();

  // Row data
  const rows = [
    { en: 'CUSTOMER NAME', ar: 'اسم العميل', val: label.customer_name, icon: 'user' },
    { en: 'CUSTOMER NO.', ar: 'رقم العميل', val: customerPhone, icon: 'id' },
    { en: 'DESTINATION', ar: 'الوجهة', val: label.destination || '—', icon: 'map' },
    { en: 'GOODS TYPE', ar: 'نوع البضاعة', val: label.product || '—', icon: 'box' },
    { en: 'ORIGIN', ar: 'بلد المنشأ', val: `${label.origin || 'China'} (China)`, icon: 'globe' },
    { en: 'WEIGHT', ar: 'الوزن', val: label.weight_kg ? `${label.weight_kg} KG` : '—', icon: 'weight' },
    { en: 'VOLUME', ar: 'الحجم', val: label.volume_cbm ? `${label.volume_cbm} CBM` : '—', icon: 'cube' },
    { en: 'PACKAGE', ar: 'عدد الطرود', val: label.package_count ? `${label.package_count} PCS` : '—', icon: 'boxes' },
  ];

  const renderIcon = (icon: string, size = 16) => {
    const s = size;
    switch(icon) {
      case 'user': return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
      case 'id': return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M8 10h.01M12 10h4M8 14h.01M12 14h4"/></svg>;
      case 'map': return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
      case 'box': return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
      case 'globe': return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
      case 'weight': return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>;
      case 'cube': return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>;
      case 'boxes': return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>;
      default: return null;
    }
  };

  return (
    <>
      <style>{`
        @page { size: A4 landscape; margin: 0; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body, html { margin: 0; padding: 0; background: #555; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }

        @media print {
          @page { size: A4 landscape; margin: 0; }
          body, html { background: white !important; margin: 0 !important; padding: 0 !important; }
          .no-print { display: none !important; }
          .label-page {
            width: 297mm !important;
            height: 210mm !important;
            margin: 0 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
          }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
        }
      `}</style>

      {/* Toolbar */}
      <div className="no-print" style={{ display:'flex', gap:12, justifyContent:'center', padding:'16px', background:'#222' }}>
        <button onClick={() => window.print()} style={{ padding:'12px 40px', borderRadius:8, border:'none', background:ORANGE, color:'#fff', fontWeight:700, cursor:'pointer', fontSize:16 }}>🖨️ طباعة</button>
        <button onClick={() => window.history.back()} style={{ padding:'12px 30px', borderRadius:8, border:'2px solid #777', background:'transparent', color:'#ccc', fontWeight:600, cursor:'pointer', fontSize:16 }}>رجوع</button>
      </div>

      {/* ===== A4 LANDSCAPE LABEL ===== */}
      <div className="label-page" dir="ltr" style={{
        width: '297mm', height: '210mm', margin: '20px auto',
        background: '#fff', overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)', borderRadius: 12,
        display: 'flex', flexDirection: 'column',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}>

        {/* ========== HEADER ========== */}
        <div style={{ height: 130, display: 'flex', position: 'relative', flexShrink: 0 }}>
          {/* Navy curved background */}
          <div style={{
            width: '52%', height: '100%', background: NAVY,
            borderBottomRightRadius: '80px 130px',
            display: 'flex', alignItems: 'center', padding: '0 36px', gap: 20, zIndex: 2,
          }}>
            {/* Actual Logo */}
            <img src="/logo.png" alt="Bin Habeb" style={{ width: 80, height: 80, objectFit: 'contain' }} />
            <div style={{ color: '#fff' }}>
              <div style={{ fontSize: 34, fontWeight: 900, lineHeight: 1.1 }}>Bin Habeb</div>
              <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.2 }}>Trading &amp; Import</div>
              <div style={{ fontSize: 16, color: ORANGE, fontWeight: 800, marginTop: 2 }} dir="rtl">بن حبيب للتجارة والاستيراد</div>
            </div>
          </div>

          {/* Right: Trust badges */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 44, zIndex: 2, paddingRight: 40 }}>
            {[
              { svg: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>, ar: 'ثقة', en: 'Trust' },
              { svg: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l3 3"/></svg>, ar: 'سرعة', en: 'Speed' },
              { svg: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-4"/></svg>, ar: 'احترافية', en: 'Professionalism' },
            ].map((b, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ width: 50, height: 50, margin: '0 auto 8px', border: `2.5px solid ${ORANGE}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: ORANGE, background: '#fff' }}>{b.svg}</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: NAVY }} dir="rtl">{b.ar}</div>
                <div style={{ fontSize: 12, color: '#777', fontWeight: 700 }}>{b.en}</div>
              </div>
            ))}
          </div>

          {/* Orange/Navy corner decoration */}
          <div style={{ position: 'absolute', top: 0, right: 0, width: 200, height: 130, overflow: 'hidden', zIndex: 1 }}>
            <svg width="200" height="130" viewBox="0 0 200 130" preserveAspectRatio="none">
              <path d="M40 130 C 100 130, 150 60, 200 0 L 200 130 Z" fill={ORANGE} />
              <path d="M110 130 C 155 130, 180 90, 200 30 L 200 0 C 150 40, 115 100, 40 100 Z" fill={NAVY} />
            </svg>
            <div style={{ position: 'absolute', top: 15, right: 15, color: '#fff', fontSize: 44, opacity: 0.3 }}>↗</div>
          </div>
        </div>

        {/* Divider under header */}
        <div style={{ height: 4, display: 'flex', flexShrink: 0 }}>
          <div style={{ width: '52%', background: NAVY }}></div>
          <div style={{ flex: 1, background: '#ddd' }}></div>
        </div>

        {/* ========== MAIN BODY ========== */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {/* Left: Cargo No + QR */}
          <div style={{ width: 380, background: '#F5F6F8', borderRight: `4px solid ${ORANGE}`, display: 'flex', flexDirection: 'column', padding: '20px 28px', flexShrink: 0 }}>
            
            {/* Title */}
            <div style={{ marginBottom: 4 }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: NAVY }} dir="rtl">رقم الشحنة</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#666', letterSpacing: 1 }}>CARGO NO.</div>
            </div>
            
            {/* Number + QR side by side */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
              {/* Big Number */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', lineHeight: 1 }}>
                  <span style={{ fontSize: 72, fontWeight: 900, color: NAVY, letterSpacing: -2 }}>{labelPrefix}</span>
                  <span style={{ fontSize: 72, fontWeight: 900, color: ORANGE, letterSpacing: -2 }}>{labelNumber}</span>
                </div>
              </div>
              
              {/* QR Code */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginLeft: 10 }}>
                <div style={{ padding: 8, border: '2px solid #ddd', borderRadius: 8, background: '#fff' }}>
                  <QRCodeSVG value={trackingUrl} size={100} level="M" />
                </div>
                <div style={{ background: ORANGE, color: '#fff', fontSize: 10, fontWeight: 900, padding: '3px 12px', borderRadius: 4, marginTop: 6, whiteSpace: 'nowrap', letterSpacing: 0.5 }}>SCAN TO TRACK</div>
              </div>
            </div>

            {/* SMARTSHIP line */}
            <div style={{ textAlign: 'center', fontSize: 12, fontWeight: 800, color: '#888', letterSpacing: 1, marginTop: 6 }}>
              SMARTSHIP-{labelNumber}-{destWord}
            </div>
          </div>

          {/* Right: Details Table */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {rows.map((row, i) => (
              <div key={i} style={{
                flex: 1, display: 'flex', alignItems: 'center',
                borderBottom: i < 7 ? '1.5px solid #EEF0F3' : 'none',
                background: i % 2 === 0 ? '#fff' : '#FAFBFC',
              }}>
                {/* English Label */}
                <div style={{ width: 170, paddingLeft: 20, fontSize: 13, color: '#666', fontWeight: 800, letterSpacing: 0.3 }}>{row.en}</div>
                {/* Value */}
                <div style={{ flex: 1, fontSize: 18, fontWeight: 900, color: NAVY, textAlign: 'center' }} dir="rtl">{row.val}</div>
                {/* Arabic Label */}
                <div style={{ width: 120, paddingRight: 16, textAlign: 'right', fontSize: 15, color: '#555', fontWeight: 900 }} dir="rtl">{row.ar}</div>
                {/* Icon strip */}
                <div style={{ width: 55, background: NAVY, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', border: `2px solid ${ORANGE}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: ORANGE }}>
                    {renderIcon(row.icon)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ========== SHIPMENT INFO BAR ========== */}
        <div style={{ height: 75, display: 'flex', borderTop: `3px solid ${ORANGE}`, flexShrink: 0 }}>
          {[
            { icon: <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>, ar: 'تاريخ الشحن', en: 'SHIPMENT DATE', val: formatDate(label.shipment_date) },
            { icon: <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="1.5"><path d="M2 21h20"/><path d="M4 17l1.5-6h13L20 17"/><path d="M6 11V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4"/></svg>, ar: 'طريقة الشحن', en: 'SHIPMENT METHOD', val: label.shipment_method || 'SEA FREIGHT' },
            { icon: <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>, ar: 'ملاحظات', en: 'REMARKS', val: label.remarks || 'يُحفظ بعيداً عن الرطوبة والحرارة' },
          ].map((item, i) => (
            <div key={i} style={{ flex: i === 2 ? 1.5 : 1, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16, borderRight: i < 2 ? '1.5px solid #ddd' : 'none' }}>
              {item.icon}
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: 15, fontWeight: 900, color: NAVY }} dir="rtl">{item.ar}</span>
                  <span style={{ fontSize: 10, color: '#999', fontWeight: 700 }}>{item.en}</span>
                </div>
                <div style={{ fontSize: 16, fontWeight: 900, color: NAVY }} dir="rtl">{item.val}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ========== CONTACT BAR ========== */}
        <div style={{ height: 75, display: 'flex', background: NAVY, color: '#fff', flexShrink: 0 }}>
          
          {/* China Office */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 20px', gap: 14, borderRight: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ width: 48, height: 48, background: '#dd2025', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="yellow"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontSize: 16, fontWeight: 900 }} dir="rtl">مكتب الصين</span>
                <span style={{ fontSize: 10, color: ORANGE, fontWeight: 700 }}>CHINA OFFICE</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.8.33 1.63.7 2.81"/></svg>
                <span style={{ fontSize: 16, fontWeight: 800 }} dir="ltr">{chinaPhone}</span>
              </div>
            </div>
          </div>

          {/* Aden Rep */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 20px', gap: 14, borderRight: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ width: 48, height: 48, border: '2px solid #fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontSize: 16, fontWeight: 900 }} dir="rtl">مندوب عدن</span>
                <span style={{ fontSize: 10, color: ORANGE, fontWeight: 700 }}>ADEN REPRESENTATIVE</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.8.33 1.63.7 2.81"/></svg>
                <span style={{ fontSize: 16, fontWeight: 800 }} dir="ltr">{adenPhone}</span>
              </div>
            </div>
          </div>

          {/* Website/Contact */}
          <div style={{ flex: 0.9, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 20px', gap: 5, borderRight: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              <span style={{ fontSize: 14, fontWeight: 700 }}>binhabeb.com</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.8.33 1.63.7 2.81"/></svg>
              <span style={{ fontSize: 14, fontWeight: 700 }} dir="ltr">{customerPhone}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <span style={{ fontSize: 14, fontWeight: 700 }}>info@binhabeb.com</span>
            </div>
          </div>

          {/* Sea & Air */}
          <div style={{ width: 220, background: ORANGE, clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 0 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 900 }} dir="rtl">نقل بحري وجوي</div>
            <div style={{ fontSize: 13, fontWeight: 800 }}>SEA &amp; AIR FREIGHT</div>
            <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M2 21h20"/><path d="M4 17l1.5-6h13L20 17"/><path d="M6 11V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4"/></svg>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.6L3 8l6.5 4L5 16.5l-3.3-1.1-1.4 1.4L4.6 21l4.2-4.3 4.5 4.5 1.8-1.7.4-6.8 5.6-5.6"/></svg>
            </div>
          </div>
        </div>

        {/* ========== BOTTOM HANDLING BAR ========== */}
        <div style={{ height: 48, display: 'flex', alignItems: 'center', background: '#fff', borderTop: '1.5px solid #e0e0e0', flexShrink: 0 }}>
          {[
            { svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={NAVY} strokeWidth="2.5"><path d="M12 19V5M5 12l7-7 7 7"/></svg>, ar: 'أعلى', en: 'THIS SIDE UP' },
            { svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={NAVY} strokeWidth="2.5"><path d="M12 2v10m-5-5l5-5 5 5M4 16c0 4.4 3.6 8 8 8s8-3.6 8-8"/></svg>, ar: 'يحفظ جافاً', en: 'KEEP DRY' },
            { svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={NAVY} strokeWidth="2.5"><path d="M12 2l-7 9h14l-7-9zM5 11v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-9"/></svg>, ar: 'قابل للكسر', en: 'FRAGILE' },
            { svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={NAVY} strokeWidth="2.5"><path d="M9 13l-3 3-3-3m18 0l-3 3-3-3M2 17v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2M12 4v8M8 8l4-4 4 4"/></svg>, ar: 'يتعامل بحذر', en: 'HANDLE WITH CARE' },
          ].map((h, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, borderRight: '1.5px solid #e0e0e0' }}>
              {h.svg}
              <div>
                <div style={{ fontSize: 12, fontWeight: 900, color: NAVY }} dir="rtl">{h.ar}</div>
                <div style={{ fontSize: 9, color: '#999', fontWeight: 700 }}>{h.en}</div>
              </div>
            </div>
          ))}
          
          {/* Signature */}
          <div style={{ flex: 1.5, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16 }}>
            <div style={{ flex: 1, borderBottom: '2px solid #bbb', height: 22 }}></div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: NAVY }} dir="rtl">توقيع المستلم</div>
              <div style={{ fontSize: 10, color: '#999', fontWeight: 700 }}>RECEIVER SIGNATURE</div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
