'use client';
import { use, useState, useEffect, useRef } from 'react';
import { getTranslations, Locale } from '@/lib/translations';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import { FadeInView } from '@/components/Animations';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Download, RotateCcw, ChevronUp, ChevronDown, Calculator as CalcIcon } from 'lucide-react';
import html2canvas from 'html2canvas';
import { useSettingsStore } from '@/store/useSettingsStore';

const calcDict = {
  ar: {
    title: 'حاسبة الشحن الذكية',
    subtitle: 'احسب التكلفة النهائية لمنتجاتك واصلة إلى مستودعك',
    productDetails: 'بيانات المنتج',
    unitPrice: 'سعر القطعة',
    unitsPerCarton: 'القطع بالكرتون',
    cartonVolume: 'حجم الكرتون',
    finalCost: 'التكلفة النهائية للقطعة داخل مستودعك',
    breakdown: 'تفاصيل الحساب',
    productCost: 'تكلفة المنتج',
    shippingCost: 'تكلفة الشحن للقطعة',
    reset: 'إعادة ضبط',
    export: 'حفظ الفاتورة',
    editRates: 'تعديل أسعار الصرف',
    usdRmb: 'دولار إلى يوان',
    usdSar: 'دولار إلى ريال',
    estimateTitle: 'عرض سعر مبدئي',
    companyName: 'مؤسسة بن حبيب للتجارة والاستيراد',
    disclaimer: 'هذا العرض تقريبي وقابل للتغيير الطفيف بناءً على القياسات الفعلية وأسعار الصرف اليومية.',
    thankYou: 'شكراً لاختياركم بن حبيب'
  },
  en: {
    title: 'Smart Shipping Calculator',
    subtitle: 'Estimate the final landed cost of your products',
    productDetails: 'Product Details',
    unitPrice: 'Unit Price',
    unitsPerCarton: 'Units per Carton',
    cartonVolume: 'Carton Volume',
    finalCost: 'Final Landed Cost per Unit',
    breakdown: 'Calculation Breakdown',
    productCost: 'Product Cost',
    shippingCost: 'Shipping Cost per Unit',
    reset: 'Reset',
    export: 'Save Invoice',
    editRates: 'Edit Exchange Rates',
    usdRmb: 'USD to RMB',
    usdSar: 'USD to SAR',
    estimateTitle: 'ESTIMATE QUOTE',
    companyName: 'Bin Habib Trading & Import',
    disclaimer: 'This is an estimate quote and subject to minor changes based on actual measurements and daily exchange rates.',
    thankYou: 'Thank you for choosing Bin Habeb'
  }
};

