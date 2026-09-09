import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Lock, User, KeyRound, ShieldCheck, ArrowRight } from 'lucide-react';

export interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [identifier, setIdentifier] = useState('');
  const [passcode, setPasscode] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !passcode) return;
    setIsSuccess(true);
  };

  const handleReset = () => {
    setIsSuccess(false);
    setIdentifier('');
    setPasscode('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      title={isSuccess ? 'ACCESS GRANTED' : 'SYSTEM LOGIN'}
      subtitle={
        isSuccess
          ? 'SESSION INITIALIZED // STUDENT & ADMIN PORTAL'
          : 'PSITS CCS DEPARTMENT // COLLEGE OF COMPUTER STUDIES'
      }
      badge="SECURITY GATE"
      headerVariant="black"
      maxWidth="md"
    >
      {isSuccess ? (
        <div className="space-y-5 text-center py-4">
          <div className="w-16 h-16 mx-auto bg-[#C4B5FD] border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_#000000]">
            <ShieldCheck className="w-10 h-10 text-black stroke-[2.5]" />
          </div>

          <div className="space-y-1">
            <span className="font-mono text-xs font-black uppercase bg-[#FFD93D] px-2 py-0.5 border border-black text-black">
              USER: {identifier}
            </span>
            <h3 className="text-2xl font-black uppercase tracking-tight text-black">
              AUTHENTICATION SIMULATED
            </h3>
            <p className="text-xs font-bold text-gray-700 uppercase">
              Phase 1 visual gateway verified. Full Firebase Authentication & role-based access control
              will be connected in Phase 2.
            </p>
          </div>

          <Button variant="dark" size="md" onClick={handleReset} fullWidth>
            RETURN TO APP
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-[#FFD93D] border-3 border-black p-3 text-xs font-bold uppercase">
            <span className="font-mono font-black text-black block mb-0.5">
              NOTICE // PHASE 1 STUB
            </span>
            <span>Enter any Student ID or Admin handle to test the portal interface.</span>
          </div>

          <Input
            label="STUDENT ID / ADMIN HANDLE"
            placeholder="e.g. 2024-00129 or admin"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            leftIcon={<User className="w-4 h-4 stroke-[2.5]" />}
          />

          <Input
            label="ACCESS PIN / PASSCODE"
            type="password"
            placeholder="••••••••"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            required
            leftIcon={<KeyRound className="w-4 h-4 stroke-[2.5]" />}
          />

          <div className="pt-2 space-y-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              rightIcon={<ArrowRight className="w-5 h-5 stroke-[3]" />}
            >
              AUTHENTICATE →
            </Button>
            <Button type="button" variant="secondary" size="md" fullWidth onClick={handleReset}>
              CANCEL
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
