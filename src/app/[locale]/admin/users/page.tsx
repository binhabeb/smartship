'use client';
import { use, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getTranslations, Locale } from '@/lib/translations';

export default function AdminUsersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const loc = (locale === 'ar' ? 'ar' : 'en') as Locale;
  const t = getTranslations(loc);

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [adding, setAdding] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  
  const [newUser, setNewUser] = useState({ email: '', role: 'data_entry', full_name: '' });
  const [editingUser, setEditingUser] = useState<any>(null);
  const [updating, setUpdating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('user_roles').select('*').order('created_at', { ascending: false });
      if (data) setUsers(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const generateToken = () => {
    return 'inv_' + Array.from(crypto.getRandomValues(new Uint8Array(24)))
      .map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      const token = generateToken();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

      const { error } = await supabase.from('user_roles').insert([{
        ...newUser,
        is_active: false,
        invitation_token: token,
        invitation_expires_at: expiresAt,
      }]);
      if (error) throw error;
      
      // Copy invite link
      const baseUrl = window.location.origin;
      const inviteLink = `${baseUrl}/${locale}/admin/invite/${token}`;
      await navigator.clipboard.writeText(inviteLink);
      
      alert(loc === 'ar' 
        ? `✅ تم إضافة الموظف وتم نسخ رابط الدعوة!\n\nأرسل هذا الرابط للموظف ليكمل تسجيل حسابه:\n${inviteLink}` 
        : `✅ User added! Invitation link copied!\n\nSend this link to the employee:\n${inviteLink}`
      );
      
      setShowForm(false);
      setNewUser({ email: '', role: 'data_entry', full_name: '' });
      await fetchUsers();
    } catch (err: any) {
      console.error(err);
      alert(loc === 'ar' ? `خطأ: ${err.message}` : `Error: ${err.message}`);
    } finally {
      setAdding(false);
    }
  };

  const copyInviteLink = async (token: string) => {
    const baseUrl = window.location.origin;
    const inviteLink = `${baseUrl}/${locale}/admin/invite/${token}`;
    await navigator.clipboard.writeText(inviteLink);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 3000);
  };

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const { error } = await supabase.from('user_roles').update({ role: editingUser.role }).eq('email', editingUser.email);
      if (error) throw error;
      
      setEditingUser(null);
      await fetchUsers();
    } catch (err: any) {
      console.error(err);
      alert(loc === 'ar' ? `خطأ: ${err.message}` : `Error: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteUser = async () => {
    setUpdating(true);
    try {
      const { error } = await supabase.from('user_roles').delete().eq('email', editingUser.email);
      if (error) throw error;
      
      setEditingUser(null);
      setShowDeleteConfirm(false);
      await fetchUsers();
    } catch (err: any) {
      console.error(err);
      alert(loc === 'ar' ? `خطأ: ${err.message}` : `Error: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const getRoleLabel = (role: string) => {
    if (role === 'admin') return loc === 'ar' ? 'مسؤول النظام (Admin)' : 'Admin';
    if (role === 'manager') return loc === 'ar' ? 'مدير (إصدار فواتير وإدارة)' : 'Manager';
    if (role === 'data_entry') return loc === 'ar' ? 'مدخل بيانات (إضافة شحنات)' : 'Data Entry';
    if (role === 'supervisor') return loc === 'ar' ? 'مشرف (مشاهدة فقط)' : 'Supervisor';
    return role;
  };

  const getRoleBadgeClass = (role: string) => {
    if (role === 'admin') return 'badge-danger';
    if (role === 'manager') return 'badge-approved';
    if (role === 'data_entry') return 'badge-new';
    return 'badge-transit';
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>{loc === 'ar' ? 'إدارة الموظفين والصلاحيات' : 'Users & Roles Management'}</h1>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}>
            {showForm ? '❌' : '➕'} {loc === 'ar' ? 'إضافة موظف جديد' : 'Add New Employee'}
          </button>
          <button onClick={fetchUsers} className="btn-secondary" style={{ padding: '8px 16px', fontSize: 13 }}>
            🔄 {loc === 'ar' ? 'تحديث' : 'Refresh'}
          </button>
        </div>
      </div>

      <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: 16, borderRadius: 12, marginBottom: 24, border: '1px solid rgba(59, 130, 246, 0.3)', fontSize: 13, color: 'var(--text-secondary)' }}>
        <strong>{loc === 'ar' ? '💡 كيف يعمل النظام:' : '💡 How it works:'}</strong> {loc === 'ar' ? 'عند إضافة موظف جديد، سيتم إنشاء رابط دعوة تلقائياً. أرسل الرابط للموظف ليقوم بتعيين كلمة مروره وتفعيل حسابه.' : 'When you add a new employee, an invitation link is automatically created. Send the link to the employee to set their password and activate their account.'}
      </div>

      {showForm && (
        <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>{loc === 'ar' ? 'إضافة موظف جديد' : 'Add New Employee'}</h3>
          <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <div><label style={{ fontSize: 12, marginBottom: 4, display: 'block' }}>{loc === 'ar' ? 'البريد الإلكتروني للموظف' : 'Employee Email'}</label><input required className="input-glass" type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} dir="ltr" /></div>
              <div><label style={{ fontSize: 12, marginBottom: 4, display: 'block' }}>{loc === 'ar' ? 'الاسم الكامل' : 'Full Name'}</label><input required className="input-glass" type="text" value={newUser.full_name} onChange={e => setNewUser({...newUser, full_name: e.target.value})} /></div>
              <div>
                <label style={{ fontSize: 12, marginBottom: 4, display: 'block' }}>{loc === 'ar' ? 'مستوى الصلاحية' : 'Role Level'}</label>
                <select className="input-glass" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                  <option value="admin">{loc === 'ar' ? 'مسؤول النظام (تحكم كامل)' : 'Admin (Full Access)'}</option>
                  <option value="manager">{loc === 'ar' ? 'مدير (إدارة الطلبات، فواتير، وشحنات)' : 'Manager (Invoices, Shipments)'}</option>
                  <option value="data_entry">{loc === 'ar' ? 'مدخل بيانات (إضافة شحنات فقط)' : 'Data Entry (Add Shipments)'}</option>
                  <option value="supervisor">{loc === 'ar' ? 'مشرف (استعراض ومشاهدة فقط)' : 'Supervisor (Read Only)'}</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button type="submit" disabled={adding} className="btn-success" style={{ padding: '8px 24px' }}>{adding ? '...' : (loc === 'ar' ? 'إضافة وإنشاء رابط دعوة' : 'Add & Create Invite Link')}</button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-card" style={{ padding: '24px 0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', padding: '0 24px' }}>
          <table className="glass-table" style={{ minWidth: 900 }}>
            <thead>
              <tr>
                <th>{loc === 'ar' ? 'الموظف' : 'Employee'}</th>
                <th>{loc === 'ar' ? 'البريد الإلكتروني' : 'Email'}</th>
                <th>{loc === 'ar' ? 'الصلاحية' : 'Role'}</th>
                <th>{loc === 'ar' ? 'حالة الحساب' : 'Account Status'}</th>
                <th>{loc === 'ar' ? 'تاريخ التعيين' : 'Date'}</th>
                <th style={{ textAlign: 'end' }}>{loc === 'ar' ? 'إجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40 }}>Loading...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)' }}>{loc === 'ar' ? 'لم يتم إضافة أي موظفين بعد' : 'No employees added yet'}</td></tr>
              ) : (
                users.map(u => (
                  <tr key={u.email}>
                    <td style={{ fontWeight: 600 }}>{u.full_name || '-'}</td>
                    <td style={{ fontFamily: 'var(--font-en)' }}>{u.email}</td>
                    <td>
                      <span className={`badge ${getRoleBadgeClass(u.role)}`}>
                        {getRoleLabel(u.role)}
                      </span>
                    </td>
                    <td>
                      {u.is_active ? (
                        <span style={{ color: 'var(--success)', fontWeight: 600, fontSize: 13 }}>✅ {loc === 'ar' ? 'مفعّل' : 'Active'}</span>
                      ) : (
                        <span style={{ color: 'var(--warning)', fontWeight: 600, fontSize: 13 }}>⏳ {loc === 'ar' ? 'بانتظار التفعيل' : 'Pending'}</span>
                      )}
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                      {new Date(u.created_at).toLocaleDateString(loc === 'ar' ? 'ar-SA' : 'en-US')}
                    </td>
                    <td style={{ textAlign: 'end' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        {!u.is_active && u.invitation_token && (
                          <button
                            onClick={() => copyInviteLink(u.invitation_token)}
                            className="btn-secondary"
                            style={{ padding: '6px 12px', fontSize: 12, borderRadius: 8 }}
                          >
                            {copiedToken === u.invitation_token ? '✅' : '🔗'} {loc === 'ar' ? 'نسخ رابط الدعوة' : 'Copy Invite'}
                          </button>
                        )}
                        <button 
                          onClick={() => { setEditingUser({...u}); setShowDeleteConfirm(false); }} 
                          className="btn-secondary" 
                          style={{ padding: '6px 12px', fontSize: 12, borderRadius: 8 }}
                        >
                          {loc === 'ar' ? 'تعديل' : 'Edit'}
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

      {editingUser && (
        <div className="modal-overlay" onClick={() => !updating && setEditingUser(null)}>
          <div className="modal-content glass-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>{loc === 'ar' ? 'تعديل بيانات الموظف' : 'Edit Employee Details'}</h3>
              <button onClick={() => setEditingUser(null)} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', fontSize: 20 }}>✕</button>
            </div>

            {!showDeleteConfirm ? (
              <form onSubmit={handleUpdateRole}>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 8, display: 'block' }}>{loc === 'ar' ? 'الموظف' : 'Employee'}</label>
                  <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: 12, border: '1px solid var(--glass-border)' }}>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{editingUser.full_name}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'var(--font-en)' }}>{editingUser.email}</div>
                  </div>
                </div>

                <div style={{ marginBottom: 32 }}>
                  <label style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 8, display: 'block' }}>{loc === 'ar' ? 'تغيير الصلاحية' : 'Change Role'}</label>
                  <select 
                    className="input-glass" 
                    value={editingUser.role} 
                    onChange={e => setEditingUser({...editingUser, role: e.target.value})}
                  >
                    <option value="admin">{loc === 'ar' ? 'مسؤول النظام (Admin)' : 'Admin'}</option>
                    <option value="manager">{loc === 'ar' ? 'مدير (Manager)' : 'Manager'}</option>
                    <option value="data_entry">{loc === 'ar' ? 'مدخل بيانات (Data Entry)' : 'Data Entry'}</option>
                    <option value="supervisor">{loc === 'ar' ? 'مشرف (Supervisor)' : 'Supervisor'}</option>
                  </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button 
                    type="button" 
                    onClick={() => setShowDeleteConfirm(true)} 
                    className="btn-danger" 
                    style={{ padding: '10px 20px', fontSize: 13, background: 'none', border: '1px solid var(--danger)', color: 'var(--danger)' }}
                  >
                    {loc === 'ar' ? 'إزالة الموظف' : 'Remove Employee'}
                  </button>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button type="button" onClick={() => setEditingUser(null)} className="btn-secondary" style={{ padding: '10px 20px', fontSize: 13 }}>
                      {loc === 'ar' ? 'إلغاء' : 'Cancel'}
                    </button>
                    <button type="submit" disabled={updating} className="btn-primary" style={{ padding: '10px 24px', fontSize: 13 }}>
                      {updating ? '...' : (loc === 'ar' ? 'حفظ التغييرات' : 'Save Changes')}
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div style={{ textAlign: 'center', padding: '12px 0' }}>
                <div style={{ width: 64, height: 64, background: 'rgba(255, 59, 48, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'var(--danger)', fontSize: 32 }}>⚠️</div>
                <h4 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: 'var(--danger)' }}>{loc === 'ar' ? 'تأكيد الحذف' : 'Confirm Deletion'}</h4>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 32, lineHeight: 1.6 }}>
                  {loc === 'ar' 
                    ? `هل أنت متأكد من رغبتك في إزالة الموظف (${editingUser.email})؟ سيتم سحب كافة صلاحياته فوراً ولا يمكن التراجع عن هذا الإجراء.` 
                    : `Are you sure you want to remove (${editingUser.email})? All permissions will be revoked immediately and this action cannot be undone.`}
                </p>
                <div style={{ display: 'flex', gap: 16 }}>
                  <button onClick={() => setShowDeleteConfirm(false)} className="btn-secondary" style={{ flex: 1, padding: '12px' }} disabled={updating}>
                    {loc === 'ar' ? 'تراجع' : 'Back'}
                  </button>
                  <button onClick={handleDeleteUser} className="btn-danger" style={{ flex: 1, padding: '12px' }} disabled={updating}>
                    {updating ? '...' : (loc === 'ar' ? 'تأكيد الإزالة نهائياً' : 'Confirm Removal')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
