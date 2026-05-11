'use client';
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator as CalcIcon, X, Download, ChevronUp, ChevronDown, RotateCcw, Box, Truck, DollarSign } from 'lucide-react';
import html2canvas from 'html2canvas';
import { useSettingsStore } from '@/store/useSettingsStore';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const dict = {
  ar: {
    title: 'حاسبة سمارت شيب',
    subtitle: 'احسب التكلفة الإجمالية',
    shippingComm: 'سعر الشحن والعمولة',
    cbmRate: 'سعر الشحن لكل متر مكعب (CBM)',
    commission: 'عمولة المكتب',
    editRates: 'لتعديل أسعار الصرف اضغط هنا',
    usdRmb: 'دولار إلى يوان (USD -> RMB)',
    usdSar: 'دولار إلى ريال (USD -> SAR)',
    productDetails: 'بيانات المنتج',
    unitPrice: 'سعر القطعة',
    unitsPerCarton: 'عدد القطع في الكرتون',
    cartonVolume: 'حجم الكرتون',
    finalCost: 'التكلفة النهائية للقطعة داخل مستودعك',
    perPiece: 'للقطعة',
    breakdown: 'تفاصيل الحساب',
    productCost: 'تكلفة المنتج (شاملة العمولة)',
    commAmount: 'مبلغ العمولة',
    shippingCost: 'تكلفة الشحن لكل قطعة',
    totalShipping: 'إجمالي شحن الكرتون',
    reset: 'إعادة ضبط',
    export: 'تصدير'
  },
  en: {
    title: 'SmartShip Calculator',
    subtitle: 'Landed Cost Estimator',
    shippingComm: 'Shipping & Commission',
    cbmRate: 'CBM Rate',
    commission: 'Office Commission',
    editRates: 'Click here to edit exchange rates',
    usdRmb: 'USD to RMB',
    usdSar: 'USD to SAR',
    productDetails: 'Product Details',
    unitPrice: 'Unit Price',
    unitsPerCarton: 'Units per Carton',
    cartonVolume: 'Carton Volume',
    finalCost: 'Final Landed Cost per Unit',
    perPiece: 'per unit',
    breakdown: 'Calculation Breakdown',
    productCost: 'Product Cost (incl. Comm)',
    commAmount: 'Commission Amount',
    shippingCost: 'Shipping Cost per Unit',
    totalShipping: 'Total Carton Shipping',
    reset: 'Reset',
    export: 'Export'
  }
};

