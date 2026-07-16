'use client';
import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getTranslations, Locale } from '@/lib/translations';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function AdminLogin({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const loc = (locale === 'ar' ? 'ar' : 'en') as Locale;
  const t = getTranslations(loc);
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
    } else {
      router.push(`/${locale}/admin/dashboard`);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const redirectUrl = typeof window !== 'undefined' 
      ? `${window.location.origin}/${locale}/admin/auth/callback?type=recovery`
      : `http://localhost:3000/${locale}/admin/auth/callback?type=recovery`;

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (resetError) {
      setError(resetError.message);
    } else {
      setForgotSent(true);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'radial-gradient(ellipse at 50% 30%, rgba(0,122,255,0.08) 0%, transparent 60%), var(--bg-deep)' }}>
      {/* Back to Home Button */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={{ position: 'absolute', top: 24, [loc === 'ar' ? 'right' : 'left']: 24, zIndex: 10 }}>
        <Link href={`/${locale}`} style={{ 
          display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', 
          textDecoration: 'none', fontSize: 14, fontWeight: 600, padding: '10px 16px',
          borderRadius: 12, background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
          backdropFilter: 'var(--blur-glass)', transition: 'all 0.3s'
        }} className="back-home-btn">
          <span>{loc === 'ar' ? '🏠 العودة للرئيسية' : '🏠 Back to Home'}</span>
        </Link>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: 40, maxWidth: 420, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #0055CC)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 16px' }}>🚢</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
            {mode === 'login' 
              ? (t.admin?.loginTitle || 'Admin Login') 
              : (loc === 'ar' ? 'استعادة كلمة المرور' : 'Reset Password')}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            {mode === 'login' 
              ? (t.admin?.loginSubtitle || 'Sign in to access the command center') 
              : (loc === 'ar' ? 'أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين كلمة المرور' : 'Enter your email and we will send you a password reset link')}
          </p>
        </div>
        
        {error && (
          <div style={{ background: 'rgba(255, 59, 48, 0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '12px 16px', borderRadius: 8, marginBottom: 20, fontSize: 13, textAlign: 'center' }}>
            {error}
          </div>
        )}

        {mode === 'forgot' && forgotSent ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: 'var(--success)' }}>
              {loc === 'ar' ? 'تم إرسال رابط الاستعادة!' : 'Reset Link Sent!'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24, lineHeight: 1.7 }}>
              {loc === 'ar' 
                ? `تم إرسال رابط إعادة تعيين كلمة المرور إلى ${email}. يرجى مراجعة بريدك الإلكتروني (بما في ذلك مجلد الرسائل غير المرغوبة).`
                : `A password reset link has been sent to ${email}. Please check your email (including spam folder).`}
            </p>
            <button onClick={() => { setMode('login'); setForgotSent(false); setError(''); }} className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: 16 }}>
              {loc === 'ar' ? 'العودة لتسجيل الدخول' : 'Back to Login'}
            </button>
          </div>
        ) : mode === 'forgot' ? (
          <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>{t.admin?.email || 'Email'}</label>
              <input required className="input-glass" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@smartship.com" dir="ltr" />
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: 16, marginTop: 8, opacity: loading ? 0.7 : 1 }}>
              {loading ? '...' : (loc === 'ar' ? 'إرسال رابط الاستعادة' : 'Send Reset Link')}
            </button>

            <button type="button" onClick={() => { setMode('login'); setError(''); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer', marginTop: 8 }}>
              {loc === 'ar' ? '← العودة لتسجيل الدخول' : '← Back to Login'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>{t.admin?.email || 'Email'}</label>
              <input required className="input-glass" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@smartship.com" dir="ltr" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>{t.admin?.password || 'Password'}</label>
              <input required className="input-glass" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" dir="ltr" />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <input type="checkbox" style={{ accentColor: 'var(--primary)' }} /> {t.admin?.rememberMe || 'Remember Me'}
              </label>
              <button type="button" onClick={() => { setMode('forgot'); setError(''); }} style={{ fontSize: 13, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'none' }}>
                {t.admin?.forgotPassword || 'Forgot Password?'}
              </button>
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: 16, marginTop: 8, opacity: loading ? 0.7 : 1 }}>
              {loading ? '...' : (t.admin?.login || 'Login')}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
