'use client';
import { use, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getTranslations, Locale } from '@/lib/translations';
import { ImportRequest } from '@/lib/types';
import { compressImage } from '@/lib/imageUtils';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function AdminRequestsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const loc = (locale === 'ar' ? 'ar' : 'en') as Locale;
  const t = getTranslations(loc);
  const [requests, setRequests] = useState<ImportRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [converting, setConverting] = useState<string | null>(null);
  const [showInvoicePrompt, setShowInvoicePrompt] = useState<{ id: string, name: string, phone: string } | null>(null);

  // View Details Modal
  const [viewingRequest, setViewingRequest] = useState<ImportRequest | null>(null);

  // Convert Modal (with full shipment form)
  const [convertingRequest, setConvertingRequest] = useState<ImportRequest | null>(null);
  const [convertForm, setConvertForm] = useState({
    customer_name: '', customer_phone: '', city: '', product: '', product_description: '',
    current_status: 'shipped', quantity: 1, color: '', destination: '',
    product_image: '', photos: [] as string[],
  });

  const fetchRequests = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('import_requests')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setRequests(data);
    setLoading(false);
  };

  useEffect(() => { fetchRequests(); }, []);

  // Open convert modal pre-filled with request data
  const openConvertModal = (req: ImportRequest) => {
    setConvertForm({
      customer_name: req.customer_name,
      customer_phone: req.customer_phone,
      city: req.city || '',
      product: req.product_name,
      product_description: req.product_description || '',
      current_status: 'shipped',
      quantity: 1,
      color: '',
      destination: '',
      product_image: req.product_image || '',
      photos: req.product_image ? [req.product_image] : [],
    });
    setConvertingRequest(req);
  };

  const handleAddPhotos = async (files: FileList) => {
    const newPhotos = [...convertForm.photos];
    for (let i = 0; i < files.length; i++) {
      try {
        const compressed = await compressImage(files[i]);
        newPhotos.push(compressed);
      } catch (e) {
        console.error('Failed to compress image', e);
      }
    }
    setConvertForm({ ...convertForm, photos: newPhotos });
  };

  const removePhoto = (index: number) => {
    const newPhotos = convertForm.photos.filter((_, i) => i !== index);
    setConvertForm({ ...convertForm, photos: newPhotos });
  };

  const handleConvertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!convertingRequest) return;
    setConverting(convertingRequest.id);
    try {
      const { data: newShipment, error: shipError } = await supabase.from('shipments').insert([{
        customer_name: convertForm.customer_name,
        customer_phone: convertForm.customer_phone,
        city: convertForm.city,
        destination: convertForm.destination,
        product: convertForm.product,
        product_description: convertForm.product_description,
        current_status: convertForm.current_status,
        quantity: convertForm.quantity,
        color: convertForm.color,
        product_image: convertForm.photos[0] || convertForm.product_image || '',
        photos: convertForm.photos,
      }]).select('id').single();

      if (shipError) throw new Error(shipError.message || JSON.stringify(shipError));

      // Update request status
      await supabase.from('import_requests').update({ status: 'converted' }).eq('id', convertingRequest.id);

      setConvertingRequest(null);
      await fetchRequests();
      if (newShipment) {
        setShowInvoicePrompt({ id: newShipment.id, name: convertForm.customer_name, phone: convertForm.customer_phone });
      }
    } catch (err: any) {
      console.error(err);
      alert(loc === 'ar' ? `خطأ: ${err.message}` : `Error: ${err.message}`);
    } finally {
      setConverting(null);
    }
  };

  // WhatsApp welcome message
  const sendWelcomeWhatsApp = (req: ImportRequest) => {
    const phone = req.customer_phone.replace(/[^0-9+]/g, '').replace('+', '');
    const msg = loc === 'ar'
      ? `مرحباً ${req.customer_name}! 👋\n\nشكراً لتواصلك مع *مؤسسة بن حبيب للتجارة والاستيراد*.\n\nتم استلام طلبك بنجاح:\n📦 المنتج: ${req.product_name}\n📝 الوصف: ${req.product_description || 'غير محدد'}\n📅 التاريخ: ${new Date(req.created_at).toLocaleDateString('ar-SA')}\n\nسنقوم بمراجعة طلبك والرد عليك في أقرب وقت.\n\n📞 للتواصل: +8619383079080\n🌐 الموقع: www.binhabeb.com\n\nفريق بن حبيب 🚢`
      : `Hello ${req.customer_name}! 👋\n\nThank you for contacting *Bin Habib Trading & Import*.\n\nYour request has been received:\n📦 Product: ${req.product_name}\n📝 Description: ${req.product_description || 'N/A'}\n📅 Date: ${new Date(req.created_at).toLocaleDateString('en-US')}\n\nWe will review your request and get back to you shortly.\n\n📞 Contact: +8619383079080\n🌐 Website: www.binhabeb.com\n\nBin Habib Team 🚢`;
    
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const getStatusBadgeClass = (status: string) => {
    if (status === 'converted') return 'badge-delivered';
    if (status === 'approved') return 'badge-approved';
    if (status === 'reviewing') return 'badge-reviewing';
    return 'badge-new';
  };

  const getStatusLabel = (status: string) => {
    if (status === 'converted') return loc === 'ar' ? 'تم التحويل' : 'Converted';
    if (status === 'approved') return loc === 'ar' ? 'موافق عليه' : 'Approved';
    if (status === 'reviewing') return loc === 'ar' ? 'قيد المراجعة' : 'Reviewing';
    return loc === 'ar' ? 'جديد' : 'New';
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>{t.admin?.requests || 'Import Requests'}</h1>
        <button onClick={fetchRequests} className="btn-secondary" style={{ padding: '8px 16px', fontSize: 13 }}>
          🔄 {loc === 'ar' ? 'تحديث' : 'Refresh'}
        </button>
      </div>

      <div className="glass-card" style={{ padding: '24px 0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', padding: '0 24px' }}>
          <table className="glass-table" style={{ minWidth: 800 }}>
            <thead>
              <tr>
                <th>{t.admin?.clientName || 'Client Info'}</th>
                <th>{t.admin?.product || 'Product Info'}</th>
                <th>{loc === 'ar' ? 'الصورة' : 'Image'}</th>
                <th>{t.admin?.requestDate || 'Date'}</th>
                <th>{t.admin?.statusCol || 'Status'}</th>
                <th style={{ textAlign: 'end' }}>{t.admin?.actions || 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)' }}>Loading...</td></tr>
              ) : requests.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)' }}>{loc === 'ar' ? 'لا توجد طلبات' : 'No requests found'}</td></tr>
              ) : (
                requests.map(req => (
                  <tr key={req.id}>
                    <td>
                      <div style={{ fontWeight: 600, cursor: 'pointer', color: 'var(--primary)' }} onClick={() => setViewingRequest(req)}>
                        {req.customer_name}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-tertiary)', fontFamily: 'var(--font-en)' }}>{req.customer_phone}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{req.city}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{req.product_name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{req.product_description?.substring(0, 50)}{(req.product_description?.length || 0) > 50 ? '...' : ''}</div>
                    </td>
                    <td>
                      {req.product_image ? (
                        <div style={{ width: 48, height: 48, borderRadius: 8, overflow: 'hidden', cursor: 'pointer' }} onClick={() => setViewingRequest(req)}>
                          <img src={req.product_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-tertiary)', fontSize: 12 }}>—</span>
                      )}
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'var(--font-en)' }}>
                      {new Date(req.created_at).toLocaleDateString(loc === 'ar' ? 'ar-SA' : 'en-US')}
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(req.status)}`}>{getStatusLabel(req.status)}</span>
                    </td>
                    <td style={{ textAlign: 'end' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        <button onClick={() => setViewingRequest(req)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }}>
                          👁️ {loc === 'ar' ? 'عرض' : 'View'}
                        </button>
                        <button onClick={() => sendWelcomeWhatsApp(req)} className="btn-whatsapp" style={{ padding: '6px 12px', fontSize: 12 }}>
                          💬
                        </button>
                        {req.status !== 'converted' && (
                          <button 
                            onClick={() => openConvertModal(req)}
                            className="btn-primary" 
                            style={{ padding: '6px 16px', fontSize: 12 }}
                          >
                            {loc === 'ar' ? 'تحويل لشحنة' : 'Convert'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Request Details Modal */}
      {viewingRequest && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 }} onClick={() => setViewingRequest(null)}>
          <div className="glass-card" onClick={e => e.stopPropagation()} style={{ padding: 32, maxWidth: 600, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontSize: 20, fontWeight: 800 }}>{loc === 'ar' ? 'تفاصيل الطلب' : 'Request Details'}</h3>
              <button onClick={() => setViewingRequest(null)} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', fontSize: 20 }}>✕</button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              <div><div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 4 }}>{loc === 'ar' ? 'اسم العميل' : 'Customer'}</div><div style={{ fontWeight: 700 }}>{viewingRequest.customer_name}</div></div>
              <div><div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 4 }}>{loc === 'ar' ? 'رقم الجوال' : 'Phone'}</div><div style={{ fontWeight: 700, fontFamily: 'var(--font-en)' }} dir="ltr">{viewingRequest.customer_phone}</div></div>
              <div><div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 4 }}>{loc === 'ar' ? 'المدينة' : 'City'}</div><div style={{ fontWeight: 600 }}>{viewingRequest.city || '—'}</div></div>
              <div><div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 4 }}>{loc === 'ar' ? 'التاريخ' : 'Date'}</div><div style={{ fontFamily: 'var(--font-en)' }}>{new Date(viewingRequest.created_at).toLocaleString(loc === 'ar' ? 'ar-SA' : 'en-US')}</div></div>
            </div>

            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 4 }}>{loc === 'ar' ? 'المنتج' : 'Product'}</div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{viewingRequest.product_name}</div>
              {viewingRequest.product_description && <div style={{ color: 'var(--text-secondary)', marginBottom: 8, lineHeight: 1.6 }}>{viewingRequest.product_description}</div>}
              {viewingRequest.product_notes && <div style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 8 }}>📝 {viewingRequest.product_notes}</div>}
              {viewingRequest.product_url && <a href={viewingRequest.product_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontSize: 14 }}>🔗 {loc === 'ar' ? 'رابط المنتج' : 'Product Link'}</a>}
            </div>

            {viewingRequest.product_image && (
              <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: 16, marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 8 }}>{loc === 'ar' ? 'صورة المنتج' : 'Product Image'}</div>
                <img src={viewingRequest.product_image} alt="Product" style={{ width: '100%', maxHeight: 400, objectFit: 'contain', borderRadius: 12, background: 'var(--bg-elevated)' }} />
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button onClick={() => sendWelcomeWhatsApp(viewingRequest)} className="btn-whatsapp" style={{ flex: 1, padding: '12px' }}>
                💬 {loc === 'ar' ? 'مراسلة العميل' : 'Message Customer'}
              </button>
              {viewingRequest.status !== 'converted' && (
                <button onClick={() => { setViewingRequest(null); openConvertModal(viewingRequest); }} className="btn-primary" style={{ flex: 1, padding: '12px' }}>
                  📦 {loc === 'ar' ? 'تحويل لشحنة' : 'Convert to Shipment'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Convert to Shipment Modal (Full Form) */}
      {convertingRequest && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 }} onClick={() => !converting && setConvertingRequest(null)}>
          <div className="glass-card" onClick={e => e.stopPropagation()} style={{ padding: 32, maxWidth: 700, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontSize: 20, fontWeight: 800 }}>{loc === 'ar' ? 'إكمال بيانات الشحنة' : 'Complete Shipment Details'}</h3>
              <button onClick={() => setConvertingRequest(null)} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', fontSize: 20 }}>✕</button>
            </div>

            <form onSubmit={handleConvertSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                <div><label style={{ fontSize: 12, marginBottom: 4, display: 'block' }}>{loc === 'ar' ? 'اسم العميل' : 'Customer Name'}</label><input required className="input-glass" value={convertForm.customer_name} onChange={e => setConvertForm({...convertForm, customer_name: e.target.value})} /></div>
                <div><label style={{ fontSize: 12, marginBottom: 4, display: 'block' }}>{loc === 'ar' ? 'رقم الجوال' : 'Phone'}</label><input required className="input-glass" value={convertForm.customer_phone} onChange={e => setConvertForm({...convertForm, customer_phone: e.target.value})} dir="ltr" /></div>
                <div><label style={{ fontSize: 12, marginBottom: 4, display: 'block' }}>{loc === 'ar' ? 'المدينة' : 'City'}</label><input className="input-glass" value={convertForm.city} onChange={e => setConvertForm({...convertForm, city: e.target.value})} /></div>
                <div><label style={{ fontSize: 12, marginBottom: 4, display: 'block' }}>{loc === 'ar' ? 'الوجهة' : 'Destination'}</label><input className="input-glass" value={convertForm.destination} onChange={e => setConvertForm({...convertForm, destination: e.target.value})} /></div>
                <div><label style={{ fontSize: 12, marginBottom: 4, display: 'block' }}>{loc === 'ar' ? 'المنتج' : 'Product'}</label><input required className="input-glass" value={convertForm.product} onChange={e => setConvertForm({...convertForm, product: e.target.value})} /></div>
                <div><label style={{ fontSize: 12, marginBottom: 4, display: 'block' }}>{loc === 'ar' ? 'الكمية' : 'Quantity'}</label><input className="input-glass" type="number" min="1" value={convertForm.quantity} onChange={e => setConvertForm({...convertForm, quantity: parseInt(e.target.value) || 1})} dir="ltr" /></div>
                <div><label style={{ fontSize: 12, marginBottom: 4, display: 'block' }}>{loc === 'ar' ? 'اللون' : 'Color'}</label><input className="input-glass" value={convertForm.color} onChange={e => setConvertForm({...convertForm, color: e.target.value})} /></div>
                <div><label style={{ fontSize: 12, marginBottom: 4, display: 'block' }}>{loc === 'ar' ? 'الحالة' : 'Status'}</label>
                  <select className="input-glass" value={convertForm.current_status} onChange={e => setConvertForm({...convertForm, current_status: e.target.value})}>
                    <option value="shipped">{loc === 'ar' ? 'تم الشحن' : 'Shipped'}</option>
                    <option value="in_transit">{loc === 'ar' ? 'في الطريق' : 'In Transit'}</option>
                    <option value="customs">{loc === 'ar' ? 'في الجمارك' : 'Customs'}</option>
                    <option value="delivered">{loc === 'ar' ? 'تم التسليم' : 'Delivered'}</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label style={{ fontSize: 12, marginBottom: 4, display: 'block' }}>{loc === 'ar' ? 'وصف المنتج' : 'Product Description'}</label>
                <textarea className="input-glass" value={convertForm.product_description} onChange={e => setConvertForm({...convertForm, product_description: e.target.value})} rows={2} style={{ resize: 'vertical' }} />
              </div>

              {/* Photos Section */}
              <div>
                <label style={{ fontSize: 12, marginBottom: 8, display: 'block', fontWeight: 600 }}>{loc === 'ar' ? 'صور الشحنة (يمكنك إضافة عدة صور)' : 'Shipment Photos (multiple allowed)'}</label>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
                  {convertForm.photos.map((photo, i) => (
                    <div key={i} style={{ position: 'relative', width: 80, height: 80, borderRadius: 12, overflow: 'hidden' }}>
                      <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button type="button" onClick={() => removePhoto(i)} style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.7)', border: 'none', color: 'white', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                    </div>
                  ))}
                  <label style={{ width: 80, height: 80, borderRadius: 12, border: '2px dashed var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 24, color: 'var(--text-tertiary)' }}>
                    <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => e.target.files && handleAddPhotos(e.target.files)} />
                    +
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button type="button" onClick={() => setConvertingRequest(null)} className="btn-secondary" style={{ padding: '10px 24px' }}>{loc === 'ar' ? 'إلغاء' : 'Cancel'}</button>
                <button type="submit" disabled={!!converting} className="btn-success" style={{ padding: '10px 32px', opacity: converting ? 0.7 : 1 }}>
                  {converting ? '...' : (loc === 'ar' ? 'إنشاء الشحنة' : 'Create Shipment')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Prompt Modal */}
      {showInvoicePrompt && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-card" style={{ padding: 32, maxWidth: 400, width: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🎉</div>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>{loc === 'ar' ? 'تم تحويل الطلب بنجاح!' : 'Request Converted!'}</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: 14 }}>
              {loc === 'ar' 
                ? `تم إنشاء الشحنة رقم ${showInvoicePrompt.id} للعميل (${showInvoicePrompt.name}). هل تود إصدار فاتورة إلكترونية الآن؟` 
                : `Shipment ${showInvoicePrompt.id} created for ${showInvoicePrompt.name}. Issue invoice now?`}
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button onClick={() => setShowInvoicePrompt(null)} className="btn-secondary" style={{ flex: 1, padding: '12px' }}>
                {loc === 'ar' ? 'ليس الآن' : 'Not Now'}
              </button>
              <Link href={`/${locale}/admin/invoices?new=${showInvoicePrompt.id}&name=${encodeURIComponent(showInvoicePrompt.name)}&phone=${encodeURIComponent(showInvoicePrompt.phone)}`} className="btn-primary" style={{ flex: 1, padding: '12px', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {loc === 'ar' ? 'إصدار فاتورة' : 'Issue Invoice'}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
