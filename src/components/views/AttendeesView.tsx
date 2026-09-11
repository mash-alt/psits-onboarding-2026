import React, { useState } from 'react';
import { PageHeader } from '../ui/PageHeader';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { MythicalGroupBadge } from '../ui/MythicalGroupBadge';
import { AttendeeDetailModal } from '../modals/AttendeeDetailModal';
import { EditAttendeeModal } from '../modals/EditAttendeeModal';
import { ExportAttendeesModal } from '../modals/ExportAttendeesModal';
import { ImportAttendeesModal } from '../modals/ImportAttendeesModal';
import { OFFICIAL_MYTHICAL_GROUPS } from '../../data/mythicalGroups';
import { AttendeeRegistration } from '../../types';
import { useAttendeeDatabase } from '../../hooks/useAttendeeDatabase';
import { generateAttendeeCSVTemplate, exportAttendeesToCSV } from '../../utils/csvUtils';
import { useAuth } from '../../context/AuthContext';
import {
  Search,
  Filter,
  UserPlus,
  Users,
  Eye,
  Edit3,
  RotateCcw,
  Check,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  Calendar,
  Layers,
  Sparkles,
  Download,
  Upload,
  FileSpreadsheet,
  FileText,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react';

export interface AttendeesViewProps {
  onOpenRegister: () => void;
  selectedGroupFilter?: string | null;
  onClearGroupFilter?: () => void;
}

export const AttendeesView: React.FC<AttendeesViewProps> = ({
  onOpenRegister,
  selectedGroupFilter = null,
  onClearGroupFilter,
}) => {
  const {
    attendees,
    sortedAttendees,
    paginatedAttendees,
    filteredCount,
    totalCount,
    statistics,
    searchState,
    setSearchState,
    draftFilters,
    setDraftFilters,
    appliedFilters,
    applyDraftFilters,
    clearAllFilters,
    setSingleFilter,
    sortOption,
    setSortOption,
    pagination,
    setPagination,
    totalPages,
    currentPageSafe,
    availableSections,
    activeFiltersCount,
    handleUpdateAttendee,
    handleUpdateAttendeeGroup,
    handleDeleteAttendee,
    handleImportAttendees,
  } = useAttendeeDatabase(selectedGroupFilter);

  // Modal inspection states
  const [selectedAttendeeForDetail, setSelectedAttendeeForDetail] =
    useState<AttendeeRegistration | null>(null);
  const [selectedAttendeeForEdit, setSelectedAttendeeForEdit] =
    useState<AttendeeRegistration | null>(null);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState<boolean>(true);

  // CSV Export & Import modal states
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const { role: currentRole, isAdmin, isOfficer } = useAuth();

  const handleExportSuccess = (count: number, filename: string) => {
    setToastMessage(`CSV EXPORT SUCCESSFUL: ${count} attendee records saved to ${filename}`);
  };

  const handleImportSuccessCallback = async (
    importedList: AttendeeRegistration[],
    overwrite: boolean
  ) => {
    const stats = await handleImportAttendees(importedList, overwrite);
    setToastMessage(
      `CSV IMPORT COMPLETE: +${stats.added} new attendees added, ${stats.updated} records updated (${stats.total} total in database).`
    );
    return stats;
  };

  const handleDownloadTemplateOnly = () => {
    generateAttendeeCSVTemplate();
    setToastMessage('CSV TEMPLATE DOWNLOADED: PSITS_Attendee_Import_Template.csv');
  };

  // Search input handler
  const handleSearchChange = (val: string) => {
    setSearchState((prev) => ({ ...prev, query: val }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleSearchFieldChange = (field: string) => {
    setSearchState((prev) => ({
      ...prev,
      field: field as 'ALL' | 'STUDENT_ID' | 'NAME' | 'COURSE' | 'SECTION',
    }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  // Quick stats card click shortcuts
  const handleStatClick = (type: 'ALL' | 'PAID' | 'UNPAID' | 'EARLY_BIRD' | 'REGULAR') => {
    if (type === 'ALL') {
      clearAllFilters();
    } else if (type === 'PAID') {
      setSingleFilter('paymentStatus', 'PAID');
    } else if (type === 'UNPAID') {
      setSingleFilter('paymentStatus', 'UNPAID');
    } else if (type === 'EARLY_BIRD') {
      setSingleFilter('registrationType', 'EARLY BIRD');
    } else if (type === 'REGULAR') {
      setSingleFilter('registrationType', 'REGULAR');
    }
  };

  const handleOpenEditFromDetail = (attendee: AttendeeRegistration) => {
    setSelectedAttendeeForDetail(null);
    setSelectedAttendeeForEdit(attendee);
  };

  const handleResetFilters = () => {
    clearAllFilters();
    if (onClearGroupFilter) onClearGroupFilter();
  };

  const handleDelete = async (attendee: AttendeeRegistration) => {
    const confirmed = window.confirm(
      `Delete ${attendee.fullName} (${attendee.studentId})? This cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await handleDeleteAttendee(attendee);
      setSelectedAttendeeForDetail(null);
      setSelectedAttendeeForEdit(null);
      setToastMessage(`ATTENDEE DELETED: ${attendee.studentId}`);
    } catch (err) {
      console.error('Failed to delete attendee:', err);
      setToastMessage('UNABLE TO DELETE ATTENDEE. PLEASE TRY AGAIN.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* 1. PAGE HEADER */}
      <PageHeader
        tag="COLLEGE OF COMPUTER STUDIES // CCS DEPARTMENT"
        title="ATTENDEE"
        titleAccent="DATABASE"
        description="Searchable verified attendee database, registration records, payment ledger, and Mythical Creature Group rosters for the PSITS Acquaintance Party."
        badgeText="12 MYTHICAL CREATURE GROUPS"
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setIsExportModalOpen(true)}
              title="Export attendee database to CSV spreadsheet"
              leftIcon={<Download className="w-4 h-4 stroke-[2.5]" />}
            >
              EXPORT CSV
            </Button>

            <Button
              variant="violet"
              size="md"
              onClick={() => setIsImportModalOpen(true)}
              title="Bulk import attendees from formatted CSV spreadsheet"
              leftIcon={<Upload className="w-4 h-4 stroke-[2.5]" />}
            >
              IMPORT CSV
            </Button>

            <Button
              variant="primary"
              size="md"
              onClick={onOpenRegister}
              leftIcon={<UserPlus className="w-4 h-4 stroke-[2.5]" />}
            >
              REGISTER
            </Button>
          </div>
        }
      />

      {/* DISMISSIBLE TOAST NOTIFICATION BANNER */}
      {toastMessage && (
        <div className="p-4 bg-[#10B981] border-4 border-black shadow-[5px_5px_0px_#000000] text-black flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2.5 font-mono font-black text-xs sm:text-sm uppercase">
            <CheckCircle2 className="w-5 h-5 stroke-[2.5] shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            aria-label="Dismiss message"
            className="p-1 hover:bg-black hover:text-[#10B981] border-2 border-black font-black transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      )}

      {isOfficer && <div className="bg-[#FFFDF5] border-4 border-black p-4 shadow-[5px_5px_0px_#000000] flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black text-[#FFD93D] border-2 border-black flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-black uppercase text-black">
                OFFICER & ADMIN DATA SUITE
              </span>
              <span className="bg-[#FFD93D] border border-black font-mono text-[9px] font-black uppercase px-1.5 py-0.2">
                ACTIVE ACCESS: {currentRole}
              </span>
            </div>
            <p className="text-[11px] font-mono font-bold text-gray-700 uppercase">
              Bulk CSV export, Excel ingestion, sample format template, and database sync.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const res = exportAttendeesToCSV(sortedAttendees, 'PSITS_Attendees_Filtered');
              handleExportSuccess(res.count, res.filename);
            }}
            title="Download CSV of current filtered attendees list"
            leftIcon={<Download className="w-3.5 h-3.5 stroke-[2.5]" />}
          >
            EXPORT CURRENT ({filteredCount})
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const res = exportAttendeesToCSV(attendees, 'PSITS_Attendees_All');
              handleExportSuccess(res.count, res.filename);
            }}
            title="Download complete attendee database CSV"
            leftIcon={<Download className="w-3.5 h-3.5 stroke-[2.5]" />}
          >
            EXPORT ALL ({totalCount})
          </Button>

          <Button
            variant="violet"
            size="sm"
            onClick={() => setIsImportModalOpen(true)}
            leftIcon={<Upload className="w-3.5 h-3.5 stroke-[2.5]" />}
          >
            IMPORT CSV
          </Button>

          <button
            onClick={handleDownloadTemplateOnly}
            title="Download blank template CSV"
            className="text-[10px] font-mono font-black uppercase underline hover:text-[#FF6B6B] px-1 cursor-pointer"
          >
            [GET TEMPLATE]
          </button>
        </div>
      </div>}

      {/* 2. STATISTICS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* TOTAL ATTENDEES */}
        <div
          onClick={() => handleStatClick('ALL')}
          className="bg-black text-[#FFD93D] border-4 border-black p-3.5 sm:p-4 shadow-[4px_4px_0px_#000000] cursor-pointer hover:-translate-y-0.5 transition-transform"
        >
          <div className="font-mono text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-gray-400">
            TOTAL ATTENDEES
          </div>
          <div className="text-3xl sm:text-4xl font-black font-mono mt-1 text-[#FFD93D]">
            {statistics.totalAttendees}
          </div>
          <div className="text-[10px] font-mono font-bold text-gray-400 mt-1 uppercase">
            VERIFIED STUDENTS
          </div>
        </div>

        {/* PAID */}
        <div
          onClick={() => handleStatClick('PAID')}
          className="bg-[#10B981] text-black border-4 border-black p-3.5 sm:p-4 shadow-[4px_4px_0px_#000000] cursor-pointer hover:-translate-y-0.5 transition-transform"
        >
          <div className="font-mono text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-black">
            PAID
          </div>
          <div className="text-3xl sm:text-4xl font-black font-mono mt-1 text-black">
            {statistics.paid}
          </div>
          <div className="text-[10px] font-mono font-black text-black/80 mt-1 uppercase">
            FEES SETTLED
          </div>
        </div>

        {/* UNPAID */}
        <div
          onClick={() => handleStatClick('UNPAID')}
          className="bg-[#FF6B6B] text-black border-4 border-black p-3.5 sm:p-4 shadow-[4px_4px_0px_#000000] cursor-pointer hover:-translate-y-0.5 transition-transform"
        >
          <div className="font-mono text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-black">
            UNPAID
          </div>
          <div className="text-3xl sm:text-4xl font-black font-mono mt-1 text-black">
            {statistics.unpaid}
          </div>
          <div className="text-[10px] font-mono font-black text-black/80 mt-1 uppercase">
            PENDING PAYMENT
          </div>
        </div>

        {/* EARLY BIRD */}
        <div
          onClick={() => handleStatClick('EARLY_BIRD')}
          className="bg-[#C4B5FD] text-black border-4 border-black p-3.5 sm:p-4 shadow-[4px_4px_0px_#000000] cursor-pointer hover:-translate-y-0.5 transition-transform"
        >
          <div className="font-mono text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-black">
            EARLY BIRD
          </div>
          <div className="text-3xl sm:text-4xl font-black font-mono mt-1 text-black">
            {statistics.earlyBird}
          </div>
          <div className="text-[10px] font-mono font-black text-black/80 mt-1 uppercase">
            ₱350 TIER
          </div>
        </div>

        {/* REGULAR */}
        <div
          onClick={() => handleStatClick('REGULAR')}
          className="bg-[#FFFDF5] text-black border-4 border-black p-3.5 sm:p-4 shadow-[4px_4px_0px_#000000] cursor-pointer hover:-translate-y-0.5 transition-transform"
        >
          <div className="font-mono text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-black">
            REGULAR
          </div>
          <div className="text-3xl sm:text-4xl font-black font-mono mt-1 text-black">
            {statistics.regular}
          </div>
          <div className="text-[10px] font-mono font-black text-gray-700 mt-1 uppercase">
            ₱450 TIER
          </div>
        </div>

        {/* 12 GROUPS */}
        <div
          onClick={() => clearAllFilters()}
          className="bg-[#FFD93D] text-black border-4 border-black p-3.5 sm:p-4 shadow-[4px_4px_0px_#000000] cursor-pointer hover:-translate-y-0.5 transition-transform"
        >
          <div className="font-mono text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-black">
            12 GROUPS
          </div>
          <div className="text-3xl sm:text-4xl font-black font-mono mt-1 text-black">
            12
          </div>
          <div className="text-[10px] font-mono font-black text-black/80 mt-1 uppercase">
            ACTIVE ROSTERS
          </div>
        </div>
      </div>

      {/* 3. ADVANCED SEARCH & FILTER CONTROL PANEL */}
      <div className="bg-[#FFFFFF] border-4 border-black shadow-[8px_8px_0px_#000000] overflow-hidden">
        {/* Header Bar */}
        <div className="bg-black text-[#FFD93D] p-3 sm:p-4 flex flex-wrap items-center justify-between gap-2 font-mono text-xs font-black uppercase border-b-4 border-black">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 stroke-[3]" />
            <span>ATTENDEE DATABASE SEARCH & ADVANCED FILTERS</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <span className="bg-[#FFD93D] text-black px-2 py-0.5">
              {filteredCount} MATCHES OF {totalCount} RECORDS
            </span>
            <button
              onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
              className="text-[#FFFDF5] hover:text-[#FFD93D] underline cursor-pointer text-[11px]"
            >
              {isFilterPanelOpen ? '[COLLAPSE FILTERS]' : '[EXPAND FILTERS]'}
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-5">
          {/* SEARCH BAR ROW */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4">
            <div className="md:col-span-8">
              <Input
                label="SEARCH BY STUDENT ID, NAME, COURSE, OR SECTION"
                placeholder="Type exact 8-digit Student ID (e.g. 84920184), Name, Course, or Section..."
                value={searchState.query}
                onChange={(e) => handleSearchChange(e.target.value)}
                leftIcon={<Search className="w-4 h-4 stroke-[2.5]" />}
                helperText="SEARCH ENGINE SUPPORTS EXACT 8-DIGIT STUDENT ID AS WELL AS PARTIAL MATCHES"
              />
            </div>

            <div className="md:col-span-4">
              <Select
                label="SEARCH SCOPE / TARGET FIELD"
                value={searchState.field}
                onChange={(e) => handleSearchFieldChange(e.target.value)}
                options={[
                  { value: 'ALL', label: 'ALL FIELDS (ID, NAME, COURSE, SECTION)' },
                  { value: 'STUDENT_ID', label: 'STUDENT ID ONLY (8 DIGITS)' },
                  { value: 'NAME', label: 'STUDENT FULL NAME' },
                  { value: 'COURSE', label: 'COURSE / PROGRAM' },
                  { value: 'SECTION', label: 'SECTION CODE' },
                ]}
              />
            </div>
          </div>

          {/* ADVANCED FILTERS GRID (Expandable) */}
          {isFilterPanelOpen && (
            <div className="bg-[#FFFDF5] border-2 border-black p-4 space-y-4">
              <div className="flex items-center justify-between border-b-2 border-black/20 pb-2">
                <span className="font-mono text-xs font-black uppercase text-black flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5" />
                  ADVANCED FILTER CONTROLS
                </span>
                <span className="text-[11px] font-mono text-gray-500 font-bold">
                  APPLY MULTIPLE FILTERS SIMULTANEOUSLY
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* 1. Course */}
                <Select
                  label="COURSE / PROGRAM"
                  value={draftFilters.course}
                  onChange={(e) =>
                    setDraftFilters((prev) => ({ ...prev, course: e.target.value }))
                  }
                  options={[
                    { value: 'ALL', label: 'ALL COURSES' },
                    { value: 'BS Information Technology', label: 'BS Information Technology' },
                    { value: 'BS Computer Science', label: 'BS Computer Science' },
                    { value: 'BS Information Systems', label: 'BS Information Systems' },
                  ]}
                />

                {/* 2. Section */}
                <Select
                  label="SECTION"
                  value={draftFilters.section}
                  onChange={(e) =>
                    setDraftFilters((prev) => ({ ...prev, section: e.target.value }))
                  }
                  options={[
                    { value: 'ALL', label: 'ALL SECTIONS' },
                    ...availableSections.map((sec) => ({
                      value: sec,
                      label: `SECTION ${sec}`,
                    })),
                  ]}
                />

                {/* 3. Year Level */}
                <Select
                  label="YEAR LEVEL"
                  value={draftFilters.year}
                  onChange={(e) =>
                    setDraftFilters((prev) => ({ ...prev, year: e.target.value }))
                  }
                  options={[
                    { value: 'ALL', label: 'ALL YEAR LEVELS' },
                    { value: '1st Year', label: '1ST YEAR' },
                    { value: '2nd Year', label: '2ND YEAR' },
                    { value: '3rd Year', label: '3RD YEAR' },
                    { value: '4th Year', label: '4TH YEAR' },
                  ]}
                />

                {/* 4. Registration Type */}
                <Select
                  label="REGISTRATION TYPE"
                  value={draftFilters.registrationType}
                  onChange={(e) =>
                    setDraftFilters((prev) => ({
                      ...prev,
                      registrationType: e.target.value,
                    }))
                  }
                  options={[
                    { value: 'ALL', label: 'ALL TYPES (EARLY & REGULAR)' },
                    { value: 'EARLY BIRD', label: 'EARLY BIRD (₱350)' },
                    { value: 'REGULAR', label: 'REGULAR (₱450)' },
                  ]}
                />

                {/* 5. Mythical Creature Group */}
                <Select
                  label="MYTHICAL CREATURE GROUP"
                  value={draftFilters.group}
                  onChange={(e) =>
                    setDraftFilters((prev) => ({ ...prev, group: e.target.value }))
                  }
                  options={[
                    { value: 'ALL', label: 'ALL 12 MYTHICAL GROUPS' },
                    { value: 'UNASSIGNED', label: 'PENDING ASSIGNMENT' },
                    ...OFFICIAL_MYTHICAL_GROUPS.map((g) => ({
                      value: g.name,
                      label: `${g.symbol} ${g.name.toUpperCase()} GROUP`,
                    })),
                  ]}
                />

                {/* 6. Payment Status */}
                <Select
                  label="PAYMENT STATUS"
                  value={draftFilters.paymentStatus}
                  onChange={(e) =>
                    setDraftFilters((prev) => ({
                      ...prev,
                      paymentStatus: e.target.value,
                    }))
                  }
                  options={[
                    { value: 'ALL', label: 'ALL PAYMENT STATUSES' },
                    { value: 'PAID', label: 'PAID ONLY' },
                    { value: 'UNPAID', label: 'UNPAID ONLY' },
                    { value: 'PENDING', label: 'PENDING VERIFICATION' },
                  ]}
                />

                {/* 7. Date Paid */}
                <Input
                  label="DATE PAID"
                  placeholder="e.g. 2026-09 or 2026-09-02"
                  value={draftFilters.datePaid}
                  onChange={(e) =>
                    setDraftFilters((prev) => ({ ...prev, datePaid: e.target.value }))
                  }
                  leftIcon={<Calendar className="w-3.5 h-3.5" />}
                  helperText="FILTER BY SPECIFIC DATE OR MONTH"
                />

                {/* Filter Action Buttons */}
                <div className="flex flex-col justify-end space-y-2">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="primary"
                      size="md"
                      className="flex-1"
                      onClick={applyDraftFilters}
                      leftIcon={<Check className="w-4 h-4 stroke-[3]" />}
                    >
                      APPLY FILTERS
                    </Button>

                    <Button
                      variant="outline"
                      size="md"
                      onClick={handleResetFilters}
                      title="Clear all active and draft filters"
                    >
                      CLEAR FILTERS
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ACTIVE FILTER CHIPS & CONTROLS BAR */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t-2 border-black/10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono font-black text-gray-600 uppercase">
                ACTIVE FILTERS ({activeFiltersCount}):
              </span>

              {searchState.query && (
                <Badge variant="yellow" size="sm">
                  QUERY: "{searchState.query}"
                </Badge>
              )}
              {appliedFilters.course !== 'ALL' && (
                <Badge variant="white" size="sm">
                  COURSE: {appliedFilters.course.replace('BS ', '')}
                </Badge>
              )}
              {appliedFilters.section !== 'ALL' && (
                <Badge variant="white" size="sm">
                  SEC: {appliedFilters.section}
                </Badge>
              )}
              {appliedFilters.year !== 'ALL' && (
                <Badge variant="white" size="sm">
                  YEAR: {appliedFilters.year}
                </Badge>
              )}
              {appliedFilters.registrationType !== 'ALL' && (
                <Badge variant="yellow" size="sm">
                  TYPE: {appliedFilters.registrationType}
                </Badge>
              )}
              {appliedFilters.group !== 'ALL' && (
                <Badge variant="violet" size="sm">
                  GROUP: {appliedFilters.group}
                </Badge>
              )}
              {appliedFilters.paymentStatus !== 'ALL' && (
                <Badge
                  variant={appliedFilters.paymentStatus === 'PAID' ? 'yellow' : 'red'}
                  size="sm"
                >
                  PAYMENT: {appliedFilters.paymentStatus}
                </Badge>
              )}
              {appliedFilters.datePaid && (
                <Badge variant="white" size="sm">
                  PAID: {appliedFilters.datePaid}
                </Badge>
              )}

              {activeFiltersCount === 0 && (
                <span className="text-xs font-mono font-bold text-gray-500">
                  NO ACTIVE FILTERS (SHOWING ALL STUDENTS)
                </span>
              )}

              {activeFiltersCount > 0 && (
                <button
                  onClick={handleResetFilters}
                  className="text-[11px] font-mono font-black text-[#FF6B6B] uppercase hover:underline ml-2 cursor-pointer"
                >
                  [CLEAR ALL]
                </button>
              )}
            </div>

            {/* SORTING & PAGE SIZE BAR */}
            <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span className="font-bold uppercase text-black">SORT:</span>
                <select
                  value={sortOption}
                  onChange={(e) =>
                    setSortOption(e.target.value as typeof sortOption)
                  }
                  className="bg-white border-2 border-black px-2.5 py-1 text-xs font-black uppercase shadow-[2px_2px_0px_#000000] focus:outline-none"
                >
                  <option value="STUDENT_ID_ASC">STUDENT ID (ASCENDING)</option>
                  <option value="STUDENT_ID_DESC">STUDENT ID (DESCENDING)</option>
                  <option value="NAME_AZ">NAME A-Z</option>
                  <option value="NAME_ZA">NAME Z-A</option>
                  <option value="NEWEST_REGISTRATION">NEWEST REGISTRATION</option>
                  <option value="OLDEST_REGISTRATION">OLDEST REGISTRATION</option>
                  <option value="COURSE">COURSE</option>
                  <option value="DATE_PAID">DATE PAID</option>
                  <option value="MYTHICAL_GROUP">MYTHICAL CREATURE GROUP</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-bold uppercase text-black">PAGE SIZE:</span>
                <select
                  value={pagination.pageSize}
                  onChange={(e) =>
                    setPagination((prev) => ({
                      ...prev,
                      pageSize: Number(e.target.value),
                      currentPage: 1,
                    }))
                  }
                  className="bg-white border-2 border-black px-2 py-1 text-xs font-black uppercase shadow-[2px_2px_0px_#000000] focus:outline-none"
                >
                  <option value={10}>10 ROWS</option>
                  <option value={25}>25 ROWS</option>
                  <option value={50}>50 ROWS</option>
                  <option value={100}>100 ROWS</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. ATTENDEES TABLE (DESKTOP) & ATTENDEE CARDS (MOBILE) */}
      {filteredCount === 0 ? (
        <EmptyState
          title="NO ATTENDEES MATCH QUERY"
          description={`No registered student matches the current search query "${searchState.query}" or the applied filter criteria.`}
          actionText="CLEAR FILTERS & SEARCH"
          onAction={handleResetFilters}
        />
      ) : (
        <div className="space-y-4">
          {/* DESKTOP TABLE (Hidden on mobile) */}
          <div className="hidden md:block border-4 border-black bg-[#FFFFFF] shadow-[8px_8px_0px_#000000] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-black text-[#FFD93D] font-mono text-[11px] font-black uppercase tracking-wider border-b-4 border-black">
                    <th className="py-3.5 px-3 border-r-2 border-black/40">STUDENT ID</th>
                    <th className="py-3.5 px-3 border-r-2 border-black/40">NAME</th>
                    <th className="py-3.5 px-3 border-r-2 border-black/40">COURSE</th>
                    <th className="py-3.5 px-2.5 border-r-2 border-black/40">SECTION</th>
                    <th className="py-3.5 px-2.5 border-r-2 border-black/40">YEAR</th>
                    <th className="py-3.5 px-2.5 border-r-2 border-black/40">TYPE</th>
                    <th className="py-3.5 px-2.5 border-r-2 border-black/40">AMOUNT</th>
                    <th className="py-3.5 px-3 border-r-2 border-black/40">DATE PAID</th>
                    <th className="py-3.5 px-3 border-r-2 border-black/40">GROUP</th>
                    <th className="py-3.5 px-2.5 border-r-2 border-black/40">STATUS</th>
                    <th className="py-3.5 px-3 text-center">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-black text-xs font-bold uppercase">
                  {paginatedAttendees.map((att, idx) => {
                    const isEven = idx % 2 === 0;

                    return (
                      <tr
                        key={att.id}
                        className={`hover:bg-[#FFFDF5] transition-colors ${
                          isEven ? 'bg-white' : 'bg-[#FAFAFA]'
                        }`}
                      >
                        {/* 1. STUDENT ID */}
                        <td className="py-3 px-3 font-mono font-black border-r-2 border-black text-black">
                          <span className="bg-[#FFD93D] px-1.5 py-0.5 border border-black shadow-[1px_1px_0px_#000000]">
                            {att.studentId}
                          </span>
                        </td>

                        {/* 2. NAME */}
                        <td className="py-3 px-3 font-black border-r-2 border-black text-black max-w-[160px] truncate">
                          {att.fullName}
                        </td>

                        {/* 3. COURSE */}
                        <td className="py-3 px-3 font-mono border-r-2 border-black text-[11px] text-gray-800">
                          {att.course ? att.course.replace('BS ', '') : 'IT'}
                        </td>

                        {/* 4. SECTION */}
                        <td className="py-3 px-2.5 font-mono font-black border-r-2 border-black">
                          <span className="bg-black text-white px-1.5 py-0.5 text-[10px]">
                            {att.section}
                          </span>
                        </td>

                        {/* 5. YEAR */}
                        <td className="py-3 px-2.5 font-mono text-[11px] border-r-2 border-black text-gray-700">
                          {att.yearLevel.replace(' Year', 'Y')}
                        </td>

                        {/* 6. TYPE */}
                        <td className="py-3 px-2.5 font-mono border-r-2 border-black">
                          <span
                            className={`text-[10px] px-1.5 py-0.5 font-black uppercase border border-black ${
                              att.registrationType === 'EARLY BIRD'
                                ? 'bg-[#FFD93D] text-black'
                                : 'bg-[#C4B5FD] text-black'
                            }`}
                          >
                            {att.registrationType === 'EARLY BIRD' ? 'EARLY' : 'REG'}
                          </span>
                        </td>

                        {/* 7. AMOUNT */}
                        <td className="py-3 px-2.5 font-mono font-black border-r-2 border-black text-[11px]">
                          ₱{att.actualAmount !== undefined ? att.actualAmount : att.amount}
                        </td>

                        {/* 8. DATE PAID */}
                        <td className="py-3 px-3 font-mono text-[11px] border-r-2 border-black text-gray-600 whitespace-nowrap">
                          {att.datePaid || 'UNPAID'}
                        </td>

                        {/* 9. GROUP BADGE */}
                        <td className="py-3 px-3 border-r-2 border-black">
                          <MythicalGroupBadge groupName={att.groupAssignment} size="sm" />
                        </td>

                        {/* 10. STATUS */}
                        <td className="py-3 px-2.5 border-r-2 border-black whitespace-nowrap">
                          {att.paymentStatus === 'PAID' ? (
                            <span className="inline-flex items-center gap-1 bg-[#10B981] text-black text-[10px] font-mono font-black px-1.5 py-0.5 border border-black">
                              <CheckCircle2 className="w-3 h-3" />
                              PAID
                            </span>
                          ) : att.paymentStatus === 'UNPAID' ? (
                            <span className="inline-flex items-center gap-1 bg-[#FF6B6B] text-black text-[10px] font-mono font-black px-1.5 py-0.5 border border-black">
                              <AlertTriangle className="w-3 h-3" />
                              UNPAID
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-[#FFD93D] text-black text-[10px] font-mono font-black px-1.5 py-0.5 border border-black">
                              <Clock className="w-3 h-3" />
                              PENDING
                            </span>
                          )}
                        </td>

                        {/* 11. ACTIONS */}
                        <td className="py-3 px-3 text-center">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => setSelectedAttendeeForDetail(att)}
                              className="px-2 py-1 bg-white hover:bg-[#FFD93D] text-black font-mono font-black text-[10px] border-2 border-black shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1"
                              title="View full profile"
                            >
                              <Eye className="w-3 h-3" />
                              <span>VIEW</span>
                            </button>

                            <button
                              onClick={() => setSelectedAttendeeForEdit(att)}
                              className="px-2 py-1 bg-white hover:bg-black hover:text-[#FFD93D] text-black font-mono font-black text-[10px] border-2 border-black shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1"
                              title="Edit attendee record"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>EDIT</span>
                            </button>
                            {isAdmin && (
                              <button
                                onClick={() => handleDelete(att)}
                                className="px-2 py-1 bg-[#FF6B6B] hover:bg-black hover:text-[#FF6B6B] text-black font-mono font-black text-[10px] border-2 border-black shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1"
                                title="Delete attendee record"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>DELETE</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* MOBILE ATTENDEE CARDS (Visible on mobile screens) */}
          <div className="block md:hidden space-y-4">
            {paginatedAttendees.map((att) => (
              <div
                key={att.id}
                className="bg-white border-4 border-black p-4 shadow-[6px_6px_0px_#000000] space-y-3 relative"
              >
                {/* Prominent Student ID Header */}
                <div className="flex items-center justify-between border-b-2 border-black pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-black bg-[#FFD93D] text-black px-2.5 py-1 border-2 border-black shadow-[2px_2px_0px_#000000] tracking-wider">
                      {att.studentId}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-gray-500 uppercase">
                      STUDENT ID
                    </span>
                  </div>

                  {att.paymentStatus === 'PAID' ? (
                    <span className="inline-flex items-center gap-1 bg-[#10B981] text-black text-[10px] font-mono font-black px-2 py-0.5 border-2 border-black">
                      <CheckCircle2 className="w-3 h-3" />
                      PAID
                    </span>
                  ) : att.paymentStatus === 'UNPAID' ? (
                    <span className="inline-flex items-center gap-1 bg-[#FF6B6B] text-black text-[10px] font-mono font-black px-2 py-0.5 border-2 border-black">
                      <AlertTriangle className="w-3 h-3" />
                      UNPAID
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-[#FFD93D] text-black text-[10px] font-mono font-black px-2 py-0.5 border-2 border-black">
                      <Clock className="w-3 h-3" />
                      PENDING
                    </span>
                  )}
                </div>

                {/* Name & Academic Info */}
                <div>
                  <h3 className="text-lg font-black uppercase text-black leading-tight">
                    {att.fullName}
                  </h3>
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-gray-700 mt-1">
                    <span>{att.course ? att.course.replace('BS ', '') : 'IT'}</span>
                    <span>&bull;</span>
                    <span className="bg-black text-white px-1.5 py-0.2">
                      {att.section}
                    </span>
                    <span>&bull;</span>
                    <span>{att.yearLevel}</span>
                  </div>
                </div>

                {/* Mythical Creature Group Badge */}
                <div className="pt-1">
                  <div className="text-[10px] font-mono font-bold text-gray-500 uppercase mb-1">
                    MYTHICAL CREATURE GROUP ASSIGNMENT
                  </div>
                  <MythicalGroupBadge groupName={att.groupAssignment} size="md" />
                </div>

                {/* Financial Ledger Details */}
                <div className="bg-[#FFFDF5] border-2 border-black p-2.5 grid grid-cols-2 gap-2 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-gray-500 block uppercase">REGISTRATION</span>
                    <span className="font-bold text-black">{att.registrationType}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 block uppercase">FEE / AMOUNT</span>
                    <span className="font-black text-[#FF6B6B]">
                      ₱{att.actualAmount !== undefined ? att.actualAmount : att.amount} PHP
                    </span>
                  </div>
                  <div className="col-span-2 border-t border-black/10 pt-1 flex justify-between">
                    <span className="text-[10px] text-gray-500 uppercase">DATE PAID:</span>
                    <span className="font-bold text-black">{att.datePaid || 'UNPAID'}</span>
                  </div>
                </div>

                {/* Mobile Action Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex-1"
                    onClick={() => setSelectedAttendeeForDetail(att)}
                    leftIcon={<Eye className="w-3.5 h-3.5" />}
                  >
                    VIEW
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setSelectedAttendeeForEdit(att)}
                    leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                  >
                    EDIT
                  </Button>
                  {isAdmin && (
                    <Button
                      variant="accent"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDelete(att)}
                      leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                    >
                      DELETE
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* 5. PAGINATION FOOTER */}
          <div className="bg-[#FFFDF5] border-4 border-black p-4 shadow-[6px_6px_0px_#000000] flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs font-bold">
            <div className="text-gray-700 font-mono">
              SHOWING{' '}
              <span className="text-black font-black">
                {Math.min(filteredCount, (currentPageSafe - 1) * pagination.pageSize + 1)}
              </span>{' '}
              TO{' '}
              <span className="text-black font-black">
                {Math.min(filteredCount, currentPageSafe * pagination.pageSize)}
              </span>{' '}
              OF <span className="text-black font-black">{filteredCount}</span> ATTENDEES (PAGE{' '}
              {currentPageSafe} OF {totalPages})
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setPagination((prev) => ({ ...prev, currentPage: 1 }))}
                disabled={currentPageSafe <= 1}
                aria-label="First page"
                className="p-1.5 bg-white border-2 border-black font-black hover:bg-[#FFD93D] disabled:opacity-30 disabled:cursor-not-allowed shadow-[2px_2px_0px_#000000] cursor-pointer"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    currentPage: Math.max(1, prev.currentPage - 1),
                  }))
                }
                disabled={currentPageSafe <= 1}
                aria-label="Previous page"
                className="px-2.5 py-1.5 bg-white border-2 border-black font-black hover:bg-[#FFD93D] disabled:opacity-30 disabled:cursor-not-allowed shadow-[2px_2px_0px_#000000] cursor-pointer flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">PREV</span>
              </button>

              {/* Page Number Pills */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = i + 1;
                  if (totalPages > 5 && currentPageSafe > 3) {
                    pageNum = currentPageSafe - 2 + i;
                    if (pageNum > totalPages) pageNum = totalPages - 4 + i;
                  }
                  if (pageNum < 1 || pageNum > totalPages) return null;

                  const isCurrent = pageNum === currentPageSafe;

                  return (
                    <button
                      key={pageNum}
                      onClick={() =>
                        setPagination((prev) => ({ ...prev, currentPage: pageNum }))
                      }
                      className={`w-8 h-8 font-black border-2 border-black text-xs shadow-[2px_2px_0px_#000000] transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-black text-[#FFD93D]'
                          : 'bg-white text-black hover:bg-[#FFD93D]'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    currentPage: Math.min(totalPages, prev.currentPage + 1),
                  }))
                }
                disabled={currentPageSafe >= totalPages}
                aria-label="Next page"
                className="px-2.5 py-1.5 bg-white border-2 border-black font-black hover:bg-[#FFD93D] disabled:opacity-30 disabled:cursor-not-allowed shadow-[2px_2px_0px_#000000] cursor-pointer flex items-center gap-1"
              >
                <span className="hidden sm:inline">NEXT</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() =>
                  setPagination((prev) => ({ ...prev, currentPage: totalPages }))
                }
                disabled={currentPageSafe >= totalPages}
                aria-label="Last page"
                className="p-1.5 bg-white border-2 border-black font-black hover:bg-[#FFD93D] disabled:opacity-30 disabled:cursor-not-allowed shadow-[2px_2px_0px_#000000] cursor-pointer"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODALS */}
      {/* Attendee Detail Modal */}
      <AttendeeDetailModal
        attendee={selectedAttendeeForDetail}
        isOpen={!!selectedAttendeeForDetail}
        onClose={() => setSelectedAttendeeForDetail(null)}
        onEditAttendee={handleOpenEditFromDetail}
        onChangeGroup={(attendee, newGroup) => {
          handleUpdateAttendeeGroup(attendee, newGroup);
          setSelectedAttendeeForDetail({ ...attendee, groupAssignment: newGroup });
        }}
      />

      {/* Edit Attendee Modal */}
      <EditAttendeeModal
        attendee={selectedAttendeeForEdit}
        isOpen={!!selectedAttendeeForEdit}
        onClose={() => setSelectedAttendeeForEdit(null)}
        onSave={handleUpdateAttendee}
      />

      {/* CSV Export Modal */}
      <ExportAttendeesModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        filteredAttendees={sortedAttendees}
        allAttendees={attendees}
        appliedFilters={appliedFilters}
        searchState={searchState}
        onExportSuccess={handleExportSuccess}
      />

      {/* CSV Import Modal */}
      <ImportAttendeesModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        existingAttendees={attendees}
        onImportSuccess={handleImportSuccessCallback}
      />
    </div>
  );
};
