import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { PageHeader } from '../ui/PageHeader';
import { Lock, User, ArrowRight, ShieldCheck, AlertTriangle, Key, Terminal, Sparkles, Eye, EyeOff } from 'lucide-react';
import { authenticateOfficer } from '../../data/eventStore';

export interface LoginViewProps {
  onLoginSuccess: () => void;
  onNavigateToHome: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
  onNavigateToHome,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      setError('USERNAME IS REQUIRED');
      return;
    }

    if (trimmedUsername.length < 3) {
      setError('USERNAME MUST BE AT LEAST 3 CHARACTERS');
      return;
    }

    if (!password) {
      setError('PASSWORD IS REQUIRED');
      return;
    }

    if (password.length < 4) {
      setError('PASSWORD MUST BE AT LEAST 4 CHARACTERS');
      return;
    }

    setLoading(true);

    // Simulate fast local authentication
    setTimeout(() => {
      setLoading(false);
      authenticateOfficer(trimmedUsername, password);
      onLoginSuccess();
    }, 400);
  };

  const handleQuickFill = () => {
    setUsername('admin_officer');
    setPassword('psits2026');
    setError(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <PageHeader
        tag="SECURITY ACCESS // OFFICER CONSOLE"
        title="OFFICER"
        titleAccent="LOGIN"
        description="Official event management and administration console for PSITS officers and department coordinators."
        badgeText="OFFICER ACCESS"
      />

      {/* Asymmetric Brutalist Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-6">
        {/* Left Column (5 Cols) - Heavy Graphic Block */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#FFD93D] border-8 border-black p-6 sm:p-8 shadow-[10px_10px_0px_#000000] relative overflow-hidden">
            {/* Background Texture Overlay */}
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(#000000 2px, transparent 2px)',
                backgroundSize: '16px 16px',
              }}
            />

            <div className="relative z-10 space-y-5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-black bg-black text-[#FFD93D] px-2 py-0.5 uppercase tracking-widest border border-black">
                  CCS DEPT // AUTH
                </span>
                <Badge variant="black" size="sm">
                  OFFICER ACCESS
                </Badge>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black uppercase text-black tracking-tight leading-none">
                EVENT CONTROL
                <br />
                <span className="bg-black text-[#FFFDF5] px-2 py-0.5 inline-block mt-1">
                  CONSOLE
                </span>
              </h2>

              <p className="text-xs sm:text-sm font-bold uppercase text-black leading-relaxed">
                Enter your authorized officer credentials to manage attendees, Mythical Creature Groups, event raffles, and department records.
              </p>

              {/* Informational checklist */}
              <div className="border-t-4 border-black pt-4 space-y-2 text-xs font-mono font-black uppercase">
                <div className="flex items-center gap-2">
                  <span className="bg-black text-white w-5 h-5 flex items-center justify-center text-[10px]">
                    ✓
                  </span>
                  <span>AUTHORIZED PSITS OFFICERS ONLY</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-black text-white w-5 h-5 flex items-center justify-center text-[10px]">
                    ✓
                  </span>
                  <span>ATTENDEE DATABASE & CSV INGESTION</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-black text-white w-5 h-5 flex items-center justify-center text-[10px]">
                    ✓
                  </span>
                  <span>12 MYTHICAL CREATURE GROUPS MANAGEMENT</span>
                </div>
              </div>

              {/* Mock testing quick fill */}
              <div className="bg-[#FFFDF5] border-4 border-black p-3 shadow-[4px_4px_0px_#000000] mt-4">
                <div className="flex items-center justify-between text-[11px] font-mono font-black uppercase text-gray-700 mb-1">
                  <span>TEST CREDENTIALS</span>
                  <Sparkles className="w-3.5 h-3.5 text-[#FF6B6B]" />
                </div>
                <button
                  type="button"
                  onClick={handleQuickFill}
                  className="w-full text-left font-mono text-xs font-black text-black hover:text-[#FF6B6B] underline cursor-pointer"
                >
                  ⚡ CLICK TO AUTOFILL OFFICER ACCOUNT
                </button>
              </div>
            </div>
          </div>

          {/* Barcode Stamp */}
          <div className="p-4 bg-black text-[#FFD93D] border-4 border-black font-mono text-xs shadow-[6px_6px_0px_#FF6B6B] flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-bold text-[10px] text-gray-400 block">SECURITY HASH</span>
              <span className="font-black tracking-widest">#PSITS-AUTH-CCS-2026</span>
            </div>
            <Terminal className="w-6 h-6 text-[#FFD93D]" />
          </div>
        </div>

        {/* Right Column (7 Cols) - Officer Login Card */}
        <div className="lg:col-span-7">
          <div className="bg-white border-8 border-black shadow-[12px_12px_0px_#000000] relative">
            {/* Top Hazard Bar */}
            <div className="h-4 bg-[#000000] flex">
              <div
                className="w-full h-full"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(45deg, #FFD93D, #FFD93D 12px, #000000 12px, #000000 24px)',
                }}
              />
            </div>

            {/* Header Strip */}
            <div className="p-6 border-b-4 border-black bg-[#FFFDF5] flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="font-mono text-xs font-black uppercase text-gray-500 block">
                  AUTHENTICATION CONSOLE
                </span>
                <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black">
                  LOGIN
                </h3>
              </div>
              <Badge variant="yellow" size="md">
                OFFICER ACCESS
              </Badge>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="p-6 sm:p-8 space-y-6">
              {/* Error Alert in Neo-Brutalist Red Accent */}
              {error && (
                <div className="bg-[#FF6B6B] border-4 border-black p-4 shadow-[5px_5px_0px_#000000] text-black font-black uppercase text-xs sm:text-sm flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 stroke-[3] mt-0.5" />
                  <div>
                    <span className="block font-mono text-[10px] text-black/80">
                      AUTHENTICATION FAILED //
                    </span>
                    <span>{error}</span>
                  </div>
                </div>
              )}

              <div className="space-y-5">
                {/* Username input */}
                <div>
                  <label className="block text-xs font-mono font-black uppercase tracking-wider text-black mb-1.5">
                    USERNAME
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-black">
                      <User className="w-4 h-4 text-black stroke-[2.5]" />
                    </div>
                    <input
                      type="text"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        if (error) setError(null);
                      }}
                      required
                      className="w-full pl-10 pr-3 py-2.5 bg-white border-3 border-black text-black font-mono font-bold text-sm shadow-[3px_3px_0px_#000000] focus:outline-none focus:ring-2 focus:ring-[#FFD93D]"
                    />
                  </div>
                </div>

                {/* Password input */}
                <div>
                  <label className="block text-xs font-mono font-black uppercase tracking-wider text-black mb-1.5">
                    PASSWORD
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-black">
                      <Lock className="w-4 h-4 text-black stroke-[2.5]" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (error) setError(null);
                      }}
                      required
                      className="w-full pl-10 pr-10 py-2.5 bg-white border-3 border-black text-black font-mono font-bold text-sm shadow-[3px_3px_0px_#000000] focus:outline-none focus:ring-2 focus:ring-[#FFD93D]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-black hover:text-[#FF6B6B] cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Show Password Checkbox */}
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="show-password-checkbox"
                      checked={showPassword}
                      onChange={(e) => setShowPassword(e.target.checked)}
                      className="w-4 h-4 border-2 border-black accent-black cursor-pointer"
                    />
                    <label
                      htmlFor="show-password-checkbox"
                      className="text-xs font-mono font-black uppercase text-black cursor-pointer select-none"
                    >
                      SHOW PASSWORD
                    </label>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2 space-y-3">
                <Button
                  type="submit"
                  variant="primary"
                  size="xl"
                  fullWidth
                  disabled={loading}
                  rightIcon={<ArrowRight className="w-5 h-5 stroke-[3]" />}
                >
                  {loading ? 'AUTHENTICATING...' : 'LOGIN'}
                </Button>
              </div>
            </form>

            {/* Card Footer notice */}
            <div className="border-t-4 border-black bg-[#FFFDF5] p-4 text-xs font-bold text-gray-600 font-mono uppercase flex items-center justify-between">
              <span>CCS DEPARTMENT // PSITS 2026</span>
              <button
                type="button"
                onClick={onNavigateToHome}
                className="text-black font-black hover:underline cursor-pointer"
              >
                RETURN HOME →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
