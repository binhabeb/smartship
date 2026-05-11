'use client';
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator as CalcIcon, X, Download, ChevronUp, ChevronDown, RotateCcw, Box, Truck } from 'lucide-react';
import html2canvas from 'html2canvas';
import { useSettingsStore } from '@/store/useSettingsStore';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const dict = {
  ar: {
    title: 'حاسبة الشحن',
    subtitle: 'احسب التكلفة الإجمالية',
    shippingComm: 'سعر الشحن والعمولة',
    cbmRate: 'سعر الشحن للمتر المكعب',
    commission: 'عمولة المكتب',
    editRates: 'تعديل أسعار الصرف',
    usdRmb: 'دولار إلى يوان',
    usdSar: 'دولار إلى ريال',
    productDetails: 'بيانات المنتج',
    unitPrice: 'سعر القطعة',
    unitsPerCarton: 'القطع بالكرتون',
    cartonVolume: 'حجم الكرتون',
    finalCost: 'التكلفة النهائية للقطعة داخل مستودعك',
    perPiece: 'للقطعة',
    breakdown: 'تفاصيل الحساب',
    productCost: 'تكلفة المنتج (شاملة العمولة)',
    commAmount: 'العمولة',
    shippingCost: 'تكلفة الشحن للقطعة',
    totalShipping: 'شحن الكرتون',
    reset: 'إعادة ضبط',
    export: 'حفظ'
  },
  en: {
    title: 'SmartShip Calculator',
    subtitle: 'Landed Cost Estimator',
    shippingComm: 'Shipping & Commission',
    cbmRate: 'CBM Rate',
    commission: 'Commission',
    editRates: 'Edit Exchange Rates',
    usdRmb: 'USD to RMB',
    usdSar: 'USD to SAR',
    productDetails: 'Product Details',
    unitPrice: 'Unit Price',
    unitsPerCarton: 'Units/Carton',
    cartonVolume: 'Carton Volume',
    finalCost: 'Final Landed Cost per Unit',
    perPiece: 'per unit',
    breakdown: 'Calculation Breakdown',
    productCost: 'Product Cost (incl. Comm)',
    commAmount: 'Commission',
    shippingCost: 'Shipping per Unit',
    totalShipping: 'Total Shipping',
    reset: 'Reset',
    export: 'Save'
  }
};

