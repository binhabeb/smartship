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

  const fetchShipment = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('shipments')
      .select('*')
      .eq('id', id)
      .single();
    
    if (data) {
      setShipment(data);
      setNewStatus(data.current_status);
      setAdminNotes(data.admin_notes || '');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchShipment();
  }, [id]);

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      const updates: any = {
        current_status: newStatus,
        admin_notes: adminNotes,
        updated_at: new Date().toISOString()
      };

      // If status changed, append to history
      if (newStatus !== shipment.current_status) {
        const historyEntry = {
          key: newStatus,
          label: {
            ar: getStatusLabelAr(newStatus),
            en: getStatusLabelEn(newStatus)
          },
          timestamp: new Date().toLocaleString('en-US', { hour12: true }),
          completed: true
        };
        updates.status_history = [...(shipment.status_history || []), historyEntry];
      }

      const { error } = await supabase
        .from('shipments')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      await fetchShipment();
      alert(loc === 'ar' ? 'تم تحديث الشحنة بنجاح' : 'Shipment updated successfully');
    } catch (error) {
      console.error(error);
      alert(loc === 'ar' ? 'حدث خطأ أثناء التحديث' : 'Error updating shipment');
    } finally {
      setUpdating(false);
    }
  };

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

  const whatsappMessage = shipment ? `أهلاً ${shipment.customer_name}، أود إعلامك أن شحنتك رقم ${shipment.id} حالتها الآن: ${getStatusLabelAr(shipment.current_status)}.` : '';

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
            <div><span style={{ color: 'var(--text-secondary)' }}>{loc === 'ar' ? 'الوجهة:' : 'Destination:'}</span> <strong style={{ marginInlineStart: 8 }}>{shipment.destination}</strong></div>
            <div style={{ marginTop: 12 }}>
              <a href={`https://wa.me/${shipment.customer_phone.replace('+', '')}?text=${encodeURIComponent(whatsappMessage)}`} target="_blank" rel="noopener noreferrer" className="btn-whatsapp" style={{ textDecoration: 'none', display: 'inline-block', width: '100%', textAlign: 'center' }}>
                💬 {loc === 'ar' ? 'مراسلة عبر واتساب' : 'Message on WhatsApp'}
              </a>
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, borderBottom: '1px solid var(--glass-border)', paddingBottom: 8 }}>
            {loc === 'ar' ? 'معلومات المنتج' : 'Product Info'}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div><span style={{ color: 'var(--text-secondary)' }}>{loc === 'ar' ? 'المنتج:' : 'Product:'}</span> <strong style={{ marginInlineStart: 8 }}>{shipment.product}</strong></div>
            <div><span style={{ color: 'var(--text-secondary)' }}>{loc === 'ar' ? 'الوصف:' : 'Description:'}</span> <span style={{ marginInlineStart: 8 }}>{shipment.product_description}</span></div>
            <div><span style={{ color: 'var(--text-secondary)' }}>{loc === 'ar' ? 'الكمية:' : 'Quantity:'}</span> <strong style={{ marginInlineStart: 8 }}>{shipment.quantity}</strong></div>
          </div>
        </div>

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
          
          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={handleUpdate} disabled={updating} className="btn-success" style={{ padding: '12px 32px', opacity: updating ? 0.7 : 1 }}>
              {updating ? '...' : (loc === 'ar' ? 'حفظ التحديثات' : 'Save Updates')}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
