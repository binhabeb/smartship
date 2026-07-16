'use client';
import { use, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getTranslations, Locale } from '@/lib/translations';
import Link from 'next/link';
import { Suspense } from 'react';

function AuthCallbackContent({ locale, loc }: { locale: string; loc: Locale }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'recovery' | 'confirmed' | 'error'>('loading');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const isAr = loc === 'ar';

  useEffect(() => {
    const handleCallback = async () => {
      // Check for hash fragments (Supabase sends tokens in hash)
      const hash = window.location.hash;
      const params = new URLSearchParams(hash.replace('#', ''));
      const type = params.get('type') || searchParams.get('type') || '';
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      // If we have tokens in hash, set the session
      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (error) {
          setStatus('error');
          setErrorMsg(error.message);
          return;
        }
      }

      if (type === 'recovery') {
        // Password recovery flow
        setStatus('recovery');
      } else if (type === 'signup' || type === 'email_confirmation') {
        // Email confirmation after invite signup
        // Activate the user in user_roles
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.email) {
          await supabase
            .from('user_roles')
            .update({ is_active: true, auth_user_id: session.user.id })
            .eq('email', session.user.email);
        }
        setStatus('confirmed');
      } else {
        // Check if there's an active session (might be a redirect after confirmation)
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // Try to activate user if not already
          if (session.user?.email) {
            await supabase
              .from('user_roles')
              .update({ is_active: true, auth_user_id: session.user.id })
              .eq('email', session.user.email)
              .eq('is_active', false);
          }
          setStatus('confirmed');
        } else {
          setStatus('error');
          setErrorMsg(isAr ? 'رابط غير صالح أو منتهي الصلاحية' : 'Invalid or expired link');
        }
      }
    };

    handleCallback();
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (newPassword.length < 6) {
      setErrorMsg(isAr ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg(isAr ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      setStatus('confirmed');
    } catch (err: any) {
      setErrorMsg(err.message || (isAr ? 'حدث خطأ غير متوقع' : 'An unexpected error occurred'));
    } finally {
      setSubmitting(false);
    }
  };

  // Loading
  if (status === 'loading') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div className="loading-spinner"></div>
        <p style={{ marginTop: 16, color: 'var(--text-secondary)' }}>
          {isAr ? 'جاري التحقق...' : 'Verifying...'}
        </p>
      </div>
    );
  }

  // Error
  if (status === 'error') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>⚠️</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>
          {isAr ? 'حدث خطأ' : 'Something went wrong'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24, maxWidth: 400 }}>
          {errorMsg || (isAr ? 'رابط غير صالح أو منتهي الصلاحية.' : 'Invalid or expired link.')}
        </p>
        <Link href={`/${locale}/admin/login`} className="btn-primary" style={{ padding: '12px 24px', textDecoration: 'none' }}>
          {isAr ? 'تسجيل الدخول' : 'Go to Login'}
        </Link>
      </div>
    );
  }

  // Password Recovery Form
  if (status === 'recovery') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div className="glass-card" style={{ padding: 40, maxWidth: 480, width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #0055CC)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 16px' }}>🔐</div>
            <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
              {isAr ? 'تعيين كلمة مرور جديدة' : 'Set New Password'}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              {isAr ? 'أدخل كلمة المرور الجديدة لحسابك' : 'Enter your new password below'}
            </p>
          </div>

          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                {isAr ? 'كلمة المرور الجديدة' : 'New Password'}
              </label>
              <input
                required type="password" className="input-glass"
                value={newPassword} onChange={e => setNewPassword(e.target.value)}
                placeholder={isAr ? '6 أحرف على الأقل' : 'At least 6 characters'}
                minLength={6} dir="ltr"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                {isAr ? 'تأكيد كلمة المرور' : 'Confirm Password'}
              </label>
              <input
                required type="password" className="input-glass"
                value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                placeholder={isAr ? 'أعد إدخال كلمة المرور' : 'Re-enter password'}
                dir="ltr"
              />
            </div>

            {errorMsg && (
              <div style={{ color: 'var(--danger)', fontSize: 14, padding: 12, background: 'rgba(255,59,48,0.1)', borderRadius: 8 }}>
                ⚠️ {errorMsg}
              </div>
            )}

            <button type="submit" disabled={submitting} className="btn-primary"
              style={{ padding: '14px', fontSize: 16, opacity: submitting ? 0.7 : 1 }}>
              {submitting ? '...' : (isAr ? 'تحديث كلمة المرور' : 'Update Password')}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Confirmed / Success
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>
        {isAr ? 'تم بنجاح!' : 'Success!'}
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 24, maxWidth: 400 }}>
        {isAr ? 'تم تأكيد حسابك بنجاح. يمكنك الآن تسجيل الدخول.' : 'Your account has been confirmed. You can now sign in.'}
      </p>
      <Link href={`/${locale}/admin/login`} className="btn-primary" style={{ padding: '12px 32px', textDecoration: 'none' }}>
        {isAr ? 'تسجيل الدخول' : 'Sign In'}
      </Link>
    </div>
  );
}

export default function AuthCallbackPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const loc = (locale === 'ar' ? 'ar' : 'en') as Locale;
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="loading-spinner"></div></div>}>
      <AuthCallbackContent locale={locale} loc={loc} />
    </Suspense>
  );
}
