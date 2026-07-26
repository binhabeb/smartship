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
  
  // Settings or defaults
  const chinaPhone = settings?.contact_phone || '+86 193 8307 9080';
  const adenPhone = '+967 783 326 838'; // the new number requested earlier
  const customerPhone = label.customer_phone || '+967 770 966 517';
  
  const formatDate = (d: string) => {
    if (!d) return '—';
    const dt = new Date(d);
    return `${String(dt.getDate()).padStart(2,'0')} / ${String(dt.getMonth()+1).padStart(2,'0')} / ${dt.getFullYear()}`;
  };

  const NAVY = '#0a1930';
  const ORANGE = '#ef7300';

  const labelNumParts = label.label_number.split('-');
  const labelPrefix = labelNumParts[0] + '-';
  const labelNumber = labelNumParts.slice(1).join('-');
  const destWord = (label.destination || 'ADEN').split(' ')[0].split('-')[0].toUpperCase();

  return (
    <>
      <style>{`
        @page { size: A5 landscape; margin: 0; }
        * { box-sizing: border-box; }
        body, html { margin: 0; padding: 0; background: #555; }
        .print-btn { display: flex; gap: 12px; justify-content: center; padding: 16px; background: #222; }
        
        .label-container {
          width: 210mm;
          height: 148mm;
          margin: 20px auto;
          background: #ffffff;
          position: relative;
          font-family: 'Segoe UI', system-ui, sans-serif;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          display: flex;
          flex-direction: column;
          border-radius: 12px;
        }

        @media print {
          @page { size: A5 landscape; margin: 0; }
          body, html { background: white !important; margin: 0 !important; padding: 0 !important; width: 100% !important; height: 100% !important; overflow: hidden !important; }
          .print-btn { display: none !important; }
          .label-container {
            width: 210mm !important;
            height: 148mm !important;
            margin: 0 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            border: none !important;
            page-break-after: avoid;
            page-break-inside: avoid;
          }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
        }

        .header-bg-curve {
          position: absolute;
          top: 0;
          left: 0;
          width: 52%;
          height: 110px;
          background: ${NAVY};
          border-bottom-right-radius: 120px;
          z-index: 1;
        }
        
        .details-row {
          display: flex;
          align-items: center;
          height: 12.5%;
          border-bottom: 1px solid #eef0f3;
        }
        .details-row:nth-child(even) { background: #fcfcfd; }
        .details-row:last-child { border-bottom: none; }
      `}</style>

      <div className="print-btn no-print">
        <button onClick={() => window.print()} style={{ padding:'10px 32px', borderRadius:8, border:'none', background:ORANGE, color:'#fff', fontWeight:700, cursor:'pointer', fontSize:14 }}>
          🖨️ طباعة
        </button>
        <button onClick={() => window.history.back()} style={{ padding:'10px 24px', borderRadius:8, border:'1px solid #777', background:'transparent', color:'#ccc', fontWeight:600, cursor:'pointer', fontSize:14 }}>
          رجوع
        </button>
      </div>

      <div className="label-container">
        
        {/* === HEADER (Height: 110px) === */}
        <div style={{ height: 110, display: 'flex', position: 'relative', flexShrink: 0, zIndex: 2 }}>
          {/* Background curve for left side */}
          <div className="header-bg-curve"></div>
          
          {/* Top-Right Orange Graphic */}
          <div style={{ position: 'absolute', top: 0, right: 0, width: 220, height: 110, zIndex: 1, overflow: 'hidden' }}>
            <svg width="220" height="110" viewBox="0 0 220 110">
              <path d="M40 110 C 100 110, 160 50, 220 0 L 220 110 Z" fill={ORANGE} />
              <path d="M100 110 C 150 110, 190 70, 220 30 L 220 0 C 160 30, 110 80, 50 80 Z" fill={NAVY} />
            </svg>
            <div style={{ position: 'absolute', top: 20, right: 20, color: 'white', fontSize: 40, opacity: 0.3 }}>↗</div>
          </div>

          {/* Left Content (Logo) */}
          <div style={{ width: '52%', zIndex: 2, padding: '24px 30px', display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Custom Logo B */}
            <div style={{ position: 'relative', width: 64, height: 64 }}>
               <svg viewBox="0 0 100 100" width="100%" height="100%">
                 <rect x="5" y="5" width="90" height="90" rx="16" fill="none" stroke="white" strokeWidth="6"/>
                 <text x="50" y="70" fill="white" fontSize="56" fontWeight="900" textAnchor="middle" fontFamily="Arial, sans-serif">B</text>
                 <path d="M 20 80 Q 50 20 95 15 L 75 5 M 95 15 L 85 35" stroke={ORANGE} strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
               </svg>
            </div>
            <div style={{ color: 'white' }}>
              <div style={{ fontSize: 28, fontWeight: 900, lineHeight: 1.1, letterSpacing: 0.5 }}>Bin Habeb</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'white', lineHeight: 1.2 }}>Trading & Import</div>
              <div style={{ fontSize: 14, color: ORANGE, fontWeight: 800, lineHeight: 1.3, marginTop: 4 }}>بن حبيب للتجارة والاستيراد</div>
            </div>
          </div>

          {/* Right Content (Trust Badges) */}
          <div style={{ flex: 1, zIndex: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 36, paddingRight: 60, paddingTop: 10 }}>
            {[
              { icon: 'svg-shield', ar: 'ثقة', en: 'Trust' },
              { icon: 'svg-timer', ar: 'سرعة', en: 'Speed' },
              { icon: 'svg-pro', ar: 'احترافية', en: 'Professionalism' },
            ].map((b, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ width: 38, height: 38, margin: '0 auto 8px', border: `2px solid ${ORANGE}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: ORANGE, background: '#fff' }}>
                  {b.icon === 'svg-shield' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>}
                  {b.icon === 'svg-timer' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l3 3"/><path d="M2 12h2"/><path d="M20 12h2"/></svg>}
                  {b.icon === 'svg-pro' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-4"/></svg>}
                </div>
                <div style={{ fontSize: 13, fontWeight: 800, color: NAVY }}>{b.ar}</div>
                <div style={{ fontSize: 10, color: '#777', fontWeight: 700 }}>{b.en}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Divider line under header */}
        <div style={{ height: 4, width: '100%', background: '#e0e0e0', display: 'flex' }}>
           <div style={{ width: '52%', height: '100%', background: NAVY }}></div>
           <div style={{ flex: 1, height: '100%', background: '#e0e0e0' }}></div>
        </div>

        {/* === MAIN BODY === */}
        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
          
          {/* Left Panel: Cargo No & QR (Width: ~340px) */}
          <div style={{ width: 340, display: 'flex', flexDirection: 'column', padding: '16px 24px', borderRight: '1px solid #e0e0e0' }}>
            
            <div style={{ fontSize: 18, fontWeight: 900, color: NAVY, textAlign: 'left', marginBottom: 2 }}>رقم الشحنة</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#666', textAlign: 'left', letterSpacing: 1 }}>CARGO NO.</div>
            <div style={{ width: 44, height: 4, background: ORANGE, marginTop: 6, marginBottom: 20 }}></div>
            
            {/* Cargo Number huge */}
            <div style={{ display: 'flex', alignItems: 'baseline', marginTop: 10, marginBottom: 20 }}>
              <span style={{ fontSize: 64, fontWeight: 900, color: NAVY, letterSpacing: -1 }}>{labelPrefix}</span>
              <span style={{ fontSize: 64, fontWeight: 900, color: ORANGE, letterSpacing: -1 }}>{labelNumber}</span>
            </div>
            
            {/* Divider line with text */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              <div style={{ flex: 1, height: 1, background: '#ccc' }}></div>
              <div style={{ fontSize: 10, fontWeight: 800, color: NAVY, letterSpacing: 1 }}>SMARTSHIP-{labelNumber}-{destWord}</div>
              <div style={{ flex: 1, height: 1, background: '#ccc' }}></div>
            </div>

            {/* QR Code Block */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
               <div style={{ position: 'relative', display: 'inline-block' }}>
                 <div style={{ padding: 10, border: '2px solid #ddd', borderRadius: 8 }}>
                   <QRCodeSVG value={trackingUrl} size={96} level="M" />
                 </div>
                 {/* SCAN TO TRACK Badge */}
                 <div style={{ position: 'absolute', bottom: -12, left: '50%', transform: 'translateX(-50%)', background: NAVY, color: ORANGE, fontSize: 10, fontWeight: 900, padding: '4px 14px', borderRadius: 4, whiteSpace: 'nowrap' }}>
                   SCAN TO TRACK
                 </div>
               </div>
            </div>

          </div>

          {/* Right Panel: Details Table */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
            
            {/* Navy column for icons on the far right */}
            <div style={{ position: 'absolute', top: 0, right: 0, width: 48, height: '100%', background: NAVY, zIndex: 1 }}></div>

            {/* Table Rows */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', zIndex: 2 }}>
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
                  <div style={{ width: 150, paddingLeft: 16, fontSize: 10, color: '#666', fontWeight: 700, letterSpacing: 0.5 }}>{row.en}</div>
                  <div style={{ flex: 1, textAlign: 'center', fontSize: 14, fontWeight: 900, color: NAVY }}>{row.val}</div>
                  <div style={{ width: 110, paddingRight: 20, textAlign: 'right', fontSize: 12, color: '#444', fontWeight: 800 }}>{row.ar}</div>
                  <div style={{ width: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <div style={{ width: 26, height: 26, borderRadius: '50%', border: `1.5px solid ${ORANGE}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: ORANGE }}>
                        {row.icon === 'user' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
                        {row.icon === 'id' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M8 10h.01M12 10h4M8 14h.01M12 14h4"/></svg>}
                        {row.icon === 'map' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>}
                        {row.icon === 'box' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>}
                        {row.icon === 'globe' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>}
                        {row.icon === 'weight' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>}
                        {row.icon === 'cube' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>}
                        {row.icon === 'boxes' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>}
                     </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* === SHIPMENT INFO BAR (Height: 64px) === */}
        <div style={{ height: 64, display: 'flex', borderTop: `2px solid ${ORANGE}`, borderBottom: '2px solid #e0e0e0', flexShrink: 0 }}>
          {[
            { icon: 'calendar', ar: 'تاريخ الشحن', en: 'SHIPMENT DATE', val: formatDate(label.shipment_date) },
            { icon: 'ship', ar: 'طريقة الشحن', en: 'SHIPMENT METHOD', val: label.shipment_method || 'SEA FREIGHT' },
            { icon: 'doc', ar: 'ملاحظات', en: 'REMARKS', val: label.remarks || 'يُحفظ بعيداً عن الرطوبة والحرارة' },
          ].map((item, i) => (
            <div key={i} style={{ flex: i === 2 ? 1.5 : 1, display: 'flex', alignItems: 'center', padding: '0 20px', borderRight: i < 2 ? '1px solid #e0e0e0' : 'none', gap: 16 }}>
              <div style={{ color: ORANGE }}>
                {item.icon === 'calendar' && <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><circle cx="9" cy="16" r="1"/><circle cx="15" cy="16" r="1"/></svg>}
                {item.icon === 'ship' && <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 21h20"/><path d="M4 17l1.5-6h13L20 17"/><path d="M6 11V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4"/><circle cx="12" cy="14" r="1"/></svg>}
                {item.icon === 'doc' && <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 900, color: NAVY }}>{item.ar}</span>
                  <span style={{ fontSize: 9, color: '#888', fontWeight: 800 }}>{item.en}</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 900, color: NAVY }}>{item.val}</div>
              </div>
            </div>
          ))}
        </div>

        {/* === CONTACT BAR (Height: 64px) === */}
        <div style={{ height: 64, display: 'flex', background: NAVY, color: 'white', flexShrink: 0 }}>
          
          {/* China Office */}
          <div style={{ flex: 1.2, display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12, borderRight: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ width: 44, height: 44, background: '#dd2025', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'yellow', fontSize: 20 }}>★</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 900 }}>مكتب الصين <span style={{ fontSize: 9, color: ORANGE, fontWeight: 700, marginInlineStart: 4 }}>CHINA OFFICE</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <span style={{ fontSize: 15, fontWeight: 800 }} dir="ltr">{chinaPhone}</span>
              </div>
            </div>
          </div>

          {/* Aden Rep */}
          <div style={{ flex: 1.2, display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12, borderRight: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ width: 44, height: 44, border: '2px solid white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 900 }}>مندوب عدن <span style={{ fontSize: 9, color: ORANGE, fontWeight: 700, marginInlineStart: 4 }}>ADEN REP</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <span style={{ fontSize: 15, fontWeight: 800 }} dir="ltr">{adenPhone}</span>
              </div>
            </div>
          </div>

          {/* Socials / Website */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 16px', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: ORANGE }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              <span style={{ color: 'white', fontWeight: 700 }}>binhabeb.com</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: ORANGE }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <span style={{ color: 'white', fontWeight: 700 }} dir="ltr">{customerPhone}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: ORANGE }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <span style={{ color: 'white', fontWeight: 700 }}>info@binhabeb.com</span>
            </div>
          </div>

          {/* Sea & Air Freight block */}
          <div style={{ width: 190, background: ORANGE, clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 0 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
             <div style={{ fontSize: 15, fontWeight: 900 }}>نقل بحري وجوي</div>
             <div style={{ fontSize: 11, fontWeight: 800 }}>SEA & AIR FREIGHT</div>
             <div style={{ display: 'flex', gap: 14, marginTop: 4 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M2 21h20"/><path d="M4 17l1.5-6h13L20 17"/><path d="M6 11V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4"/><circle cx="12" cy="14" r="1"/></svg>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.6L3 8l6.5 4L5 16.5l-3.3-1.1-1.4 1.4L4.6 21l4.2-4.3 4.5 4.5 1.8-1.7.4-6.8 5.6-5.6"/></svg>
             </div>
          </div>

        </div>

        {/* === BOTTOM HANDLING ICONS === */}
        <div style={{ height: 44, display: 'flex', alignItems: 'center', background: 'white', flexShrink: 0 }}>
          {[
            { icon: '↑↑', ar: 'أعلى', en: 'THIS SIDE UP' },
            { icon: '☂', ar: 'يحفظ جافاً', en: 'KEEP DRY' },
            { icon: '🍷', ar: 'قابل للكسر', en: 'FRAGILE' },
            { icon: '🤲', ar: 'يتعامل بحذر', en: 'HANDLE WITH CARE' },
          ].map((h, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, height: '100%', borderRight: '1px solid #e0e0e0' }}>
              <span style={{ fontSize: 24, color: NAVY }}>
                 {h.en === 'THIS SIDE UP' && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 19V5M5 12l7-7 7 7"/></svg>}
                 {h.en === 'KEEP DRY' && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v10m-5-5l5-5 5 5M4 16c0 4.4 3.6 8 8 8s8-3.6 8-8"/></svg>}
                 {h.en === 'FRAGILE' && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2l-7 9h14l-7-9zM5 11v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-9"/><path d="M9 22V11M15 22V11"/></svg>}
                 {h.en === 'HANDLE WITH CARE' && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 13l-3 3-3-3m18 0l-3 3-3-3M2 17v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2M12 4v8M8 8l4-4 4 4"/></svg>}
              </span>
              <div>
                <div style={{ fontSize: 11, fontWeight: 900, color: NAVY }}>{h.ar}</div>
                <div style={{ fontSize: 8, color: '#888', fontWeight: 800 }}>{h.en}</div>
              </div>
            </div>
          ))}

          {/* Receiver Signature */}
          <div style={{ flex: 1.5, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16 }}>
            <div style={{ flex: 1, borderBottom: '2px solid #bbb', height: 20 }}></div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, fontWeight: 900, color: NAVY }}>توقيع المستلم</div>
              <div style={{ fontSize: 9, color: '#888', fontWeight: 800 }}>RECEIVER SIGNATURE</div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
