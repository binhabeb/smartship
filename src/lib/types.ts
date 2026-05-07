// ============================================
// SmartShip Type Definitions
// ============================================

// --- Database Types (snake_case, matches Supabase columns) ---

export interface ImportRequest {
  id: string;
  customer_name: string;
  customer_phone: string;
  city: string;
  product_name: string;
  product_description: string;
  product_notes?: string;
  product_url?: string;
  product_image?: string;
  status: 'new' | 'reviewing' | 'approved' | 'converted';
  created_at: string;
}

export interface ShipmentDB {
  id: string;
  customer_name: string;
  customer_phone: string;
  city: string;
  destination?: string;
  product: string;
  product_description?: string;
  product_image?: string;
  quantity?: number;
  color?: string;
  current_status: string;
  status_history?: StatusHistoryEntry[];
  photos?: string[];
  invoice_amount?: number;
  admin_notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface UserRole {
  email: string;
  role: 'admin' | 'manager' | 'staff';
}

// --- Frontend Display Types (camelCase, used in UI components) ---

export interface StatusHistoryEntry {
  key: string;
  label: { ar: string; en: string };
  timestamp: string;
  completed: boolean;
}

export interface Shipment {
  id: string;
  customerName: string;
  customerPhone: string;
  city: string;
  destination?: string;
  product: string;
  productDescription?: string;
  productImage?: string;
  quantity?: number;
  color?: string;
  currentStatus: string;
  statusHistory: StatusHistoryEntry[];
  photos: string[];
  invoiceAmount?: number;
  adminNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface InvoiceItem {
  name?: string;
  description?: string;
  quantity: number;
  unitPrice?: number;
  price?: number;
  total?: number;
}

export interface Invoice {
  id: string;
  shipmentId: string;
  customerName: string;
  items: InvoiceItem[];
  totalAmount?: number;
  amount?: number;
  currency?: string;
  status?: 'paid' | 'unpaid';
  details?: string;
  createdAt: string;
  qrCode?: string;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  target: string;
  details: string;
  timestamp: string;
}

export interface ChartData {
  month: string;
  shipments: number;
}

export interface StatusDistribution {
  name: string;
  value: number;
  color: string;
}

export interface DestinationData {
  country: string;
  flag: string;
  count: number;
}
