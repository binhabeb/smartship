'use client';
import { use, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getTranslations, Locale } from '@/lib/translations';
import Link from 'next/link';
import { Calculator as CalcIcon } from 'lucide-react';

interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
}

interface Invoice {
  id: string;
  customer_name: string;
  customer_phone?: string;
  shipment_id: string;
  status: 'paid' | 'unpaid';
  amount: number;
  created_at: string;
  items?: InvoiceItem[];
  details?: string;
}

export default function InvoicePublicPage({ params }: { params: Promise<{ locale: string, id: string }> }) {
  const { locale, id } = use(params);
  const loc = (locale === 'ar' ? 'ar' : 'en') as Locale;
  const isAr = loc === 'ar';

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInvoice() {
      setLoading(true);
      const { data } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', id)
        .single();
      
      if (data) setInvoice(data as Invoice);
      setLoading(false);
    }
    fetchInvoice();
  }, [id]);

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="loading-spinner"></div></div>;

  if (!invoice) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🚫</div>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>{isAr ? 'الفاتورة غير موجودة' : 'Invoice Not Found'}</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>{isAr ? 'عذراً، لم نتمكن من العثور على الفاتورة المطلوبة.' : 'Sorry, we could not find the requested invoice.'}</p>
      <Link href={`/${locale}`} className="btn-primary" style={{ padding: '12px 24px', textDecoration: 'none' }}>
        {isAr ? 'العودة للرئيسية' : 'Back to Home'}
      </Link>
    </div>
  );

  const isPaid = invoice.status === 'paid';
  const items = invoice.items || [{ description: invoice.details || (isAr ? 'رسوم شحن' : 'Shipping fees'), quantity: 1, price: invoice.amount }];

  return (
    <div className="invoice-page-wrapper">
      <div className="invoice-container">
        
        {/* Actions Header (Hidden in Print) */}
        <div className="print-hidden action-header">
          <Link href={`/${locale}`} className="back-link">
            {isAr ? '← العودة للموقع' : '← Back to Site'}
          </Link>
          <button onClick={() => window.print()} className="btn-primary print-btn">
            🖨️ {isAr ? 'طباعة / PDF' : 'Print / Save PDF'}
          </button>
        </div>

        {/* Invoice Document */}
        <div className="invoice-doc">
          
          {/* Header Section */}
          <div className="doc-header">
            <div className="doc-header-left">
              <h2 className="doc-title">{isAr ? 'فاتورة ضريبية إلكترونية' : 'ELECTRONIC TAX INVOICE'}</h2>
              <div className="doc-id">INV-{invoice.id.substring(0, 8).toUpperCase()}</div>
              <div className="doc-date">
                {new Date(invoice.created_at).toLocaleDateString(isAr ? 'en-CA' : 'en-CA').replace(/-/g, '/')}
              </div>
            </div>
            
            <div className="doc-header-right">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, justifyContent: isAr ? 'flex-end' : 'flex-end' }}>
                <div style={{ textAlign: isAr ? 'left' : 'right' }}>
                  <div className="doc-company">Bin Habeb</div>
                  <div className="doc-company-sub">Trading & Import</div>
                  <div className="doc-company-ar">بن حبيب للتجارة والاستيراد</div>
                </div>
                {/* SVG Logo to ensure print clarity */}
                <svg width="48" height="48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 20 H50 C65 20 75 30 75 45 C75 55 68 62 58 66 L75 80 H55 L42 66 H35 V80 H20 V20 Z" fill="#0066FF"/>
                  <path d="M35 32 H50 C58 32 62 36 62 43 C62 50 58 54 50 54 H35 V32 Z" fill="#FFFFFF" className="logo-inner"/>
                </svg>
              </div>
              
              <div className="doc-contact">
                <span className="contact-item">📞 8619383079080</span>
                <span className="contact-item">🌐 www.binhabeb.com</span>
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="doc-info-grid">
            <div className="info-box status-box">
              <div className="info-label">{isAr ? 'حالة الفاتورة' : 'Invoice Status'}</div>
              <div className={`status-badge ${isPaid ? 'paid' : 'unpaid'}`}>
                {isPaid ? (isAr ? '✅ مدفوعة' : '✅ PAID') : (isAr ? '⏳ غير مدفوعة' : '⏳ UNPAID')}
              </div>
            </div>

            <div className="info-box billed-to-box">
              <div className="info-label">{isAr ? 'مفوتر إلى' : 'Billed To'}</div>
              <div className="customer-name">{invoice.customer_name}</div>
              {invoice.customer_phone && (
                <div className="customer-phone" dir="ltr">📞 {invoice.customer_phone}</div>
              )}
              <div className="shipment-ref">
                📦 {isAr ? 'الشنطة:' : 'Bag:'} <strong>{invoice.shipment_id}</strong>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="doc-table-wrapper">
            <table className="doc-table">
              <thead>
                <tr>
                  <th className="th-desc">{isAr ? 'الوصف' : 'Description'}</th>
                  <th className="th-qty">{isAr ? 'الكمية' : 'Qty'}</th>
                  <th className="th-price">{isAr ? 'السعر' : 'Price'}</th>
                  <th className="th-total">{isAr ? 'المجموع' : 'Total'}</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i}>
                    <td className="td-desc">{item.description}</td>
                    <td className="td-qty">{item.quantity}</td>
                    <td className="td-price">{item.price.toFixed(2)}</td>
                    <td className="td-total">{(item.quantity * item.price).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Box */}
          <div className="doc-summary-wrapper">
            <div className="doc-summary-box">
              <div className="summary-row">
                <span className="summary-label">{isAr ? 'المجموع الفرعي' : 'Subtotal'}</span>
                <span className="summary-value">SAR {invoice.amount.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">{isAr ? 'الضريبة (0%)' : 'Tax (0%)'}</span>
                <span className="summary-value">SAR 0.00</span>
              </div>
              <div className="summary-row total-row">
                <span className="summary-label">{isAr ? 'الإجمالي' : 'Total'}</span>
                <span className="summary-value">SAR {invoice.amount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="doc-footer">
            <p className="footer-thanks">{isAr ? 'شكراً لتعاملكم معنا' : 'Thank you for doing business with us'}</p>
            <div className="footer-links">
              <span>🌐 www.binhabeb.com</span>
              <span>📞 8619383079080</span>
            </div>
          </div>

        </div>
      </div>

      {/* Invoice Specific Styles (Responsive + Print) */}
      <style dangerouslySetInnerHTML={{__html: `
        .invoice-page-wrapper {
          min-height: 100vh;
          padding: 60px 20px;
          background: var(--bg-deep);
          display: flex;
          justify-content: center;
          align-items: flex-start;
          font-family: var(--font-ar);
        }
        [dir="ltr"] .invoice-page-wrapper { font-family: var(--font-en); }

        .invoice-container {
          width: 100%;
          max-width: 850px;
        }

        .action-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding: 0 10px;
        }
        .back-link {
          color: var(--text-secondary);
          text-decoration: none;
          font-weight: 600;
          font-size: 15px;
          transition: color 0.2s;
        }
        .back-link:hover { color: var(--primary); }
        .print-btn {
          padding: 10px 24px;
          font-size: 15px;
        }

        /* --- Electronic Document Styles (Dark Theme Default) --- */
        .invoice-doc {
          background: #061125;
          border-radius: 24px;
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 24px 60px rgba(0,0,0,0.4);
          padding: 56px 48px;
          color: white;
        }

        .doc-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid rgba(255,255,255,0.06);
          padding-bottom: 32px;
          margin-bottom: 40px;
        }
        .doc-header-left {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .doc-title {
          font-size: 22px;
          font-weight: 800;
          margin: 0;
          color: white;
        }
        .doc-id {
          font-family: 'Montserrat', sans-serif;
          font-size: 17px;
          font-weight: 700;
          color: #0066FF;
          letter-spacing: 0.5px;
        }
        .doc-date {
          font-size: 14px;
          color: rgba(255,255,255,0.6);
          font-family: 'Montserrat', sans-serif;
        }

        .doc-header-right {
          text-align: end;
        }
        .doc-company {
          font-size: 18px;
          font-weight: 800;
          color: white;
          font-family: 'Montserrat', sans-serif;
          line-height: 1.1;
        }
        .doc-company-sub {
          font-size: 12px;
          color: rgba(255,255,255,0.7);
          font-family: 'Montserrat', sans-serif;
        }
        .doc-company-ar {
          font-size: 12px;
          color: rgba(255,255,255,0.7);
          margin-top: 2px;
        }
        
        .doc-contact {
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 13px;
          color: rgba(255,255,255,0.7);
          font-family: 'Montserrat', sans-serif;
          margin-top: 12px;
        }

        .doc-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-bottom: 48px;
        }
        .info-box {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .status-box {
          align-items: flex-start;
        }
        .billed-to-box {
          align-items: flex-end;
          text-align: end;
        }
        
        .info-label {
          font-size: 14px;
          color: rgba(255,255,255,0.5);
          font-weight: 600;
        }
        .status-badge {
          display: inline-flex;
          align-items: center;
          padding: 8px 24px;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 700;
          border: 1px solid transparent;
        }
        .status-badge.paid {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
          border-color: rgba(16, 185, 129, 0.2);
        }
        .status-badge.unpaid {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border-color: rgba(239, 68, 68, 0.2);
        }

        .customer-name {
          font-size: 22px;
          font-weight: 800;
          color: white;
        }
        .customer-phone {
          font-size: 15px;
          color: rgba(255,255,255,0.7);
          font-family: 'Montserrat', sans-serif;
        }
        .shipment-ref {
          font-size: 15px;
          color: rgba(255,255,255,0.7);
        }
        .shipment-ref strong {
          color: white;
          font-family: 'Montserrat', sans-serif;
        }

        .doc-table-wrapper {
          margin-bottom: 40px;
          overflow-x: auto;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.06);
        }
        .doc-table {
          width: 100%;
          border-collapse: collapse;
        }
        .doc-table th {
          background: rgba(0, 102, 255, 0.15);
          color: #80B3FF;
          padding: 16px 20px;
          font-size: 14px;
          font-weight: 700;
          text-align: start;
        }
        .doc-table th.th-qty, .doc-table th.th-price, .doc-table th.th-total {
          text-align: center;
        }
        [dir="ltr"] .doc-table th { text-align: left; }
        [dir="ltr"] .doc-table th.th-qty, [dir="ltr"] .doc-table th.th-price, [dir="ltr"] .doc-table th.th-total { text-align: center; }

        .doc-table td {
          padding: 18px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          font-size: 15px;
          color: rgba(255,255,255,0.9);
        }
        .doc-table tr:last-child td {
          border-bottom: none;
        }
        .doc-table td.td-qty, .doc-table td.td-price, .doc-table td.td-total {
          text-align: center;
          font-family: 'Montserrat', sans-serif;
        }
        .doc-table td.td-desc {
          font-weight: 600;
        }

        .doc-summary-wrapper {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 56px;
        }
        .doc-summary-box {
          width: 340px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 12px;
        }
        .summary-label {
          font-size: 15px;
          color: rgba(255,255,255,0.6);
        }
        .summary-value {
          font-family: 'Montserrat', sans-serif;
          font-size: 15px;
          font-weight: 600;
          color: white;
        }
        .total-row {
          background: rgba(0, 102, 255, 0.2);
          border: 1px solid rgba(0, 102, 255, 0.3);
          padding: 20px 16px;
          border-radius: 12px;
          margin-top: 8px;
        }
        .total-row .summary-label {
          color: white;
          font-weight: 700;
          font-size: 17px;
        }
        .total-row .summary-value {
          color: #4D94FF;
          font-weight: 800;
          font-size: 20px;
        }

        .doc-footer {
          text-align: center;
          padding-top: 32px;
        }
        .footer-thanks {
          font-size: 15px;
          font-weight: 600;
          color: white;
          margin-bottom: 16px;
        }
        .footer-links {
          display: flex;
          justify-content: center;
          gap: 32px;
          font-size: 14px;
          color: rgba(255,255,255,0.5);
          font-family: 'Montserrat', sans-serif;
        }

        /* --- Mobile Adjustments --- */
        @media (max-width: 600px) {
          .invoice-page-wrapper { padding: 20px 10px; }
          .invoice-doc { padding: 32px 20px; border-radius: 16px; }
          .doc-header { flex-direction: column; gap: 32px; align-items: center; text-align: center; }
          .doc-header-left { align-items: center; }
          .doc-header-right { text-align: center; }
          .doc-header-right > div { justify-content: center !important; }
          .doc-header-right > div > div { text-align: center !important; }
          .doc-info-grid { grid-template-columns: 1fr; gap: 40px; }
          .status-box { align-items: center; }
          .billed-to-box { align-items: center; text-align: center; }
          .doc-summary-box { width: 100%; }
          .doc-table-wrapper { border-radius: 8px; }
          .doc-table th, .doc-table td { padding: 12px 10px; font-size: 13px; }
          .footer-links { flex-direction: column; gap: 12px; }
        }

        /* --- Print & PDF Styles (Light Theme Override & A4 Setup) --- */
        @media print {
          /* Page setup to fix blank second page and margins */
          @page {
            size: A4 portrait;
            margin: 15mm;
          }
          
          /* Hide everything except the invoice document */
          body, html {
            background: white !important;
          }
          body * {
            visibility: hidden;
          }
          .invoice-page-wrapper {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
            min-height: auto !important;
            display: block !important;
          }
          .print-hidden {
            display: none !important;
          }
          
          /* Show ONLY the document and reset positioning */
          .invoice-doc, .invoice-doc * {
            visibility: visible;
          }
          .invoice-doc {
            position: relative !important;
            width: 100%;
            max-width: 100% !important;
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
          }

          /* Force Webkit to print background colors accurately */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Force Light Theme Colors for Text and Borders */
          .doc-title { color: #111 !important; }
          .doc-date { color: #555 !important; }
          .doc-company { color: #222 !important; }
          .doc-company-sub { color: #555 !important; }
          .doc-company-ar { color: #666 !important; }
          .doc-contact { color: #555 !important; }
          .doc-header { border-bottom: 2px solid #eee !important; }
          
          .logo-inner { fill: #000 !important; }
          
          .info-label { color: #777 !important; }
          .customer-name { color: #111 !important; }
          .customer-phone, .shipment-ref { color: #444 !important; }
          .shipment-ref strong { color: #111 !important; }

          .doc-table-wrapper { border: 1px solid #e2e8f0 !important; }
          .doc-table th {
            background-color: #f8fafc !important; 
            color: #334155 !important;
          }
          .doc-table td {
            color: #1e293b !important;
            border-bottom: 1px solid #e2e8f0 !important;
          }

          .summary-label { color: #555 !important; }
          .summary-value { color: #111 !important; }
          
          /* The total box remains colored, but make sure text is white */
          .total-row {
            background-color: #f1f5f9 !important;
            border: 1px solid #cbd5e1 !important;
          }
          .total-row .summary-label, .total-row .summary-value {
            color: #0f172a !important;
          }

          .doc-footer { border-top: 1px solid #eee !important; }
          .footer-thanks { color: #222 !important; }
          .footer-links { color: #555 !important; }

          /* Prevent unwanted page breaks inside elements */
          .doc-summary-wrapper { page-break-inside: avoid; }
          .doc-table tr { page-break-inside: avoid; }
          .doc-info-grid { page-break-inside: avoid; }
        }
      `}} />
    </div>
  );
}
