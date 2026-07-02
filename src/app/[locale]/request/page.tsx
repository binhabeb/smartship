'use client';
import { use, useState } from 'react';
import Link from 'next/link';
import { getTranslations, Locale } from '@/lib/translations';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import { FadeInView } from '@/components/Animations';
import { motion, AnimatePresence } from 'framer-motion';

import { supabase } from '@/lib/supabase';
import { compressImage } from '@/lib/imageUtils';

export default function RequestPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const loc = (locale === 'ar' ? 'ar' : 'en') as Locale;
  const t = getTranslations(loc);
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', city: '', productName: '', productDesc: '', productNotes: '', productUrl: '', productImage: '' });

  const update = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await supabase.from('import_requests').insert([
        {
          customer_name: form.name,
          customer_phone: form.phone,
          city: form.city,
          product_name: form.productName,
          product_description: form.productDesc,
          product_notes: form.productNotes,
          product_url: form.productUrl,
          product_image: form.productImage, // Adding base64 image data
          status: 'new',
        }
      ]);
      
      if (response.error) {
        console.error('Supabase raw error:', response.error);
        const errDetails = `Msg: ${response.error.message}, Code: ${response.error.code}, Keys: ${Object.keys(response.error).join(',')}, String: ${String(response.error)}`;
        alert(loc === 'ar' ? `خطأ مفصل: ${errDetails}` : `Detailed Error: ${errDetails}`);
        setLoading(false);
        return;
      }
      
      setSubmitted(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('Submission error:', err);
      alert(loc === 'ar' ? `خطأ: ${errorMessage}` : `Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <>
        <Header locale={loc} />
        <main style={{ paddingTop: 'var(--header-height)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card" style={{ padding: 48, textAlign: 'center', maxWidth: 500 }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>✅</div>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>{t.request.successTitle}</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 32, lineHeight: 1.8 }}>{t.request.successMessage}</p>
            <Link href={`/${locale}`} className="btn-primary" style={{ textDecoration: 'none', padding: '12px 32px' }}>{t.request.successButton}</Link>
          </motion.div>
        </main>
        <BottomNav locale={loc} />
      </>
    );
  }

  return (
    <>
      <Header locale={loc} />
      <main style={{ paddingTop: 'calc(var(--header-height) + 40px)', minHeight: '100vh', padding: '120px 20px 120px' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <FadeInView>
            <h1 style={{ fontSize: 28, fontWeight: 800, textAlign: 'center', marginBottom: 8 }}>{t.request.title}</h1>
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: 40 }}>{t.request.subtitle}</p>
          </FadeInView>

          {/* Step Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 40 }}>
            {[1, 2].map(s => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: step >= s ? 'var(--primary)' : 'var(--bg-elevated)', color: step >= s ? 'white' : 'var(--text-tertiary)',
                  fontWeight: 700, fontSize: 14, fontFamily: 'var(--font-en)',
                  transition: 'all var(--transition-smooth)',
                }}>{s}</div>
                <span style={{ fontSize: 14, fontWeight: 600, color: step >= s ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
                  {s === 1 ? t.request.step1 : t.request.step2}
                </span>
                {s === 1 && <div style={{ width: 40, height: 2, background: step > 1 ? 'var(--primary)' : 'var(--glass-border)', borderRadius: 1 }} />}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <form className="glass-card" style={{ padding: 32 }} onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{t.request.name} *</label>
                      <input required className="input-glass" value={form.name} onChange={e => update('name', e.target.value)} placeholder={t.request.namePlaceholder} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{t.request.phone} *</label>
                      <input required type="tel" className="input-glass" value={form.phone} onChange={e => update('phone', e.target.value)} placeholder={t.request.phonePlaceholder} dir="ltr" style={{ textAlign: loc === 'ar' ? 'right' : 'left' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{t.request.city}</label>
                      <input className="input-glass" value={form.city} onChange={e => update('city', e.target.value)} placeholder={t.request.cityPlaceholder} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 32 }}>
                    <button type="submit" className="btn-primary" style={{ padding: '12px 36px' }}>{t.request.next}</button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <form className="glass-card" style={{ padding: 32 }} onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{t.request.productName} *</label>
                      <input required className="input-glass" value={form.productName} onChange={e => update('productName', e.target.value)} placeholder={t.request.productNamePlaceholder} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{t.request.productDesc}</label>
                      <textarea className="input-glass" value={form.productDesc} onChange={e => update('productDesc', e.target.value)} placeholder={t.request.productDescPlaceholder} rows={3} style={{ resize: 'vertical' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{t.request.productNotes}</label>
                      <textarea className="input-glass" value={form.productNotes} onChange={e => update('productNotes', e.target.value)} placeholder={t.request.productNotesPlaceholder} rows={2} style={{ resize: 'vertical' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{t.request.productUrl}</label>
                      <input type="url" className="input-glass" value={form.productUrl} onChange={e => update('productUrl', e.target.value)} placeholder="https://..." dir="ltr" />
                    </div>
                    {/* Upload Area */}
                    <div>
                      <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{t.request.productImage}</label>
                      <label style={{ display: 'block', border: '2px dashed var(--glass-border)', borderRadius: 'var(--radius-lg)', padding: 32, textAlign: 'center', cursor: 'pointer' }}>
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const compressed = await compressImage(file);
                              update('productImage', compressed);
                            } catch (err) {
                              console.error('Image compression failed:', err);
                              // Fallback to original
                              const reader = new FileReader();
                              reader.onloadend = () => update('productImage', reader.result as string);
                              reader.readAsDataURL(file);
                            }
                          }
                        }} />
                        {form.productImage ? (
                          <div style={{ color: 'var(--primary)', fontWeight: 600 }}>{loc === 'ar' ? 'تم إرفاق الصورة ✅' : 'Image attached ✅'}</div>
                        ) : (
                          <>
                            <div style={{ fontSize: 32, marginBottom: 8 }}>📁</div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{t.request.uploadImage}</div>
                            <div style={{ color: 'var(--text-tertiary)', fontSize: 12, margin: '8px 0' }}>{t.request.uploadOr}</div>
                            <span className="btn-secondary" style={{ padding: '6px 16px', fontSize: 13 }}>{t.request.browseFiles}</span>
                          </>
                        )}
                      </label>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32, gap: 12 }}>
                    <button type="button" className="btn-secondary" onClick={() => setStep(1)} style={{ padding: '12px 28px' }}>{t.request.previous}</button>
                    <button type="submit" className="btn-success" disabled={loading} style={{ padding: '12px 36px', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
                      {loading ? '...' : t.request.submit}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <Footer locale={loc} />
      <BottomNav locale={loc} />
    </>
  );
}
