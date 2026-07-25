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
    fixed_cbm_rate: 150,
    office_commission: 5,
    wa_template_invoice_ar: 'مرحباً {CUSTOMER_NAME}! 👋\n\nتم إصدار فاتورة جديدة لشحنتك رقم *{SHIPMENT_ID}*.\n\n💰 المبلغ الإجمالي: *{AMOUNT} SAR*\n🧾 عرض الفاتورة: {INVOICE_LINK}\n📦 تتبع الشحنة: {TRACKING_LINK}\n\n📞 للتواصل واتساب: {PHONE}\n🌐 الموقع: {WEBSITE}\n\nشكراً لثقتكم بمؤسسة بن حبيب للتجارة والاستيراد 🚢\n\n---\n\nHello {CUSTOMER_NAME}! 👋\n\nA new invoice has been issued for your shipment *{SHIPMENT_ID}*.\n\n💰 Total: *{AMOUNT} SAR*\n🧾 View Invoice: {INVOICE_LINK}\n📦 Track Shipment: {TRACKING_LINK}\n\n📞 WhatsApp: {PHONE}\n🌐 Website: {WEBSITE}\n\nThank you for choosing Bin Habib Trading & Import 🚢',
    wa_template_shipment_ar: 'مرحباً {CUSTOMER_NAME}! 👋\n\nتم تحديث حالة شحنتك رقم *{SHIPMENT_ID}*:\n\n📍 الحالة الجديدة: *{STATUS}*\n📦 المنتج: {PRODUCT}\n\n🔗 تتبع الشحنة: {TRACKING_LINK}\n\n📞 للتواصل واتساب: {PHONE}\n🌐 الموقع: {WEBSITE}\n\nمؤسسة بن حبيب للتجارة والاستيراد 🚢\nنسعد بخدمتكم دائماً!\n\n---\n\nHello {CUSTOMER_NAME}! 👋\n\nYour shipment *{SHIPMENT_ID}* has been updated:\n\n📍 Current Status: *{STATUS}*\n📦 Product: {PRODUCT}\n\n🔗 Track Shipment: {TRACKING_LINK}\n\n📞 WhatsApp: {PHONE}\n🌐 Website: {WEBSITE}\n\nBin Habib Trading & Import 🚢\nAlways happy to serve you!',
    wa_template_welcome_ar: 'مرحباً {CUSTOMER_NAME}! 👋\n\nشكراً لتواصلك مع *مؤسسة بن حبيب للتجارة والاستيراد*.\n\nتم استلام طلبك بنجاح:\n📦 المنتج: {PRODUCT}\n📝 الوصف: {DESCRIPTION}\n📅 التاريخ: {DATE}\n\nسنقوم بمراجعة طلبك والرد عليك في أقرب وقت.\n\n📞 للتواصل: {PHONE}\n🌐 الموقع: {WEBSITE}\n\nفريق بن حبيب 🚢\n\n---\n\nHello {CUSTOMER_NAME}! 👋\n\nThank you for contacting *Bin Habib Trading & Import*.\n\nYour request has been received:\n📦 Product: {PRODUCT}\n📝 Description: {DESCRIPTION}\n📅 Date: {DATE}\n\nWe will review your request and get back to you shortly.\n\n📞 Contact: {PHONE}\n🌐 Website: {WEBSITE}\n\nBin Habib Team 🚢',
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
          // Fill missing templates with defaults if they are null in the database
          setSettings({
            ...settingsData,
            wa_template_invoice_ar: settingsData.wa_template_invoice_ar || 'مرحباً {CUSTOMER_NAME}! 👋\n\nتم إصدار فاتورة جديدة لشحنتك رقم *{SHIPMENT_ID}*.\n\n💰 المبلغ الإجمالي: *{AMOUNT} SAR*\n🧾 عرض الفاتورة: {INVOICE_LINK}\n📦 تتبع الشحنة: {TRACKING_LINK}\n\n📞 للتواصل واتساب: {PHONE}\n🌐 الموقع: {WEBSITE}\n\nشكراً لثقتكم بمؤسسة بن حبيب للتجارة والاستيراد 🚢\n\n---\n\nHello {CUSTOMER_NAME}! 👋\n\nA new invoice has been issued for your shipment *{SHIPMENT_ID}*.\n\n💰 Total: *{AMOUNT} SAR*\n🧾 View Invoice: {INVOICE_LINK}\n📦 Track Shipment: {TRACKING_LINK}\n\n📞 WhatsApp: {PHONE}\n🌐 Website: {WEBSITE}\n\nThank you for choosing Bin Habib Trading & Import 🚢',
            wa_template_shipment_ar: settingsData.wa_template_shipment_ar || 'مرحباً {CUSTOMER_NAME}! 👋\n\nتم تحديث حالة شحنتك رقم *{SHIPMENT_ID}*:\n\n📍 الحالة الجديدة: *{STATUS}*\n📦 المنتج: {PRODUCT}\n\n🔗 تتبع الشحنة: {TRACKING_LINK}\n\n📞 للتواصل واتساب: {PHONE}\n🌐 الموقع: {WEBSITE}\n\nمؤسسة بن حبيب للتجارة والاستيراد 🚢\nنسعد بخدمتكم دائماً!\n\n---\n\nHello {CUSTOMER_NAME}! 👋\n\nYour shipment *{SHIPMENT_ID}* has been updated:\n\n📍 Current Status: *{STATUS}*\n📦 Product: {PRODUCT}\n\n🔗 Track Shipment: {TRACKING_LINK}\n\n📞 WhatsApp: {PHONE}\n🌐 Website: {WEBSITE}\n\nBin Habib Trading & Import 🚢\nAlways happy to serve you!',
            wa_template_welcome_ar: settingsData.wa_template_welcome_ar || 'مرحباً {CUSTOMER_NAME}! 👋\n\nشكراً لتواصلك مع *مؤسسة بن حبيب للتجارة والاستيراد*.\n\nتم استلام طلبك بنجاح:\n📦 المنتج: {PRODUCT}\n📝 الوصف: {DESCRIPTION}\n📅 التاريخ: {DATE}\n\nسنقوم بمراجعة طلبك والرد عليك في أقرب وقت.\n\n📞 للتواصل: {PHONE}\n🌐 الموقع: {WEBSITE}\n\nفريق بن حبيب 🚢\n\n---\n\nHello {CUSTOMER_NAME}! 👋\n\nThank you for contacting *Bin Habib Trading & Import*.\n\nYour request has been received:\n📦 Product: {PRODUCT}\n📝 Description: {DESCRIPTION}\n📅 Date: {DATE}\n\nWe will review your request and get back to you shortly.\n\n📞 Contact: {PHONE}\n🌐 Website: {WEBSITE}\n\nBin Habib Team 🚢',
          });
        }
      }
      setLoading(false);
    };

    checkRoleAndFetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate WhatsApp templates
    const requiredInvoice = ['{CUSTOMER_NAME}', '{INVOICE_LINK}'];
    const requiredShipment = ['{CUSTOMER_NAME}', '{SHIPMENT_ID}', '{STATUS}'];
    const requiredWelcome = ['{CUSTOMER_NAME}'];

    const checkMissing = (text: string | undefined, required: string[]) => {
      if (!text) return null;
      for (const req of required) {
        if (!text.includes(req)) return req;
      }
      return null;
    };

    let validationError = null;
    let missing = checkMissing(settings.wa_template_invoice_ar, requiredInvoice);
    if (missing) validationError = loc === 'ar' ? `خطأ: قالب الفاتورة ينقصه المتغير الأساسي: ${missing}` : `Error: Invoice template missing variable: ${missing}`;
    
    if (!validationError) {
      missing = checkMissing(settings.wa_template_shipment_ar, requiredShipment);
      if (missing) validationError = loc === 'ar' ? `خطأ: قالب حالة الشحنة ينقصه المتغير الأساسي: ${missing}` : `Error: Shipment template missing variable: ${missing}`;
    }

    if (!validationError) {
      missing = checkMissing(settings.wa_template_welcome_ar, requiredWelcome);
      if (missing) validationError = loc === 'ar' ? `خطأ: قالب استلام الطلب ينقصه المتغير الأساسي: ${missing}` : `Error: Welcome template missing variable: ${missing}`;
    }

    if (validationError) {
      alert(validationError);
      return;
    }

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
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>{loc === 'ar' ? 'إعدادات حاسبة الشحن' : 'Shipping Calculator Settings'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{loc === 'ar' ? 'سعر الشحن لكل متر مكعب (USD)' : 'CBM Rate (USD)'}</label>
              <input className="input-glass" type="number" value={settings.fixed_cbm_rate ?? 150} onChange={e => setSettings({...settings, fixed_cbm_rate: parseFloat(e.target.value) || 0})} dir="ltr" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{loc === 'ar' ? 'نسبة عمولة المكتب (%)' : 'Office Commission (%)'}</label>
              <input className="input-glass" type="number" value={settings.office_commission ?? 5} onChange={e => setSettings({...settings, office_commission: parseFloat(e.target.value) || 0})} dir="ltr" />
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

        <div className="glass-card" style={{ padding: 32 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>{loc === 'ar' ? 'قوالب رسائل الواتساب' : 'WhatsApp Templates'}</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 24 }}>
            {loc === 'ar' 
              ? 'يمكنك تعديل محتوى الرسائل التلقائية هنا. استخدم المتغيرات (مثال: {CUSTOMER_NAME}) ليتم استبدالها تلقائياً بالبيانات الحقيقية عند الإرسال.' 
              : 'You can edit the automatic message content here. Use variables (e.g., {CUSTOMER_NAME}) to be replaced automatically with real data when sending.'}
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {/* Invoice Template */}
            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: 24 }}>
              <h4 style={{ fontWeight: 600, marginBottom: 8, color: 'var(--primary)' }}>{loc === 'ar' ? 'رسالة الفاتورة الجديدة' : 'New Invoice Message'}</h4>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {loc === 'ar' ? 'المتغيرات المتاحة:' : 'Available Variables:'}
                <code style={{ background: 'rgba(0,0,0,0.1)', padding: '2px 6px', borderRadius: 4 }}>{'{CUSTOMER_NAME}'}</code>
                <code style={{ background: 'rgba(0,0,0,0.1)', padding: '2px 6px', borderRadius: 4 }}>{'{SHIPMENT_ID}'}</code>
                <code style={{ background: 'rgba(0,0,0,0.1)', padding: '2px 6px', borderRadius: 4 }}>{'{AMOUNT}'}</code>
                <code style={{ background: 'rgba(0,0,0,0.1)', padding: '2px 6px', borderRadius: 4 }}>{'{INVOICE_LINK}'}</code>
                <code style={{ background: 'rgba(0,0,0,0.1)', padding: '2px 6px', borderRadius: 4 }}>{'{TRACKING_LINK}'}</code>
                <code style={{ background: 'rgba(0,0,0,0.1)', padding: '2px 6px', borderRadius: 4 }}>{'{PHONE}'}</code>
                <code style={{ background: 'rgba(0,0,0,0.1)', padding: '2px 6px', borderRadius: 4 }}>{'{WEBSITE}'}</code>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{loc === 'ar' ? 'الرسالة (عربي + إنجليزي في نفس الرسالة)' : 'Message (Bilingual)'}</label>
                  <textarea className="input-glass" rows={12} style={{ resize: 'vertical' }} value={settings.wa_template_invoice_ar || ''} onChange={e => setSettings({...settings, wa_template_invoice_ar: e.target.value})} dir="rtl" />
                </div>
              </div>
            </div>

            {/* Shipment Update Template */}
            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: 24 }}>
              <h4 style={{ fontWeight: 600, marginBottom: 8, color: 'var(--primary)' }}>{loc === 'ar' ? 'رسالة تحديث حالة الشحنة' : 'Shipment Update Message'}</h4>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {loc === 'ar' ? 'المتغيرات المتاحة:' : 'Available Variables:'}
                <code style={{ background: 'rgba(0,0,0,0.1)', padding: '2px 6px', borderRadius: 4 }}>{'{CUSTOMER_NAME}'}</code>
                <code style={{ background: 'rgba(0,0,0,0.1)', padding: '2px 6px', borderRadius: 4 }}>{'{SHIPMENT_ID}'}</code>
                <code style={{ background: 'rgba(0,0,0,0.1)', padding: '2px 6px', borderRadius: 4 }}>{'{STATUS}'}</code>
                <code style={{ background: 'rgba(0,0,0,0.1)', padding: '2px 6px', borderRadius: 4 }}>{'{PRODUCT}'}</code>
                <code style={{ background: 'rgba(0,0,0,0.1)', padding: '2px 6px', borderRadius: 4 }}>{'{TRACKING_LINK}'}</code>
                <code style={{ background: 'rgba(0,0,0,0.1)', padding: '2px 6px', borderRadius: 4 }}>{'{PHONE}'}</code>
                <code style={{ background: 'rgba(0,0,0,0.1)', padding: '2px 6px', borderRadius: 4 }}>{'{WEBSITE}'}</code>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{loc === 'ar' ? 'الرسالة (عربي + إنجليزي في نفس الرسالة)' : 'Message (Bilingual)'}</label>
                  <textarea className="input-glass" rows={12} style={{ resize: 'vertical' }} value={settings.wa_template_shipment_ar || ''} onChange={e => setSettings({...settings, wa_template_shipment_ar: e.target.value})} dir="rtl" />
                </div>
              </div>
            </div>

            {/* Welcome Template */}
            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: 24 }}>
              <h4 style={{ fontWeight: 600, marginBottom: 8, color: 'var(--primary)' }}>{loc === 'ar' ? 'رسالة استلام الطلب' : 'Request Received Welcome Message'}</h4>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {loc === 'ar' ? 'المتغيرات المتاحة:' : 'Available Variables:'}
                <code style={{ background: 'rgba(0,0,0,0.1)', padding: '2px 6px', borderRadius: 4 }}>{'{CUSTOMER_NAME}'}</code>
                <code style={{ background: 'rgba(0,0,0,0.1)', padding: '2px 6px', borderRadius: 4 }}>{'{PRODUCT}'}</code>
                <code style={{ background: 'rgba(0,0,0,0.1)', padding: '2px 6px', borderRadius: 4 }}>{'{DESCRIPTION}'}</code>
                <code style={{ background: 'rgba(0,0,0,0.1)', padding: '2px 6px', borderRadius: 4 }}>{'{DATE}'}</code>
                <code style={{ background: 'rgba(0,0,0,0.1)', padding: '2px 6px', borderRadius: 4 }}>{'{PHONE}'}</code>
                <code style={{ background: 'rgba(0,0,0,0.1)', padding: '2px 6px', borderRadius: 4 }}>{'{WEBSITE}'}</code>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{loc === 'ar' ? 'الرسالة (عربي + إنجليزي في نفس الرسالة)' : 'Message (Bilingual)'}</label>
                  <textarea className="input-glass" rows={12} style={{ resize: 'vertical' }} value={settings.wa_template_welcome_ar || ''} onChange={e => setSettings({...settings, wa_template_welcome_ar: e.target.value})} dir="rtl" />
                </div>
              </div>
            </div>
          </div>
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
