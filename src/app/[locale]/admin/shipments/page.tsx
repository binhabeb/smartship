'use client';
import { use, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getTranslations, Locale } from '@/lib/translations';
import Link from 'next/link';

export default function AdminShipmentsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const loc = (locale === 'ar' ? 'ar' : 'en') as Locale;
  const t = getTranslations(loc);
  const [shipments, setShipments] = useState<any[]>([]);
  const [filteredShipments, setFilteredShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [showAddForm, setShowAddForm] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newShipment, setNewShipment] = useState({
    customer_name: '', customer_phone: '', city: '', product: '', product_description: '', current_status: 'shipped', product_image: ''
  });

  const [showInvoicePrompt, setShowInvoicePrompt] = useState<{ id: string, name: string } | null>(null);

  const fetchShipments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('shipments')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) {
      setShipments(data);
      setFilteredShipments(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  const handleAddShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      const { data, error } = await supabase.from('shipments').insert([newShipment]).select('id, customer_name').single();
      if (error) throw new Error(error.message || error.code || JSON.stringify(error));
      
      setShowAddForm(false);
      setNewShipment({ customer_name: '', customer_phone: '', city: '', product: '', product_description: '', current_status: 'shipped', product_image: '' });
      await fetchShipments();
      
      // Prompt for invoice
      setShowInvoicePrompt({ id: data.id, name: data.customer_name });
    } catch (err: any) {
      console.error(err);
      alert(loc === 'ar' ? `خطأ: ${err.message}` : `Error: ${err.message}`);
    } finally {
      setAdding(false);
    }
  };

  useEffect(() => {
    let result = shipments;

    if (search.trim() !== '') {
      const q = search.toLowerCase();
      result = result.filter(s => 
        s.id.toLowerCase().includes(q) || 
        s.customer_name.toLowerCase().includes(q) || 
        s.customer_phone.includes(q)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(s => s.current_status === statusFilter);
    }

    setFilteredShipments(result);
  }, [search, statusFilter, shipments]);

  const getStatusBadgeClass = (status: string) => {
    if (status === 'delivered') return 'badge-delivered';
    if (status === 'in_transit') return 'badge-transit';
    if (status === 'customs') return 'badge-customs';
    if (status === 'delayed') return 'badge-danger';
    return 'badge-new'; // shipped, etc
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      delivered: t.tracking?.statusDelivered || 'Delivered', 
      in_transit: t.tracking?.statusInTransit || 'In Transit',
      customs: t.tracking?.statusCustoms || 'Customs', 
      shipped: t.tracking?.statusShipped || 'Shipped',
      at_port: t.tracking?.statusAtPort || 'At Port', 
      delayed: t.tracking?.statusDelayed || 'Delayed',
    };
    return map[status] || status;
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>{t.admin?.shipments || 'Shipments'}</h1>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => setShowAddForm(!showAddForm)} className="btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}>
            ➕ {loc === 'ar' ? 'إضافة شحنة' : 'Add Shipment'}
          </button>
          <button onClick={fetchShipments} className="btn-secondary" style={{ padding: '8px 16px', fontSize: 13 }}>
            🔄 {loc === 'ar' ? 'تحديث' : 'Refresh'}
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>{loc === 'ar' ? 'إضافة شحنة يدوياً' : 'Add Manual Shipment'}</h3>
          <form onSubmit={handleAddShipment} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <div><label style={{ fontSize: 12, marginBottom: 4, display: 'block' }}>{loc === 'ar' ? 'اسم العميل' : 'Customer Name'}</label><input required className="input-glass" type="text" value={newShipment.customer_name} onChange={e => setNewShipment({...newShipment, customer_name: e.target.value})} /></div>
            <div><label style={{ fontSize: 12, marginBottom: 4, display: 'block' }}>{loc === 'ar' ? 'رقم الجوال' : 'Phone'}</label><input required className="input-glass" type="text" value={newShipment.customer_phone} onChange={e => setNewShipment({...newShipment, customer_phone: e.target.value})} dir="ltr" /></div>
            <div><label style={{ fontSize: 12, marginBottom: 4, display: 'block' }}>{loc === 'ar' ? 'المدينة' : 'City'}</label><input className="input-glass" type="text" value={newShipment.city} onChange={e => setNewShipment({...newShipment, city: e.target.value})} /></div>
            <div><label style={{ fontSize: 12, marginBottom: 4, display: 'block' }}>{loc === 'ar' ? 'المنتج' : 'Product'}</label><input className="input-glass" type="text" value={newShipment.product} onChange={e => setNewShipment({...newShipment, product: e.target.value})} /></div>
            <div><label style={{ fontSize: 12, marginBottom: 4, display: 'block' }}>{loc === 'ar' ? 'الحالة' : 'Status'}</label>
              <select className="input-glass" value={newShipment.current_status} onChange={e => setNewShipment({...newShipment, current_status: e.target.value})}>
                <option value="new">{loc === 'ar' ? 'جديد' : 'New'}</option>
                <option value="shipped">{loc === 'ar' ? 'تم الشحن' : 'Shipped'}</option>
                <option value="in_transit">{loc === 'ar' ? 'في الطريق' : 'In Transit'}</option>
                <option value="delivered">{loc === 'ar' ? 'تم التسليم' : 'Delivered'}</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, marginBottom: 4, display: 'block' }}>{loc === 'ar' ? 'صورة الشحنة' : 'Shipment Image'}</label>
              <label className="input-glass" style={{ display: 'block', cursor: 'pointer', textAlign: 'center', padding: '8px' }}>
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setNewShipment({...newShipment, product_image: reader.result as string});
                    };
                    reader.readAsDataURL(file);
                  }
                }} />
                {newShipment.product_image ? (loc === 'ar' ? 'تم الرفع ✅' : 'Uploaded ✅') : (loc === 'ar' ? 'اختر صورة...' : 'Choose Image...')}
              </label>
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
              <button type="button" onClick={() => setShowAddForm(false)} className="btn-secondary" style={{ padding: '8px 24px' }}>{loc === 'ar' ? 'إلغاء' : 'Cancel'}</button>
              <button type="submit" disabled={adding} className="btn-primary" style={{ padding: '8px 24px' }}>{adding ? '...' : (loc === 'ar' ? 'إضافة' : 'Add')}</button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-card" style={{ padding: 24, marginBottom: 24, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 250 }}>
          <input 
            type="text" 
            className="input-glass" 
            placeholder={loc === 'ar' ? '🔍 ابحث برقم الشحنة، اسم العميل، أو الجوال...' : '🔍 Search by ID, name, phone...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {['all', 'shipped', 'in_transit', 'customs', 'delivered', 'delayed'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={statusFilter === status ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '8px 16px', fontSize: 13, whiteSpace: 'nowrap', opacity: statusFilter === status ? 1 : 0.8 }}
            >
              {status === 'all' ? (loc === 'ar' ? 'الكل' : 'All') : getStatusLabel(status)}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card" style={{ padding: '24px 0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', padding: '0 24px' }}>
          <table className="glass-table" style={{ minWidth: 800 }}>
            <thead>
              <tr>
                <th>{t.tracking?.shipmentId || 'ID'}</th>
                <th>{t.admin?.clientName || 'Client'}</th>
                <th>{t.admin?.destination || 'Destination'}</th>
                <th>{t.admin?.statusCol || 'Status'}</th>
                <th style={{ textAlign: 'end' }}>{t.admin?.actions || 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)' }}>Loading...</td>
                </tr>
              ) : filteredShipments.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)' }}>
                    {loc === 'ar' ? 'لا توجد شحنات مطابقة' : 'No matching shipments'}
                  </td>
                </tr>
              ) : (
                filteredShipments.map(ship => (
                  <tr key={ship.id}>
                    <td style={{ fontWeight: 700, fontFamily: 'var(--font-en)', color: 'var(--primary)' }}>
                      <Link href={`/${locale}/admin/shipments/${ship.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        {ship.id}
                      </Link>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{ship.customer_name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-tertiary)', fontFamily: 'var(--font-en)' }}>{ship.customer_phone}</div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{ship.destination || ship.city}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(ship.current_status)}`}>
                        {getStatusLabel(ship.current_status)}
                      </span>
                    </td>
                    <td style={{ textAlign: 'end' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <a 
                          href={`https://wa.me/${ship.customer_phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-whatsapp"
                          style={{ padding: '8px 12px', fontSize: 12, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          title={loc === 'ar' ? 'مراسلة عبر واتساب' : 'Message on WhatsApp'}
                        >
                          💬
                        </a>
                        <Link href={`/${locale}/admin/shipments/${ship.id}`} className="btn-secondary" style={{ padding: '6px 12px', fontSize: 12, textDecoration: 'none', display: 'inline-block' }}>
                          {loc === 'ar' ? 'إدارة' : 'Manage'}
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Prompt Modal */}
      {showInvoicePrompt && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-card" style={{ padding: 32, maxWidth: 400, width: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🎉</div>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>{loc === 'ar' ? 'تمت إضافة الشحنة!' : 'Shipment Added!'}</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: 14 }}>
              {loc === 'ar' 
                ? `تم إنشاء الشحنة رقم ${showInvoicePrompt.id} بنجاح. هل تود إصدار فاتورة إلكترونية للعميل (${showInvoicePrompt.name}) الآن؟` 
                : `Shipment ${showInvoicePrompt.id} created successfully. Would you like to issue an invoice for ${showInvoicePrompt.name} now?`}
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button onClick={() => setShowInvoicePrompt(null)} className="btn-secondary" style={{ flex: 1, padding: '12px' }}>
                {loc === 'ar' ? 'ليس الآن' : 'Not Now'}
              </button>
              <Link href={`/${locale}/admin/invoices?new=${showInvoicePrompt.id}&name=${encodeURIComponent(showInvoicePrompt.name)}`} className="btn-primary" style={{ flex: 1, padding: '12px', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {loc === 'ar' ? 'إصدار فاتورة' : 'Issue Invoice'}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
