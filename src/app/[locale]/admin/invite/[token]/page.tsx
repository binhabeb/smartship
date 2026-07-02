'use client';
import { use, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getTranslations, Locale } from '@/lib/translations';
import Link from 'next/link';

export default function InvitePage({ params }: { params: Promise<{ locale: string, token: string }> }) {
  const { locale, token } = use(params);
  const loc = (locale === 'ar' ? 'ar' : 'en') as Locale;

  const [status, setStatus] = useState<'loading' | 'valid' | 'expired' | 'done' | 'error'>('loading');
  const [userInfo, setUserInfo] = useState<any>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function verifyToken() {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('invitation_token', token)
        .single();

      if (error || !data) {
        setStatus('expired');
        return;
      }

      // Check if already active
      if (data.is_active) {
        setStatus('expired');
        return;
      }

      // Check expiry
      if (data.invitation_expires_at && new Date(data.invitation_expires_at) < new Date()) {
        setStatus('expired');
        return;
      }

      setUserInfo(data);
      setStatus('valid');
    }
    verifyToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (password.length < 6) {
      setErrorMsg(loc === 'ar' ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg(loc === 'ar' ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      // Create Supabase Auth account
      const { error: signUpError } = await supabase.auth.signUp({
        email: userInfo.email,
        password: password,
      });

      if (signUpError) throw signUpError;

      // Activate the user role
      const { error: updateError } = await supabase
        .from('user_roles')
        .update({
          is_active: true,
          invitation_token: null,
          invitation_expires_at: null,
        })
        .eq('id', userInfo.id);

      if (updateError) throw updateError;

      setStatus('done');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || (loc === 'ar' ? 'حدث خطأ غير متوقع' : 'An unexpected error occurred'));
    } finally {
      setSubmitting(false);
    }
  };

  // Loading
  if (status === 'loading') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  // Expired / Invalid
  if (status === 'expired') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>⚠️</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>
          {loc === 'ar' ? 'رابط الدعوة غير صالح أو منتهي' : 'Invitation Link Invalid or Expired'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24, maxWidth: 400 }}>
          {loc === 'ar' ? 'يرجى التواصل مع مسؤول النظام للحصول على رابط دعوة جديد.' : 'Please contact your administrator for a new invitation link.'}
        </p>
        <Link href={`/${locale}`} className="btn-primary" style={{ padding: '12px 24px', textDecoration: 'none' }}>
          {loc === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
        </Link>
      </div>
    );
  }

  // Success
  if (status === 'done') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>
          {loc === 'ar' ? 'تم إنشاء حسابك بنجاح!' : 'Account Created Successfully!'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24, maxWidth: 400 }}>
          {loc === 'ar' ? 'يمكنك الآن تسجيل الدخول باستخدام بريدك الإلكتروني وكلمة المرور الجديدة.' : 'You can now sign in with your email and new password.'}
        </p>
        <Link href={`/${locale}/admin/login`} className="btn-primary" style={{ padding: '12px 32px', textDecoration: 'none' }}>
          {loc === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
        </Link>
      </div>
    );
  }

  // Registration Form
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="glass-card" style={{ padding: 40, maxWidth: 480, width: '100%' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img src="/logo.png" alt="Bin Habeb" style={{ height: 50, margin: '0 auto 16px', display: 'block' }} />
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
            {loc === 'ar' ? 'إكمال تسجيل حسابك' : 'Complete Your Registration'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            {loc === 'ar' ? 'تمت دعوتك للانضمام لفريق عمل بن حبيب' : 'You have been invited to join Bin Habeb team'}
          </p>
        </div>

        {/* User Info */}
        <div style={{ background: 'rgba(0,102,255,0.05)', padding: 16, borderRadius: 12, marginBottom: 24, border: '1px solid rgba(0,102,255,0.15)' }}>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>{loc === 'ar' ? 'الاسم:' : 'Name:'}</div>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>{userInfo?.full_name}</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>{loc === 'ar' ? 'البريد الإلكتروني:' : 'Email:'}</div>
          <div style={{ fontWeight: 700, fontFamily: 'var(--font-en)' }} dir="ltr">{userInfo?.email}</div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
              {loc === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}
            </label>
            <input
              required
              type="password"
              className="input-glass"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={loc === 'ar' ? '6 أحرف على الأقل' : 'At least 6 characters'}
              minLength={6}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
              {loc === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
            </label>
            <input
              required
              type="password"
              className="input-glass"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder={loc === 'ar' ? 'أعد إدخال كلمة المرور' : 'Re-enter password'}
            />
          </div>

          {errorMsg && (
            <div style={{ color: 'var(--danger)', fontSize: 14, padding: 12, background: 'rgba(255,59,48,0.1)', borderRadius: 8 }}>
              ⚠️ {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary"
            style={{ padding: '14px', fontSize: 16, opacity: submitting ? 0.7 : 1 }}
          >
            {submitting ? '...' : (loc === 'ar' ? 'إنشاء الحساب والتفعيل' : 'Create Account & Activate')}
          </button>
        </form>
      </div>
    </div>
  );
}
