import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { AttendeeRegistration, AttendeeFilterState, AttendeeSearchState } from '../../types';
import { exportAttendeesToCSV } from '../../utils/csvUtils';
import {
  Download,
  FileSpreadsheet,
  Filter,
  CheckCircle2,
  Database,
  Calendar,
  Layers,
} from 'lucide-react';

export interface ExportAttendeesModalProps {
  isOpen: boolean;
  onClose: () => void;
  filteredAttendees: AttendeeRegistration[];
  allAttendees: AttendeeRegistration[];
  appliedFilters: AttendeeFilterState;
  searchState: AttendeeSearchState;
  onExportSuccess?: (count: number, filename: string) => void;
}

export const ExportAttendeesModal: React.FC<ExportAttendeesModalProps> = ({
  isOpen,
  onClose,
  filteredAttendees,
  allAttendees,
  appliedFilters,
  searchState,
  onExportSuccess,
}) => {
  const [exportScope, setExportScope] = useState<'FILTERED' | 'ALL'>('FILTERED');
  const [exportedInfo, setExportedInfo] = useState<{ count: number; filename: string } | null>(null);

  const isFiltered =
    filteredAttendees.length !== allAttendees.length ||
    !!searchState.query ||
    appliedFilters.course !== 'ALL' ||
    appliedFilters.section !== 'ALL' ||
    appliedFilters.year !== 'ALL' ||
    appliedFilters.registrationType !== 'ALL' ||
    appliedFilters.group !== 'ALL' ||
    appliedFilters.paymentStatus !== 'ALL';

  const targetAttendees = exportScope === 'FILTERED' ? filteredAttendees : allAttendees;

  const handleExecuteExport = () => {
    const prefix = exportScope === 'FILTERED' ? 'PSITS_Attendees_Filtered' : 'PSITS_Attendees_All';
    const result = exportAttendeesToCSV(targetAttendees, prefix);
    setExportedInfo({ count: result.count, filename: result.filename });
    if (onExportSuccess) {
      onExportSuccess(result.count, result.filename);
    }
  };

  const handleClose = () => {
    setExportedInfo(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="EXPORT ATTENDEE DATA"
      subtitle="OFFICIAL PSITS DATABASE CSV EXTRACTION // ADMIN & OFFICER UTILITY"
      badge="CSV EXPORT"
      headerVariant="yellow"
      maxWidth="2xl"
      footer={
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] font-mono font-bold text-gray-500 uppercase">
            TARGET: {targetAttendees.length} STUDENT RECORDS
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" onClick={handleClose}>
              {exportedInfo ? 'CLOSE' : 'CANCEL'}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleExecuteExport}
              disabled={targetAttendees.length === 0}
              leftIcon={<Download className="w-4 h-4 stroke-[2.5]" />}
            >
              DOWNLOAD CSV ({targetAttendees.length})
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* SUCCESS NOTIFICATION IF EXPORTED */}
        {exportedInfo && (
          <div className="p-4 bg-[#10B981] border-4 border-black shadow-[4px_4px_0px_#000000] text-black space-y-1">
            <div className="flex items-center gap-2 font-mono font-black text-sm uppercase">
              <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
              <span>CSV FILE GENERATED & DOWNLOADED SUCCESSFULLY!</span>
            </div>
            <p className="text-xs font-mono font-bold">
              Exported {exportedInfo.count} verified student records into{' '}
              <span className="underline font-black">{exportedInfo.filename}</span> with standard UTF-8 encoding.
            </p>
          </div>
        )}

        {/* EXPORT SCOPE SELECTOR */}
        <div className="space-y-3">
          <div className="font-mono text-xs font-black uppercase text-black flex items-center gap-1.5">
            <Layers className="w-4 h-4" />
            <span>SELECT EXPORT SCOPE</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* OPTION 1: CURRENT FILTERED LIST */}
            <div
              onClick={() => setExportScope('FILTERED')}
              className={`p-4 border-4 border-black cursor-pointer transition-all ${
                exportScope === 'FILTERED'
                  ? 'bg-[#FFD93D] shadow-[6px_6px_0px_#000000] -translate-y-0.5'
                  : 'bg-white shadow-[3px_3px_0px_#000000] hover:bg-[#FFFDF5]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 stroke-[2.5]" />
                  <span className="font-mono font-black text-sm uppercase">
                    CURRENT FILTERED VIEW
                  </span>
                </div>
                <Badge variant={exportScope === 'FILTERED' ? 'black' : 'yellow'} size="sm">
                  {filteredAttendees.length} RECORDS
                </Badge>
              </div>

              <p className="text-xs font-bold text-gray-800 mt-2">
                Exports only the attendees matching your active search query and applied filters.
              </p>

              {isFiltered && (
                <div className="mt-3 pt-2 border-t-2 border-black/20 flex flex-wrap gap-1">
                  {searchState.query && (
                    <span className="bg-black text-[#FFD93D] font-mono text-[9px] px-1.5 py-0.5 uppercase">
                      QUERY: "{searchState.query}"
                    </span>
                  )}
                  {appliedFilters.course !== 'ALL' && (
                    <span className="bg-white text-black border border-black font-mono text-[9px] px-1.5 py-0.5 uppercase">
                      {appliedFilters.course.replace('BS ', '')}
                    </span>
                  )}
                  {appliedFilters.group !== 'ALL' && (
                    <span className="bg-[#C4B5FD] text-black border border-black font-mono text-[9px] px-1.5 py-0.5 uppercase">
                      GROUP: {appliedFilters.group}
                    </span>
                  )}
                  {appliedFilters.paymentStatus !== 'ALL' && (
                    <span className="bg-[#FF6B6B] text-black border border-black font-mono text-[9px] px-1.5 py-0.5 uppercase">
                      PAY: {appliedFilters.paymentStatus}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* OPTION 2: COMPLETE DATABASE */}
            <div
              onClick={() => setExportScope('ALL')}
              className={`p-4 border-4 border-black cursor-pointer transition-all ${
                exportScope === 'ALL'
                  ? 'bg-[#FFD93D] shadow-[6px_6px_0px_#000000] -translate-y-0.5'
                  : 'bg-white shadow-[3px_3px_0px_#000000] hover:bg-[#FFFDF5]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 stroke-[2.5]" />
                  <span className="font-mono font-black text-sm uppercase">
                    ENTIRE DATABASE
                  </span>
                </div>
                <Badge variant={exportScope === 'ALL' ? 'black' : 'yellow'} size="sm">
                  {allAttendees.length} RECORDS
                </Badge>
              </div>

              <p className="text-xs font-bold text-gray-800 mt-2">
                Exports all verified attendee registrations currently enrolled across all courses, years, and groups.
              </p>

              <div className="mt-3 pt-2 border-t-2 border-black/20 text-[10px] font-mono font-bold text-gray-700 uppercase">
                COMPLETE EVENT ARCHIVE // 12 MYTHICAL CREATURE GROUPS
              </div>
            </div>
          </div>
        </div>

        {/* COLUMN INVENTORY CARD */}
        <div className="bg-[#FFFDF5] border-3 border-black p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-black uppercase text-black flex items-center gap-1.5">
              <FileSpreadsheet className="w-4 h-4" />
              INCLUDED CSV COLUMNS (13 ATTRIBUTES)
            </span>
            <span className="font-mono text-[10px] font-bold text-gray-600 uppercase">
              EXCEL & GOOGLE SHEETS COMPLIANT
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono font-bold">
            <div className="bg-white border border-black px-2 py-1 flex items-center gap-1.5">
              <span className="w-2 h-2 bg-black rounded-full"></span>
              <span>Student ID</span>
            </div>
            <div className="bg-white border border-black px-2 py-1 flex items-center gap-1.5">
              <span className="w-2 h-2 bg-black rounded-full"></span>
              <span>Full Name</span>
            </div>
            <div className="bg-white border border-black px-2 py-1 flex items-center gap-1.5">
              <span className="w-2 h-2 bg-black rounded-full"></span>
              <span>Course / Degree</span>
            </div>
            <div className="bg-white border border-black px-2 py-1 flex items-center gap-1.5">
              <span className="w-2 h-2 bg-black rounded-full"></span>
              <span>Section Code</span>
            </div>
            <div className="bg-white border border-black px-2 py-1 flex items-center gap-1.5">
              <span className="w-2 h-2 bg-black rounded-full"></span>
              <span>Year Level</span>
            </div>
            <div className="bg-white border border-black px-2 py-1 flex items-center gap-1.5">
              <span className="w-2 h-2 bg-black rounded-full"></span>
              <span>Registration Type</span>
            </div>
            <div className="bg-white border border-black px-2 py-1 flex items-center gap-1.5">
              <span className="w-2 h-2 bg-[#10B981] rounded-full"></span>
              <span>Amount Paid (₱)</span>
            </div>
            <div className="bg-white border border-black px-2 py-1 flex items-center gap-1.5">
              <span className="w-2 h-2 bg-black rounded-full"></span>
              <span>Expected Amount</span>
            </div>
            <div className="bg-white border border-black px-2 py-1 flex items-center gap-1.5">
              <span className="w-2 h-2 bg-black rounded-full"></span>
              <span>Payment Status</span>
            </div>
            <div className="bg-white border border-black px-2 py-1 flex items-center gap-1.5">
              <span className="w-2 h-2 bg-black rounded-full"></span>
              <span>Date Paid</span>
            </div>
            <div className="bg-white border border-black px-2 py-1 flex items-center gap-1.5">
              <span className="w-2 h-2 bg-[#C4B5FD] rounded-full"></span>
              <span>Mythical Group</span>
            </div>
            <div className="bg-white border border-black px-2 py-1 flex items-center gap-1.5">
              <span className="w-2 h-2 bg-black rounded-full"></span>
              <span>Registration Status</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
