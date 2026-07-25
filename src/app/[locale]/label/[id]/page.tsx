'use client';
import { use, useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { QRCodeSVG } from 'qrcode.react';

export default function LabelPrintPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = use(params);
  const [label, setLabel] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const labelRef = useRef<HTMLDivElement>(null);

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

  if (loading) return <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'#f0f2f5',fontFamily:'Arial' }}>
    <div style={{ textAlign:'center' }}>
      <div style={{ width:40,height:40,border:'3px solid #E8731A',borderTopColor:'transparent',borderRadius:'50%',animation:'spin 1s linear infinite',margin:'0 auto 16px' }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ color:'#666' }}>Loading label…</div>
    </div>
  </div>;

  if (!label) return <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'#f0f2f5',fontFamily:'Arial',color:'#666' }}>Label not found</div>;

  const trackingUrl = `https://www.binhabeb.com/${locale}/tracking?id=${label.shipment_id}`;
  const chinaPhone = settings?.contact_phone || '+86 193 8307 9080';
  const adenPhone = '+967 783 326 838';

  const formatDate = (d: string) => {
    if (!d) return '—';
    const dt = new Date(d);
    return `${String(dt.getDate()).padStart(2,'0')} / ${String(dt.getMonth()+1).padStart(2,'0')} / ${dt.getFullYear()}`;
  };

  // Design constants
  const NAVY = '#1B2A4A';
  const ORANGE = '#E8731A';
  const GRAY_BG = '#EEF1F5';

  return (
    <>
      <style>{`
        @page { size: A5 landscape; margin: 0; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { margin: 0; padding: 0; background: #e8e8e8; }
        @media print {
          html, body { background: white !important; }
          .no-print { display: none !important; }
          .label-card { box-shadow: none !important; margin: 0 !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
        }
      `}</style>

      {/* Toolbar – hidden on print */}
      <div className="no-print" style={{ display:'flex', gap:12, justifyContent:'center', padding:'16px 20px', background:'#1a1a2e', fontFamily:'Arial' }}>
        <button onClick={() => window.print()} style={{ padding:'10px 32px', borderRadius:10, border:'none', background:ORANGE, color:'#fff', fontWeight:700, cursor:'pointer', fontSize:14, display:'flex', alignItems:'center', gap:8 }}>
          🖨️ طباعة / تحميل PDF
        </button>
        <button onClick={() => window.history.back()} style={{ padding:'10px 24px', borderRadius:10, border:'1px solid #555', background:'transparent', color:'#ccc', fontWeight:600, cursor:'pointer', fontSize:14 }}>
          ← رجوع
        </button>
      </div>

      {/* ===== A5 LANDSCAPE LABEL (210mm × 148mm) ===== */}
      <div ref={labelRef} className="label-card" style={{
        width: '210mm', height: '148mm', margin: '24px auto',
        background: '#fff', fontFamily: "'Segoe UI', Tahoma, Arial, sans-serif",
        overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
        display: 'flex', flexDirection: 'column', borderRadius: 4,
      }}>

        {/* ═══════ HEADER BAR ═══════ */}
        <div style={{
          background: `linear-gradient(135deg, ${NAVY} 0%, #243B5E 100%)`,
          color: '#fff', display: 'flex', alignItems: 'center', padding: '0 24px',
          height: 72, flexShrink: 0,
        }}>
          {/* Logo */}
          <div style={{ display:'flex', alignItems:'center', gap:12, flex:1 }}>
            {/* Logo icon */}
            <div style={{ position:'relative', width:48, height:48 }}>
              <div style={{ width:48, height:48, borderRadius:12, border:`2px solid ${ORANGE}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <span style={{ fontSize:24, fontWeight:900, color:ORANGE }}>B</span>
              </div>
              <div style={{ position:'absolute', top:-2, right:-4, width:14, height:14, background:ORANGE, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <span style={{ fontSize:7, color:'#fff', fontWeight:900 }}>↗</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize:20, fontWeight:900, letterSpacing:0.5, lineHeight:1.1 }}>Bin Habeb</div>
              <div style={{ fontSize:12, fontWeight:700, color:ORANGE, lineHeight:1.2 }}>Trading & Import</div>
              <div style={{ fontSize:9, color:'rgba(255,255,255,0.5)', lineHeight:1.3 }}>بن حبيب للتجارة والاستيراد</div>
            </div>
          </div>

          {/* Trust Badges */}
          <div style={{ display:'flex', gap:28 }}>
            {[
              { icon:'✓', ar:'ثقة', en:'Trust' },
              { icon:'⚡', ar:'سرعة', en:'Speed' },
              { icon:'★', ar:'احترافية', en:'Professionalism' },
            ].map((b,i) => (
              <div key={i} style={{ textAlign:'center' }}>
                <div style={{ width:34, height:34, borderRadius:'50%', border:`2px solid ${ORANGE}`, background:'rgba(232,115,26,0.08)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, color:ORANGE, margin:'0 auto 4px' }}>{b.icon}</div>
                <div style={{ fontSize:9, fontWeight:700, color:'rgba(255,255,255,0.9)' }}>{b.ar}</div>
                <div style={{ fontSize:7, color:'rgba(255,255,255,0.4)' }}>{b.en}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══════ MAIN BODY ═══════ */}
        <div style={{ flex:1, display:'flex', minHeight:0 }}>

          {/* ─── LEFT: Cargo Number + QR ─── */}
          <div style={{
            width: 210, background: GRAY_BG, display:'flex', flexDirection:'column',
            alignItems:'center', justifyContent:'center', padding:'10px 12px',
            borderRight: `3px solid ${ORANGE}`, flexShrink:0,
          }}>
            <div style={{ fontSize:11, fontWeight:800, color:'#555', letterSpacing:0.5 }}>رقم الشحنة</div>
            <div style={{ fontSize:9, color:'#999', fontWeight:600, marginBottom:6, letterSpacing:1 }}>CARGO NO.</div>

            {/* Big number */}
            <div style={{ display:'flex', alignItems:'baseline', lineHeight:1 }}>
              <span style={{ fontSize:22, fontWeight:700, color:NAVY }}>BH-</span>
              <span style={{ fontSize:42, fontWeight:900, color:NAVY, letterSpacing:2 }}>
                {label.label_number.replace('BH-','')}
              </span>
            </div>

            {/* QR Code */}
            <div style={{ margin:'8px 0', background:'#fff', padding:8, borderRadius:8, boxShadow:'0 2px 8px rgba(0,0,0,0.06)', display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
              <QRCodeSVG value={trackingUrl} size={72} level="M" />
              <div style={{ background:ORANGE, color:'#fff', fontSize:6.5, fontWeight:800, padding:'2px 10px', borderRadius:3, letterSpacing:0.8, textTransform:'uppercase' }}>SCAN TO TRACK</div>
            </div>

            <div style={{ fontSize:6.5, color:'#aaa', fontWeight:600, letterSpacing:0.3, marginTop:2, textAlign:'center' }}>
              SMARTSHIP-{label.label_number.replace('BH-','')}-{(label.destination || 'DEST').split(' ')[0].split('-')[0].toUpperCase()}
            </div>
          </div>

          {/* ─── RIGHT: Details Table ─── */}
          <div style={{ flex:1, display:'flex', flexDirection:'column' }}>
            {[
              { en:'CUSTOMER NAME', ar:'اسم العميل', val: label.customer_name },
              { en:'CUSTOMER NO.', ar:'رقم العميل', val: label.customer_phone || '—' },
              { en:'DESTINATION', ar:'الوجهة', val: label.destination || '—' },
              { en:'GOODS TYPE', ar:'نوع البضاعة', val: label.product || '—' },
              { en:'ORIGIN', ar:'بلد المنشأ', val: `${label.origin || 'China'} (China)` },
              { en:'WEIGHT', ar:'الوزن', val: label.weight_kg ? `${label.weight_kg} KG` : '—' },
              { en:'VOLUME', ar:'الحجم', val: label.volume_cbm ? `${label.volume_cbm} CBM` : '—' },
              { en:'PACKAGE', ar:'عدد الطرود', val: label.package_count ? `${label.package_count} PCS` : '—' },
            ].map((row, i) => (
              <div key={i} style={{
                flex:1, display:'flex', alignItems:'center',
                borderBottom: i < 7 ? '1px solid #E5E7EB' : 'none',
                background: i % 2 === 0 ? '#fff' : '#FAFBFC',
                padding: '0 16px',
              }}>
                <div style={{ width:140, fontSize:8.5, color:'#777', fontWeight:700, textTransform:'uppercase', letterSpacing:0.5 }}>{row.en}</div>
                <div style={{ flex:1, fontSize:11.5, fontWeight:700, color:NAVY }}>{row.val}</div>
                <div style={{ fontSize:9.5, color:'#999', fontWeight:700, textAlign:'right', minWidth:70 }}>{row.ar}</div>
                {/* Orange right accent */}
                <div style={{ width:28, height:'100%', background:`linear-gradient(180deg, ${i%2===0?'rgba(232,115,26,0.06)':'rgba(232,115,26,0.03)'} 0%, rgba(232,115,26,0.12) 100%)`, display:'flex', alignItems:'center', justifyContent:'center', marginRight:-16, marginLeft:10 }}>
                  <div style={{ width:3, height:'60%', background:ORANGE, borderRadius:2, opacity:0.4 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══════ SHIPMENT INFO BAR ═══════ */}
        <div style={{
          display:'flex', background:GRAY_BG, borderTop:`2px solid ${ORANGE}`,
          flexShrink:0, height:44,
        }}>
          {[
            { icon:'📅', ar:'تاريخ الشحن', en:'SHIPMENT DATE', val: formatDate(label.shipment_date) },
            { icon:'🚢', ar:'طريقة الشحن', en:'SHIPMENT METHOD', val: label.shipment_method || 'SEA FREIGHT' },
            { icon:'📝', ar:'ملاحظات', en:'REMARKS', val: label.remarks || 'يُحفظ بعيداً عن الرطوبة والحرارة' },
          ].map((item, i) => (
            <div key={i} style={{
              flex: i===2 ? 2 : 1, padding:'6px 16px', display:'flex', alignItems:'center', gap:10,
              borderRight: i<2 ? '1px solid #D5D8DC' : 'none',
            }}>
              <span style={{ fontSize:16 }}>{item.icon}</span>
              <div>
                <div style={{ display:'flex', gap:8, alignItems:'baseline' }}>
                  <span style={{ fontSize:8, fontWeight:800, color:'#555' }}>{item.ar}</span>
                  <span style={{ fontSize:6.5, color:'#aaa', textTransform:'uppercase', fontWeight:600 }}>{item.en}</span>
                </div>
                <div style={{ fontSize:10, fontWeight:700, color:NAVY, marginTop:1 }}>{item.val}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ═══════ CONTACT BAR ═══════ */}
        <div style={{
          display:'flex', background:NAVY, color:'#fff', flexShrink:0, height:46,
        }}>
          {/* China Office */}
          <div style={{ flex:1, padding:'0 16px', display:'flex', alignItems:'center', gap:10, borderRight:'1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ width:26, height:26, borderRadius:'50%', border:`1.5px solid ${ORANGE}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, flexShrink:0 }}>📞</div>
            <div>
              <div style={{ fontSize:9, fontWeight:800, color:ORANGE }}>مكتب الصين</div>
              <div style={{ fontSize:6, color:'rgba(255,255,255,0.4)', fontWeight:600 }}>CHINA OFFICE</div>
              <div style={{ fontSize:9.5, fontWeight:600 }} dir="ltr">{chinaPhone}</div>
            </div>
          </div>
          {/* Aden Rep */}
          <div style={{ flex:1, padding:'0 16px', display:'flex', alignItems:'center', gap:10, borderRight:'1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ width:26, height:26, borderRadius:'50%', border:`1.5px solid ${ORANGE}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, flexShrink:0 }}>👤</div>
            <div>
              <div style={{ fontSize:9, fontWeight:800, color:ORANGE }}>مندوب عدن</div>
              <div style={{ fontSize:6, color:'rgba(255,255,255,0.4)', fontWeight:600 }}>ADEN REPRESENTATIVE</div>
              <div style={{ fontSize:9.5, fontWeight:600 }} dir="ltr">{adenPhone}</div>
            </div>
          </div>
          {/* Website */}
          <div style={{ flex:1.2, padding:'0 16px', display:'flex', alignItems:'center', gap:10, borderRight:'1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ width:26, height:26, borderRadius:'50%', border:`1.5px solid ${ORANGE}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, flexShrink:0 }}>🌐</div>
            <div>
              <div style={{ fontSize:10, fontWeight:700 }}>binhabeb.com</div>
              <div style={{ fontSize:8, fontWeight:600 }} dir="ltr">{label.customer_phone || '+967 770 966 517'}</div>
              <div style={{ fontSize:7.5, color:'rgba(255,255,255,0.5)' }}>info@binhabeb.com</div>
            </div>
          </div>
          {/* Sea & Air badge */}
          <div style={{ padding:'0 18px', display:'flex', alignItems:'center', gap:8, background:ORANGE, flexShrink:0 }}>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:11, fontWeight:900, lineHeight:1.2 }}>نقل بحري وجوي</div>
              <div style={{ fontSize:7.5, fontWeight:700, opacity:0.85 }}>SEA & AIR FREIGHT</div>
            </div>
            <span style={{ fontSize:20 }}>🚢</span>
          </div>
        </div>

        {/* ═══════ BOTTOM HANDLING ICONS ═══════ */}
        <div style={{
          display:'flex', alignItems:'center', background:'#FAFAFA',
          borderTop:'1px solid #E5E7EB', flexShrink:0, height:34,
        }}>
          {[
            { icon:'⬆️', ar:'أعلى', en:'THIS SIDE UP' },
            { icon:'💧', ar:'يحفظ جافاً', en:'KEEP DRY' },
            { icon:'⚠️', ar:'قابل للكسر', en:'FRAGILE' },
            { icon:'🤲', ar:'يتعامل بحذر', en:'HANDLE WITH CARE' },
          ].map((h, i) => (
            <div key={i} style={{
              flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:5,
              borderRight:'1px solid #E5E7EB',
            }}>
              <span style={{ fontSize:12 }}>{h.icon}</span>
              <div>
                <div style={{ fontSize:7, fontWeight:800, color:'#444' }}>{h.ar}</div>
                <div style={{ fontSize:5.5, color:'#999', fontWeight:600 }}>{h.en}</div>
              </div>
            </div>
          ))}
          {/* Receiver Signature */}
          <div style={{ flex:1.6, display:'flex', alignItems:'center', justifyContent:'flex-end', gap:8, padding:'0 14px' }}>
            <div style={{ flex:1, borderBottom:'1.5px solid #ccc', height:14 }} />
            <div style={{ textAlign:'right', flexShrink:0 }}>
              <div style={{ fontSize:8, fontWeight:800, color:'#444' }}>توقيع المستلم</div>
              <div style={{ fontSize:6, color:'#999', fontWeight:600 }}>RECEIVER SIGNATURE</div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
