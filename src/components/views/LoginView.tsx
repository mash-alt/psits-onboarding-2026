import React, { useState } from 'react';
import { AlertTriangle, ArrowRight, CheckCircle2, Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { PageHeader } from '../ui/PageHeader';
import { useAuth } from '../../context/AuthContext';

export interface LoginViewProps { onLoginSuccess: () => void; onNavigateToHome: () => void; }

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, onNavigateToHome }) => {
  const { signIn, resetPassword, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); clearError(); setNotice(null); setLoading(true);
    try {
      if (resetMode) { await resetPassword(email.trim()); setNotice('PASSWORD RESET EMAIL SENT. CHECK THE AUTHORIZED INBOX.'); }
      else { await signIn(email.trim(), password); onLoginSuccess(); }
    } catch { /* Auth context provides the user-facing error. */ } finally { setLoading(false); }
  };

  return <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
    <PageHeader tag="SECURITY ACCESS // FIREBASE AUTHENTICATION" title="OFFICER" titleAccent={resetMode ? 'RESET' : 'LOGIN'} description="Authorized PSITS officers and administrators can access event operations here." badgeText="OFFICER ACCESS ONLY" />
    <div className="mt-6 grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
      <section className="lg:col-span-2 bg-[#FFD93D] border-8 border-black p-6 shadow-[10px_10px_0px_#000000] space-y-5">
        <Badge variant="black" size="sm">CCS DEPT // FIREBASE</Badge>
        <h2 className="text-3xl font-black uppercase leading-none">EVENT CONTROL<br /><span className="bg-black text-white px-2">CONSOLE</span></h2>
        <p className="text-xs font-bold uppercase leading-relaxed">Credentials are provisioned by an administrator. Public account creation is not available.</p>
        <div className="border-t-4 border-black pt-4 space-y-2 text-xs font-mono font-black uppercase"><p>FIREBASE AUTHENTICATION</p><p>ROLE-BASED FIRESTORE ACCESS</p><p>12 MYTHICAL CREATURE GROUPS</p></div>
      </section>
      <section className="lg:col-span-3 bg-white border-8 border-black shadow-[12px_12px_0px_#000000]">
        <div className="p-6 border-b-4 border-black bg-[#FFFDF5] flex items-center justify-between gap-3"><div><p className="font-mono text-xs font-black text-gray-500">AUTHENTICATION CONSOLE</p><h3 className="text-2xl font-black uppercase">{resetMode ? 'PASSWORD RESET' : 'OFFICER LOGIN'}</h3></div><ShieldCheck className="w-8 h-8" /></div>
        <form onSubmit={submit} className="p-6 space-y-5">
          {notice && <div className="bg-[#10B981] border-4 border-black p-3 font-mono text-xs font-black uppercase flex gap-2"><CheckCircle2 className="w-5 h-5 shrink-0" />{notice}</div>}
          {error && <div className="bg-[#FF6B6B] border-4 border-black p-3 font-mono text-xs font-black uppercase flex gap-2"><AlertTriangle className="w-5 h-5 shrink-0" />{error}</div>}
          <label className="block text-xs font-mono font-black uppercase">Email address<div className="relative mt-1"><Mail className="absolute left-3 top-3 w-4 h-4" /><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full pl-10 pr-3 py-2.5 border-3 border-black font-mono font-bold shadow-[3px_3px_0px_#000000]" /></div></label>
          {!resetMode && <label className="block text-xs font-mono font-black uppercase">Password<div className="relative mt-1"><Lock className="absolute left-3 top-3 w-4 h-4" /><input required type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} className="w-full pl-10 pr-10 py-2.5 border-3 border-black font-mono font-bold shadow-[3px_3px_0px_#000000]" /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-3 top-3">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div></label>}
          <Button type="submit" variant="primary" size="xl" fullWidth disabled={loading} rightIcon={<ArrowRight className="w-5 h-5" />}>{loading ? 'PROCESSING...' : resetMode ? 'SEND RESET EMAIL' : 'LOGIN TO PORTAL'}</Button>
          <button type="button" onClick={() => { setResetMode((value) => !value); clearError(); setNotice(null); }} className="text-xs font-mono font-black uppercase underline">{resetMode ? 'RETURN TO LOGIN' : 'FORGOT PASSWORD?'}</button>
        </form>
        <div className="border-t-4 border-black bg-[#FFFDF5] p-4 text-xs font-bold font-mono uppercase flex justify-between"><span>CCS DEPARTMENT // PSITS 2026</span><button onClick={onNavigateToHome} className="underline">RETURN HOME</button></div>
      </section>
    </div>
  </div>;
};
