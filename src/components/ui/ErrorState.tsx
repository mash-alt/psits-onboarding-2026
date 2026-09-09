import React from 'react';
import { Button } from './Button';
import { AlertOctagon, RotateCcw } from 'lucide-react';

export interface ErrorStateProps {
  title?: string;
  errorCode?: string;
  message?: string;
  onRetry?: () => void;
  retryText?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'SYSTEM PROTOCOL EXCEPTION',
  errorCode = 'ERR_NETWORK_TIMEOUT_503',
  message = 'An interrupt occurred while communicating with the event dispatch server. The attendee stream could not be loaded.',
  onRetry,
  retryText = 'REBOOT CONNECTION',
}) => {
  return (
    <div className="w-full bg-[#FFFFFF] border-8 border-black shadow-[10px_10px_0px_#FF6B6B] my-6 relative overflow-hidden">
      {/* Top Hazard Bar */}
      <div className="h-4 bg-hazard-stripes-red border-b-4 border-black"></div>

      <div className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <div className="w-14 h-14 shrink-0 bg-[#FF6B6B] border-4 border-black flex items-center justify-center text-black shadow-[4px_4px_0px_#000000]">
            <AlertOctagon className="w-8 h-8 stroke-[3]" />
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-[#FF6B6B] text-black font-mono text-xs px-2 py-0.5 font-black uppercase border-2 border-black">
                CRITICAL WARNING
              </span>
              <span className="font-mono text-xs font-bold text-gray-700">
                CODE: [{errorCode}]
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black">
              {title}
            </h3>

            <p className="text-sm font-bold text-gray-800 uppercase tracking-wide">
              {message}
            </p>

            {onRetry && (
              <div className="pt-3">
                <Button
                  variant="accent"
                  size="md"
                  onClick={onRetry}
                  leftIcon={<RotateCcw className="w-4 h-4 stroke-[3]" />}
                >
                  {retryText}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-black text-[#FFFDF5] text-[10px] font-mono font-bold px-4 py-1 flex justify-between border-t-4 border-black uppercase">
        <span>FAULT DETECTOR // PSITS BUGTRAC</span>
        <span>RESTART RECOMMENDED</span>
      </div>
    </div>
  );
};
