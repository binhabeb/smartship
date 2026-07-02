'use client';
import { use, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getTranslations, Locale } from '@/lib/translations';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminShipmentDetails({ params }: { params: Promise<{ locale: string, id: string }> }) {
  const { locale, id } = use(params);
  const loc = (locale === 'ar' ? 'ar' : 'en') as Locale;
  const t = getTranslations(loc);
  const router = useRouter();
  
  const [shipment, setShipment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [showWhatsAppSuggestion, setShowWhatsAppSuggestion] = useState(false);

  const fetchShipment = async () => {
    setLoading(true);
    const { data } = await supabase.from('shipments').select('*').eq('id', id).single();
    if (data) {
      setShipment(data);
      setNewStatus(data.current_status);
      setAdminNotes(data.admin_notes || '');
    }
    setLoading(false);
  };

  useEffect(() => { fetchShipment(); }, [id]);

  const getStatusLabelAr = (status: string) => {
    const map: Record<string, string> = {
      delivered: 'تم التسليم', in_transit: 'في الطريق', customs: 'في الجمارك', shipped: 'تم الشحن', at_port: 'في الميناء', delayed: 'متأخرة'
    };
    return map[status] || status;
  };

  const getStatusLabelEn = (status: string) => {
    const map: Record<string, string> = {
      delivered: 'Delivered', in_transit: 'In Transit', customs: 'Customs', shipped: 'Shipped', at_port: 'At Port', delayed: 'Delayed'
    };
    return map[status] || status;
  };

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      const updates: any = {
        current_status: newStatus,
        admin_notes: adminNotes,
        updated_at: new Date().toISOString()
      };

      if (newStatus !== shipment.current_status) {
        const historyEntry = {
          key: newStatus,
          label: { ar: getStatusLabelAr(newStatus), en: getStatusLabelEn(newStatus) },
          timestamp: new Date().toLocaleString('en-US', { hour12: true }),
          completed: true
        };
        updates.status_history = [...(shipment.status_history || []), historyEntry];
      }

      const { error } = await supabase.from('shipments').update(updates).eq('id', id);
      if (error) throw error;
      
      // Show WhatsApp suggestion if status changed
      if (newStatus !== shipment.current_status) {
        setShowWhatsAppSuggestion(true);
      } else {
        router.push(`/${locale}/admin/shipments`);
      }
    } catch (error) {
      console.error(error);
      alert(loc === 'ar' ? 'حدث خطأ أثناء التحديث' : 'Error updating shipment');
    } finally {
      setUpdating(false);
    }
  };

  const sendWhatsAppUpdate = () => {
    if (!shipment) return;
    const phone = shipment.customer_phone.replace(/[^0-9+]/g, '').replace('+', '');
    const url = typeof window !== 'undefined' ? window.location.origin : '';
    const trackingLink = `${url}/${locale}/tracking?id=${shipment.id}`;
    
    const msg = loc === 'ar'
      ? `مرحباً ${shipment.customer_name}! 👋\n\nتم تحديث حالة شحنتك رقم *${shipment.id}*:\n\n📍 الحالة الحالية: *${getStatusLabelAr(newStatus)}*\n📦 المنتج: ${shipment.product}\n\n🔗 تتبع الشحنة: ${trackingLink}\n\n📞 للتواصل واتساب: +8619383079080\n🌐 الموقع: www.binhabeb.com\n\nمؤسسة بن حبيب للتجارة والاستيراد 🚢\nنسعد بخدمتكم دائماً!`
      : `Hello ${shipment.customer_name}! 👋\n\nYour shipment *${shipment.id}* has been updated:\n\n📍 Current Status: *${getStatusLabelEn(newStatus)}*\n📦 Product: ${shipment.product}\n\n🔗 Track Shipment: ${trackingLink}\n\n📞 WhatsApp: +8619383079080\n🌐 Website: www.binhabeb.com\n\nBin Habib Trading & Import 🚢\nAlways happy to serve you!`;
    
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
    router.push(`/${locale}/admin/shipments`);
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>;
  if (!shipment) return <div style={{ padding: 40, textAlign: 'center' }}>Shipment not found</div>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <Link href={`/${locale}/admin/shipments`} className="btn-secondary" style={{ textDecoration: 'none', padding: '8px 12px' }}>
          ⬅️ {loc === 'ar' ? 'عودة' : 'Back'}
        </Link>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>
          {loc === 'ar' ? 'تفاصيل الشحنة' : 'Shipment Details'}: <span style={{ color: 'var(--primary)', fontFamily: 'var(--font-en)' }}>{shipment.id}</span>
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
        
        {/* Customer Info */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, borderBottom: '1px solid var(--glass-border)', paddingBottom: 8 }}>
            {loc === 'ar' ? 'معلومات العميل' : 'Customer Info'}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div><span style={{ color: 'var(--text-secondary)' }}>{loc === 'ar' ? 'الاسم:' : 'Name:'}</span> <strong style={{ marginInlineStart: 8 }}>{shipment.customer_name}</strong></div>
            <div><span style={{ color: 'var(--text-secondary)' }}>{loc === 'ar' ? 'الجوال:' : 'Phone:'}</span> <strong style={{ marginInlineStart: 8, fontFamily: 'var(--font-en)' }} dir="ltr">{shipment.customer_phone}</strong></div>
            <div><span style={{ color: 'var(--text-secondary)' }}>{loc === 'ar' ? 'المدينة:' : 'City:'}</span> <strong style={{ marginInlineStart: 8 }}>{shipment.city}</strong></div>
            <div><span style={{ color: 'var(--text-secondary)' }}>{loc === 'ar' ? 'الوجهة:' : 'Destination:'}</span> <strong style={{ marginInlineStart: 8 }}>{shipment.destination || '—'}</strong></div>
          </div>
        </div>

        {/* Product Info */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, borderBottom: '1px solid var(--glass-border)', paddingBottom: 8 }}>
            {loc === 'ar' ? 'معلومات المنتج' : 'Product Info'}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div><span style={{ color: 'var(--text-secondary)' }}>{loc === 'ar' ? 'المنتج:' : 'Product:'}</span> <strong style={{ marginInlineStart: 8 }}>{shipment.product}</strong></div>
            <div><span style={{ color: 'var(--text-secondary)' }}>{loc === 'ar' ? 'الوصف:' : 'Description:'}</span> <span style={{ marginInlineStart: 8 }}>{shipment.product_description || '—'}</span></div>
            <div><span style={{ color: 'var(--text-secondary)' }}>{loc === 'ar' ? 'الكمية:' : 'Quantity:'}</span> <strong style={{ marginInlineStart: 8 }}>{shipment.quantity || 1}</strong></div>
            {shipment.color && <div><span style={{ color: 'var(--text-secondary)' }}>{loc === 'ar' ? 'اللون:' : 'Color:'}</span> <strong style={{ marginInlineStart: 8 }}>{shipment.color}</strong></div>}
          </div>
        </div>

        {/* Photos */}
        {((shipment.photos && shipment.photos.length > 0) || shipment.product_image) && (
          <div className="glass-card" style={{ padding: 24, gridColumn: '1 / -1' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, borderBottom: '1px solid var(--glass-border)', paddingBottom: 8 }}>
              {loc === 'ar' ? 'صور الشحنة' : 'Shipment Photos'}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12 }}>
              {(shipment.photos && shipment.photos.length > 0 ? shipment.photos : [shipment.product_image]).filter(Boolean).map((photo: string, i: number) => (
                <div key={i} style={{ aspectRatio: '1', borderRadius: 12, overflow: 'hidden', background: 'var(--bg-elevated)' }}>
                  <img src={photo} alt={`Photo ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status History */}
        {shipment.status_history && shipment.status_history.length > 0 && (
          <div className="glass-card" style={{ padding: 24, gridColumn: '1 / -1' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, borderBottom: '1px solid var(--glass-border)', paddingBottom: 8 }}>
              {loc === 'ar' ? 'سجل التحديثات' : 'Status History'}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[...shipment.status_history].reverse().map((entry: any, i: number) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: entry.completed ? 'var(--success)' : 'var(--text-tertiary)' }} />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: 600 }}>{loc === 'ar' ? entry.label?.ar : entry.label?.en}</span>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text-tertiary)', fontFamily: 'var(--font-en)' }}>{entry.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Management & Status Update */}
        <div className="glass-card" style={{ padding: 24, gridColumn: '1 / -1' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, borderBottom: '1px solid var(--glass-border)', paddingBottom: 8 }}>
            {loc === 'ar' ? 'تحديث الحالة' : 'Update Status'}
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600 }}>{loc === 'ar' ? 'الحالة الحالية' : 'Current Status'}</label>
              <select className="input-glass" value={newStatus} onChange={(e) => setNewStatus(e.target.value)} style={{ width: '100%', cursor: 'pointer' }}>
                <option value="shipped">{loc === 'ar' ? 'تم الشحن' : 'Shipped'}</option>
                <option value="in_transit">{loc === 'ar' ? 'في الطريق' : 'In Transit'}</option>
                <option value="customs">{loc === 'ar' ? 'في الجمارك' : 'Customs'}</option>
                <option value="at_port">{loc === 'ar' ? 'في الميناء' : 'At Port'}</option>
                <option value="delivered">{loc === 'ar' ? 'تم التسليم' : 'Delivered'}</option>
                <option value="delayed">{loc === 'ar' ? 'متأخرة' : 'Delayed'}</option>
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600 }}>{loc === 'ar' ? 'ملاحظات الإدارة (خاص)' : 'Admin Notes (Internal)'}</label>
              <textarea 
                className="input-glass" 
                value={adminNotes} 
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder={loc === 'ar' ? 'ملاحظات داخلية لا يراها العميل...' : 'Internal notes not visible to customer...'}
                rows={3}
                style={{ width: '100%', resize: 'vertical' }}
              />
            </div>
          </div>
          
          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <a 
              href={`https://wa.me/${shipment.customer_phone.replace(/[^0-9]/g, '')}`}
              target="_blank" rel="noopener noreferrer" 
              className="btn-whatsapp" 
              style={{ textDecoration: 'none', padding: '10px 20px', display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              💬 {loc === 'ar' ? 'مراسلة العميل' : 'Message Customer'}
            </a>
            <button onClick={handleUpdate} disabled={updating} className="btn-success" style={{ padding: '12px 32px', opacity: updating ? 0.7 : 1 }}>
              {updating ? '...' : (loc === 'ar' ? 'حفظ التحديثات' : 'Save Updates')}
            </button>
          </div>
        </div>
      </div>

      {/* WhatsApp Suggestion Modal */}
      {showWhatsAppSuggestion && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-card" style={{ padding: 32, maxWidth: 420, width: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>✅</div>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>{loc === 'ar' ? 'تم تحديث الحالة!' : 'Status Updated!'}</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: 14 }}>
              {loc === 'ar' 
                ? `تم تحديث حالة الشحنة إلى "${getStatusLabelAr(newStatus)}". هل تود إبلاغ العميل (${shipment.customer_name}) عبر واتساب؟` 
                : `Status updated to "${getStatusLabelEn(newStatus)}". Notify ${shipment.customer_name} via WhatsApp?`}
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => router.push(`/${locale}/admin/shipments`)} className="btn-secondary" style={{ flex: 1, padding: '12px' }}>
                {loc === 'ar' ? 'تخطي' : 'Skip'}
              </button>
              <button onClick={sendWhatsAppUpdate} className="btn-whatsapp" style={{ flex: 1, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                💬 {loc === 'ar' ? 'إرسال للعميل' : 'Send to Customer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
