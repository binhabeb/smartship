'use client';
import { use, useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getTranslations, Locale } from '@/lib/translations';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import { FadeInView } from '@/components/Animations';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Shipment } from '@/lib/types';

function TrackingContent({ loc }: { loc: Locale }) {
  const t = getTranslations(loc);
  const searchParams = useSearchParams();
  const urlId = searchParams.get('id');

  const [trackingId, setTrackingId] = useState(urlId || '');
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (urlId && !searched && !shipment) {
      handleSearch(urlId);
    }
  }, [urlId]);

  const handleSearch = async (overrideId?: string) => {
    const idToSearch = (typeof overrideId === 'string' ? overrideId : trackingId).trim();
    if (!idToSearch) return;
    setLoading(true);
    setSearched(false);
    
    try {
      const { data, error } = await supabase
        .from('shipments')
        .select('*')
        .ilike('id', idToSearch)
        .single();

      if (error) {
        if (error.code !== 'PGRST116') console.error('Tracking fetch error:', error);
        setShipment(null);
      } else if (data) {
        const mapped: Shipment = {
          id: data.id,
          customerName: data.customer_name,
          customerPhone: data.customer_phone,
          city: data.city,
          destination: data.destination,
          product: data.product,
          productDescription: data.product_description,
          productImage: data.product_image,
          quantity: data.quantity,
          color: data.color,
          currentStatus: data.current_status,
          statusHistory: data.status_history || [],
          photos: data.photos || [],
          invoiceAmount: data.invoice_amount,
          adminNotes: data.admin_notes,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
        setShipment(mapped);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  const copyId = () => {
    if (shipment) { navigator.clipboard.writeText(shipment.id); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  const getStatusColor = (status: string) => {
    if (status === 'delivered') return 'var(--success)';
    if (status === 'delayed') return 'var(--danger)';
    return 'var(--primary)';
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      delivered: t.tracking.statusDelivered, in_transit: t.tracking.statusInTransit,
      customs: t.tracking.statusCustoms, shipped: t.tracking.statusShipped,
      at_port: t.tracking.statusAtPort, delayed: t.tracking.statusDelayed,
    };
    return map[status] || status;
  };

  return (
      <main style={{ paddingTop: 'calc(var(--header-height) + 40px)', minHeight: '100vh', padding: '120px 20px 120px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <FadeInView>
            <h1 style={{ fontSize: 28, fontWeight: 800, textAlign: 'center', marginBottom: 32 }}>{t.tracking.title}</h1>
          </FadeInView>

          {/* Search Bar */}
          <FadeInView delay={0.1}>
            <div className="glass-card" style={{ padding: 8, display: 'flex', gap: 8, marginBottom: 32 }}>
              <input className="input-glass" value={trackingId} onChange={e => setTrackingId(e.target.value)}
                placeholder={t.tracking.searchPlaceholder}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                style={{ flex: 1, border: 'none', background: 'transparent' }} />
              <button className="btn-primary" onClick={() => handleSearch()} disabled={loading} style={{ padding: '12px 28px', whiteSpace: 'nowrap', opacity: loading ? 0.7 : 1 }}>
                {loading ? '...' : t.tracking.searchButton}
              </button>
            </div>
          </FadeInView>

          <AnimatePresence mode="wait">
            {shipment ? (
              <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {/* Status Header */}
                <div className="glass-card glow-success" style={{
                  padding: 24, marginBottom: 24, textAlign: 'center',
                  borderColor: getStatusColor(shipment.currentStatus),
                  boxShadow: `0 0 30px ${getStatusColor(shipment.currentStatus)}25`,
                }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: getStatusColor(shipment.currentStatus), marginBottom: 8 }}>
                    {shipment.currentStatus === 'delivered' ? '✅' : '📍'} {getStatusLabel(shipment.currentStatus)}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 16 }}>
                    <div className="glass-card" style={{ padding: '12px 20px' }}>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{t.tracking.shipmentId}</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary)', fontFamily: 'var(--font-en)' }}>{shipment.id}</div>
                    </div>
                    <div className="glass-card" style={{ padding: '12px 20px' }}>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{t.tracking.customerName}</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary)' }}>{shipment.customerName}</div>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="glass-card" style={{ padding: 28, marginBottom: 24 }}>
                  <div className="timeline-line">
                    {[...shipment.statusHistory].reverse().map((status, i) => (
                      <div key={i} style={{ position: 'relative', paddingBottom: i < shipment.statusHistory.length - 1 ? 32 : 0, paddingInlineStart: 20 }}>
                        <div className={`timeline-dot ${status.completed ? 'completed' : 'pending'}`}>
                          {status.completed ? '✓' : ''}
                        </div>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 600 }}>{loc === 'ar' ? status.label.ar : status.label.en}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4, fontFamily: 'var(--font-en)' }}>{status.timestamp}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Product Info */}
                <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>{t.tracking.productInfo}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>{shipment.product}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{loc === 'ar' ? 'الكمية' : 'Qty'}: {shipment.quantity}</div>
                    {shipment.color && <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{loc === 'ar' ? 'اللون' : 'Color'}: {shipment.color}</div>}
                  </div>
                </div>

                {/* Shipment Photos */}
                <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>{t.tracking.shipmentPhotos}</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 12 }}>
                    {(shipment.photos.length > 0 ? shipment.photos : (shipment.productImage ? [shipment.productImage] : [])).length > 0 ? (
                      (shipment.photos.length > 0 ? shipment.photos : [shipment.productImage]).filter((p): p is string => Boolean(p)).map((photo, i) => (
                        <div key={i} style={{
                          aspectRatio: '1', borderRadius: 12, background: 'var(--bg-elevated)',
                          overflow: 'hidden'
                        }}>
                          <img src={photo} alt={`Photo ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      ))
                    ) : (
                      <div style={{
                        aspectRatio: '1', borderRadius: 12, background: 'var(--bg-elevated)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32,
                        color: 'var(--text-tertiary)'
                      }}>📦</div>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <button className="btn-secondary" onClick={copyId} style={{ flex: 1 }}>
                    {copied ? '✅ ' + t.tracking.copied : '📋 ' + t.tracking.copyId}
                  </button>
                  <a href={`https://wa.me/966501234567?text=${encodeURIComponent(`أهلاً، أود الاستفسار عن شحنتي رقم ${shipment.id}`)}`}
                    className="btn-whatsapp" style={{ flex: 1, textDecoration: 'none' }} target="_blank" rel="noopener noreferrer">
                    💬 {t.tracking.contactWhatsapp}
                  </a>
                </div>
              </motion.div>
            ) : searched ? (
              <motion.div key="notfound" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: 60 }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>🔍</div>
                <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>{t.tracking.notFound}</p>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: 60 }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>📦</div>
                <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>{t.tracking.enterTrackingId}</p>
                <p style={{ color: 'var(--text-tertiary)', fontSize: 13, marginTop: 8, fontFamily: 'var(--font-en)' }}>
                  {loc === 'ar' ? 'جرب:' : 'Try:'} SS-10025, SS-10024, SS-10023
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
  );
}

export default function TrackingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const loc = (locale === 'ar' ? 'ar' : 'en') as Locale;
  return (
    <>
      <Header locale={loc} />
      <Suspense fallback={<main style={{ paddingTop: 'calc(var(--header-height) + 40px)', minHeight: '100vh', padding: '120px 20px 120px' }}></main>}>
        <TrackingContent loc={loc} />
      </Suspense>
      <Footer locale={loc} />
      <BottomNav locale={loc} />
    </>
  );
}
