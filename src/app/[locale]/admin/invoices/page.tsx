'use client';
import { use, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getTranslations, Locale } from '@/lib/translations';

import { useSearchParams } from 'next/navigation';

export default function AdminInvoicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const loc = (locale === 'ar' ? 'ar' : 'en') as Locale;
  const t = getTranslations(loc);
  const searchParams = useSearchParams();
  
  const newShipmentId = searchParams.get('new');
  const newCustomerName = searchParams.get('name') || '';
  const newCustomerPhone = searchParams.get('phone') || ''; // We might not have phone in URL but good to be aware

  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(!!newShipmentId);
  const [adding, setAdding] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  
  const [newInvoice, setNewInvoice] = useState({
    shipment_id: newShipmentId || '',
    customer_name: newCustomerName || '',
    customer_phone: newCustomerPhone || '',
    details: '',
  });

  const [showWhatsAppPrompt, setShowWhatsAppPrompt] = useState<any>(null);

  const [invoiceItems, setInvoiceItems] = useState([{ description: '', quantity: 1, price: 0 }]);

  const calculateTotal = () => {
    return invoiceItems.reduce((acc, item) => acc + (item.quantity * item.price), 0);
  };

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setInvoices(data);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleIssueInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      const amount = calculateTotal();
      const { data, error } = await supabase.from('invoices').insert([{
        shipment_id: newInvoice.shipment_id,
        customer_name: newInvoice.customer_name,
        amount: amount,
        details: newInvoice.details,
        items: invoiceItems,
        status: 'unpaid'
      }]).select('id').single();

      if (error) throw new Error(error.message || error.code || JSON.stringify(error));
      
      setShowForm(false);
      setShowWhatsAppPrompt({
        id: data.id,
        shipment_id: newInvoice.shipment_id,
        customer_name: newInvoice.customer_name,
        amount: amount
      });
      
      setInvoiceItems([{ description: '', quantity: 1, price: 0 }]);
      setNewInvoice({ shipment_id: '', customer_name: '', customer_phone: '', details: '' });
      await fetchInvoices();
    } catch (err: any) {
      console.error(err);
      alert(loc === 'ar' ? `خطأ: ${err.message}` : `Error: ${err.message}`);
    } finally {
      setAdding(false);
    }
  };

  const handleUpdateStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'paid' ? 'unpaid' : 'paid';
    setUpdating(id);
    try {
      const { error } = await supabase.from('invoices').update({ status: nextStatus }).eq('id', id);
      if (error) throw error;
      await fetchInvoices();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(null);
    }
  };

  const handleWhatsApp = (inv: any) => {
    const url = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const invoiceLink = `${url}/${locale}/invoice/${inv.id}`;
    const trackingLink = `${url}/${locale}/tracking?id=${inv.shipment_id}`;
    
    const msg = loc === 'ar'
      ? `مرحباً ${inv.customer_name}،\nتم إصدار فاتورة جديدة لشحنتك رقم *${inv.shipment_id}*.\n\n💰 المبلغ الإجمالي: ${inv.amount} SAR\n🧾 عرض الفاتورة: ${invoiceLink}\n📦 تتبع الشحنة: ${trackingLink}\n\nشكراً لتعاملك مع بن حبيب للشحن.`
      : `Hello ${inv.customer_name},\nA new invoice has been issued for your shipment *${inv.shipment_id}*.\n\n💰 Total Amount: ${inv.amount} SAR\n🧾 View Invoice: ${invoiceLink}\n📦 Track Shipment: ${trackingLink}\n\nThank you for choosing Bin Habib.`;
    
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>{loc === 'ar' ? 'إدارة الفواتير' : 'Invoices Management'}</h1>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}>
            {showForm ? '❌' : '➕'} {loc === 'ar' ? 'إصدار فاتورة' : 'Issue Invoice'}
          </button>
          <button onClick={fetchInvoices} className="btn-secondary" style={{ padding: '8px 16px', fontSize: 13 }}>
            🔄 {loc === 'ar' ? 'تحديث' : 'Refresh'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>{loc === 'ar' ? 'إصدار فاتورة إلكترونية' : 'Issue E-Invoice'}</h3>
          <form onSubmit={handleIssueInvoice} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <div><label style={{ fontSize: 12, marginBottom: 4, display: 'block', color: 'var(--text-secondary)' }}>{loc === 'ar' ? 'رقم الشحنة المربوطة' : 'Shipment ID'}</label><input required className="input-glass" type="text" value={newInvoice.shipment_id} onChange={e => setNewInvoice({...newInvoice, shipment_id: e.target.value})} dir="ltr" /></div>
              <div><label style={{ fontSize: 12, marginBottom: 4, display: 'block', color: 'var(--text-secondary)' }}>{loc === 'ar' ? 'اسم العميل' : 'Customer Name'}</label><input required className="input-glass" type="text" value={newInvoice.customer_name} onChange={e => setNewInvoice({...newInvoice, customer_name: e.target.value})} /></div>
              <div><label style={{ fontSize: 12, marginBottom: 4, display: 'block', color: 'var(--text-secondary)' }}>{loc === 'ar' ? 'ملاحظات للفاتورة' : 'Invoice Notes'}</label><input className="input-glass" type="text" value={newInvoice.details} onChange={e => setNewInvoice({...newInvoice, details: e.target.value})} /></div>
            </div>

            {/* Line Items */}
            <div style={{ background: 'var(--bg-elevated)', padding: 16, borderRadius: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h4 style={{ fontWeight: 700, margin: 0 }}>{loc === 'ar' ? 'بنود الفاتورة' : 'Invoice Items'}</h4>
                <button type="button" onClick={() => setInvoiceItems([...invoiceItems, { description: '', quantity: 1, price: 0 }])} className="btn-secondary" style={{ padding: '4px 12px', fontSize: 12 }}>
                  ➕ {loc === 'ar' ? 'إضافة بند' : 'Add Item'}
                </button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {invoiceItems.map((item, index) => (
                  <div key={index} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr auto', gap: 12, alignItems: 'center' }}>
                    <input required className="input-glass" type="text" placeholder={loc === 'ar' ? 'وصف البند (مثال: أجور شحن)' : 'Description'} value={item.description} onChange={e => { const newItems = [...invoiceItems]; newItems[index].description = e.target.value; setInvoiceItems(newItems); }} />
                    <input required className="input-glass" type="number" min="1" placeholder={loc === 'ar' ? 'الكمية' : 'Qty'} value={item.quantity} onChange={e => { const newItems = [...invoiceItems]; newItems[index].quantity = parseInt(e.target.value) || 0; setInvoiceItems(newItems); }} dir="ltr" />
                    <input required className="input-glass" type="number" step="0.01" placeholder={loc === 'ar' ? 'السعر' : 'Price'} value={item.price} onChange={e => { const newItems = [...invoiceItems]; newItems[index].price = parseFloat(e.target.value) || 0; setInvoiceItems(newItems); }} dir="ltr" />
                    <button type="button" onClick={() => setInvoiceItems(invoiceItems.filter((_, i) => i !== index))} disabled={invoiceItems.length === 1} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: invoiceItems.length > 1 ? 'pointer' : 'not-allowed', padding: 8 }}>❌</button>
                  </div>
                ))}
              </div>
              
              <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--glass-border)', paddingTop: 16 }}>
                <div style={{ fontSize: 18 }}>{loc === 'ar' ? 'الإجمالي:' : 'Total:'} <strong style={{ fontFamily: 'var(--font-en)', color: 'var(--primary)', marginInlineStart: 8 }}>{calculateTotal().toFixed(2)} SAR</strong></div>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button type="submit" disabled={adding} className="btn-success" style={{ padding: '12px 32px', fontSize: 14 }}>
                {adding ? '...' : (loc === 'ar' ? 'إصدار الفاتورة وحفظها' : 'Save & Issue Invoice')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-card" style={{ padding: '24px 0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', padding: '0 24px' }}>
          <table className="glass-table" style={{ minWidth: 800 }}>
            <thead>
              <tr>
                <th>{loc === 'ar' ? 'رقم الفاتورة' : 'Invoice ID'}</th>
                <th>{loc === 'ar' ? 'رقم الشحنة' : 'Shipment ID'}</th>
                <th>{loc === 'ar' ? 'اسم العميل' : 'Customer'}</th>
                <th>{loc === 'ar' ? 'المبلغ' : 'Amount'}</th>
                <th>{loc === 'ar' ? 'الحالة' : 'Status'}</th>
                <th style={{ textAlign: 'end' }}>{loc === 'ar' ? 'إجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40 }}>Loading...</td></tr>
              ) : invoices.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)' }}>{loc === 'ar' ? 'لا توجد فواتير أو أن الجدول لم يتم إنشاؤه بعد' : 'No invoices or table not created'}</td></tr>
              ) : (
                invoices.map(inv => (
                  <tr key={inv.id}>
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                      <a href={`/${locale}/invoice/${inv.id}`} target="_blank" style={{ color: 'inherit', textDecoration: 'none' }}>{inv.id} ↗</a>
                    </td>
                    <td style={{ fontFamily: 'var(--font-en)' }}>{inv.shipment_id}</td>
                    <td style={{ fontWeight: 600 }}>{inv.customer_name}</td>
                    <td style={{ fontFamily: 'var(--font-en)', fontWeight: 800 }}>{inv.amount} <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>SAR</span></td>
                    <td>
                      <span className={`badge ${inv.status === 'paid' ? 'badge-delivered' : 'badge-new'}`}>
                        {inv.status === 'paid' ? (loc === 'ar' ? 'مدفوعة' : 'Paid') : (loc === 'ar' ? 'غير مدفوعة' : 'Unpaid')}
                      </span>
                    </td>
                    <td style={{ textAlign: 'end' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                        <a href={`/${locale}/invoice/${inv.id}`} target="_blank" className="btn-secondary" style={{ padding: '6px 12px', fontSize: 11, textDecoration: 'none', background: 'rgba(255,255,255,0.1)' }}>
                          👁️ {loc === 'ar' ? 'عرض' : 'View'}
                        </a>
                        <button onClick={() => handleUpdateStatus(inv.id, inv.status)} disabled={updating === inv.id} className="btn-secondary" style={{ padding: '6px 12px', fontSize: 11 }}>
                          {updating === inv.id ? '...' : (inv.status === 'paid' ? (loc === 'ar' ? 'جعلها غير مدفوعة' : 'Mark Unpaid') : (loc === 'ar' ? 'تأكيد الدفع' : 'Mark Paid'))}
                        </button>
                        <button onClick={() => handleWhatsApp(inv)} className="btn-whatsapp" style={{ padding: '6px 12px', fontSize: 11 }}>
                          💬 {loc === 'ar' ? 'إرسال للعميل' : 'Send'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>

          </table>
        </div>
      </div>

      {/* WhatsApp Prompt Modal */}
      {showWhatsAppPrompt && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-card" style={{ padding: 32, maxWidth: 400, width: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>✅</div>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>{loc === 'ar' ? 'تم إصدار الفاتورة بنجاح!' : 'Invoice Issued!'}</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: 14 }}>
              {loc === 'ar' 
                ? `تم إنشاء الفاتورة رقم ${showWhatsAppPrompt.id} للعميل. هل تود إرسال إشعار الفاتورة عبر واتساب للعميل الآن؟` 
                : `Invoice ${showWhatsAppPrompt.id} created. Would you like to notify the customer via WhatsApp now?`}
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button onClick={() => setShowWhatsAppPrompt(null)} className="btn-secondary" style={{ flex: 1, padding: '12px' }}>
                {loc === 'ar' ? 'إغلاق' : 'Close'}
              </button>
              <button onClick={() => { handleWhatsApp(showWhatsAppPrompt); setShowWhatsAppPrompt(null); }} className="btn-whatsapp" style={{ flex: 1, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                💬 {loc === 'ar' ? 'إرسال للعميل' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
