const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://bwcwlxyvzzkxexzxiuoy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3Y3dseHl2enpreGV4enhpdW95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxMTEwNjUsImV4cCI6MjA5MzY4NzA2NX0.q1EesgonGqO2EPwhZ19ykkmx3lX1zLBTuGBQHAFKxfo'
);

async function fix() {
  const { data, error } = await supabase.from('site_settings').select('*').single();
  
  if (error) {
    console.error('Error fetching:', error);
    return;
  }
  
  console.log('Current invoice template:', data.wa_template_invoice_ar);
  
  const newInvoice = `مرحباً {CUSTOMER_NAME}! 👋

تم إصدار فاتورة جديدة لشحنتك رقم *{SHIPMENT_ID}*.

💰 المبلغ الإجمالي: *{AMOUNT} SAR*
🧾 عرض الفاتورة: {INVOICE_LINK}
📦 تتبع الشحنة: {TRACKING_LINK}

📞 للتواصل واتساب: {PHONE}
🌐 الموقع: {WEBSITE}

شكراً لثقتكم بمؤسسة بن حبيب للتجارة والاستيراد 🚢

---

Hello {CUSTOMER_NAME}! 👋

A new invoice has been issued for your shipment *{SHIPMENT_ID}*.

💰 Total: *{AMOUNT} SAR*
🧾 View Invoice: {INVOICE_LINK}
📦 Track Shipment: {TRACKING_LINK}

📞 WhatsApp: {PHONE}
🌐 Website: {WEBSITE}

Thank you for choosing Bin Habib Trading & Import 🚢`;

  const newShipment = `مرحباً {CUSTOMER_NAME}! 👋

تم تحديث حالة شحنتك رقم *{SHIPMENT_ID}*:

📍 الحالة الجديدة: *{STATUS}*
📦 المنتج: {PRODUCT}

🔗 تتبع الشحنة: {TRACKING_LINK}

📞 للتواصل واتساب: {PHONE}
🌐 الموقع: {WEBSITE}

مؤسسة بن حبيب للتجارة والاستيراد 🚢
نسعد بخدمتكم دائماً!

---

Hello {CUSTOMER_NAME}! 👋

Your shipment *{SHIPMENT_ID}* has been updated:

📍 Current Status: *{STATUS}*
📦 Product: {PRODUCT}

🔗 Track Shipment: {TRACKING_LINK}

📞 WhatsApp: {PHONE}
🌐 Website: {WEBSITE}

Bin Habib Trading & Import 🚢
Always happy to serve you!`;

  const newWelcome = `مرحباً {CUSTOMER_NAME}! 👋

شكراً لتواصلك مع *مؤسسة بن حبيب للتجارة والاستيراد*.

تم استلام طلبك بنجاح:
📦 المنتج: {PRODUCT}
📝 الوصف: {DESCRIPTION}
📅 التاريخ: {DATE}

سنقوم بمراجعة طلبك والرد عليك في أقرب وقت.

📞 للتواصل: {PHONE}
🌐 الموقع: {WEBSITE}

فريق بن حبيب 🚢

---

Hello {CUSTOMER_NAME}! 👋

Thank you for contacting *Bin Habib Trading & Import*.

Your request has been received:
📦 Product: {PRODUCT}
📝 Description: {DESCRIPTION}
📅 Date: {DATE}

We will review your request and get back to you shortly.

📞 Contact: {PHONE}
🌐 Website: {WEBSITE}

Bin Habib Team 🚢`;

  const { error: updateError } = await supabase.from('site_settings').update({
    wa_template_invoice_ar: newInvoice,
    wa_template_shipment_ar: newShipment,
    wa_template_welcome_ar: newWelcome
  }).eq('id', data.id);
  
  if (updateError) {
    console.error('Update error:', updateError);
  } else {
    console.log('Database templates updated with proper UTF-8 emojis!');
  }
}

fix();
