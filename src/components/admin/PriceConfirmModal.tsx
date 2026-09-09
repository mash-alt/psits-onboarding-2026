import React from 'react';
import { Button } from '../ui/Button';
import { AlertTriangle, DollarSign, X, Check, ShieldAlert } from 'lucide-react';

export interface PriceConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  oldEarlyBird: number;
  newEarlyBird: number;
  oldRegular: number;
  newRegular: number;
  currency: string;
  totalHistoricalAttendees: number;
}

export const PriceConfirmModal: React.FC<PriceConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  oldEarlyBird,
  newEarlyBird,
  oldRegular,
  newRegular,
  currency,
  totalHistoricalAttendees,
}) => {
  if (!isOpen) return null;

  const earlyBirdChanged = oldEarlyBird !== newEarlyBird;
  const regularChanged = oldRegular !== newRegular;

  return (
    <div
      id="price-confirm-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="price-confirm-modal-card"
        className="bg-[#FFFFFF] border-4 sm:border-8 border-black shadow-[12px_12px_0px_#000000] w-full max-w-lg my-8 relative animate-fadeIn overflow-hidden"
      >
        {/* Warning Banner Header */}
        <div className="bg-[#FF6B6B] text-black p-4 flex items-center justify-between border-b-4 border-black font-mono">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 stroke-[3]" />
            <span className="font-black text-sm uppercase tracking-wider">
              CONFIRM REGISTRATION PRICE CHANGE
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1 bg-black text-white hover:bg-white hover:text-black border-2 border-black cursor-pointer transition-all"
          >
            <X className="w-5 h-5 stroke-[3]" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5">
          <div className="border-2 border-black bg-[#FFFDF5] p-4 font-mono text-xs space-y-3">
            <div className="font-black uppercase text-black text-sm flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 stroke-[3] text-black" />
              PROPOSED PRICE MODIFICATIONS
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-black/20">
              <div className="p-2.5 bg-white border-2 border-black">
                <span className="text-gray-500 uppercase block text-[10px] font-bold">
                  EARLY BIRD FEE
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="line-through text-gray-500 font-bold">
                    ₱{oldEarlyBird}
                  </span>
                  <span className="font-black text-black text-base">
                    &rarr; ₱{newEarlyBird} {currency}
                  </span>
                </div>
                {earlyBirdChanged && (
                  <span className="text-[10px] font-black text-[#FF6B6B] uppercase block mt-1">
                    [MODIFIED]
                  </span>
                )}
              </div>

              <div className="p-2.5 bg-white border-2 border-black">
                <span className="text-gray-500 uppercase block text-[10px] font-bold">
                  REGULAR FEE
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="line-through text-gray-500 font-bold">
                    ₱{oldRegular}
                  </span>
                  <span className="font-black text-black text-base">
                    &rarr; ₱{newRegular} {currency}
                  </span>
                </div>
                {regularChanged && (
                  <span className="text-[10px] font-black text-[#FF6B6B] uppercase block mt-1">
                    [MODIFIED]
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Historical Integrity Guarantee Notice */}
          <div className="p-4 bg-[#FFD93D] border-4 border-black text-black space-y-2">
            <div className="flex items-center gap-2 font-mono font-black text-xs uppercase">
              <ShieldAlert className="w-4 h-4 stroke-[3]" />
              HISTORICAL FINANCIAL INTEGRITY GUARANTEE
            </div>
            <p className="text-xs font-mono font-bold leading-relaxed">
              Updating these prices will apply <strong>ONLY to future registrations</strong>. All{' '}
              <strong>{totalHistoricalAttendees} historical registrations</strong> already in the
              database will preserve their stored amounts and will NOT be modified.
            </p>
          </div>

          <p className="text-xs font-mono text-gray-600 font-bold">
            Are you sure you want to commit these fee updates to the live registration system?
          </p>

          {/* Action Buttons */}
          <div className="pt-3 border-t-2 border-black flex items-center justify-end gap-3">
            <Button variant="outline" size="md" onClick={onClose}>
              CANCEL
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={onConfirm}
              leftIcon={<Check className="w-4 h-4 stroke-[3]" />}
            >
              CONFIRM & APPLY NEW PRICES
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
