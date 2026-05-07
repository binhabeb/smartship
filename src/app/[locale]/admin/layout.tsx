'use client';
import { use, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getTranslations, Locale } from '@/lib/translations';
import { ImportRequest, Shipment } from '@/lib/types';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  const loc = (locale === 'ar' ? 'ar' : 'en') as Locale;
  const t = getTranslations(loc);
  const router = useRouter();
  const pathname = usePathname();

  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<(ImportRequest | Shipment | any)[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) setIsCollapsed(true);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<(ImportRequest | Shipment | any)[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const isLoginPage = pathname.includes('/admin/login');

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session && !isLoginPage) {
        router.push(`/${locale}/admin/login`);
      } else if (session && isLoginPage) {
        router.push(`/${locale}/admin/dashboard`);
      } else if (session) {
        setAuthenticated(true);
        setUserName(session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User');
        setUserEmail(session.user.email || '');
        const { data: roleData } = await supabase.from('user_roles').select('role').eq('email', session.user.email).single();
        if (roleData) setUserRole(roleData.role);
      }
      setLoading(false);
    };
    checkAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' && !isLoginPage) {
        router.push(`/${locale}/admin/login`);
      } else if (event === 'SIGNED_IN' && isLoginPage) {
        router.push(`/${locale}/admin/dashboard`);
      }
      setAuthenticated(!!session);
      if (session) {
        setUserName(session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User');
        setUserEmail(session.user.email || '');
        supabase.from('user_roles').select('role').eq('email', session.user.email).single().then(({ data }) => {
          if (data) setUserRole(data.role);
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [locale, router, isLoginPage]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserRole(null);
    router.push(`/${locale}/admin/login`);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const { data: shipments } = await supabase.from('shipments').select('id, customer_name, current_status').or(`customer_name.ilike.%${query}%,id.ilike.%${query}%`).limit(5);
      const { data: requests } = await supabase.from('import_requests').select('id, customer_name, status').or(`customer_name.ilike.%${query}%,id.ilike.%${query}%`).limit(5);
      setSearchResults([...(shipments || []).map(s => ({ ...s, type: 'shipment', status: s.current_status })), ...(requests || []).map(r => ({ ...r, type: 'request' }))]);
    } catch (err) { console.error(err); } finally { setIsSearching(false); }
  };

  useEffect(() => {
    if (authenticated) {
      const fetchNotifications = async () => {
        const { data: shipments } = await supabase.from('shipments').select('id, customer_name, created_at').order('created_at', { ascending: false }).limit(4);
        const { data: requests } = await supabase.from('import_requests').select('id, customer_name, created_at').order('created_at', { ascending: false }).limit(4);
        const combined = [...(shipments || []).map(s => ({ ...s, type: 'shipment', title: loc === 'ar' ? 'شحنة جديدة' : 'New Shipment' })), ...(requests || []).map(r => ({ ...r, type: 'request', title: loc === 'ar' ? 'طلب استيراد' : 'New Request' }))].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setNotifications(combined.slice(0, 8));
      };
      fetchNotifications();
    }
  }, [authenticated, loc]);

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#02080C', color: 'white' }}>
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} style={{ width: 40, height: 40, border: '3px solid rgba(0, 240, 255, 0.1)', borderTopColor: '#00F0FF', borderRadius: '50%' }} />
    </div>
  );

  if (isLoginPage) return <>{children}</>;
  if (!authenticated) return null;

  const menuItems = [
    { href: `/${locale}/admin/dashboard`, label: t.admin?.dashboard || 'Dashboard', icon: '📊', id: 'dashboard' },
    { href: `/${locale}/admin/requests`, label: t.admin?.requests || 'Requests', icon: '📋', id: 'requests' },
    { href: `/${locale}/admin/shipments`, label: t.admin?.shipments || 'Shipments', icon: '📦', id: 'shipments' },
    { href: `/${locale}/admin/invoices`, label: loc === 'ar' ? 'الفواتير' : 'Invoices', icon: '🧾', id: 'invoices', restricted: ['admin', 'manager'] },
    { href: `/${locale}/admin/reports`, label: loc === 'ar' ? 'التقارير' : 'Reports', icon: '📈', id: 'reports' },
    { href: `/${locale}/admin/audit`, label: loc === 'ar' ? 'سجل النشاطات' : 'Activity Log', icon: '📝', id: 'audit' },
    { href: `/${locale}/admin/users`, label: loc === 'ar' ? 'إدارة الموظفين' : 'Users & Roles', icon: '👥', id: 'users', restricted: ['admin'] },
    { href: `/${locale}/admin/settings`, label: loc === 'ar' ? 'الإعدادات' : 'Settings', icon: '⚙️', id: 'settings', restricted: ['admin', 'manager'] },
    { href: `/${locale}/admin/support`, label: loc === 'ar' ? 'الدعم الفني' : 'Support', icon: '🎧', id: 'support' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#02080C', color: 'white', direction: loc === 'ar' ? 'rtl' : 'ltr' }}>
      <style>{`
        :root { --elec-blue: #00F0FF; --elec-blue-glow: rgba(0, 240, 255, 0.3); --bg-midnight: #02080C; }
        body { background: radial-gradient(circle at 50% -20%, #051A24 0%, #02080C 100%); margin: 0; }
        .admin-nav-item:hover { background: rgba(0, 240, 255, 0.05) !important; color: white !important; border-color: rgba(0, 240, 255, 0.2) !important; }
        .admin-nav-item.active { background: rgba(0, 240, 255, 0.15) !important; border: 1px solid var(--elec-blue-glow) !important; box-shadow: 0 0 20px rgba(0, 240, 255, 0.1); }
        .search-result-item:hover { background: rgba(0, 240, 255, 0.05) !important; }
        .notification-item:hover { background: rgba(255, 255, 255, 0.02) !important; }
        select option { background-color: #0F141E !important; color: white !important; padding: 10px; }
        select { background-color: rgba(255,255,255,0.03) !important; color: white !important; }
        ::-webkit-scrollbar-thumb { background: rgba(0, 240, 255, 0.1); }
        ::-webkit-scrollbar-thumb:hover { background: var(--elec-blue-glow); }
      `}</style>

      {/* Sidebar Overlay on Mobile */}
      {isMobile && !isCollapsed && (
        <div 
          onClick={() => setIsCollapsed(true)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 95, backdropFilter: 'blur(5px)' }} 
        />
      )}

      {/* Sidebar */}
      <motion.aside initial={false} animate={{ width: isMobile ? (isCollapsed ? 0 : 280) : (isCollapsed ? 90 : 280) }} style={{ background: 'rgba(1, 10, 15, 0.95)', backdropFilter: 'blur(30px)', borderInlineEnd: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', position: isMobile ? 'fixed' : 'relative', top: 0, bottom: 0, zIndex: 100, overflow: 'hidden', [loc === 'ar' ? 'right' : 'left']: 0 }}>
        {!isMobile && (
          <button onClick={() => setIsCollapsed(!isCollapsed)} style={{ position: 'absolute', [loc === 'ar' ? 'left' : 'right']: 12, top: 24, width: 32, height: 32, borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', color: 'var(--elec-blue)', cursor: 'pointer', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
            {isCollapsed ? (loc === 'ar' ? '◀' : '▶') : (loc === 'ar' ? '▶' : '◀')}
          </button>
        )}
        <div style={{ padding: '40px 24px', display: 'flex', alignItems: 'center', justifyContent: isCollapsed && !isMobile ? 'center' : 'flex-start', minHeight: 120 }}>
          <AnimatePresence mode="wait">
            {isCollapsed && !isMobile ? (
              <motion.img key="icon" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} src="/assets/admin/logo-icon.png" style={{ width: 45, height: 'auto', filter: 'drop-shadow(0 0 10px var(--elec-blue-glow))' }} />
            ) : (
              <motion.img key="full" initial={{ opacity: 0, x: loc === 'ar' ? 20 : -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: loc === 'ar' ? 20 : -20 }} src="/assets/admin/logo-full.png" style={{ height: 40, width: 'auto', maxWidth: '80%' }} />
            )}
          </AnimatePresence>
        </div>
        <nav style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 6, flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          {menuItems.map((item) => {
            if (item.restricted && !item.restricted.includes(userRole || '')) return null;
            const isActive = pathname.includes(item.id);
            return (
              <Link key={item.href} href={item.href} onClick={() => isMobile && setIsCollapsed(true)} style={{ display: 'flex', alignItems: 'center', justifyContent: isCollapsed && !isMobile ? 'center' : 'flex-start', gap: 16, padding: '14px 16px', borderRadius: 14, textDecoration: 'none', color: isActive ? 'white' : 'rgba(255,255,255,0.4)', fontWeight: isActive ? 700 : 500, transition: 'all 0.3s', whiteSpace: 'nowrap', border: '1px solid transparent' }} className={`admin-nav-item ${isActive ? 'active' : ''}`}>
                <span style={{ fontSize: 22, color: isActive ? 'var(--elec-blue)' : 'inherit' }}>{item.icon}</span>
                {(!isCollapsed || isMobile) && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{item.label}</motion.span>}
              </Link>
            );
          })}
        </nav>
        <div style={{ padding: 20, background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, justifyContent: isCollapsed && !isMobile ? 'center' : 'flex-start' }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg, var(--elec-blue), #007AFF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 18, flexShrink: 0, boxShadow: '0 0 15px var(--elec-blue-glow)' }}>{userName?.[0]?.toUpperCase() || 'A'}</div>
            {(!isCollapsed || isMobile) && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: 'white' }}>{userName}</div>
                <div style={{ fontSize: 11, color: 'var(--elec-blue)', fontWeight: 600 }}>{userRole?.toUpperCase()}</div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', width: '100%' }}>
        <header style={{ height: isMobile ? 70 : 90, borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isMobile ? '0 16px' : '0 40px', background: 'rgba(2, 8, 12, 0.8)', backdropFilter: 'blur(30px)', zIndex: 90 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 12 : 40, flex: 1 }}>
            {isMobile && (
              <button onClick={() => setIsCollapsed(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: 24, cursor: 'pointer', padding: '4px' }}>
                ☰
              </button>
            )}
            {!isMobile && (
              <div style={{ fontSize: 22, fontWeight: 900, minWidth: 180, color: 'white', letterSpacing: -0.5 }}>
                {pathname.includes('dashboard') ? t.admin?.dashboard || 'Dashboard' :
                  pathname.includes('requests') ? t.admin?.requests || 'Requests' :
                    pathname.includes('shipments') ? t.admin?.shipments || 'Shipments' :
                      pathname.includes('settings') ? (loc === 'ar' ? 'الإعدادات' : 'Settings') :
                        pathname.includes('users') ? (loc === 'ar' ? 'الموظفين' : 'Users') : 'Console'}
              </div>
            )}
            <div style={{ position: 'relative', width: '100%', maxWidth: 500 }}>
              <div style={{ position: 'absolute', [loc === 'ar' ? 'right' : 'left']: 20, top: '50%', transform: 'translateY(-50%)', opacity: 0.4, fontSize: 18, color: 'var(--elec-blue)' }}>🔍</div>
              <input type="text" value={searchQuery} onChange={(e) => handleSearch(e.target.value)} placeholder={loc === 'ar' ? 'ابحث هنا...' : 'Global Search...'} style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: loc === 'ar' ? '14px 54px 14px 14px' : '14px 14px 14px 54px', color: 'white', fontSize: 14, outline: 'none', transition: 'all 0.4s' }} />
              <AnimatePresence>
                {searchQuery.length >= 2 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} style={{ position: 'absolute', top: 70, [loc === 'ar' ? 'right' : 'left']: 0, width: '100%', zIndex: 1100, padding: '12px 0', background: 'rgba(15,20,30,0.98)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
                    {isSearching ? (<div style={{ padding: 20, textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>Searching...</div>) : searchResults.length === 0 ? (<div style={{ padding: 20, textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>{loc === 'ar' ? 'لا توجد نتائج مطابقة' : 'No matching records'}</div>) : (
                      searchResults.map((res, i) => (
                        <div key={i} onClick={() => { router.push(`/${locale}/admin/${res.type === 'shipment' ? 'shipments' : 'requests'}?id=${res.id}`); setSearchQuery(''); }} style={{ padding: '12px 20px', borderBottom: i === searchResults.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }} className="search-result-item">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ fontWeight: 700, fontSize: 14 }}>{res.customer_name}</span><span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 6, background: res.type === 'shipment' ? 'rgba(0,122,255,0.2)' : 'rgba(175,82,222,0.2)', color: res.type === 'shipment' ? '#007AFF' : '#AF52DE' }}>{res.type === 'shipment' ? 'SHIPMENT' : 'REQUEST'}</span></div>
                          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>ID: <span style={{ fontFamily: 'monospace' }}>{res.id}</span> • {res.status || 'Active'}</div>
                        </div>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ position: 'relative' }}>
              <button onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', width: 48, height: 48, borderRadius: 14, cursor: 'pointer', fontSize: 22, position: 'relative', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                🔔 {notifications.length > 0 && (<span style={{ position: 'absolute', top: -4, right: -4, background: '#FF3B30', color: 'white', fontSize: 10, width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, border: '4px solid #05070A' }}>{notifications.length}</span>)}
              </button>
              <AnimatePresence>
                {showNotifications && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} style={{ position: 'absolute', top: 70, [loc === 'ar' ? 'left' : 'right']: 0, width: 340, background: 'rgba(15,20,30,0.98)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '20px 0', zIndex: 1000, boxShadow: '0 20px 50px rgba(0,0,0,0.6)' }}>
                    <div style={{ padding: '0 20px 15px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontWeight: 800, fontSize: 15, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span>{loc === 'ar' ? 'التنبيهات' : 'Notifications'}</span><button onClick={() => setNotifications([])} style={{ background: 'none', border: 'none', color: '#00F0FF', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>{loc === 'ar' ? 'مسح الكل' : 'Clear All'}</button></div>
                    <div style={{ maxHeight: 400, overflowY: 'auto' }}>{notifications.length === 0 ? (<div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>No recent activity</div>) : (notifications.map((n, i) => (<div key={i} style={{ padding: '15px 20px', borderBottom: i === notifications.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.03)', display: 'flex', gap: 15, alignItems: 'start', cursor: 'pointer' }} className="notification-item"><div style={{ width: 36, height: 36, borderRadius: 10, background: n.type === 'shipment' ? 'rgba(0,122,255,0.1)' : 'rgba(175,82,222,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{n.type === 'shipment' ? '📦' : '📥'}</div><div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{n.title}</div><div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{n.customer_name} ({n.id})</div><div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', marginTop: 6 }}>{new Date(n.created_at).toLocaleTimeString()}</div></div></div>)))}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div style={{ position: 'relative' }}>
              <button onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }} style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 0 : 14, background: 'rgba(0, 240, 255, 0.05)', padding: isMobile ? '6px' : '8px 20px 8px 8px', borderRadius: 100, border: '1px solid var(--elec-blue-glow)', cursor: 'pointer' }}>
                <div style={{ width: isMobile ? 32 : 36, height: isMobile ? 32 : 36, borderRadius: '50%', background: 'var(--elec-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#000', fontSize: 14 }}>{userName?.[0]?.toUpperCase()}</div>
                {!isMobile && <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--elec-blue)' }}>{loc === 'ar' ? 'متصل' : 'Online'}</div>}
              </button>
              <AnimatePresence>
                {showProfile && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} style={{ position: 'absolute', top: 70, [loc === 'ar' ? 'left' : 'right']: 0, width: 260, background: 'rgba(15,20,30,0.98)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '24px', zIndex: 1000, boxShadow: '0 20px 50px rgba(0,0,0,0.6)' }}>
                    <div style={{ textAlign: 'center', marginBottom: 20 }}><div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--elec-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#000', fontSize: 24, margin: '0 auto 12px', boxShadow: '0 0 20px var(--elec-blue-glow)' }}>{userName?.[0]?.toUpperCase()}</div><div style={{ fontSize: 16, fontWeight: 800, color: 'white' }}>{userName}</div><div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{userEmail}</div><div style={{ fontSize: 10, background: 'rgba(0,240,255,0.1)', color: 'var(--elec-blue)', padding: '2px 8px', borderRadius: 4, display: 'inline-block', marginTop: 8, fontWeight: 700 }}>{userRole?.toUpperCase()}</div></div>
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 16 }}><button onClick={handleLogout} style={{ width: '100%', padding: '12px', borderRadius: 10, background: 'rgba(255,59,48,0.1)', border: '1px solid rgba(255,59,48,0.2)', color: '#FF3B30', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>🚪 {loc === 'ar' ? 'تسجيل الخروج' : 'Logout'}</button></div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>
        <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '20px 16px' : '48px', position: 'relative' }}>{children}</div>
      </main>
    </div>
  );
}