export default function Calculator({ isOpen, onClose, locale = 'en' }: { isOpen: boolean; onClose: () => void; locale?: string }) {
  const isAr = locale === 'ar';
  const t = dict[isAr ? 'ar' : 'en'];
  
  const globalFixedCbmRate = useSettingsStore((state) => state.fixedCbmRate);
  
  // Local state
  const [fixedCbmRate, setFixedCbmRate] = useState(globalFixedCbmRate.toString());
  const [officeCommission, setOfficeCommission] = useState('5');
  const [unitPriceRMB, setUnitPriceRMB] = useState('');
  const [unitsPerCarton, setUnitsPerCarton] = useState('');
  const [cartonVolumeCBM, setCartonVolumeCBM] = useState('');
  
  // Exchange Rates
  const [showRates, setShowRates] = useState(false);
  const [exRmb, setExRmb] = useState('7.24');
  const [exSar, setExSar] = useState('3.75');

  // Breakdown toggle
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

  // Math Logic
  const priceRMB = parseFloat(unitPriceRMB) || 0;
  const units = parseInt(unitsPerCarton) || 1;
  const volumeCBM = parseFloat(cartonVolumeCBM) || 0;
  const commission = parseFloat(officeCommission) || 0;
  const cbmRate = parseFloat(fixedCbmRate) || 0;
  const rateRMB = parseFloat(exRmb) || 7.24;
  const rateSAR = parseFloat(exSar) || 3.75;

  // 1. Commission Amount
  const commAmountRMB = priceRMB * (commission / 100);
  // 2. Product with Commission
  const productCommRMB = priceRMB + commAmountRMB;
  // 3. Total Carton Shipping (USD)
  const shippingCartonUSD = volumeCBM * cbmRate;
  // 4. Shipping per Unit (RMB)
  const shippingUnitRMB = (shippingCartonUSD / units) * rateRMB;
  // 5. Final Total (RMB)
  const finalTotalRMB = productCommRMB + shippingUnitRMB;
  // 6. Final Total (SAR)
  const finalTotalSAR = finalTotalRMB * (rateSAR / rateRMB);
  // 7. Final Total (USD)
  const finalTotalUSD = finalTotalRMB / rateRMB;

  const handleDownload = async () => {
    if (quoteRef.current) {
      const canvas = await html2canvas(quoteRef.current, {
        backgroundColor: '#0a0a0a',
        scale: 2,
      });
      const link = document.createElement('a');
      link.download = 'SmartShip-Quote.png';
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  // UI Components
  const InputRow = ({ label, value, onChange, suffix, type = "number", icon }: any) => (
    <div className={cn("flex items-center justify-between gap-4 w-full", isAr ? "flex-row-reverse" : "flex-row")}>
      <div className={cn("flex items-center gap-2 text-sm text-white/80 font-medium", isAr && "flex-row-reverse")}>
        {icon}
        <span>{label}</span>
      </div>
      <div className={cn("relative flex items-center w-32 md:w-40", isAr && "flex-row-reverse")}>
        <input
          type={type}
          inputMode="decimal"
          value={value}
          onChange={e => onChange(e.target.value)}
          dir="ltr"
          className={cn(
            "w-full bg-white/[0.04] border border-white/10 rounded-lg py-2.5 text-center text-white focus:bg-white/[0.08] focus:border-blue-500/50 outline-none transition-all font-sans font-semibold",
            isAr ? "pr-10 pl-3" : "pl-10 pr-3"
          )}
        />
        <span className={cn("absolute text-white/40 text-xs font-semibold", isAr ? "right-3" : "left-3")}>
          {suffix}
        </span>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999]"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={cn(
              "fixed bottom-0 left-0 right-0 h-[90vh] md:h-full md:top-0 md:left-auto md:w-[500px] z-[1000]",
              "bg-[#0f0f15]/95 md:bg-gradient-to-b md:from-[#1a1a24]/95 md:to-[#0f0f15]/95 backdrop-blur-xl",
              "border-t md:border-l md:border-t-0 border-white/10 shadow-2xl flex flex-col",
              "rounded-t-3xl md:rounded-none overflow-hidden text-white font-sans"
            )}
            dir={isAr ? 'rtl' : 'ltr'}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/5 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-blue-400">
                  <CalcIcon size={24} />
                </div>
                <div>
                  <h2 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                    {t.title}
                  </h2>
                  <p className="text-xs text-white/50">{t.subtitle}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/50 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-40 custom-scrollbar relative">
              <div ref={quoteRef} className="space-y-4 max-w-full">
                
                {/* Section 1: Shipping & Commission */}
                <div className="p-4 md:p-5 rounded-2xl bg-white/[0.02] border border-white/5 shadow-inner">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <Truck size={18} className="text-purple-400" />
                      <h3 className="text-sm font-bold text-white/90">{t.shippingComm}</h3>
                    </div>
                    <button onClick={handleReset} className="p-1.5 rounded-lg bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-colors" title={t.reset}>
                      <RotateCcw size={14} />
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    <InputRow label={t.cbmRate} value={fixedCbmRate} onChange={setFixedCbmRate} suffix="USD" />
                    <InputRow label={t.commission} value={officeCommission} onChange={setOfficeCommission} suffix="%" />
                  </div>

                  {/* Accordion for Rates */}
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <button 
                      onClick={() => setShowRates(!showRates)}
                      className="w-full flex items-center justify-between text-xs text-white/50 hover:text-white/80 transition-colors"
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
                <div className="p-4 md:p-5 rounded-2xl bg-white/[0.02] border border-white/5 shadow-inner">
                  <div className="flex items-center gap-2 mb-5">
                    <Box size={18} className="text-blue-400" />
                    <h3 className="text-sm font-bold text-white/90">{t.productDetails}</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <InputRow label={t.unitPrice} value={unitPriceRMB} onChange={setUnitPriceRMB} suffix="RMB" />
                    <InputRow label={t.unitsPerCarton} value={unitsPerCarton} onChange={setUnitsPerCarton} suffix="PCS" />
                    <InputRow label={t.cartonVolume} value={cartonVolumeCBM} onChange={setCartonVolumeCBM} suffix="CBM" />
                  </div>
                </div>

                {/* Desktop Result Breakdown (Shown inline on desktop) */}
                <div className="hidden md:block p-5 rounded-2xl bg-gradient-to-br from-purple-900/40 to-blue-900/20 border border-purple-500/20">
                  <div className="text-center mb-6">
                    <h4 className="text-xs text-white/70 mb-2">{t.finalCost}</h4>
                    <div className="flex items-center justify-center gap-3 font-bold">
                      <span className="text-4xl text-white">¥{finalTotalRMB.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-center gap-4 mt-2 text-sm">
                      <span className="text-emerald-400">SAR {finalTotalSAR.toFixed(2)}</span>
                      <span className="text-blue-400">USD {finalTotalUSD.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10 space-y-2 text-xs">
                    <div className="flex justify-between text-white/60">
                      <span>{t.productCost}</span>
                      <span>¥{productCommRMB.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-white/40 text-[10px]">
                      <span>↳ {t.commAmount} ({commission}%)</span>
                      <span>¥{commAmountRMB.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-white/60 pt-2">
                      <span>{t.shippingCost}</span>
                      <span>¥{shippingUnitRMB.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-white/40 text-[10px]">
                      <span dir="ltr">↳ {volumeCBM} CBM × ${cbmRate} = ${shippingCartonUSD.toFixed(2)}</span>
                      <span>¥{(shippingCartonUSD * rateRMB).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Sticky Mobile Result Card */}
            <div className="md:hidden absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0a0a0f] via-[#0f0f15] to-transparent pt-10 pb-4 px-4 z-50">
              <div className="bg-gradient-to-br from-purple-900/60 to-blue-900/40 border border-purple-500/30 rounded-2xl p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl">
                <div 
                  className="flex flex-col cursor-pointer"
                  onClick={() => setShowBreakdown(!showBreakdown)}
                >
                  <div className="text-[11px] text-white/70 mb-1 font-medium">{t.finalCost}</div>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-3xl font-bold text-white mb-1">
                        ¥{finalTotalRMB.toFixed(2)} <span className="text-xs font-normal text-white/50">{t.perPiece}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm font-semibold">
                        <span className="text-emerald-400">SAR {finalTotalSAR.toFixed(2)}</span>
                        <span className="text-blue-400">USD {finalTotalUSD.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button onClick={(e) => { e.stopPropagation(); handleDownload(); }} className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20">
                        <Download size={16} />
                      </button>
                      <motion.div animate={{ rotate: showBreakdown ? 180 : 0 }}>
                        <ChevronUp size={18} className="text-white/50" />
                      </motion.div>
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {showBreakdown && (
                    <motion.div
                      initial={{ height: 0, opacity: 0, marginTop: 0 }}
                      animate={{ height: 'auto', opacity: 1, marginTop: 16 }}
                      exit={{ height: 0, opacity: 0, marginTop: 0 }}
                      className="overflow-hidden border-t border-white/10 pt-3 space-y-2 text-xs"
                    >
                      <div className="text-center text-white/50 text-[10px] mb-2">{t.breakdown}</div>
                      <div className="flex justify-between text-white/80">
                        <span>{t.productCost}</span>
                        <span className="font-semibold text-white">¥{productCommRMB.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-white/40 text-[10px]">
                        <span>↳ {t.commAmount} ({commission}%)</span>
                        <span>¥{commAmountRMB.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-white/80 pt-1">
                        <span>{t.shippingCost}</span>
                        <span className="font-semibold text-white">¥{shippingUnitRMB.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-white/40 text-[10px]">
                        <span dir="ltr">↳ {volumeCBM} CBM × ${cbmRate} = ${shippingCartonUSD.toFixed(2)}</span>
                        <span>¥{(shippingCartonUSD * rateRMB).toFixed(2)}</span>
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
