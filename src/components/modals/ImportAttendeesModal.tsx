import React, { useState, useRef, useMemo } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { AttendeeRegistration } from '../../types';
import {
  parseAttendeeCSV,
  generateAttendeeCSVTemplate,
  CSVParseSummary,
} from '../../utils/csvUtils';
import {
  Upload,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  CheckCircle2,
  FileText,
  RefreshCw,
  Info,
  Check,
  X,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';

export interface ImportAttendeesModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingAttendees: AttendeeRegistration[];
  onImportSuccess: (
    importedAttendees: AttendeeRegistration[],
    overwriteExisting: boolean
  ) => Promise<{ added: number; updated: number; total: number }>;
}

type TabType = 'FILE_UPLOAD' | 'PASTE_TEXT' | 'TEMPLATE_GUIDE';
type PreviewFilterType = 'ALL' | 'VALID' | 'NEW' | 'UPDATE' | 'ERRORS';

export const ImportAttendeesModal: React.FC<ImportAttendeesModalProps> = ({
  isOpen,
  onClose,
  existingAttendees,
  onImportSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('FILE_UPLOAD');
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [rawText, setRawText] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<string>('');

  // Ingestion settings
  const [overwriteExisting, setOverwriteExisting] = useState<boolean>(true);
  const [autoAssignGroups, setAutoAssignGroups] = useState<boolean>(true);

  // Parsing & execution state
  const [parseResult, setParseResult] = useState<CSVParseSummary | null>(null);
  const [previewFilter, setPreviewFilter] = useState<PreviewFilterType>('ALL');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [importSummary, setImportSummary] = useState<{
    added: number;
    updated: number;
    total: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse text whenever rawText changes
  const processCSVContent = (content: string, name: string = 'pasted_data.csv', size: string = '') => {
    setFileName(name);
    setFileSize(size);
    const summary = parseAttendeeCSV(content, existingAttendees, {
      autoAssignGroups,
    });
    setParseResult(summary);
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      alert('Please upload a standard .csv or .txt file.');
      return;
    }

    const readableSize = `${(file.size / 1024).toFixed(1)} KB`;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setRawText(text);
      processCSVContent(text, file.name, readableSize);
    };
    reader.readAsText(file);
  };

  const handlePasteSubmit = () => {
    if (!rawText.trim()) return;
    processCSVContent(rawText, 'clipboard_data.csv', `${(rawText.length / 1024).toFixed(1)} KB`);
  };

  const handleDownloadTemplate = () => {
    generateAttendeeCSVTemplate();
  };

  const handleResetImport = () => {
    setParseResult(null);
    setRawText('');
    setFileName('');
    setFileSize('');
    setImportSummary(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleExecuteImport = async () => {
    if (!parseResult || parseResult.validCount === 0) return;

    setIsProcessing(true);
    try {
      // Gather valid records
      const validRecords = parseResult.rows
        .filter((r) => r.isValid && r.record)
        .map((r) => r.record!);

      const stats = await onImportSuccess(validRecords, overwriteExisting);
      setImportSummary(stats);
    } catch (err) {
      console.error('Failed to import attendees:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    handleResetImport();
    onClose();
  };

  // Filter preview rows
  const filteredPreviewRows = useMemo(() => {
    if (!parseResult) return [];
    return parseResult.rows.filter((row) => {
      if (previewFilter === 'VALID') return row.isValid;
      if (previewFilter === 'ERRORS') return !row.isValid;
      if (previewFilter === 'NEW') return row.isValid && !row.isExisting;
      if (previewFilter === 'UPDATE') return row.isValid && row.isExisting;
      return true;
    });
  }, [parseResult, previewFilter]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="IMPORT ATTENDEE DATA"
      subtitle="BULK ENROLLMENT // CSV INGESTION // ADMIN & OFFICER DATA SUITE"
      badge="OFFICER CSV INGESTION"
      headerVariant="violet"
      maxWidth="4xl"
      footer={
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadTemplate}
              leftIcon={<Download className="w-4 h-4 stroke-[2.5]" />}
              title="Download empty formatted CSV template"
            >
              DOWNLOAD CSV TEMPLATE
            </Button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {importSummary ? (
              <Button variant="primary" size="md" onClick={handleClose}>
                VIEW ATTENDEE DATABASE
              </Button>
            ) : parseResult ? (
              <>
                <Button variant="outline" size="sm" onClick={handleResetImport}>
                  UPLOAD DIFFERENT FILE
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleExecuteImport}
                  disabled={parseResult.validCount === 0 || isProcessing}
                  leftIcon={<Check className="w-4 h-4 stroke-[3]" />}
                >
                  {isProcessing
                    ? 'PROCESSING...'
                    : `CONFIRM IMPORT (${parseResult.validCount} ATTENDEES)`}
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={handleClose}>
                CANCEL
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* 1. CELEBRATORY SUCCESS SUMMARY VIEW */}
        {importSummary && (
          <div className="p-6 bg-[#10B981] border-4 border-black shadow-[6px_6px_0px_#000000] text-black space-y-4 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-black text-[#FFD93D] flex items-center justify-center border-2 border-black shrink-0">
                <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black font-mono uppercase tracking-tight">
                  ATTENDEE INGESTION SUCCESSFUL!
                </h3>
                <p className="text-xs font-mono font-bold mt-0.5">
                  The attendee database and mythical creature group rosters have been refreshed.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-white border-2 border-black p-3 shadow-[2px_2px_0px_#000000]">
                <div className="text-[10px] font-mono font-black uppercase text-gray-600">
                  NEW STUDENTS ADDED
                </div>
                <div className="text-2xl font-black font-mono text-black mt-0.5">
                  +{importSummary.added}
                </div>
              </div>

              <div className="bg-white border-2 border-black p-3 shadow-[2px_2px_0px_#000000]">
                <div className="text-[10px] font-mono font-black uppercase text-gray-600">
                  RECORDS UPDATED
                </div>
                <div className="text-2xl font-black font-mono text-black mt-0.5">
                  {importSummary.updated}
                </div>
              </div>

              <div className="bg-white border-2 border-black p-3 shadow-[2px_2px_0px_#000000]">
                <div className="text-[10px] font-mono font-black uppercase text-gray-600">
                  TOTAL VERIFIED ATTENDEES
                </div>
                <div className="text-2xl font-black font-mono text-black mt-0.5">
                  {importSummary.total}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. INITIAL UPLOAD / INPUT TABS (Hidden once parsed or if imported) */}
        {!parseResult && !importSummary && (
          <div className="space-y-4">
            {/* TAB SELECTORS */}
            <div className="flex border-b-4 border-black gap-2 font-mono text-xs font-black uppercase">
              <button
                onClick={() => setActiveTab('FILE_UPLOAD')}
                className={`px-4 py-2.5 border-t-2 border-x-2 border-black transition-colors cursor-pointer flex items-center gap-2 ${
                  activeTab === 'FILE_UPLOAD'
                    ? 'bg-[#FFD93D] text-black -mb-1 pb-3.5 z-10 border-b-0'
                    : 'bg-white hover:bg-gray-100 text-gray-700'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>UPLOAD CSV FILE</span>
              </button>

              <button
                onClick={() => setActiveTab('PASTE_TEXT')}
                className={`px-4 py-2.5 border-t-2 border-x-2 border-black transition-colors cursor-pointer flex items-center gap-2 ${
                  activeTab === 'PASTE_TEXT'
                    ? 'bg-[#FFD93D] text-black -mb-1 pb-3.5 z-10 border-b-0'
                    : 'bg-white hover:bg-gray-100 text-gray-700'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>PASTE CSV TEXT</span>
              </button>

              <button
                onClick={() => setActiveTab('TEMPLATE_GUIDE')}
                className={`px-4 py-2.5 border-t-2 border-x-2 border-black transition-colors cursor-pointer flex items-center gap-2 ${
                  activeTab === 'TEMPLATE_GUIDE'
                    ? 'bg-[#FFD93D] text-black -mb-1 pb-3.5 z-10 border-b-0'
                    : 'bg-white hover:bg-gray-100 text-gray-700'
                }`}
              >
                <Info className="w-3.5 h-3.5" />
                <span>FORMAT GUIDE</span>
              </button>
            </div>

            {/* TAB 1: FILE DRAG & DROP ZONE */}
            {activeTab === 'FILE_UPLOAD' && (
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-4 border-dashed p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[220px] ${
                  dragActive
                    ? 'border-black bg-[#FFD93D]/30 scale-[0.99]'
                    : 'border-black bg-[#FFFDF5] hover:bg-white'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt"
                  className="hidden"
                  onChange={handleFileInputChange}
                />

                <div className="w-16 h-16 bg-[#C4B5FD] text-black border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_#000000] mb-4">
                  <Upload className="w-8 h-8 stroke-[2.5]" />
                </div>

                <div className="font-mono text-base font-black uppercase text-black">
                  DRAG & DROP CSV FILE HERE OR CLICK TO BROWSE
                </div>
                <p className="text-xs font-mono font-bold text-gray-600 uppercase mt-1">
                  SUPPORTS .CSV AND .TXT (EXCEL / GOOGLE SHEETS EXPORT)
                </p>

                <div className="mt-4 inline-flex items-center gap-2">
                  <span className="px-4 py-2 bg-black text-[#FFD93D] font-mono text-xs font-black uppercase border-2 border-black shadow-[2px_2px_0px_#000000]">
                    CHOOSE FILE FROM DEVICE
                  </span>
                </div>
              </div>
            )}

            {/* TAB 2: PASTE RAW TEXT */}
            {activeTab === 'PASTE_TEXT' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-black uppercase text-black">
                    PASTE RAW CSV DATA (INCLUDING HEADER ROW)
                  </span>
                  <span className="text-[10px] font-mono text-gray-500 font-bold">
                    CAN COPY DIRECTLY FROM EXCEL CELLS OR SPREADSHEET
                  </span>
                </div>

                <textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder={`Student ID,Full Name,Course,Section,Year Level,Registration Type,Amount Paid,Payment Status,Date Paid,Mythical Creature Group\n20240101,Santos Maria Elena,BS Information Technology,BSIT-1A,1st Year,EARLY BIRD,350,PAID,2026-08-25,Tikbalang\n20230245,Dela Cruz Juan Paolo,BS Computer Science,BSCS-2B,2nd Year,REGULAR,450,PAID,2026-09-02,Aswang`}
                  rows={8}
                  className="w-full font-mono text-xs p-3 border-4 border-black bg-white shadow-[4px_4px_0px_#000000] focus:outline-none focus:ring-2 focus:ring-[#FFD93D]"
                />

                <div className="flex justify-end">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handlePasteSubmit}
                    disabled={!rawText.trim()}
                    leftIcon={<Check className="w-4 h-4 stroke-[3]" />}
                  >
                    PARSE & PREVIEW DATA
                  </Button>
                </div>
              </div>
            )}

            {/* TAB 3: FORMAT GUIDE */}
            {activeTab === 'TEMPLATE_GUIDE' && (
              <div className="bg-white border-4 border-black p-5 shadow-[6px_6px_0px_#000000] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="font-mono text-xs font-black uppercase text-black flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>CSV COLUMN SPECIFICATIONS</span>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleDownloadTemplate}
                    leftIcon={<Download className="w-3.5 h-3.5" />}
                  >
                    DOWNLOAD TEMPLATE
                  </Button>
                </div>

                <div className="overflow-x-auto border-2 border-black">
                  <table className="w-full text-left font-mono text-xs border-collapse">
                    <thead className="bg-black text-[#FFD93D] text-[10px] uppercase font-black">
                      <tr>
                        <th className="p-2 border-r border-gray-700">COLUMN NAME</th>
                        <th className="p-2 border-r border-gray-700">REQUIRED?</th>
                        <th className="p-2 border-r border-gray-700">ACCEPTED FORMATS / VALUES</th>
                        <th className="p-2">EXAMPLE</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black font-bold">
                      <tr className="bg-[#FFFDF5]">
                        <td className="p-2 border-r border-black font-black">Student ID</td>
                        <td className="p-2 border-r border-black text-[#FF6B6B] font-black">YES</td>
                        <td className="p-2 border-r border-black text-gray-700">Unique 8-digit or alphanumeric student number</td>
                        <td className="p-2">20240101</td>
                      </tr>
                      <tr>
                        <td className="p-2 border-r border-black font-black">Full Name</td>
                        <td className="p-2 border-r border-black text-[#FF6B6B] font-black">YES</td>
                        <td className="p-2 border-r border-black text-gray-700">Last Name, First Name or First Name Last Name</td>
                        <td className="p-2">Santos, Maria Elena</td>
                      </tr>
                      <tr className="bg-[#FFFDF5]">
                        <td className="p-2 border-r border-black font-black">Course</td>
                        <td className="p-2 border-r border-black text-gray-500">OPTIONAL</td>
                        <td className="p-2 border-r border-black text-gray-700">BS Information Technology, BS Computer Science, BS Information Systems (or BSIT, BSCS, BSIS)</td>
                        <td className="p-2">BS Information Technology</td>
                      </tr>
                      <tr>
                        <td className="p-2 border-r border-black font-black">Section</td>
                        <td className="p-2 border-r border-black text-gray-500">OPTIONAL</td>
                        <td className="p-2 border-r border-black text-gray-700">Section code (e.g. BSIT-1A, BSCS-2B, BSIS-3A)</td>
                        <td className="p-2">BSIT-1A</td>
                      </tr>
                      <tr className="bg-[#FFFDF5]">
                        <td className="p-2 border-r border-black font-black">Year Level</td>
                        <td className="p-2 border-r border-black text-gray-500">OPTIONAL</td>
                        <td className="p-2 border-r border-black text-gray-700">1st Year, 2nd Year, 3rd Year, 4th Year (or 1, 2, 3, 4)</td>
                        <td className="p-2">1st Year</td>
                      </tr>
                      <tr>
                        <td className="p-2 border-r border-black font-black">Registration Type</td>
                        <td className="p-2 border-r border-black text-gray-500">OPTIONAL</td>
                        <td className="p-2 border-r border-black text-gray-700">EARLY BIRD or REGULAR</td>
                        <td className="p-2">EARLY BIRD</td>
                      </tr>
                      <tr className="bg-[#FFFDF5]">
                        <td className="p-2 border-r border-black font-black">Amount Paid</td>
                        <td className="p-2 border-r border-black text-gray-500">OPTIONAL</td>
                        <td className="p-2 border-r border-black text-gray-700">Numeric amount in PHP (e.g. 350, 450, 0)</td>
                        <td className="p-2">350</td>
                      </tr>
                      <tr>
                        <td className="p-2 border-r border-black font-black">Payment Status</td>
                        <td className="p-2 border-r border-black text-gray-500">OPTIONAL</td>
                        <td className="p-2 border-r border-black text-gray-700">PAID, UNPAID, or PENDING</td>
                        <td className="p-2">PAID</td>
                      </tr>
                      <tr className="bg-[#FFFDF5]">
                        <td className="p-2 border-r border-black font-black">Date Paid</td>
                        <td className="p-2 border-r border-black text-gray-500">OPTIONAL</td>
                        <td className="p-2 border-r border-black text-gray-700">YYYY-MM-DD or readable date</td>
                        <td className="p-2">2026-08-25</td>
                      </tr>
                      <tr>
                        <td className="p-2 border-r border-black font-black">Mythical Creature Group</td>
                        <td className="p-2 border-r border-black text-gray-500">OPTIONAL</td>
                        <td className="p-2 border-r border-black text-gray-700">One of 12 official groups: Kapre, Sigbin, Aswang, Tikbalang, Chanak, Shokoy, Manananggal, Duwende, Mangkukulam, Sirena, Diwata, Otlum</td>
                        <td className="p-2">Tikbalang</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. PARSED RESULTS & LIVE PREVIEW TABLE */}
        {parseResult && !importSummary && (
          <div className="space-y-5 animate-in fade-in">
            {/* FILE INFO BAR */}
            <div className="bg-black text-[#FFD93D] p-3 border-4 border-black flex flex-wrap items-center justify-between gap-2 font-mono text-xs font-black uppercase">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4" />
                <span>LOADED FILE: {fileName}</span>
                {fileSize && <span className="text-white">({fileSize})</span>}
              </div>

              <button
                onClick={handleResetImport}
                className="text-white hover:text-[#FF6B6B] underline cursor-pointer text-[11px]"
              >
                [CHANGE / RE-UPLOAD FILE]
              </button>
            </div>

            {/* METRICS DASHBOARD */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
              {/* TOTAL ROWS */}
              <div
                onClick={() => setPreviewFilter('ALL')}
                className={`p-3 border-3 border-black cursor-pointer transition-all ${
                  previewFilter === 'ALL'
                    ? 'bg-black text-[#FFD93D] shadow-[4px_4px_0px_#000000] -translate-y-0.5'
                    : 'bg-white text-black'
                }`}
              >
                <div className="text-[10px] font-mono font-black uppercase">TOTAL ROWS</div>
                <div className="text-2xl font-black font-mono mt-0.5">{parseResult.totalRows}</div>
                <div className="text-[9px] font-mono font-bold uppercase mt-1 opacity-80">
                  PARSED IN CSV
                </div>
              </div>

              {/* VALID RECORDS */}
              <div
                onClick={() => setPreviewFilter('VALID')}
                className={`p-3 border-3 border-black cursor-pointer transition-all ${
                  previewFilter === 'VALID'
                    ? 'bg-[#10B981] text-black shadow-[4px_4px_0px_#000000] -translate-y-0.5'
                    : 'bg-white text-black'
                }`}
              >
                <div className="text-[10px] font-mono font-black uppercase">VALID RECORDS</div>
                <div className="text-2xl font-black font-mono mt-0.5">{parseResult.validCount}</div>
                <div className="text-[9px] font-mono font-bold uppercase mt-1 text-[#10B981]">
                  READY TO IMPORT
                </div>
              </div>

              {/* NEW ATTENDEES */}
              <div
                onClick={() => setPreviewFilter('NEW')}
                className={`p-3 border-3 border-black cursor-pointer transition-all ${
                  previewFilter === 'NEW'
                    ? 'bg-[#FFD93D] text-black shadow-[4px_4px_0px_#000000] -translate-y-0.5'
                    : 'bg-white text-black'
                }`}
              >
                <div className="text-[10px] font-mono font-black uppercase">NEW STUDENTS</div>
                <div className="text-2xl font-black font-mono mt-0.5">{parseResult.newCount}</div>
                <div className="text-[9px] font-mono font-bold uppercase mt-1 opacity-80">
                  NEW REGISTRATIONS
                </div>
              </div>

              {/* EXISTING UPDATES */}
              <div
                onClick={() => setPreviewFilter('UPDATE')}
                className={`p-3 border-3 border-black cursor-pointer transition-all ${
                  previewFilter === 'UPDATE'
                    ? 'bg-[#C4B5FD] text-black shadow-[4px_4px_0px_#000000] -translate-y-0.5'
                    : 'bg-white text-black'
                }`}
              >
                <div className="text-[10px] font-mono font-black uppercase">EXISTING MATCHES</div>
                <div className="text-2xl font-black font-mono mt-0.5">{parseResult.updateCount}</div>
                <div className="text-[9px] font-mono font-bold uppercase mt-1 opacity-80">
                  WILL BE UPDATED
                </div>
              </div>

              {/* INVALID / ERRORS */}
              <div
                onClick={() => setPreviewFilter('ERRORS')}
                className={`p-3 border-3 border-black cursor-pointer transition-all ${
                  previewFilter === 'ERRORS'
                    ? 'bg-[#FF6B6B] text-black shadow-[4px_4px_0px_#000000] -translate-y-0.5'
                    : 'bg-white text-black'
                }`}
              >
                <div className="text-[10px] font-mono font-black uppercase">ERRORS / INVALID</div>
                <div className="text-2xl font-black font-mono mt-0.5">{parseResult.invalidCount}</div>
                <div className="text-[9px] font-mono font-bold uppercase mt-1 text-[#FF6B6B]">
                  WILL BE SKIPPED
                </div>
              </div>
            </div>

            {/* INGESTION POLICIES / CONFIGURATION CONTROLS */}
            <div className="bg-[#FFFDF5] border-3 border-black p-4 space-y-3">
              <div className="font-mono text-xs font-black uppercase text-black flex items-center gap-1.5">
                <Layers className="w-4 h-4" />
                <span>IMPORT POLICIES & CONFLICT RESOLUTION</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs font-bold">
                <label className="flex items-start gap-2.5 p-2.5 bg-white border-2 border-black cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={overwriteExisting}
                    onChange={(e) => setOverwriteExisting(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-black cursor-pointer"
                  />
                  <div>
                    <span className="font-black uppercase text-black">
                      UPDATE EXISTING ATTENDEES (STUDENT ID MATCH)
                    </span>
                    <p className="text-[11px] text-gray-600 font-normal mt-0.5">
                      {overwriteExisting
                        ? 'Matching Student IDs will update details (Course, Section, Group, Payment) while preserving history.'
                        : 'Matching Student IDs will be skipped without overwriting existing attendee records.'}
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-2.5 bg-white border-2 border-black cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoAssignGroups}
                    onChange={(e) => {
                      setAutoAssignGroups(e.target.checked);
                      if (rawText) {
                        processCSVContent(rawText, fileName, fileSize);
                      }
                    }}
                    className="mt-0.5 w-4 h-4 accent-black cursor-pointer"
                  />
                  <div>
                    <span className="font-black uppercase text-black">
                      AUTO-ASSIGN UNASSIGNED GROUPS
                    </span>
                    <p className="text-[11px] text-gray-600 font-normal mt-0.5">
                      Automatically balances students without group assignments across the 12 official mythical creature groups.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* PREVIEW TABLE WITH FILTER TABS */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-mono text-xs font-black uppercase text-black flex items-center gap-2">
                  <span>PREVIEW PARSED ROWS ({filteredPreviewRows.length} DISPLAYED)</span>
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap gap-1 font-mono text-[10px] font-black uppercase">
                  <button
                    onClick={() => setPreviewFilter('ALL')}
                    className={`px-2 py-1 border border-black ${
                      previewFilter === 'ALL' ? 'bg-black text-[#FFD93D]' : 'bg-white hover:bg-gray-100'
                    }`}
                  >
                    ALL ({parseResult.rows.length})
                  </button>
                  <button
                    onClick={() => setPreviewFilter('VALID')}
                    className={`px-2 py-1 border border-black ${
                      previewFilter === 'VALID' ? 'bg-[#10B981] text-black' : 'bg-white hover:bg-gray-100'
                    }`}
                  >
                    VALID ({parseResult.validCount})
                  </button>
                  <button
                    onClick={() => setPreviewFilter('NEW')}
                    className={`px-2 py-1 border border-black ${
                      previewFilter === 'NEW' ? 'bg-[#FFD93D] text-black' : 'bg-white hover:bg-gray-100'
                    }`}
                  >
                    NEW ({parseResult.newCount})
                  </button>
                  <button
                    onClick={() => setPreviewFilter('UPDATE')}
                    className={`px-2 py-1 border border-black ${
                      previewFilter === 'UPDATE' ? 'bg-[#C4B5FD] text-black' : 'bg-white hover:bg-gray-100'
                    }`}
                  >
                    UPDATES ({parseResult.updateCount})
                  </button>
                  {parseResult.invalidCount > 0 && (
                    <button
                      onClick={() => setPreviewFilter('ERRORS')}
                      className={`px-2 py-1 border border-black ${
                        previewFilter === 'ERRORS' ? 'bg-[#FF6B6B] text-black' : 'bg-white hover:bg-gray-100'
                      }`}
                    >
                      ERRORS ({parseResult.invalidCount})
                    </button>
                  )}
                </div>
              </div>

              {/* Table Container */}
              <div className="border-3 border-black bg-white max-h-[320px] overflow-y-auto shadow-[4px_4px_0px_#000000]">
                <table className="w-full text-left font-mono text-xs border-collapse">
                  <thead className="bg-black text-[#FFD93D] text-[10px] uppercase font-black sticky top-0 z-10">
                    <tr>
                      <th className="py-2 px-2.5 border-r border-gray-700">ROW</th>
                      <th className="py-2 px-2.5 border-r border-gray-700">STUDENT ID</th>
                      <th className="py-2 px-3 border-r border-gray-700">NAME</th>
                      <th className="py-2 px-2.5 border-r border-gray-700">COURSE</th>
                      <th className="py-2 px-2 border-r border-gray-700">SEC</th>
                      <th className="py-2 px-2 border-r border-gray-700">YEAR</th>
                      <th className="py-2 px-2 border-r border-gray-700">PAYMENT</th>
                      <th className="py-2 px-2.5 border-r border-gray-700">MYTHICAL GROUP</th>
                      <th className="py-2 px-2.5 text-center">ACTION STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black font-bold">
                    {filteredPreviewRows.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-6 text-center text-gray-500 font-mono">
                          NO ROWS MATCH THE ACTIVE FILTER.
                        </td>
                      </tr>
                    ) : (
                      filteredPreviewRows.map((row) => {
                        const rec = row.record;
                        return (
                          <tr
                            key={row.rowNumber}
                            className={`hover:bg-[#FFFDF5] ${
                              !row.isValid
                                ? 'bg-[#FF6B6B]/15'
                                : row.isExisting
                                ? 'bg-[#C4B5FD]/15'
                                : 'bg-white'
                            }`}
                          >
                            {/* ROW */}
                            <td className="py-2 px-2.5 border-r border-black font-mono text-gray-500 text-[10px]">
                              #{row.rowNumber}
                            </td>

                            {/* STUDENT ID */}
                            <td className="py-2 px-2.5 border-r border-black font-mono font-black">
                              {rec ? (
                                <span className="bg-[#FFD93D] px-1 py-0.5 border border-black text-[11px]">
                                  {rec.studentId}
                                </span>
                              ) : (
                                <span className="text-[#FF6B6B]">{row.rawFields.studentId || 'MISSING'}</span>
                              )}
                            </td>

                            {/* NAME */}
                            <td className="py-2 px-3 border-r border-black font-black truncate max-w-[150px]">
                              {rec ? rec.fullName : <span className="text-[#FF6B6B]">{row.rawFields.fullName || 'MISSING'}</span>}
                            </td>

                            {/* COURSE */}
                            <td className="py-2 px-2.5 border-r border-black text-[11px] text-gray-700">
                              {rec ? rec.course.replace('BS ', '') : row.rawFields.course || '-'}
                            </td>

                            {/* SECTION */}
                            <td className="py-2 px-2 border-r border-black text-[10px]">
                              {rec ? rec.section : row.rawFields.section || '-'}
                            </td>

                            {/* YEAR */}
                            <td className="py-2 px-2 border-r border-black text-[10px]">
                              {rec ? rec.yearLevel.replace(' Year', 'Y') : row.rawFields.yearLevel || '-'}
                            </td>

                            {/* PAYMENT */}
                            <td className="py-2 px-2 border-r border-black text-[10px]">
                              {rec ? (
                                <span
                                  className={`px-1 py-0.5 font-mono font-black uppercase ${
                                    rec.paymentStatus === 'PAID'
                                      ? 'bg-[#10B981] text-black'
                                      : 'bg-[#FF6B6B] text-black'
                                  }`}
                                >
                                  {rec.paymentStatus}
                                </span>
                              ) : (
                                '-'
                              )}
                            </td>

                            {/* GROUP */}
                            <td className="py-2 px-2.5 border-r border-black font-mono font-bold text-[11px]">
                              {rec?.groupAssignment || row.rawFields.groupAssignment || 'PENDING'}
                            </td>

                            {/* STATUS */}
                            <td className="py-2 px-2.5 text-center">
                              {!row.isValid ? (
                                <span className="inline-flex items-center gap-1 bg-[#FF6B6B] text-black px-1.5 py-0.5 text-[9px] font-black uppercase border border-black">
                                  <AlertTriangle className="w-2.5 h-2.5" />
                                  {row.error || 'INVALID'}
                                </span>
                              ) : row.isExisting ? (
                                <span className="inline-flex items-center gap-1 bg-[#C4B5FD] text-black px-1.5 py-0.5 text-[9px] font-black uppercase border border-black">
                                  <RefreshCw className="w-2.5 h-2.5" />
                                  UPDATE EXISTING
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 bg-[#FFD93D] text-black px-1.5 py-0.5 text-[9px] font-black uppercase border border-black">
                                  <Check className="w-2.5 h-2.5" />
                                  NEW RECORD
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
