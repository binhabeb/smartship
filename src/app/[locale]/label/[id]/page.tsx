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

  const NAVY = '#09152b';
  const ORANGE = '#eb6c00';
  const GRAY_BG = '#f5f6f8';

  const labelNumParts = label.label_number.split('-');
  const labelPrefix = labelNumParts[0] + '-';
  const labelNumber = labelNumParts.slice(1).join('-');
  const destWord = (label.destination || 'ADEN').split(' ')[0].split('-')[0].toUpperCase();

  return (
    <>
      <style>{`
        @page { size: A4 landscape; margin: 0; }
        * { box-sizing: border-box; }
        body, html { margin: 0; padding: 0; background: #555; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        .print-btn { display: flex; gap: 12px; justify-content: center; padding: 16px; background: #222; }
        
        .label-container {
          width: 297mm;
          height: 210mm;
          margin: 20px auto;
          background: #ffffff;
          position: relative;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          display: grid;
          grid-template-rows: 155px 4px 1fr 85px 85px 50px;
          border-radius: 12px;
        }

        @media print {
          @page { size: A4 landscape; margin: 0; }
          body, html { background: white !important; margin: 0 !important; padding: 0 !important; width: 100% !important; height: 100% !important; overflow: hidden !important; }
          .print-btn { display: none !important; }
          .label-container {
            width: 297mm !important;
            height: 210mm !important;
            margin: 0 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            border: none !important;
            page-break-after: avoid;
            page-break-inside: avoid;
          }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
        }

        /* Helpers */
        .flex-center { display: flex; align-items: center; justify-content: center; }
        .flex-row { display: flex; align-items: center; }
        
        /* Table Rows */
        .details-row {
          display: grid;
          grid-template-columns: 180px 1fr 140px 65px;
          height: 12.5%; /* 1/8th of container */
          border-bottom: 2px solid #eef0f3;
        }
        .details-row:nth-child(even) { background: #fafbfc; }
        .details-row:last-child { border-bottom: none; }
        
        /* Arabic Text Settings */
        .ar-text { font-family: 'Segoe UI', system-ui, sans-serif; }
      `}</style>

      <div className="print-btn no-print">
        <button onClick={() => window.print()} style={{ padding:'12px 40px', borderRadius:8, border:'none', background:ORANGE, color:'#fff', fontWeight:700, cursor:'pointer', fontSize:16 }}>
          🖨️ طباعة
        </button>
        <button onClick={() => window.history.back()} style={{ padding:'12px 30px', borderRadius:8, border:'2px solid #777', background:'transparent', color:'#ccc', fontWeight:600, cursor:'pointer', fontSize:16 }}>
          رجوع
        </button>
      </div>

      <div className="label-container" dir="ltr">
        
        {/* ================= HEADER ================= */}
        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex' }}>
          
          {/* Left Navy Block with Smooth Curve */}
          <div style={{ 
            width: '53%', height: '100%', background: NAVY,
            borderBottomRightRadius: '90px 155px',
            display: 'flex', alignItems: 'center', padding: '0 40px', zIndex: 2
          }}>
            <div style={{ position: 'relative', width: 90, height: 90, marginRight: 24 }}>
               <svg viewBox="0 0 100 100" width="100%" height="100%">
                 <rect x="5" y="5" width="90" height="90" rx="16" fill="none" stroke="white" strokeWidth="6"/>
                 <text x="50" y="72" fill="white" fontSize="60" fontWeight="900" textAnchor="middle" fontFamily="Arial, sans-serif">B</text>
                 <path d="M 20 80 Q 50 20 95 15 L 75 5 M 95 15 L 85 35" stroke={ORANGE} strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
               </svg>
            </div>
            <div style={{ color: 'white' }}>
              <div style={{ fontSize: 38, fontWeight: 900, lineHeight: 1.1, letterSpacing: 0.5 }}>Bin Habeb</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'white', lineHeight: 1.2 }}>Trading & Import</div>
              <div className="ar-text" style={{ fontSize: 18, color: ORANGE, fontWeight: 800, lineHeight: 1.3, marginTop: 4 }} dir="rtl">بن حبيب للتجارة والاستيراد</div>
            </div>
          </div>

          {/* Right White Block with Trust Badges */}
          <div style={{ flex: 1, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 40, paddingRight: 60, position: 'relative', zIndex: 1 }}>
            
            {/* Top Right Orange Curve */}
            <div style={{ position: 'absolute', top: 0, right: 0, width: 250, height: '100%', overflow: 'hidden' }}>
              <svg width="250" height="155" viewBox="0 0 250 155" preserveAspectRatio="none">
                <path d="M50 155 C 120 155, 180 80, 250 0 L 250 155 Z" fill={ORANGE} />
                <path d="M120 155 C 180 155, 220 100, 250 40 L 250 0 C 180 40, 130 110, 50 110 Z" fill={NAVY} />
              </svg>
              <div style={{ position: 'absolute', top: 20, right: 20, color: 'white', fontSize: 50, opacity: 0.3 }}>↗</div>
            </div>

            {/* Badges */}
            {[
              { icon: 'shield', ar: 'ثقة', en: 'Trust' },
              { icon: 'timer', ar: 'سرعة', en: 'Speed' },
              { icon: 'pro', ar: 'احترافية', en: 'Professionalism' },
            ].map((b, i) => (
              <div key={i} style={{ textAlign: 'center', zIndex: 2 }}>
                <div className="flex-center" style={{ width: 56, height: 56, margin: '0 auto 10px', border: `2.5px solid ${ORANGE}`, borderRadius: '50%', color: ORANGE, background: '#fff' }}>
                  {b.icon === 'shield' && <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>}
                  {b.icon === 'timer' && <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l3 3"/><path d="M2 12h2"/><path d="M20 12h2"/></svg>}
                  {b.icon === 'pro' && <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-4"/></svg>}
                </div>
                <div className="ar-text" style={{ fontSize: 18, fontWeight: 900, color: NAVY }} dir="rtl">{b.ar}</div>
                <div style={{ fontSize: 13, color: '#777', fontWeight: 700 }}>{b.en}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ================= DIVIDER ================= */}
        <div style={{ display: 'flex', height: '100%', width: '100%' }}>
           <div style={{ width: '53%', background: NAVY, height: '100%' }}></div>
           <div style={{ flex: 1, background: '#e0e0e0', height: '100%' }}></div>
        </div>

        {/* ================= MAIN BODY ================= */}
        <div style={{ display: 'grid', gridTemplateColumns: '460px 1fr', height: '100%', overflow: 'hidden' }}>
          
          {/* Left Panel: Cargo No & QR */}
          <div style={{ background: GRAY_BG, borderRight: `4px solid ${ORANGE}`, padding: '30px 40px', display: 'flex', flexDirection: 'column' }}>
            
            <div className="ar-text" style={{ fontSize: 24, fontWeight: 900, color: NAVY, marginBottom: 2 }} dir="rtl">رقم الشحنة</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#666', letterSpacing: 1 }}>CARGO NO.</div>
            
            <div style={{ display: 'flex', alignItems: 'baseline', marginTop: 24, marginBottom: 24 }}>
              <span style={{ fontSize: 85, fontWeight: 900, color: NAVY, letterSpacing: -2 }}>{labelPrefix}</span>
              <span style={{ fontSize: 85, fontWeight: 900, color: ORANGE, letterSpacing: -2 }}>{labelNumber}</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 30 }}>
              <div style={{ flex: 1, height: 2, background: '#ccc' }}></div>
              <div style={{ fontSize: 13, fontWeight: 800, color: NAVY, letterSpacing: 1 }}>SMARTSHIP-{labelNumber}-{destWord}</div>
              <div style={{ flex: 1, height: 2, background: '#ccc' }}></div>
            </div>

            <div className="flex-center" style={{ flex: 1 }}>
               <div style={{ position: 'relative' }}>
                 <div style={{ padding: 12, border: '3px solid #ddd', borderRadius: 12, background: '#fff' }}>
                   <QRCodeSVG value={trackingUrl} size={130} level="M" />
                 </div>
                 <div style={{ position: 'absolute', bottom: -14, left: '50%', transform: 'translateX(-50%)', background: NAVY, color: ORANGE, fontSize: 13, fontWeight: 900, padding: '4px 18px', borderRadius: 6, whiteSpace: 'nowrap' }}>
                   SCAN TO TRACK
                 </div>
               </div>
            </div>

          </div>

          {/* Right Panel: Details Table */}
          <div style={{ display: 'flex', flexDirection: 'column', background: '#fff' }}>
            {[
              { en: 'CUSTOMER NAME', ar: 'اسم العميل', val: label.customer_name, icon: 'user' },
              { en: 'CUSTOMER NO.', ar: 'رقم العميل', val: customerPhone, icon: 'id' },
              { en: 'DESTINATION', ar: 'الوجهة', val: label.destination || '—', icon: 'map' },
              { en: 'GOODS TYPE', ar: 'نوع البضاعة', val: label.product || '—', icon: 'box' },
              { en: 'ORIGIN', ar: 'بلد المنشأ', val: `${label.origin || 'China'} (China)`, icon: 'globe' },
              { en: 'WEIGHT', ar: 'الوزن', val: label.weight_kg ? `${label.weight_kg} KG` : '—', icon: 'weight' },
              { en: 'VOLUME', ar: 'الحجم', val: label.volume_cbm ? `${label.volume_cbm} CBM` : '—', icon: 'cube' },
              { en: 'PACKAGE', ar: 'عدد الطرود', val: label.package_count ? `${label.package_count} PCS` : '—', icon: 'boxes' },
            ].map((row, i) => (
              <div key={i} className="details-row">
                <div className="flex-row" style={{ paddingLeft: 24, fontSize: 14, color: '#666', fontWeight: 800, letterSpacing: 0.5 }}>{row.en}</div>
                <div className="flex-center ar-text" style={{ fontSize: 20, fontWeight: 900, color: NAVY }} dir="rtl">{row.val}</div>
                <div className="flex-row ar-text" style={{ paddingRight: 24, justifyContent: 'flex-end', fontSize: 16, color: '#444', fontWeight: 900 }} dir="rtl">{row.ar}</div>
                <div className="flex-center" style={{ background: NAVY, color: ORANGE }}>
                  <div className="flex-center" style={{ width: 34, height: 34, borderRadius: '50%', border: `2px solid ${ORANGE}` }}>
                    {row.icon === 'user' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
                    {row.icon === 'id' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M8 10h.01M12 10h4M8 14h.01M12 14h4"/></svg>}
                    {row.icon === 'map' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>}
                    {row.icon === 'box' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>}
                    {row.icon === 'globe' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>}
                    {row.icon === 'weight' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>}
                    {row.icon === 'cube' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>}
                    {row.icon === 'boxes' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ================= SHIPMENT INFO BAR ================= */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr', borderTop: `3px solid ${ORANGE}`, borderBottom: '3px solid #e0e0e0' }}>
          {[
            { icon: 'calendar', ar: 'تاريخ الشحن', en: 'SHIPMENT DATE', val: formatDate(label.shipment_date) },
            { icon: 'ship', ar: 'طريقة الشحن', en: 'SHIPMENT METHOD', val: label.shipment_method || 'SEA FREIGHT' },
            { icon: 'doc', ar: 'ملاحظات', en: 'REMARKS', val: label.remarks || 'يُحفظ بعيداً عن الرطوبة والحرارة' },
          ].map((item, i) => (
            <div key={i} className="flex-row" style={{ padding: '0 30px', borderRight: i < 2 ? '2px solid #e0e0e0' : 'none', gap: 20 }}>
              <div style={{ color: ORANGE }}>
                {item.icon === 'calendar' && <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><circle cx="9" cy="16" r="1"/><circle cx="15" cy="16" r="1"/></svg>}
                {item.icon === 'ship' && <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 21h20"/><path d="M4 17l1.5-6h13L20 17"/><path d="M6 11V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4"/><circle cx="12" cy="14" r="1"/></svg>}
                {item.icon === 'doc' && <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>}
              </div>
              <div>
                <div className="flex-row" style={{ gap: 10, marginBottom: 4 }}>
                  <span className="ar-text" style={{ fontSize: 18, fontWeight: 900, color: NAVY }} dir="rtl">{item.ar}</span>
                  <span style={{ fontSize: 11, color: '#888', fontWeight: 800 }}>{item.en}</span>
                </div>
                <div className="ar-text" style={{ fontSize: 18, fontWeight: 900, color: NAVY }} dir="rtl">{item.val}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ================= CONTACT BAR ================= */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1fr 260px', background: NAVY, color: 'white' }}>
          
          {/* China Office */}
          <div className="flex-row" style={{ padding: '0 24px', gap: 16, borderRight: '2px solid rgba(255,255,255,0.1)' }}>
            <div className="flex-center" style={{ width: 56, height: 56, background: '#dd2025', borderRadius: '50%', color: 'yellow' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            </div>
            <div>
              <div className="flex-row" style={{ gap: 8 }}>
                 <span className="ar-text" style={{ fontSize: 20, fontWeight: 900 }} dir="rtl">مكتب الصين</span>
                 <span style={{ fontSize: 11, color: ORANGE, fontWeight: 800 }}>CHINA OFFICE</span>
              </div>
              <div className="flex-row" style={{ gap: 8, marginTop: 4 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <span style={{ fontSize: 18, fontWeight: 800 }} dir="ltr">{chinaPhone}</span>
              </div>
            </div>
          </div>

          {/* Aden Rep */}
          <div className="flex-row" style={{ padding: '0 24px', gap: 16, borderRight: '2px solid rgba(255,255,255,0.1)' }}>
            <div className="flex-center" style={{ width: 56, height: 56, border: '2.5px solid white', borderRadius: '50%' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <div>
              <div className="flex-row" style={{ gap: 8 }}>
                 <span className="ar-text" style={{ fontSize: 20, fontWeight: 900 }} dir="rtl">مندوب عدن</span>
                 <span style={{ fontSize: 11, color: ORANGE, fontWeight: 800 }}>ADEN REP</span>
              </div>
              <div className="flex-row" style={{ gap: 8, marginTop: 4 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <span style={{ fontSize: 18, fontWeight: 800 }} dir="ltr">{adenPhone}</span>
              </div>
            </div>
          </div>

          {/* Socials / Website */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 20px', gap: 6 }}>
            <div className="flex-row" style={{ gap: 10, fontSize: 15, color: ORANGE }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              <span style={{ color: 'white', fontWeight: 700 }}>binhabeb.com</span>
            </div>
            <div className="flex-row" style={{ gap: 10, fontSize: 15, color: ORANGE }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <span style={{ color: 'white', fontWeight: 700 }} dir="ltr">{customerPhone}</span>
            </div>
            <div className="flex-row" style={{ gap: 10, fontSize: 15, color: ORANGE }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <span style={{ color: 'white', fontWeight: 700 }}>info@binhabeb.com</span>
            </div>
          </div>

          {/* Sea & Air Freight block */}
          <div className="flex-center" style={{ background: ORANGE, clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 0 100%)', flexDirection: 'column' }}>
             <div className="ar-text" style={{ fontSize: 20, fontWeight: 900 }} dir="rtl">نقل بحري وجوي</div>
             <div style={{ fontSize: 14, fontWeight: 800 }}>SEA & AIR FREIGHT</div>
             <div className="flex-row" style={{ gap: 18, marginTop: 4 }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M2 21h20"/><path d="M4 17l1.5-6h13L20 17"/><path d="M6 11V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4"/><circle cx="12" cy="14" r="1"/></svg>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.6L3 8l6.5 4L5 16.5l-3.3-1.1-1.4 1.4L4.6 21l4.2-4.3 4.5 4.5 1.8-1.7.4-6.8 5.6-5.6"/></svg>
             </div>
          </div>

        </div>

        {/* ================= BOTTOM HANDLING ================= */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr) 2fr', background: 'white' }}>
          {[
            { icon: '↑↑', ar: 'أعلى', en: 'THIS SIDE UP' },
            { icon: '☂', ar: 'يحفظ جافاً', en: 'KEEP DRY' },
            { icon: '🍷', ar: 'قابل للكسر', en: 'FRAGILE' },
            { icon: '🤲', ar: 'يتعامل بحذر', en: 'HANDLE WITH CARE' },
          ].map((h, i) => (
            <div key={i} className="flex-center" style={{ gap: 12, borderRight: '2px solid #e0e0e0' }}>
              <span style={{ color: NAVY }}>
                 {h.en === 'THIS SIDE UP' && <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 19V5M5 12l7-7 7 7"/></svg>}
                 {h.en === 'KEEP DRY' && <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v10m-5-5l5-5 5 5M4 16c0 4.4 3.6 8 8 8s8-3.6 8-8"/></svg>}
                 {h.en === 'FRAGILE' && <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2l-7 9h14l-7-9zM5 11v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-9"/><path d="M9 22V11M15 22V11"/></svg>}
                 {h.en === 'HANDLE WITH CARE' && <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 13l-3 3-3-3m18 0l-3 3-3-3M2 17v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2M12 4v8M8 8l4-4 4 4"/></svg>}
              </span>
              <div>
                <div className="ar-text" style={{ fontSize: 14, fontWeight: 900, color: NAVY }} dir="rtl">{h.ar}</div>
                <div style={{ fontSize: 10, color: '#888', fontWeight: 800 }}>{h.en}</div>
              </div>
            </div>
          ))}

          {/* Receiver Signature */}
          <div className="flex-row" style={{ padding: '0 32px', gap: 20 }}>
            <div style={{ flex: 1, borderBottom: '3px solid #bbb', height: 28 }}></div>
            <div style={{ textAlign: 'right' }}>
              <div className="ar-text" style={{ fontSize: 15, fontWeight: 900, color: NAVY }} dir="rtl">توقيع المستلم</div>
              <div style={{ fontSize: 11, color: '#888', fontWeight: 800 }}>RECEIVER SIGNATURE</div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
