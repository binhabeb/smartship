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
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (mode === 'login') {
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
    } else {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
      } else {
        alert(loc === 'ar' ? 'تم إنشاء الحساب بنجاح. يرجى مراجعة بريدك الإلكتروني لتأكيد الحساب.' : 'Account created successfully. Please check your email to confirm.');
        setMode('login');
        setLoading(false);
      }
    }
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
            {mode === 'login' ? (t.admin?.loginTitle || 'Admin Login') : (loc === 'ar' ? 'إنشاء حساب مسؤول' : 'Create Admin Account')}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            {mode === 'login' ? (t.admin?.loginSubtitle || 'Sign in to access the command center') : (loc === 'ar' ? 'قم بتعبئة البيانات للانضمام لفريق الإدارة' : 'Fill in the details to join the admin team')}
          </p>
        </div>
        
        {error && (
          <div style={{ background: 'rgba(255, 59, 48, 0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '12px 16px', borderRadius: 8, marginBottom: 20, fontSize: 13, textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {mode === 'register' && (
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>{loc === 'ar' ? 'الاسم الكامل' : 'Full Name'}</label>
              <input required className="input-glass" type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Mohammed Ahmed" />
            </div>
          )}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>{t.admin?.email || 'Email'}</label>
            <input required className="input-glass" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@smartship.com" dir="ltr" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>{t.admin?.password || 'Password'}</label>
            <input required className="input-glass" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" dir="ltr" />
          </div>
          
          {mode === 'login' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <input type="checkbox" style={{ accentColor: 'var(--primary)' }} /> {t.admin?.rememberMe || 'Remember Me'}
              </label>
              <a href="#" style={{ fontSize: 13, color: 'var(--primary)', textDecoration: 'none' }}>{t.admin?.forgotPassword || 'Forgot Password?'}</a>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: 16, marginTop: 8, opacity: loading ? 0.7 : 1 }}>
            {loading ? '...' : (mode === 'login' ? (t.admin?.login || 'Login') : (loc === 'ar' ? 'إنشاء الحساب' : 'Create Account'))}
          </button>

          <button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer', marginTop: 8 }}>
            {mode === 'login' ? (loc === 'ar' ? 'ليس لديك حساب؟ إنشاء حساب' : 'Don\'t have an account? Create one') : (loc === 'ar' ? 'لديك حساب بالفعل؟ تسجيل دخول' : 'Already have an account? Login')}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
