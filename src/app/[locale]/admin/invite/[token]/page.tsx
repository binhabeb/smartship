'use client';
import { use, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getTranslations, Locale } from '@/lib/translations';
import Link from 'next/link';

export default function InvitePage({ params }: { params: Promise<{ locale: string, token: string }> }) {
  const { locale, token } = use(params);
  const loc = (locale === 'ar' ? 'ar' : 'en') as Locale;
  const isAr = loc === 'ar';

  const [status, setStatus] = useState<'loading' | 'valid' | 'expired' | 'email_sent' | 'done' | 'error'>('loading');
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
      setErrorMsg(isAr ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg(isAr ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      // Build the confirmation redirect URL
      const confirmRedirectUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/${locale}/admin/auth/callback?type=signup`
        : `http://localhost:3000/${locale}/admin/auth/callback?type=signup`;

      // Create Supabase Auth account with email confirmation
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: userInfo.email,
        password: password,
        options: {
          data: {
            full_name: userInfo.full_name,
          },
          emailRedirectTo: confirmRedirectUrl,
        },
      });

      if (signUpError) throw signUpError;

      // Store the auth user id in user_roles (but don't activate yet - wait for email confirmation)
      if (signUpData.user) {
        await supabase
          .from('user_roles')
          .update({
            auth_user_id: signUpData.user.id,
            invitation_token: null,
            invitation_expires_at: null,
          })
          .eq('id', userInfo.id);
      }

      // Check if email confirmation is required
      // If user is already confirmed (e.g. SMTP not set up), activate directly
      if (signUpData.user?.confirmed_at || signUpData.session) {
        // User was auto-confirmed (no SMTP or confirmation disabled)
        await supabase
          .from('user_roles')
          .update({ is_active: true })
          .eq('id', userInfo.id);
        setStatus('done');
      } else {
        // Email confirmation required - show message to check email
        setStatus('email_sent');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || (isAr ? 'حدث خطأ غير متوقع' : 'An unexpected error occurred'));
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
          {isAr ? 'رابط الدعوة غير صالح أو منتهي' : 'Invitation Link Invalid or Expired'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24, maxWidth: 400 }}>
          {isAr ? 'يرجى التواصل مع مسؤول النظام للحصول على رابط دعوة جديد.' : 'Please contact your administrator for a new invitation link.'}
        </p>
        <Link href={`/${locale}`} className="btn-primary" style={{ padding: '12px 24px', textDecoration: 'none' }}>
          {isAr ? 'العودة للرئيسية' : 'Back to Home'}
        </Link>
      </div>
    );
  }

  // Email Confirmation Required
  if (status === 'email_sent') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>📧</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>
          {isAr ? 'تحقق من بريدك الإلكتروني' : 'Check Your Email'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 12, maxWidth: 450, lineHeight: 1.8 }}>
          {isAr 
            ? `تم إنشاء حسابك بنجاح! تم إرسال رابط تأكيد إلى بريدك الإلكتروني:`
            : `Your account has been created! A confirmation link has been sent to:`}
        </p>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 24, fontFamily: 'var(--font-en)', color: 'var(--primary)' }} dir="ltr">
          {userInfo?.email}
        </div>
        <p style={{ color: 'var(--text-tertiary)', fontSize: 13, maxWidth: 400, marginBottom: 32, lineHeight: 1.7 }}>
          {isAr
            ? 'اضغط على الرابط في البريد لتفعيل حسابك. تأكد من مراجعة مجلد الرسائل غير المرغوبة (Spam).'
            : 'Click the link in your email to activate your account. Make sure to check your spam folder.'}
        </p>
        <Link href={`/${locale}/admin/login`} className="btn-primary" style={{ padding: '12px 32px', textDecoration: 'none' }}>
          {isAr ? 'الذهاب لتسجيل الدخول' : 'Go to Login'}
        </Link>
      </div>
    );
  }

  // Success (auto-confirmed, no SMTP)
  if (status === 'done') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>
          {isAr ? 'تم إنشاء حسابك بنجاح!' : 'Account Created Successfully!'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24, maxWidth: 400 }}>
          {isAr ? 'يمكنك الآن تسجيل الدخول باستخدام بريدك الإلكتروني وكلمة المرور الجديدة.' : 'You can now sign in with your email and new password.'}
        </p>
        <Link href={`/${locale}/admin/login`} className="btn-primary" style={{ padding: '12px 32px', textDecoration: 'none' }}>
          {isAr ? 'تسجيل الدخول' : 'Sign In'}
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
            {isAr ? 'إكمال تسجيل حسابك' : 'Complete Your Registration'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            {isAr ? 'تمت دعوتك للانضمام لفريق عمل بن حبيب' : 'You have been invited to join Bin Habeb team'}
          </p>
        </div>

        {/* User Info */}
        <div style={{ background: 'rgba(0,102,255,0.05)', padding: 16, borderRadius: 12, marginBottom: 24, border: '1px solid rgba(0,102,255,0.15)' }}>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>{isAr ? 'الاسم:' : 'Name:'}</div>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>{userInfo?.full_name}</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>{isAr ? 'البريد الإلكتروني:' : 'Email:'}</div>
          <div style={{ fontWeight: 700, fontFamily: 'var(--font-en)' }} dir="ltr">{userInfo?.email}</div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
              {isAr ? 'كلمة المرور الجديدة' : 'New Password'}
            </label>
            <input
              required
              type="password"
              className="input-glass"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={isAr ? '6 أحرف على الأقل' : 'At least 6 characters'}
              minLength={6}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
              {isAr ? 'تأكيد كلمة المرور' : 'Confirm Password'}
            </label>
            <input
              required
              type="password"
              className="input-glass"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder={isAr ? 'أعد إدخال كلمة المرور' : 'Re-enter password'}
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
            {submitting ? '...' : (isAr ? 'إنشاء الحساب والتفعيل' : 'Create Account & Activate')}
          </button>
        </form>
      </div>
    </div>
  );
}
