'use client';
import { use, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getTranslations, Locale } from '@/lib/translations';

export default function AdminSettingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const loc = (locale === 'ar' ? 'ar' : 'en') as Locale;
  const t = getTranslations(loc);

  const [settings, setSettings] = useState<any>({
    site_name: 'SmartShip',
    tracking_prefix: 'SS-',
    vat_percent: 0,
    contact_phone: '',
    contact_email: '',
    maintenance_mode: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const checkRoleAndFetchSettings = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('email', session.user.email)
        .single();
      
      setUserRole(roleData?.role);

      if (roleData?.role === 'admin' || roleData?.role === 'manager') {
        const { data: settingsData } = await supabase
          .from('site_settings')
          .select('*')
          .single();
        
        if (settingsData) {
          setSettings(settingsData);
        }
      }
      setLoading(false);
    };

    checkRoleAndFetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert([settings]);
      
      if (error) throw error;
      alert(loc === 'ar' ? 'تم حفظ الإعدادات بنجاح' : 'Settings saved successfully');
    } catch (err: any) {
      console.error(err);
      alert(loc === 'ar' ? `خطأ: ${err.message}` : `Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 40 }}>Loading...</div>;

  if (userRole !== 'admin' && userRole !== 'manager') {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <h2>{loc === 'ar' ? 'عذراً، لا تملك الصلاحية للوصول لهذه الصفحة' : 'Access Denied'}</h2>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>{loc === 'ar' ? 'إعدادات الموقع' : 'Site Settings'}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>{loc === 'ar' ? 'تحكم في الخيارات العامة لمنصة الشحن' : 'Control general options for the shipping platform'}</p>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div className="glass-card" style={{ padding: 32 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>{loc === 'ar' ? 'الإعدادات العامة' : 'General Settings'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{loc === 'ar' ? 'اسم الموقع' : 'Site Name'}</label>
              <input className="input-glass" type="text" value={settings.site_name || ''} onChange={e => setSettings({...settings, site_name: e.target.value})} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{loc === 'ar' ? 'بادئة أرقام التتبع' : 'Tracking Prefix'}</label>
              <input className="input-glass" type="text" value={settings.tracking_prefix || ''} onChange={e => setSettings({...settings, tracking_prefix: e.target.value})} dir="ltr" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{loc === 'ar' ? 'نسبة الضريبة (VAT %)' : 'VAT Percentage'}</label>
              <input className="input-glass" type="number" value={settings.vat_percent ?? 0} onChange={e => setSettings({...settings, vat_percent: parseFloat(e.target.value) || 0})} dir="ltr" />
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: 32 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>{loc === 'ar' ? 'معلومات التواصل' : 'Contact Information'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{loc === 'ar' ? 'رقم الهاتف / الواتساب' : 'Phone / WhatsApp'}</label>
              <input className="input-glass" type="text" value={settings.contact_phone || ''} onChange={e => setSettings({...settings, contact_phone: e.target.value})} dir="ltr" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{loc === 'ar' ? 'البريد الإلكتروني للدعم' : 'Support Email'}</label>
              <input className="input-glass" type="email" value={settings.contact_email || ''} onChange={e => setSettings({...settings, contact_email: e.target.value})} dir="ltr" />
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: 32 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>{loc === 'ar' ? 'حالة النظام' : 'System Status'}</h3>
          <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
            <input type="checkbox" checked={settings.maintenance_mode} onChange={e => setSettings({...settings, maintenance_mode: e.target.checked})} style={{ width: 20, height: 20, accentColor: 'var(--primary)' }} />
            <span style={{ fontWeight: 600 }}>{loc === 'ar' ? 'وضع الصيانة (تعطيل تتبع الطلبات للعملاء)' : 'Maintenance Mode (Disable tracking for customers)'}</span>
          </label>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" disabled={saving} className="btn-primary" style={{ padding: '14px 48px', fontSize: 16 }}>
            {saving ? '...' : (loc === 'ar' ? 'حفظ التغييرات' : 'Save Changes')}
          </button>
        </div>
      </form>
    </div>
  );
}
