import React from 'react';
import { Button } from './Button';
import { SearchX, ArrowRight } from 'lucide-react';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'NO RECORDS FOUND IN ARCHIVE',
  description = 'The requested query returned 0 active attendees or records. Try broadening your filter parameters.',
  actionText = 'RESET FILTERS',
  onAction,
  icon,
}) => {
  return (
    <div className="w-full bg-[#FFFFFF] border-4 border-black p-8 sm:p-12 text-center shadow-[8px_8px_0px_#000000] relative overflow-hidden my-6">
      <div className="max-w-md mx-auto flex flex-col items-center gap-4">
        <div className="w-16 h-16 bg-[#FFD93D] border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_#000000] rotate-3">
          {icon || <SearchX className="w-8 h-8 stroke-[2.5]" />}
        </div>

        <div className="inline-block bg-black text-[#FFD93D] font-mono text-xs px-2 py-0.5 font-black uppercase">
          NULL_SET // STATUS 404
        </div>

        <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black">
          {title}
        </h3>

        <p className="text-sm font-bold text-gray-700 uppercase tracking-wide">
          {description}
        </p>

        {actionText && onAction && (
          <div className="pt-2">
            <Button
              variant="primary"
              size="md"
              onClick={onAction}
              rightIcon={<ArrowRight className="w-4 h-4 stroke-[3]" />}
            >
              {actionText}
            </Button>
          </div>
        )}
      </div>

      {/* Decorative corner grid marks */}
      <div className="absolute top-2 left-2 text-xs font-mono font-black text-gray-400 select-none">
        [--EMPTY--]
      </div>
      <div className="absolute bottom-2 right-2 text-xs font-mono font-black text-gray-400 select-none">
        0x000000
      </div>
    </div>
  );
};
