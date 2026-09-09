import React, { useState, useEffect } from 'react';
import { Officer } from '../../types';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { X, UserPlus, Save, AlertCircle, Shield } from 'lucide-react';

export interface AddOfficerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; email: string; role: 'ADMIN' | 'OFFICER'; status?: 'ACTIVE' | 'DISABLED' }) => void;
  initialOfficer?: Officer | null;
}

export const AddOfficerModal: React.FC<AddOfficerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialOfficer,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'OFFICER'>('OFFICER');
  const [status, setStatus] = useState<'ACTIVE' | 'DISABLED'>('ACTIVE');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialOfficer) {
      setName(initialOfficer.name);
      setEmail(initialOfficer.email);
      setRole(initialOfficer.role);
      setStatus(initialOfficer.status);
    } else {
      setName('');
      setEmail('');
      setRole('OFFICER');
      setStatus('ACTIVE');
    }
    setError('');
  }, [initialOfficer, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('OFFICER NAME IS REQUIRED');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('VALID EMAIL ADDRESS IS REQUIRED');
      return;
    }

    onSave({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      status,
    });
    onClose();
  };

  const isEditing = !!initialOfficer;

  return (
    <div
      id="officer-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="officer-modal-card"
        className="bg-[#FFFFFF] border-4 sm:border-8 border-black shadow-[12px_12px_0px_#000000] w-full max-w-lg my-8 relative animate-fadeIn overflow-hidden"
      >
        {/* Header */}
        <div className="bg-black text-[#FFD93D] p-4 flex items-center justify-between border-b-4 border-black font-mono">
          <div className="flex items-center gap-2">
            <span className="bg-[#FFD93D] text-black font-black text-xs px-2 py-0.5 border-2 border-black">
              {isEditing ? 'EDIT OFFICER' : 'NEW OFFICER'}
            </span>
            <span className="text-xs font-bold text-white uppercase">
              {isEditing ? `ID: ${initialOfficer.id}` : 'AUTHORIZATION ENROLLMENT'}
            </span>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1 bg-[#FF6B6B] text-black border-2 border-black hover:bg-[#ff5252] cursor-pointer transition-all"
          >
            <X className="w-5 h-5 stroke-[3]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border-4 border-[#FF6B6B] text-black font-mono text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#FF6B6B] shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Input
            label="OFFICER FULL NAME"
            placeholder="e.g. Marc Joshua Dizon"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            helperText="OFFICIAL PSITS OFFICER IDENTIFIER"
          />

          <Input
            label="EMAIL ADDRESS"
            type="email"
            placeholder="e.g. officer@psits.ccs.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            helperText="USED FOR ADMINISTRATIVE LOGIN AND NOTIFICATIONS"
          />

          <Select
            label="SYSTEM ROLE ASSIGNMENT"
            value={role}
            onChange={(e) => setRole(e.target.value as 'ADMIN' | 'OFFICER')}
            options={[
              { value: 'OFFICER', label: 'OFFICER (OPERATIONAL ACCESS)' },
              { value: 'ADMIN', label: 'ADMIN (FULL SYSTEM CONTROL)' },
            ]}
            helperText="OFFICERS CANNOT MANAGE OTHER OFFICERS OR SYSTEM SETTINGS"
          />

          {isEditing && (
            <Select
              label="ACCOUNT STATUS"
              value={status}
              onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'DISABLED')}
              options={[
                { value: 'ACTIVE', label: 'ACTIVE (ENABLED)' },
                { value: 'DISABLED', label: 'DISABLED (ACCESS SUSPENDED)' },
              ]}
            />
          )}

          <div className="pt-3 border-t-2 border-black flex items-center justify-end gap-3">
            <Button variant="outline" size="md" type="button" onClick={onClose}>
              CANCEL
            </Button>
            <Button
              variant="primary"
              size="md"
              type="submit"
              leftIcon={
                isEditing ? (
                  <Save className="w-4 h-4 stroke-[2.5]" />
                ) : (
                  <UserPlus className="w-4 h-4 stroke-[2.5]" />
                )
              }
            >
              {isEditing ? 'SAVE CHANGES' : 'CREATE OFFICER'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