export default function Calculator({ isOpen, onClose, locale = 'en' }: { isOpen: boolean; onClose: () => void; locale?: string }) {
  const isAr = locale === 'ar';
  const t = dict[isAr ? 'ar' : 'en'];
  
  const globalFixedCbmRate = useSettingsStore((state) => state.fixedCbmRate);
  
  const [fixedCbmRate, setFixedCbmRate] = useState(globalFixedCbmRate.toString());
  const [officeCommission, setOfficeCommission] = useState('5');
  const [unitPriceRMB, setUnitPriceRMB] = useState('');
  const [unitsPerCarton, setUnitsPerCarton] = useState('');
  const [cartonVolumeCBM, setCartonVolumeCBM] = useState('');
  
  const [showRates, setShowRates] = useState(false);
  const [exRmb, setExRmb] = useState('7.24');
  const [exSar, setExSar] = useState('3.75');

  const [showBreakdown, setShowBreakdown] = useState(true);
  const quoteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setFixedCbmRate(globalFixedCbmRate.toString());
  }, [globalFixedCbmRate]);

  const handleReset = () => {
    setFixedCbmRate(globalFixedCbmRate.toString());
    setOfficeCommission('5');
    setExRmb('7.24');
    setExSar('3.75');
  };

  const priceRMB = parseFloat(unitPriceRMB) || 0;
  const units = parseInt(unitsPerCarton) || 1;
  const volumeCBM = parseFloat(cartonVolumeCBM) || 0;
  const commission = parseFloat(officeCommission) || 0;
  const cbmRate = parseFloat(fixedCbmRate) || 0;
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
    if (quoteRef.current) {
      const canvas = await html2canvas(quoteRef.current, {
        backgroundColor: '#051024',
        scale: 2,
      });
      const link = document.createElement('a');
      link.download = 'SmartShip-Quote.png';
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const InputRow = ({ label, value, onChange, suffix, type = "number" }: any) => (
    <div className={cn("flex items-center justify-between gap-4 w-full", isAr ? "flex-row-reverse" : "flex-row")}>
      <label className="text-[13px] text-[var(--text-secondary)] font-medium flex-1">
        {label}
      </label>
      <div className="relative w-28 md:w-32 flex-shrink-0">
        <input
          type={type}
          inputMode="decimal"
          value={value}
          onChange={e => onChange(e.target.value)}
          dir="ltr"
          className={cn(
            "input-glass !py-2 !text-sm text-center font-semibold font-['Montserrat']",
            isAr ? "!pr-10 !pl-2" : "!pl-10 !pr-2"
          )}
        />
        <span className={cn(
          "absolute top-1/2 -translate-y-1/2 text-[11px] font-bold text-[var(--text-tertiary)] font-['Montserrat']",
          isAr ? "right-3" : "left-3"
        )}>
          {suffix}
        </span>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#030A16]/80 backdrop-blur-md z-[999]"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={cn(
              "fixed bottom-0 left-0 right-0 h-[88vh] md:h-full md:top-0 md:left-auto md:w-[460px] z-[1000]",
              "glass-panel border-t md:border-l md:border-t-0 shadow-2xl flex flex-col",
              "rounded-t-3xl md:rounded-none overflow-hidden font-sans"
            )}
            dir={isAr ? 'rtl' : 'ltr'}
            style={{ background: 'var(--bg-surface)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-[var(--glass-border)] shrink-0 bg-[var(--glass-bg)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] glow-primary">
                  <CalcIcon size={20} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white tracking-wide">
                    {t.title}
                  </h2>
                  <p className="text-[11px] text-[var(--text-tertiary)]">{t.subtitle}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-[var(--glass-bg)] border border-[var(--glass-border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-white hover:bg-[var(--glass-hover)] transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-40 custom-scrollbar relative">
              <div ref={quoteRef} className="space-y-4 max-w-full">
                
                {/* Section 1: Shipping & Commission */}
                <div className="glass-card !p-4">
                  <div className="flex items-center justify-between mb-4 border-b border-[var(--glass-border)] pb-3">
                    <div className="flex items-center gap-2 text-[var(--primary)]">
                      <Truck size={18} />
                      <h3 className="text-sm font-bold text-white">{t.shippingComm}</h3>
                    </div>
                    <button onClick={handleReset} className="text-[11px] flex items-center gap-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors" title={t.reset}>
                      <RotateCcw size={12} /> {t.reset}
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    <InputRow label={t.cbmRate} value={fixedCbmRate} onChange={setFixedCbmRate} suffix="USD" />
                    <InputRow label={t.commission} value={officeCommission} onChange={setOfficeCommission} suffix="%" />
                  </div>

                  {/* Accordion for Rates */}
                  <div className="mt-4 pt-3 border-t border-[var(--glass-border)]/50">
                    <button 
                      onClick={() => setShowRates(!showRates)}
                      className="w-full flex items-center justify-between text-[11px] text-[var(--text-secondary)] hover:text-white transition-colors py-1"
                    >
                      <span>{t.editRates}</span>
                      {showRates ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    <AnimatePresence>
                      {showRates && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-3 space-y-3">
                            <InputRow label={t.usdRmb} value={exRmb} onChange={setExRmb} suffix="RMB" />
                            <InputRow label={t.usdSar} value={exSar} onChange={setExSar} suffix="SAR" />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Section 2: Product Details */}
                <div className="glass-card !p-4">
                  <div className="flex items-center gap-2 mb-4 border-b border-[var(--glass-border)] pb-3 text-[var(--primary-light)]">
                    <Box size={18} />
                    <h3 className="text-sm font-bold text-white">{t.productDetails}</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <InputRow label={t.unitPrice} value={unitPriceRMB} onChange={setUnitPriceRMB} suffix="RMB" />
                    <InputRow label={t.unitsPerCarton} value={unitsPerCarton} onChange={setUnitsPerCarton} suffix="PCS" />
                    <InputRow label={t.cartonVolume} value={cartonVolumeCBM} onChange={setCartonVolumeCBM} suffix="CBM" />
                  </div>
                </div>

                {/* Desktop Result Breakdown */}
                <div className="hidden md:block glass-card !p-5 relative overflow-hidden glow-primary">
                  {/* Subtle background glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/10 to-transparent pointer-events-none" />
                  
                  <div className="text-center mb-5 relative z-10">
                    <h4 className="text-[11px] text-[var(--text-secondary)] mb-2 font-medium">{t.finalCost}</h4>
                    <div className="flex items-center justify-center gap-2 font-bold mb-3">
                      <span className="text-[40px] text-white font-['Montserrat'] leading-none">
                        <span className="text-[20px] text-[var(--text-tertiary)] mr-1">¥</span>
                        {finalTotalRMB.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-4 text-xs font-semibold font-['Montserrat'] bg-[var(--bg-elevated)] py-2 px-4 rounded-full mx-auto w-fit border border-[var(--glass-border)]">
                      <span className="text-[var(--success)]">SAR {finalTotalSAR.toFixed(2)}</span>
                      <div className="w-px h-3 bg-[var(--glass-border)]" />
                      <span className="text-[var(--primary-light)]">USD {finalTotalUSD.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[var(--glass-border)] space-y-2.5 text-[12px] relative z-10">
                    <div className="flex justify-between items-center text-[var(--text-secondary)]">
                      <span>{t.productCost}</span>
                      <span className="font-['Montserrat'] font-medium text-white">¥ {productCommRMB.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-[var(--text-tertiary)] text-[10px] pl-2 pr-2">
                      <span>↳ {t.commAmount} ({commission}%)</span>
                      <span className="font-['Montserrat']">¥ {commAmountRMB.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-[var(--text-secondary)] pt-2">
                      <span>{t.shippingCost}</span>
                      <span className="font-['Montserrat'] font-medium text-white">¥ {shippingUnitRMB.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-[var(--text-tertiary)] text-[10px] pl-2 pr-2">
                      <span dir="ltr" className="font-['Montserrat']">↳ {volumeCBM} CBM × ${cbmRate} = ${shippingCartonUSD.toFixed(2)}</span>
                      <span className="font-['Montserrat']">¥ {(shippingCartonUSD * rateRMB).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Sticky Mobile Result Card */}
            <div className="md:hidden absolute bottom-0 left-0 right-0 z-50 p-4 pb-6 bg-gradient-to-t from-[var(--bg-deep)] via-[var(--bg-surface)] to-transparent pointer-events-none">
              <div className="glass-card !p-4 pointer-events-auto shadow-[0_10px_40px_rgba(0,102,255,0.15)] border-[var(--primary)]/30 backdrop-blur-[30px] bg-[var(--bg-card)]/90">
                <div 
                  className="flex flex-col cursor-pointer"
                  onClick={() => setShowBreakdown(!showBreakdown)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="text-[10px] text-[var(--text-secondary)] font-medium">{t.finalCost}</div>
                    <div className="flex items-center gap-2">
                      <button onClick={(e) => { e.stopPropagation(); handleDownload(); }} className="w-6 h-6 rounded-full bg-[var(--glass-bg)] flex items-center justify-center text-[var(--primary-light)] hover:bg-[var(--glass-hover)]">
                        <Download size={12} />
                      </button>
                      <motion.div animate={{ rotate: showBreakdown ? 180 : 0 }}>
                        <ChevronUp size={16} className="text-[var(--text-tertiary)]" />
                      </motion.div>
                    </div>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-[28px] font-bold text-white font-['Montserrat'] leading-none mb-1.5">
                        <span className="text-[16px] text-[var(--text-tertiary)] mr-1">¥</span>
                        {finalTotalRMB.toFixed(2)}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] font-semibold font-['Montserrat']">
                        <span className="text-[var(--success)]">SAR {finalTotalSAR.toFixed(2)}</span>
                        <span className="text-[var(--primary-light)]">USD {finalTotalUSD.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {showBreakdown && (
                    <motion.div
                      initial={{ height: 0, opacity: 0, marginTop: 0 }}
                      animate={{ height: 'auto', opacity: 1, marginTop: 12 }}
                      exit={{ height: 0, opacity: 0, marginTop: 0 }}
                      className="overflow-hidden border-t border-[var(--glass-border)] pt-3 space-y-2 text-[11px]"
                    >
                      <div className="flex justify-between items-center text-[var(--text-secondary)]">
                        <span>{t.productCost}</span>
                        <span className="font-['Montserrat'] font-medium text-white">¥ {productCommRMB.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-[var(--text-tertiary)] text-[9px] px-1">
                        <span>↳ {t.commAmount} ({commission}%)</span>
                        <span className="font-['Montserrat']">¥ {commAmountRMB.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-[var(--text-secondary)] pt-1">
                        <span>{t.shippingCost}</span>
                        <span className="font-['Montserrat'] font-medium text-white">¥ {shippingUnitRMB.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-[var(--text-tertiary)] text-[9px] px-1">
                        <span dir="ltr" className="font-['Montserrat']">↳ {volumeCBM} CBM × ${cbmRate} = ${shippingCartonUSD.toFixed(2)}</span>
                        <span className="font-['Montserrat']">¥ {(shippingCartonUSD * rateRMB).toFixed(2)}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
