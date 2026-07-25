'use client';
import { use, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getTranslations, Locale } from '@/lib/translations';
import Link from 'next/link';

export default function AdminLabelsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const loc = (locale === 'ar' ? 'ar' : 'en') as Locale;
  const t = getTranslations(loc);

  const [labels, setLabels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [adding, setAdding] = useState(false);
  const [shipments, setShipments] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [deleting, setDeleting] = useState<string | null>(null);

  const [form, setForm] = useState({
    shipment_id: '',
    invoice_id: '',
    customer_name: '',
    customer_phone: '',
    destination: '',
    product: '',
    origin: 'China',
    weight_kg: '',
    volume_cbm: '',
    package_count: '1',
    shipment_method: 'SEA FREIGHT',
    shipment_date: new Date().toISOString().split('T')[0],
    remarks: '',
  });

  const fetchLabels = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('shipping_labels')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setLabels(data);
    setLoading(false);
  };

  const fetchShipments = async () => {
    const { data } = await supabase.from('shipments').select('id, customer_name, customer_phone, destination, product, city').order('created_at', { ascending: false });
    if (data) setShipments(data);
  };

  const fetchInvoices = async () => {
    const { data } = await supabase.from('invoices').select('id, shipment_id, customer_name, amount').order('created_at', { ascending: false });
    if (data) setInvoices(data);
  };

  useEffect(() => {
    fetchLabels();
    fetchShipments();
    fetchInvoices();
  }, []);

  const handleShipmentSelect = (shipmentId: string) => {
    const ship = shipments.find(s => s.id === shipmentId);
    if (ship) {
      setForm(prev => ({
        ...prev,
        shipment_id: shipmentId,
        customer_name: ship.customer_name || '',
        customer_phone: ship.customer_phone || '',
        destination: ship.destination || ship.city || '',
        product: ship.product || '',
      }));
      // Auto-select matching invoice
      const matchInv = invoices.find(inv => inv.shipment_id === shipmentId);
      if (matchInv) {
        setForm(prev => ({ ...prev, invoice_id: matchInv.id }));
      }
    }
  };

  const generateLabelNumber = async (): Promise<string> => {
    // Get the highest existing label number
    const { data } = await supabase
      .from('shipping_labels')
      .select('label_number')
      .order('created_at', { ascending: false })
      .limit(1);

    let nextNum = 1;
    if (data && data.length > 0) {
      const lastNum = data[0].label_number;
      const match = lastNum.match(/BH-(\d+)/);
      if (match) nextNum = parseInt(match[1]) + 1;
    }
    return `BH-${String(nextNum).padStart(4, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      const labelNumber = await generateLabelNumber();
      const { error } = await supabase.from('shipping_labels').insert([{
        shipment_id: form.shipment_id,
        invoice_id: form.invoice_id || null,
        customer_name: form.customer_name,
        customer_phone: form.customer_phone,
        destination: form.destination,
        product: form.product,
        origin: form.origin,
        weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null,
        volume_cbm: form.volume_cbm ? parseFloat(form.volume_cbm) : null,
        package_count: parseInt(form.package_count) || 1,
        shipment_method: form.shipment_method,
        shipment_date: form.shipment_date,
        remarks: form.remarks,
        label_number: labelNumber,
      }]);

      if (error) throw new Error(error.message);

      setShowForm(false);
      setForm({
        shipment_id: '', invoice_id: '', customer_name: '', customer_phone: '',
        destination: '', product: '', origin: 'China', weight_kg: '', volume_cbm: '',
        package_count: '1', shipment_method: 'SEA FREIGHT',
        shipment_date: new Date().toISOString().split('T')[0], remarks: '',
      });
      await fetchLabels();
    } catch (err: any) {
      alert(loc === 'ar' ? `خطأ: ${err.message}` : `Error: ${err.message}`);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(loc === 'ar' ? 'هل تريد حذف هذه البوليصة؟' : 'Delete this label?')) return;
    setDeleting(id);
    await supabase.from('shipping_labels').delete().eq('id', id);
    await fetchLabels();
    setDeleting(null);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>{loc === 'ar' ? 'بوليصات الشحن' : 'Shipping Labels'}</h1>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}>
            {showForm ? '❌' : '➕'} {loc === 'ar' ? 'إنشاء بوليصة' : 'Create Label'}
          </button>
          <button onClick={fetchLabels} className="btn-secondary" style={{ padding: '8px 16px', fontSize: 13 }}>
            🔄 {loc === 'ar' ? 'تحديث' : 'Refresh'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>{loc === 'ar' ? 'إنشاء بوليصة شحن جديدة' : 'Create New Shipping Label'}</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            
            {/* Row 1: Shipment & Invoice Selection */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, marginBottom: 6, display: 'block', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  {loc === 'ar' ? 'اختر الشحنة *' : 'Select Shipment *'}
                </label>
                <select required className="input-glass" value={form.shipment_id} onChange={e => handleShipmentSelect(e.target.value)} style={{ width: '100%', cursor: 'pointer' }}>
                  <option value="">{loc === 'ar' ? '-- اختر شحنة --' : '-- Select Shipment --'}</option>
                  {shipments.map(s => (
                    <option key={s.id} value={s.id}>{s.id} — {s.customer_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, marginBottom: 6, display: 'block', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  {loc === 'ar' ? 'الفاتورة المرتبطة (اختياري)' : 'Linked Invoice (optional)'}
                </label>
                <select className="input-glass" value={form.invoice_id} onChange={e => setForm({...form, invoice_id: e.target.value})} style={{ width: '100%', cursor: 'pointer' }}>
                  <option value="">{loc === 'ar' ? '-- بدون فاتورة --' : '-- No Invoice --'}</option>
                  {invoices.filter(inv => !form.shipment_id || inv.shipment_id === form.shipment_id).map(inv => (
                    <option key={inv.id} value={inv.id}>{inv.shipment_id} — {inv.customer_name} ({inv.amount} SAR)</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Auto-filled Customer Info */}
            {form.shipment_id && (
              <div style={{ background: 'rgba(0, 240, 255, 0.03)', border: '1px solid rgba(0, 240, 255, 0.1)', borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: 'var(--elec-blue)' }}>
                  {loc === 'ar' ? '✅ بيانات مجلوبة من الشحنة تلقائياً' : '✅ Auto-filled from shipment'}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'block', marginBottom: 4 }}>{loc === 'ar' ? 'اسم العميل' : 'Customer Name'}</label>
                    <input className="input-glass" value={form.customer_name} onChange={e => setForm({...form, customer_name: e.target.value})} style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'block', marginBottom: 4 }}>{loc === 'ar' ? 'رقم العميل' : 'Customer Phone'}</label>
                    <input className="input-glass" value={form.customer_phone} onChange={e => setForm({...form, customer_phone: e.target.value})} dir="ltr" style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'block', marginBottom: 4 }}>{loc === 'ar' ? 'الوجهة' : 'Destination'}</label>
                    <input className="input-glass" value={form.destination} onChange={e => setForm({...form, destination: e.target.value})} style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'block', marginBottom: 4 }}>{loc === 'ar' ? 'نوع البضاعة' : 'Goods Type'}</label>
                    <input className="input-glass" value={form.product} onChange={e => setForm({...form, product: e.target.value})} style={{ width: '100%' }} />
                  </div>
                </div>
              </div>
            )}

            {/* Row 2: Extra Details */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, marginBottom: 6, display: 'block', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  {loc === 'ar' ? 'بلد المنشأ' : 'Origin'}
                </label>
                <input className="input-glass" value={form.origin} onChange={e => setForm({...form, origin: e.target.value})} style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, marginBottom: 6, display: 'block', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  {loc === 'ar' ? 'الوزن (KG)' : 'Weight (KG)'}
                </label>
                <input className="input-glass" type="number" step="0.01" value={form.weight_kg} onChange={e => setForm({...form, weight_kg: e.target.value})} dir="ltr" style={{ width: '100%' }} placeholder="120.50" />
              </div>
              <div>
                <label style={{ fontSize: 12, marginBottom: 6, display: 'block', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  {loc === 'ar' ? 'الحجم (CBM)' : 'Volume (CBM)'}
                </label>
                <input className="input-glass" type="number" step="0.001" value={form.volume_cbm} onChange={e => setForm({...form, volume_cbm: e.target.value})} dir="ltr" style={{ width: '100%' }} placeholder="0.85" />
              </div>
              <div>
                <label style={{ fontSize: 12, marginBottom: 6, display: 'block', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  {loc === 'ar' ? 'عدد الطرود' : 'Package Count'}
                </label>
                <input className="input-glass" type="number" min="1" value={form.package_count} onChange={e => setForm({...form, package_count: e.target.value})} dir="ltr" style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, marginBottom: 6, display: 'block', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  {loc === 'ar' ? 'طريقة الشحن' : 'Shipment Method'}
                </label>
                <select className="input-glass" value={form.shipment_method} onChange={e => setForm({...form, shipment_method: e.target.value})} style={{ width: '100%', cursor: 'pointer' }}>
                  <option value="SEA FREIGHT">{loc === 'ar' ? 'شحن بحري' : 'Sea Freight'}</option>
                  <option value="AIR FREIGHT">{loc === 'ar' ? 'شحن جوي' : 'Air Freight'}</option>
                  <option value="EXPRESS">{loc === 'ar' ? 'شحن سريع' : 'Express'}</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, marginBottom: 6, display: 'block', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  {loc === 'ar' ? 'تاريخ الشحن' : 'Shipment Date'}
                </label>
                <input className="input-glass" type="date" value={form.shipment_date} onChange={e => setForm({...form, shipment_date: e.target.value})} dir="ltr" style={{ width: '100%' }} />
              </div>
            </div>

            {/* Remarks */}
            <div>
              <label style={{ fontSize: 12, marginBottom: 6, display: 'block', color: 'var(--text-secondary)', fontWeight: 600 }}>
                {loc === 'ar' ? 'ملاحظات' : 'Remarks'}
              </label>
              <textarea className="input-glass" value={form.remarks} onChange={e => setForm({...form, remarks: e.target.value})} rows={2} style={{ width: '100%', resize: 'vertical' }}
                placeholder={loc === 'ar' ? 'يُحفظ بعيداً عن الرطوبة والحرارة' : 'Keep away from moisture and heat'} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary" style={{ padding: '12px 24px' }}>
                {loc === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button type="submit" disabled={adding} className="btn-success" style={{ padding: '12px 32px', fontSize: 14 }}>
                {adding ? '...' : (loc === 'ar' ? 'إنشاء البوليصة' : 'Create Label')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Labels Table */}
      <div className="glass-card" style={{ padding: '24px 0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', padding: '0 24px' }}>
          <table className="glass-table" style={{ minWidth: 900 }}>
            <thead>
              <tr>
                <th>{loc === 'ar' ? 'رقم البوليصة' : 'Label No.'}</th>
                <th>{loc === 'ar' ? 'رقم الشحنة' : 'Shipment'}</th>
                <th>{loc === 'ar' ? 'العميل' : 'Customer'}</th>
                <th>{loc === 'ar' ? 'الوجهة' : 'Destination'}</th>
                <th>{loc === 'ar' ? 'الوزن' : 'Weight'}</th>
                <th>{loc === 'ar' ? 'الحجم' : 'Volume'}</th>
                <th>{loc === 'ar' ? 'الطرود' : 'Pkgs'}</th>
                <th>{loc === 'ar' ? 'تاريخ الشحن' : 'Ship Date'}</th>
                <th style={{ textAlign: 'end' }}>{loc === 'ar' ? 'إجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: 40 }}>Loading...</td></tr>
              ) : labels.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)' }}>
                  {loc === 'ar' ? 'لا توجد بوليصات بعد' : 'No shipping labels yet'}
                </td></tr>
              ) : (
                labels.map(label => (
                  <tr key={label.id}>
                    <td style={{ fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-en)', fontSize: 15 }}>{label.label_number}</td>
                    <td style={{ fontFamily: 'var(--font-en)' }}>{label.shipment_id}</td>
                    <td style={{ fontWeight: 600 }}>{label.customer_name}</td>
                    <td>{label.destination || '—'}</td>
                    <td style={{ fontFamily: 'var(--font-en)' }}>{label.weight_kg ? `${label.weight_kg} KG` : '—'}</td>
                    <td style={{ fontFamily: 'var(--font-en)' }}>{label.volume_cbm ? `${label.volume_cbm} CBM` : '—'}</td>
                    <td style={{ fontFamily: 'var(--font-en)', textAlign: 'center' }}>{label.package_count || '—'}</td>
                    <td style={{ fontFamily: 'var(--font-en)', fontSize: 13 }}>{label.shipment_date || '—'}</td>
                    <td style={{ textAlign: 'end' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                        <Link href={`/${locale}/admin/labels/${label.id}`} target="_blank" className="btn-primary" style={{ padding: '6px 12px', fontSize: 11, textDecoration: 'none' }}>
                          🖨️ {loc === 'ar' ? 'طباعة PDF' : 'Print PDF'}
                        </Link>
                        <button onClick={() => handleDelete(label.id)} disabled={deleting === label.id} className="btn-secondary" style={{ padding: '6px 12px', fontSize: 11, color: 'var(--danger)' }}>
                          {deleting === label.id ? '...' : '🗑️'}
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
    </div>
  );
}
