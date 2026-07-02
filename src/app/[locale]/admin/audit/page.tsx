'use client';
import { use, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getTranslations, Locale } from '@/lib/translations';

export default function AdminAuditPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const loc = (locale === 'ar' ? 'ar' : 'en') as Locale;
  const t = getTranslations(loc);

  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // Mocking an activity log by fetching recent shipments, requests, and invoices
      const [shipmentsRes, requestsRes, invoicesRes] = await Promise.all([
        supabase.from('shipments').select('id, created_at, customer_name').order('created_at', { ascending: false }).limit(20),
        supabase.from('import_requests').select('id, created_at, customer_name').order('created_at', { ascending: false }).limit(20),
        supabase.from('invoices').select('id, created_at, customer_name').order('created_at', { ascending: false }).limit(20)
      ]);

      let combined: any[] = [];
      
      if (shipmentsRes.data) {
        combined = [...combined, ...shipmentsRes.data.map(s => ({ ...s, type: 'shipment', desc: loc === 'ar' ? 'تم إنشاء شحنة جديدة' : 'New shipment created' }))];
      }
      if (requestsRes.data) {
        combined = [...combined, ...requestsRes.data.map(r => ({ ...r, type: 'request', desc: loc === 'ar' ? 'طلب استيراد جديد' : 'New import request' }))];
      }
      if (invoicesRes.data) {
        combined = [...combined, ...invoicesRes.data.map(i => ({ ...i, type: 'invoice', desc: loc === 'ar' ? 'تم إصدار فاتورة إلكترونية' : 'E-Invoice issued' }))];
      }

      // Sort combined by created_at desc
      combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setLogs(combined.slice(0, 30));
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getIcon = (type: string) => {
    if (type === 'shipment') return '📦';
    if (type === 'request') return '📥';
    if (type === 'invoice') return '🧾';
    return '📝';
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>{loc === 'ar' ? 'سجل النشاطات (Audit Log)' : 'Activity Log'}</h1>
        <button onClick={fetchLogs} className="btn-secondary" style={{ padding: '8px 16px', fontSize: 13 }}>
          🔄 {loc === 'ar' ? 'تحديث' : 'Refresh'}
        </button>
      </div>

      <div className="glass-card" style={{ padding: '24px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>Loading...</div>
        ) : logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)' }}>
            {loc === 'ar' ? 'لا توجد نشاطات مسجلة بعد' : 'No activities recorded yet'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {logs.map((log, index) => (
              <div key={`${log.id}-${index}`} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px', background: 'var(--bg-elevated)', borderRadius: 12, border: '1px solid var(--glass-border)' }}>
                <div style={{ fontSize: 24, width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}>
                  {getIcon(log.type)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>{log.desc}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    <span style={{ fontWeight: 600, color: 'var(--primary)', fontFamily: 'var(--font-en)' }}>{log.id.length > 15 ? log.id.substring(0, 8).toUpperCase() : log.id}</span> • {log.customer_name}
                  </div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', fontFamily: 'var(--font-en)', textAlign: 'end' }}>
                  {new Date(log.created_at).toLocaleString(loc === 'ar' ? 'ar-SA' : 'en-US')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
