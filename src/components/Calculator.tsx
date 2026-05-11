'use client';
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator as CalcIcon, X, Download, ChevronUp, Info } from 'lucide-react';
import html2canvas from 'html2canvas';
import { useSettingsStore } from '@/store/useSettingsStore';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Hardcoded Exchange Rates
const EXCHANGE_RATE_USD_RMB = 7.24;
const EXCHANGE_RATE_USD_SAR = 3.75;

export default function Calculator({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const globalFixedCbmRate = useSettingsStore((state) => state.fixedCbmRate);
  
  // Local state for calculation
  const [fixedCbmRate, setFixedCbmRate] = useState(globalFixedCbmRate);
  const [unitPriceRMB, setUnitPriceRMB] = useState('');
  const [unitsPerCarton, setUnitsPerCarton] = useState('');
  const [cartonVolumeCBM, setCartonVolumeCBM] = useState('');
  const [officeCommission, setOfficeCommission] = useState('5');
  const [showBreakdown, setShowBreakdown] = useState(false);
  const quoteRef = useRef<HTMLDivElement>(null);

  // Sync if global changes
  useEffect(() => {
    setFixedCbmRate(globalFixedCbmRate);
  }, [globalFixedCbmRate]);

  // Derived Values
  const priceRMB = parseFloat(unitPriceRMB) || 0;
  const units = parseInt(unitsPerCarton) || 1;
  const volumeCBM = parseFloat(cartonVolumeCBM) || 0;
  const commission = parseFloat(officeCommission) || 0;
  const cbmRate = parseFloat(fixedCbmRate.toString()) || 0;

  // 1. Product with Commission (RMB)
  const productCommRMB = priceRMB * (1 + commission / 100);
  // 2. Shipping per Carton (USD)
  const shippingCartonUSD = volumeCBM * cbmRate;
  // 3. Shipping per Unit (RMB)
  const shippingUnitRMB = (shippingCartonUSD / units) * EXCHANGE_RATE_USD_RMB;
  // 4. Final Total (RMB)
  const finalTotalRMB = productCommRMB + shippingUnitRMB;
  // 5. Final Total (SAR)
  const finalTotalSAR = finalTotalRMB * (EXCHANGE_RATE_USD_SAR / EXCHANGE_RATE_USD_RMB);

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
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={cn(
              "fixed top-0 right-0 h-full w-full md:w-[500px] z-[1000]",
              "bg-gradient-to-b from-[#1a1a24]/95 to-[#0f0f15]/95",
              "border-l border-white/10 shadow-2xl flex flex-col",
              "overflow-hidden text-white font-sans"
            )}
            dir="ltr"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400">
                  <CalcIcon size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
                    SmartShip Calculator
                  </h2>
                  <p className="text-xs text-white/50">Landed Cost Estimator</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/70 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 pb-32 custom-scrollbar">
              <div ref={quoteRef} className="space-y-6">
                
                {/* Global Overrides */}
                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 shadow-inner">
                  <div className="flex items-center gap-2 mb-4">
                    <Info size={16} className="text-cyan-400" />
                    <h3 className="text-sm font-semibold text-white/90">Shipping Variables</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-white/50 mb-1.5">CBM Rate (USD)</label>
                      <input
                        type="number"
                        inputMode="decimal"
                        value={fixedCbmRate}
                        onChange={(e) => setFixedCbmRate(parseFloat(e.target.value) || 0)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-white/50 mb-1.5">Commission (%)</label>
                      <input
                        type="number"
                        inputMode="decimal"
                        value={officeCommission}
                        onChange={(e) => setOfficeCommission(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Main Inputs */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-white/70 mb-1.5">Unit Price (RMB)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">¥</span>
                      <input
                        type="number"
                        inputMode="decimal"
                        value={unitPriceRMB}
                        onChange={(e) => setUnitPriceRMB(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-white/[0.05] border border-white/10 rounded-xl py-3 pl-8 pr-4 text-white placeholder-white/20 focus:bg-white/[0.08] focus:border-blue-500/50 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-white/70 mb-1.5">Units / Carton</label>
                      <input
                        type="number"
                        inputMode="decimal"
                        value={unitsPerCarton}
                        onChange={(e) => setUnitsPerCarton(e.target.value)}
                        placeholder="e.g. 50"
                        className="w-full bg-white/[0.05] border border-white/10 rounded-xl py-3 px-4 text-white placeholder-white/20 focus:bg-white/[0.08] focus:border-blue-500/50 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-white/70 mb-1.5">Carton CBM (m³)</label>
                      <input
                        type="number"
                        inputMode="decimal"
                        value={cartonVolumeCBM}
                        onChange={(e) => setCartonVolumeCBM(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-white/[0.05] border border-white/10 rounded-xl py-3 px-4 text-white placeholder-white/20 focus:bg-white/[0.08] focus:border-blue-500/50 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Results Breakdown (Desktop or Expanded Mobile) */}
                <div className="hidden md:block p-5 rounded-2xl bg-gradient-to-br from-blue-900/20 to-cyan-900/10 border border-white/10">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-semibold text-white/90">Landed Cost Breakdown</h3>
                    <button onClick={handleDownload} className="text-xs flex items-center gap-1.5 text-blue-400 hover:text-blue-300 transition-colors">
                      <Download size={14} /> Export
                    </button>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-white/60">
                      <span>Product + Comm (RMB)</span>
                      <span className="text-white/90">¥ {productCommRMB.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-white/60">
                      <span>Shipping / Unit (RMB)</span>
                      <span className="text-white/90">¥ {shippingUnitRMB.toFixed(2)}</span>
                    </div>
                    <div className="h-px bg-white/10 my-2" />
                    <div className="flex justify-between items-end">
                      <span className="text-white/80 font-medium">Final Cost / Unit</span>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">
                          {finalTotalSAR.toFixed(2)} <span className="text-sm">SAR</span>
                        </div>
                        <div className="text-xs text-white/40">≈ ¥ {finalTotalRMB.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Sticky Bottom Summary (Mobile) */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#12121a]/90 backdrop-blur-xl border-t border-white/10 p-4 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.3)] z-50 transition-all duration-300">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setShowBreakdown(!showBreakdown)}
              >
                <div>
                  <div className="text-xs text-white/50 mb-0.5">Final Cost / Unit</div>
                  <div className="text-xl font-bold text-emerald-400">
                    {finalTotalSAR.toFixed(2)} <span className="text-sm font-normal">SAR</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={(e) => { e.stopPropagation(); handleDownload(); }} className="p-2 rounded-full bg-white/5 text-blue-400">
                    <Download size={18} />
                  </button>
                  <motion.div animate={{ rotate: showBreakdown ? 180 : 0 }}>
                    <ChevronUp size={20} className="text-white/50" />
                  </motion.div>
                </div>
              </div>

              <AnimatePresence>
                {showBreakdown && (
                  <motion.div
                    initial={{ height: 0, opacity: 0, marginTop: 0 }}
                    animate={{ height: 'auto', opacity: 1, marginTop: 16 }}
                    exit={{ height: 0, opacity: 0, marginTop: 0 }}
                    className="overflow-hidden border-t border-white/5 pt-4 space-y-2 text-sm"
                  >
                    <div className="flex justify-between text-white/60">
                      <span>Product + Comm (RMB)</span>
                      <span className="text-white/90">¥ {productCommRMB.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-white/60">
                      <span>Shipping / Unit (RMB)</span>
                      <span className="text-white/90">¥ {shippingUnitRMB.toFixed(2)}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
