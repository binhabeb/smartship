'use client';
import { use, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getTranslations, Locale } from '@/lib/translations';
import { ImportRequest } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function AdminRequestsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const loc = (locale === 'ar' ? 'ar' : 'en') as Locale;
  const t = getTranslations(loc);
  const [requests, setRequests] = useState<ImportRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [converting, setConverting] = useState<string | null>(null);
  const [showInvoicePrompt, setShowInvoicePrompt] = useState<{ id: string, name: string } | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('import_requests')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setRequests(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleConvert = async (req: ImportRequest) => {
    setConverting(req.id);
    try {
      // Create new shipment
      const { data: newShipment, error: shipError } = await supabase.from('shipments').insert([
        {
          customer_name: req.customer_name,
          customer_phone: req.customer_phone,
          city: req.city,
          product: req.product_name,
          product_description: req.product_description,
          current_status: 'shipped',
        }
      ]).select('id').single();

      if (shipError) throw new Error(shipError.message || shipError.code || JSON.stringify(shipError));

      // Update request status to converted
      const { error: reqError } = await supabase
        .from('import_requests')
        .update({ status: 'converted' })
        .eq('id', req.id);

      if (reqError) throw new Error(reqError.message || reqError.code || JSON.stringify(reqError));

      // Refresh list
      await fetchRequests();
      if (newShipment) {
        setShowInvoicePrompt({ id: newShipment.id, name: req.customer_name });
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error(err);
      alert(loc === 'ar' ? `خطأ أثناء التحويل: ${errorMessage}` : `Error converting request: ${errorMessage}`);
    } finally {
      setConverting(null);
    }
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
                <th>{t.admin?.requestDate || 'Date'}</th>
                <th>{t.admin?.statusCol || 'Status'}</th>
                <th style={{ textAlign: 'end' }}>{t.admin?.actions || 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)' }}>
                    Loading...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)' }}>
                    {loc === 'ar' ? 'لا توجد طلبات' : 'No requests found'}
                  </td>
                </tr>
              ) : (
                requests.map(req => (
                  <tr key={req.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{req.customer_name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-tertiary)', fontFamily: 'var(--font-en)' }}>{req.customer_phone}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{req.city}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{req.product_name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{req.product_description?.substring(0, 50)}{req.product_description?.length > 50 ? '...' : ''}</div>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'var(--font-en)' }}>
                      {new Date(req.created_at).toLocaleDateString(loc === 'ar' ? 'ar-SA' : 'en-US')}
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(req.status)}`}>
                        {getStatusLabel(req.status)}
                      </span>
                    </td>
                    <td style={{ textAlign: 'end' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <a 
                          href={`https://wa.me/${req.customer_phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-whatsapp"
                          style={{ padding: '8px 12px', fontSize: 12, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          title={loc === 'ar' ? 'مراسلة عبر واتساب' : 'Message on WhatsApp'}
                        >
                          💬
                        </a>
                        {req.status !== 'converted' && (
                          <button 
                            onClick={() => handleConvert(req)}
                            disabled={converting === req.id}
                            className="btn-primary" 
                            style={{ padding: '8px 16px', fontSize: 12, opacity: converting === req.id ? 0.7 : 1 }}
                          >
                            {converting === req.id ? '...' : (loc === 'ar' ? 'تحويل لشحنة' : 'Convert to Shipment')}
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

      {/* Invoice Prompt Modal */}
      {showInvoicePrompt && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-card" style={{ padding: 32, maxWidth: 400, width: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🎉</div>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>{loc === 'ar' ? 'تم تحويل الطلب بنجاح!' : 'Request Converted!'}</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: 14 }}>
              {loc === 'ar' 
                ? `تم إنشاء الشحنة رقم ${showInvoicePrompt.id} للعميل (${showInvoicePrompt.name}). هل تود إصدار فاتورة إلكترونية الآن؟` 
                : `Shipment ${showInvoicePrompt.id} created for ${showInvoicePrompt.name}. Would you like to issue an invoice now?`}
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
