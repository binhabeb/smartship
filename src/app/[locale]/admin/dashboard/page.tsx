'use client';
import { use, useState, useEffect } from 'react';
import { getTranslations, Locale } from '@/lib/translations';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import dynamic from 'next/dynamic';

// Dynamic import Recharts (~200KB) - only loads on dashboard
const ResponsiveContainer = dynamic(() => import('recharts').then(m => m.ResponsiveContainer), { ssr: false });
const AreaChart = dynamic(() => import('recharts').then(m => m.AreaChart), { ssr: false });
const Area = dynamic(() => import('recharts').then(m => m.Area), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(m => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(m => m.YAxis), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(m => m.Tooltip), { ssr: false });
const PieChart = dynamic(() => import('recharts').then(m => m.PieChart), { ssr: false });
const Pie = dynamic(() => import('recharts').then(m => m.Pie), { ssr: false });
const Cell = dynamic(() => import('recharts').then(m => m.Cell), { ssr: false });

export default function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const loc = (locale === 'ar' ? 'ar' : 'en') as Locale;
  const t = getTranslations(loc);

  const [stats, setStats] = useState({
    totalRequests: 0,
    activeShipments: 0,
    totalInvoices: 0,
    totalUsers: 0
  });
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [recentShipments, setRecentShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusChartData, setStatusChartData] = useState<any[]>([]);
  const [monthlyChartData, setMonthlyChartData] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const { count: reqCount } = await supabase.from('import_requests').select('*', { count: 'exact', head: true });
        const { count: shipCount } = await supabase.from('shipments').select('*', { count: 'exact', head: true });
        const { count: invCount } = await supabase.from('invoices').select('*', { count: 'exact', head: true });
        const { count: userCount } = await supabase.from('user_roles').select('*', { count: 'exact', head: true });

        const { data: latestReqs } = await supabase.from('import_requests').select('*').order('created_at', { ascending: false }).limit(5);
        const { data: latestShips } = await supabase.from('shipments').select('*').order('created_at', { ascending: false }).limit(5);

        // Calculate status distribution
        const { data: allShips } = await supabase.from('shipments').select('current_status');
        if (allShips) {
          const counts: Record<string, number> = {};
          allShips.forEach(s => {
            const status = s.current_status || 'other';
            counts[status] = (counts[status] || 0) + 1;
          });
          
          const statusMap = [
            { id: 'delivered', name: loc === 'ar' ? 'تم التسليم' : 'Delivered', color: '#34C759' },
            { id: 'in_transit', name: loc === 'ar' ? 'في الطريق' : 'Transit', color: '#00F0FF' },
            { id: 'customs', name: loc === 'ar' ? 'في الجمارك' : 'Customs', color: '#FF9500' },
            { id: 'shipped', name: loc === 'ar' ? 'تم الشحن' : 'Shipped', color: '#AF52DE' },
          ];
          
          setStatusChartData(statusMap.map(m => ({ ...m, value: counts[m.id] || 0 })).filter(v => v.value > 0));
        }

        // Calculate monthly activity
        const months = loc === 'ar' 
          ? ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
          : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        const { data: monthlyShips } = await supabase.from('shipments').select('created_at');
        if (monthlyShips) {
          const monthCounts = new Array(12).fill(0);
          monthlyShips.forEach(s => {
            const m = new Date(s.created_at).getMonth();
            monthCounts[m]++;
          });
          
          // Show last 6 months
          const currentMonth = new Date().getMonth();
          const last6 = [];
          for (let i = 5; i >= 0; i--) {
            const mIndex = (currentMonth - i + 12) % 12;
            last6.push({ name: months[mIndex], value: monthCounts[mIndex] });
          }
          setMonthlyChartData(last6);
        }

        setStats({
          totalRequests: reqCount || 0,
          activeShipments: shipCount || 0,
          totalInvoices: invCount || 0,
          totalUsers: userCount || 0
        });

        setRecentRequests(latestReqs || []);
        setRecentShipments(latestShips || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [loc]);

  const statsCards = [
    { label: loc === 'ar' ? 'إجمالي الطلبات' : 'Total Requests', value: stats.totalRequests, icon: '📋', color: '#00F0FF' },
    { label: loc === 'ar' ? 'شحنات نشطة' : 'Active Shipments', value: stats.activeShipments, icon: '🚢', color: '#FF9500' },
    { label: loc === 'ar' ? 'الفواتير' : 'Invoices', value: stats.totalInvoices, icon: '🧾', color: '#34C759' },
    { label: loc === 'ar' ? 'الموظفين' : 'Staff', value: stats.totalUsers, icon: '👥', color: '#AF52DE' },
  ];

  return (
    <div style={{ maxWidth: 1600, margin: '0 auto' }}>
      <style>{`
        .glass-card-dashboard {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 24px;
          padding: 32px;
          backdrop-filter: blur(10px);
          transition: all 0.3s;
        }
        .glass-card-dashboard:hover {
          background: rgba(255,255,255,0.04);
          border-color: rgba(0, 240, 255, 0.2);
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 48, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }}
            style={{ fontSize: 32, fontWeight: 900, letterSpacing: -1, color: 'white' }}
          >
            {loc === 'ar' ? 'التحليلات الذكية' : 'Operations Intelligence'}
          </motion.h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>{loc === 'ar' ? 'نظام تتبع وتحليل الشحنات المتطور' : 'Advanced shipping analytics & tracking console'}</p>
        </div>
        <div style={{ fontSize: 13, color: 'var(--elec-blue)', fontWeight: 700, background: 'rgba(0, 240, 255, 0.05)', padding: '8px 16px', borderRadius: 100, border: '1px solid rgba(0, 240, 255, 0.1)' }}>
          {new Date().toLocaleDateString(loc === 'ar' ? 'ar-SA' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 48 }}>
        {statsCards.map((card, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: i * 0.1 }}
            className="glass-card-dashboard"
            style={{ display: 'flex', alignItems: 'center', gap: 24, position: 'relative', overflow: 'hidden' }}
          >
            <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, background: card.color, filter: 'blur(50px)', opacity: 0.1 }} />
            <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>
              {card.icon}
            </div>
            <div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginBottom: 4 }}>{card.label}</div>
              <div style={{ fontSize: 36, fontWeight: 900, fontFamily: 'monospace', color: 'white' }}>{loading ? '...' : card.value}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: 24, marginBottom: 48 }}>
        <div className="glass-card-dashboard">
          <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 32, color: 'white' }}>📈 {loc === 'ar' ? 'نشاط الاستيراد' : 'Import Activity Velocity'}</h3>
          <div style={{ width: '100%', height: 300 }}>
            {monthlyChartData.length > 0 ? (
              <ResponsiveContainer>
                <AreaChart data={monthlyChartData}>
                  <defs>
                    <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#00F0FF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ background: '#0F141E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                    itemStyle={{ color: 'white' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#00F0FF" strokeWidth={4} fillOpacity={1} fill="url(#colorBlue)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)' }}>No activity data available</div>
            )}
          </div>
        </div>

        <div className="glass-card-dashboard">
          <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 32, color: 'white' }}>🎯 {loc === 'ar' ? 'توزيع الشحنات' : 'Shipment Distribution'}</h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
            {statusChartData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusChartData} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={8} dataKey="value" stroke="none">
                      {statusChartData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingRight: 40 }}>
                  {statusChartData.map((s, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 12, height: 12, borderRadius: 4, background: s.color }} />
                      <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>{s.name}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)' }}>No shipment distribution data available</div>
            )}
          </div>
        </div>
      </div>

      {/* Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
        <div className="glass-card-dashboard" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 24, color: 'white' }}>📥 {loc === 'ar' ? 'أحدث الطلبات' : 'Recent Inbound Requests'}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {recentRequests.map((req, i) => (
              <div key={i} style={{ padding: 20, background: 'rgba(255,255,255,0.02)', borderRadius: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,255,255,0.03)' }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'white' }}>{req.customer_name}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>{req.product_name} • {req.city}</div>
                </div>
                <div style={{ fontSize: 10, padding: '4px 12px', borderRadius: 8, background: 'rgba(0,240,255,0.1)', color: '#00F0FF', fontWeight: 800, textTransform: 'uppercase' }}>
                  {req.status || 'NEW'}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card-dashboard" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 24, color: 'white' }}>📦 {loc === 'ar' ? 'الشحنات النشطة' : 'Live Shipment Stream'}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {recentShipments.map((ship, i) => (
              <div key={i} style={{ padding: 20, background: 'rgba(255,255,255,0.02)', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 20, border: '1px solid rgba(255,255,255,0.03)' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(0,240,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: '#00F0FF' }}>🚢</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'white' }}>{ship.customer_name}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>ID: {ship.id} • {ship.destination}</div>
                </div>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#00F0FF', boxShadow: '0 0 10px #00F0FF' }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