export default function CalculatorPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const loc = (locale === 'ar' ? 'ar' : 'en') as Locale;
  const t = getTranslations(loc);
  const ct = calcDict[loc];

  const globalFixedCbmRate = useSettingsStore((state) => state.fixedCbmRate);
  const globalOfficeCommission = useSettingsStore((state) => state.officeCommission);
  const fetchSettings = useSettingsStore((state) => state.fetchSettings);

  const [unitPriceRMB, setUnitPriceRMB] = useState('');
  const [unitsPerCarton, setUnitsPerCarton] = useState('');
  const [cartonVolumeCBM, setCartonVolumeCBM] = useState('');
  const [exRmb, setExRmb] = useState('7.24');
  const [exSar, setExSar] = useState('3.75');
  const [showRates, setShowRates] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(true);
  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleReset = () => {
    setUnitPriceRMB('');
    setUnitsPerCarton('');
    setCartonVolumeCBM('');
  };

  const priceRMB = parseFloat(unitPriceRMB) || 0;
  const units = parseInt(unitsPerCarton) || 1;
  const volumeCBM = parseFloat(cartonVolumeCBM) || 0;
  const commission = globalOfficeCommission || 0;
  const cbmRate = globalFixedCbmRate || 0;
  const rateRMB = parseFloat(exRmb) || 7.24;
  const rateSAR = parseFloat(exSar) || 3.75;

  const commAmountRMB = priceRMB * (commission / 100);
  const productCommRMB = priceRMB + commAmountRMB;
  const shippingCartonUSD = volumeCBM * cbmRate;
  const shippingUnitRMB = (shippingCartonUSD / units) * rateRMB;
  const finalTotalRMB = productCommRMB + shippingUnitRMB;
  const finalTotalSAR = finalTotalRMB * (rateSAR / rateRMB);
  const finalTotalUSD = finalTotalRMB / rateRMB;

  const handleDownload = async () => {
    if (invoiceRef.current) {
      invoiceRef.current.style.display = 'block';
      const canvas = await html2canvas(invoiceRef.current, {
        backgroundColor: '#051024',
        scale: 2,
        useCORS: true,
      });
      invoiceRef.current.style.display = 'none';

      const link = document.createElement('a');
      link.download = `SmartShip-Quote-${new Date().getTime()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  return (
    <>
      <Header locale={loc} />
      <main style={{ paddingTop: 'calc(var(--header-height) + 40px)', minHeight: '100vh', padding: '120px 20px 120px' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <FadeInView>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 40 }}>
              <div style={{ width: 64, height: 64, borderRadius: 20, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginBottom: 20, boxShadow: '0 8px 32px var(--primary-glow)' }}>
                <CalcIcon size={32} />
              </div>
              <h1 style={{ fontSize: 28, fontWeight: 800, textAlign: 'center', marginBottom: 8 }}>{ct.title}</h1>
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', maxWidth: 400 }}>{ct.subtitle}</p>
            </div>
          </FadeInView>

          <div className="glass-card" style={{ padding: 32, marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, borderBottom: '1px solid var(--glass-border)', paddingBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--primary-light)' }}>
                <Box size={20} />
                <h3 style={{ fontSize: 18, fontWeight: 700, color: 'white' }}>{ct.productDetails}</h3>
              </div>
              <button onClick={handleReset} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <RotateCcw size={14} /> {ct.reset}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{ct.unitPrice} (RMB)</label>
                <input type="text" inputMode="decimal" className="input-glass" value={unitPriceRMB} onChange={e => {
                  const v = e.target.value;
                  if (v === '' || /^[0-9]*\.?[0-9]*$/.test(v)) setUnitPriceRMB(v);
                }} placeholder="0.00" dir="ltr" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{ct.unitsPerCarton}</label>
                  <input type="text" inputMode="numeric" className="input-glass" value={unitsPerCarton} onChange={e => {
                    const v = e.target.value;
                    if (v === '' || /^[0-9]*$/.test(v)) setUnitsPerCarton(v);
                  }} placeholder="0" dir="ltr" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{ct.cartonVolume} (CBM)</label>
                  <input type="text" inputMode="decimal" className="input-glass" value={cartonVolumeCBM} onChange={e => {
                    const v = e.target.value;
                    if (v === '' || /^[0-9]*\.?[0-9]*$/.test(v)) setCartonVolumeCBM(v);
                  }} placeholder="0.000" dir="ltr" />
                </div>
              </div>
            </div>

            {/* Rates Accordion */}
            <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--glass-border)' }}>
              <button onClick={() => setShowRates(!showRates)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', color: 'var(--text-tertiary)', fontSize: 12, cursor: 'pointer' }}>
                <span>{ct.editRates}</span>
                {showRates ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              <AnimatePresence>
                {showRates && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                    <div style={{ paddingTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4 }}>{ct.usdRmb}</label>
                        <input type="text" className="input-glass" style={{ padding: '8px 12px', fontSize: 13 }} value={exRmb} onChange={e => setExRmb(e.target.value)} dir="ltr" />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4 }}>{ct.usdSar}</label>
                        <input type="text" className="input-glass" style={{ padding: '8px 12px', fontSize: 13 }} value={exSar} onChange={e => setExSar(e.target.value)} dir="ltr" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Results Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card glow-primary" 
            style={{ 
              padding: 40, 
              position: 'relative', 
              overflow: 'hidden',
              background: 'linear-gradient(135deg, rgba(0, 102, 255, 0.1) 0%, rgba(10, 22, 48, 0.8) 100%)',
              border: '1px solid rgba(0, 102, 255, 0.3)'
            }}
          >
            <div style={{ position: 'absolute', top: -100, right: -100, width: 300, height: 300, background: 'var(--primary)', filter: 'blur(100px)', opacity: 0.1, borderRadius: '50%' }} />
            
            <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
              <h4 style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>{ct.finalCost}</h4>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 24 }}>
                <span style={{ fontSize: 56, fontWeight: 900, color: 'white', fontFamily: 'var(--font-en)', lineHeight: 1 }}>
                  <span style={{ fontSize: 24, color: 'var(--primary-light)', marginRight: 6, verticalAlign: 'top' }}>¥</span>
                  {finalTotalRMB.toFixed(2)}
                </span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, background: 'rgba(0,0,0,0.3)', padding: '16px 32px', borderRadius: 100, width: 'fit-content', margin: '0 auto 32px', border: '1px solid var(--glass-border)', backdropFilter: 'blur(10px)' }}>
                <span style={{ color: 'var(--success)', fontWeight: 800, fontSize: 18 }}>SAR {finalTotalSAR.toFixed(2)}</span>
                <div style={{ width: 1, height: 20, background: 'var(--glass-border)' }} />
                <span style={{ color: 'var(--primary-light)', fontWeight: 800, fontSize: 18 }}>USD {finalTotalUSD.toFixed(2)}</span>
              </div>

              {/* Breakdown */}
              <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: 24, textAlign: loc === 'ar' ? 'right' : 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 15, fontWeight: 500 }}>{ct.productCost}</span>
                  <span style={{ color: 'white', fontWeight: 700, fontFamily: 'var(--font-en)', fontSize: 16 }}>¥ {productCommRMB.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 15, fontWeight: 500 }}>{ct.shippingCost}</span>
                  <span style={{ color: 'white', fontWeight: 700, fontFamily: 'var(--font-en)', fontSize: 16 }}>¥ {shippingUnitRMB.toFixed(2)}</span>
                </div>
              </div>

              <button onClick={handleDownload} className="btn-primary" style={{ marginTop: 40, width: '100%', padding: '18px', fontSize: 16, borderRadius: 'var(--radius-xl)' }}>
                <Download size={22} />
                {ct.export}
              </button>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Hidden Invoice Template */}
      <div style={{ position: 'fixed', left: '-9999px', top: 0 }}>
        <div ref={invoiceRef} style={{ width: 800, background: '#051024', color: 'white', padding: 48, direction: loc === 'ar' ? 'rtl' : 'ltr', fontFamily: loc === 'ar' ? 'var(--font-ar)' : 'var(--font-en)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid rgba(255,255,255,0.1)', paddingBottom: 32, marginBottom: 40 }}>
            <div>
              <img src="/logo.png" alt="Bin Habeb Logo" style={{ height: 60, width: 'auto', marginBottom: 12, display: 'block' }} />
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16 }}>{ct.companyName}</div>
            </div>
            <div style={{ textAlign: loc === 'ar' ? 'left' : 'right' }}>
              <h2 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>{ct.estimateTitle}</h2>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginTop: 12 }}>{new Date().toLocaleDateString(loc === 'ar' ? 'ar-SA' : 'en-US')}</div>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 40 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.1)', textAlign: loc === 'ar' ? 'right' : 'left' }}>
                <th style={{ padding: '16px 0', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>{loc === 'ar' ? 'الوصف' : 'Description'}</th>
                <th style={{ padding: '16px 0', textAlign: loc === 'ar' ? 'left' : 'right', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>{loc === 'ar' ? 'القيمة' : 'Amount'}</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '24px 0' }}>
                  <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>{ct.productCost}</div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>{units} {loc === 'ar' ? 'قطعة' : 'pcs'} × ¥{priceRMB.toFixed(2)} (+ {commission}%)</div>
                </td>
                <td style={{ padding: '24px 0', textAlign: loc === 'ar' ? 'left' : 'right', fontWeight: 700, fontSize: 18 }}>¥{(productCommRMB * units).toFixed(2)}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '24px 0' }}>
                  <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>{ct.shippingCost}</div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>{loc === 'ar' ? 'شامل الجمارك والتخليص' : 'Including customs and clearance'}</div>
                </td>
                <td style={{ padding: '24px 0', textAlign: loc === 'ar' ? 'left' : 'right', fontWeight: 700, fontSize: 18 }}>¥{(shippingUnitRMB * units).toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div style={{ display: 'flex', justifyContent: loc === 'ar' ? 'flex-start' : 'flex-end' }}>
            <div style={{ width: 400, background: 'rgba(0,102,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 20, padding: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <span style={{ color: 'rgba(255,255,255,0.7)' }}>{loc === 'ar' ? 'الإجمالي (يوان)' : 'Total (RMB)'}</span>
                <span style={{ fontWeight: 700 }}>¥{(finalTotalRMB * units).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <span style={{ color: 'rgba(255,255,255,0.7)' }}>{loc === 'ar' ? 'الإجمالي (دولار)' : 'Total (USD)'}</span>
                <span style={{ fontWeight: 700 }}>${(finalTotalUSD * units).toFixed(2)}</span>
              </div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', margin: '20px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 20, fontWeight: 800 }}>{loc === 'ar' ? 'الإجمالي النهائي' : 'Final Total'}</span>
                <span style={{ fontSize: 28, fontWeight: 900, color: 'var(--primary)' }}>SAR {(finalTotalSAR * units).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 80, textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 32 }}>
            <div style={{ color: 'var(--primary)', fontWeight: 700, fontSize: 18, marginBottom: 12 }}>{ct.thankYou}</div>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, maxWidth: 500, margin: '0 auto 20px', lineHeight: 1.6 }}>{ct.disclaimer}</p>
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>www.binhabeb.com</div>
          </div>
        </div>
      </div>

      <Footer locale={loc} />
      <BottomNav locale={loc} />
    </>
  );
}
