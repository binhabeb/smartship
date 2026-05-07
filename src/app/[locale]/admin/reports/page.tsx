'use client';
import { use, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getTranslations, Locale } from '@/lib/translations';

export default function AdminReportsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const loc = (locale === 'ar' ? 'ar' : 'en') as Locale;
  const t = getTranslations(loc);

  const [stats, setStats] = useState({
    totalShipments: 0,
    totalRequests: 0,
    deliveredShipments: 0,
  });

  useEffect(() => {
    async function loadStats() {
      const [{ count: sCount }, { count: rCount }, { count: dCount }] = await Promise.all([
        supabase.from('shipments').select('*', { count: 'exact', head: true }),
        supabase.from('import_requests').select('*', { count: 'exact', head: true }),
        supabase.from('shipments').select('*', { count: 'exact', head: true }).eq('current_status', 'delivered'),
      ]);
      
      setStats({
        totalShipments: sCount || 0,
        totalRequests: rCount || 0,
        deliveredShipments: dCount || 0,
      });
    }
    loadStats();
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>{loc === 'ar' ? 'التقارير والتحليلات' : 'Reports & Analytics'}</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
        <div className="glass-card" style={{ padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📦</div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{loc === 'ar' ? 'إجمالي الشحنات' : 'Total Shipments'}</div>
          <div style={{ fontSize: 28, fontWeight: 800, marginTop: 8 }}>{stats.totalShipments}</div>
        </div>
        
        <div className="glass-card" style={{ padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📥</div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{loc === 'ar' ? 'إجمالي الطلبات' : 'Total Requests'}</div>
          <div style={{ fontSize: 28, fontWeight: 800, marginTop: 8 }}>{stats.totalRequests}</div>
        </div>

        <div className="glass-card" style={{ padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{loc === 'ar' ? 'الشحنات المسلمة' : 'Delivered'}</div>
          <div style={{ fontSize: 28, fontWeight: 800, marginTop: 8 }}>{stats.deliveredShipments}</div>
        </div>
      </div>
    </div>
  );
}
