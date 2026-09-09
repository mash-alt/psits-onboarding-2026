import { AttendeeRegistration, RegistrationType, PaymentStatus } from '../types';
import { OFFICIAL_MYTHICAL_GROUPS } from '../data/mythicalGroups';

/**
 * Escapes a single CSV cell value according to RFC 4180
 */
function escapeCSVValue(val: string | number | undefined | null): string {
  if (val === undefined || val === null) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Exports attendee list to a CSV file and initiates browser download
 */
export function exportAttendeesToCSV(
  attendees: AttendeeRegistration[],
  filenamePrefix: string = 'PSITS_Attendees_Export'
): { success: boolean; count: number; filename: string } {
  const headers = [
    'Student ID',
    'Full Name',
    'Course',
    'Section',
    'Year Level',
    'Registration Type',
    'Amount Paid',
    'Expected Amount',
    'Payment Status',
    'Date Paid',
    'Mythical Creature Group',
    'Registration Status',
    'Registered At',
  ];

  const rows = attendees.map((att) => [
    escapeCSVValue(att.studentId),
    escapeCSVValue(att.fullName),
    escapeCSVValue(att.course || 'BS Information Technology'),
    escapeCSVValue(att.section),
    escapeCSVValue(att.yearLevel),
    escapeCSVValue(att.registrationType),
    escapeCSVValue(att.actualAmount !== undefined ? att.actualAmount : att.amount),
    escapeCSVValue(att.expectedAmount !== undefined ? att.expectedAmount : (att.registrationType === 'EARLY BIRD' ? 350 : 450)),
    escapeCSVValue(att.paymentStatus),
    escapeCSVValue(att.datePaid || ''),
    escapeCSVValue(att.groupAssignment || 'UNASSIGNED'),
    escapeCSVValue(att.status || 'CONFIRMED'),
    escapeCSVValue(att.registeredAt || new Date().toISOString()),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

  // Prepend UTF-8 BOM so Excel opens special characters correctly
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = `${filenamePrefix}_${dateStr}.csv`;

  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return { success: true, count: attendees.length, filename };
}

/**
 * Generates and downloads a sample formatted CSV template for attendee imports
 */
export function generateAttendeeCSVTemplate(): { success: boolean; filename: string } {
  const headers = [
    'Student ID',
    'Full Name',
    'Course',
    'Section',
    'Year Level',
    'Registration Type',
    'Amount Paid',
    'Payment Status',
    'Date Paid',
    'Mythical Creature Group',
  ];

  const sampleRows = [
    ['20240101', 'Santos, Maria Elena', 'BS Information Technology', 'BSIT-1A', '1st Year', 'EARLY BIRD', '350', 'PAID', '2026-08-25', 'Tikbalang'],
    ['20230245', 'Dela Cruz, Juan Paolo', 'BS Computer Science', 'BSCS-2B', '2nd Year', 'REGULAR', '450', 'PAID', '2026-09-02', 'Aswang'],
    ['20220389', 'Villanueva, Carlos Joshua', 'BS Information Systems', 'BSIS-3A', '3rd Year', 'REGULAR', '0', 'UNPAID', '', 'Kapre'],
    ['20250412', 'Bautista, Alyssa Joy', 'BS Information Technology', 'BSIT-1B', '1st Year', 'EARLY BIRD', '350', 'PAID', '2026-08-28', 'Diwata'],
    ['20210567', 'Ramos, Patricia Gail', 'BS Computer Science', 'BSCS-4A', '4th Year', 'REGULAR', '450', 'PAID', '2026-09-04', 'Sigbin'],
  ];

  const csvContent = [
    headers.join(','),
    ...sampleRows.map((r) => r.map(escapeCSVValue).join(',')),
  ].join('\r\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const filename = 'PSITS_Attendee_Import_Template.csv';

  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return { success: true, filename };
}

/**
 * RFC 4180 compliant CSV line tokenizer that handles multi-line cells, quotes, and commas
 */
export function tokenizeCSV(text: string): string[][] {
  const result: string[][] = [];
  let row: string[] = [];
  let currentCell = '';
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Escaped quote: "" -> "
        currentCell += '"';
        i++; // skip next quote
      } else {
        // Toggle quote mode
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      row.push(currentCell.trim());
      currentCell = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      // End of line
      if (char === '\r' && nextChar === '\n') {
        i++; // skip \n in CRLF
      }
      row.push(currentCell.trim());
      currentCell = '';
      // Only push non-empty rows
      if (row.some((cell) => cell.length > 0)) {
        result.push(row);
      }
      row = [];
    } else {
      currentCell += char;
    }
  }

  // Final row
  if (currentCell.length > 0 || row.length > 0) {
    row.push(currentCell.trim());
    if (row.some((cell) => cell.length > 0)) {
      result.push(row);
    }
  }

  return result;
}

export interface ParsedAttendeeRow {
  rowNumber: number;
  record?: AttendeeRegistration;
  isExisting: boolean;
  existingAttendee?: AttendeeRegistration;
  isValid: boolean;
  error?: string;
  warnings: string[];
  rawFields: Record<string, string>;
}

export interface CSVParseSummary {
  totalRows: number;
  validCount: number;
  invalidCount: number;
  newCount: number;
  updateCount: number;
  rows: ParsedAttendeeRow[];
  headers: string[];
}

/**
 * Normalizes course strings into full department program titles
 */
function normalizeCourse(rawCourse: string): string {
  const lower = rawCourse.toLowerCase().trim();
  if (lower.includes('comp') || lower.includes('cs')) {
    return 'BS Computer Science';
  }
  if (lower.includes('system') || lower.includes('is')) {
    return 'BS Information Systems';
  }
  return 'BS Information Technology';
}

/**
 * Normalizes year levels to '1st Year' | '2nd Year' | '3rd Year' | '4th Year'
 */
function normalizeYearLevel(rawYear: string): '1st Year' | '2nd Year' | '3rd Year' | '4th Year' {
  const lower = rawYear.toLowerCase().trim();
  if (lower.includes('4') || lower.includes('fourth')) return '4th Year';
  if (lower.includes('3') || lower.includes('third')) return '3rd Year';
  if (lower.includes('2') || lower.includes('second')) return '2nd Year';
  return '1st Year';
}

/**
 * Normalizes mythical creature groups to official 12 group names
 */
function normalizeMythicalGroup(rawGroup: string, defaultIndex: number = 0): string {
  const trimmed = rawGroup.trim();
  if (!trimmed || trimmed.toUpperCase() === 'UNASSIGNED') {
    return OFFICIAL_MYTHICAL_GROUPS[defaultIndex % OFFICIAL_MYTHICAL_GROUPS.length].name;
  }

  const found = OFFICIAL_MYTHICAL_GROUPS.find(
    (g) => g.name.toLowerCase() === trimmed.toLowerCase()
  );
  if (found) return found.name;

  // Partial match
  const partial = OFFICIAL_MYTHICAL_GROUPS.find((g) =>
    g.name.toLowerCase().includes(trimmed.toLowerCase()) ||
    trimmed.toLowerCase().includes(g.name.toLowerCase())
  );
  if (partial) return partial.name;

  return OFFICIAL_MYTHICAL_GROUPS[defaultIndex % OFFICIAL_MYTHICAL_GROUPS.length].name;
}

/**
 * Parses raw CSV string and validates each record against attendee schema
 */
export function parseAttendeeCSV(
  csvText: string,
  existingAttendees: AttendeeRegistration[] = [],
  options: { autoAssignGroups?: boolean; defaultRegistrationType?: RegistrationType } = {}
): CSVParseSummary {
  const tokenized = tokenizeCSV(csvText);

  if (tokenized.length === 0) {
    return {
      totalRows: 0,
      validCount: 0,
      invalidCount: 0,
      newCount: 0,
      updateCount: 0,
      rows: [],
      headers: [],
    };
  }

  // Extract header row
  const rawHeaders = tokenized[0];
  const headerMap: Record<string, number> = {};

  rawHeaders.forEach((h, idx) => {
    const clean = h.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (clean.includes('studentid') || clean === 'id' || clean === 'student' || clean.includes('idnum')) {
      headerMap['studentId'] = idx;
    } else if (clean.includes('fullname') || clean === 'name' || clean === 'studentname') {
      headerMap['fullName'] = idx;
    } else if (clean.includes('course') || clean.includes('program') || clean.includes('degree')) {
      headerMap['course'] = idx;
    } else if (clean.includes('section') || clean === 'sec') {
      headerMap['section'] = idx;
    } else if (clean.includes('year') || clean === 'yr') {
      headerMap['yearLevel'] = idx;
    } else if (clean.includes('type') || clean.includes('regtype') || clean.includes('registrationtype')) {
      headerMap['registrationType'] = idx;
    } else if (clean.includes('amount') || clean.includes('fee') || clean.includes('paidamount') || clean === 'paid') {
      headerMap['amount'] = idx;
    } else if (clean.includes('paymentstatus') || clean === 'payment' || clean === 'status' || clean.includes('paystatus')) {
      headerMap['paymentStatus'] = idx;
    } else if (clean.includes('datepaid') || clean.includes('paymentdate') || clean.includes('date')) {
      headerMap['datePaid'] = idx;
    } else if (clean.includes('group') || clean.includes('creature') || clean.includes('mythical')) {
      headerMap['groupAssignment'] = idx;
    }
  });

  // Fallback if headers were not named standardly but follow default sequence
  if (headerMap['studentId'] === undefined && rawHeaders.length >= 2) {
    headerMap['studentId'] = 0;
    headerMap['fullName'] = 1;
    if (rawHeaders.length > 2) headerMap['course'] = 2;
    if (rawHeaders.length > 3) headerMap['section'] = 3;
    if (rawHeaders.length > 4) headerMap['yearLevel'] = 4;
  }

  const existingMap = new Map<string, AttendeeRegistration>();
  existingAttendees.forEach((a) => {
    existingMap.set(a.studentId.trim().toLowerCase(), a);
  });

  const parsedRows: ParsedAttendeeRow[] = [];
  const seenStudentIds = new Set<string>();
  let validCount = 0;
  let invalidCount = 0;
  let newCount = 0;
  let updateCount = 0;

  // Process data rows (skip header row at index 0)
  for (let i = 1; i < tokenized.length; i++) {
    const row = tokenized[i];
    const rowNumber = i + 1; // 1-based index including header
    const warnings: string[] = [];

    const getField = (key: string): string => {
      const colIdx = headerMap[key];
      return colIdx !== undefined && row[colIdx] !== undefined ? row[colIdx].trim() : '';
    };

    const rawFields: Record<string, string> = {
      studentId: getField('studentId'),
      fullName: getField('fullName'),
      course: getField('course'),
      section: getField('section'),
      yearLevel: getField('yearLevel'),
      registrationType: getField('registrationType'),
      amount: getField('amount'),
      paymentStatus: getField('paymentStatus'),
      datePaid: getField('datePaid'),
      groupAssignment: getField('groupAssignment'),
    };

    const studentId = rawFields.studentId;
    const fullName = rawFields.fullName;

    // Validation
    if (!studentId && !fullName) {
      // Empty row, skip
      continue;
    }

    if (!studentId) {
      invalidCount++;
      parsedRows.push({
        rowNumber,
        isValid: false,
        isExisting: false,
        error: 'Missing required Student ID.',
        warnings,
        rawFields,
      });
      continue;
    }

    if (!fullName) {
      invalidCount++;
      parsedRows.push({
        rowNumber,
        isValid: false,
        isExisting: false,
        error: 'Missing required Full Name.',
        warnings,
        rawFields,
      });
      continue;
    }

    // Check intra-CSV duplicate
    const cleanId = studentId.replace(/[^a-zA-Z0-9]/g, '');
    if (seenStudentIds.has(cleanId.toLowerCase())) {
      warnings.push(`Duplicate Student ID ${studentId} in this CSV. Later row will overwrite earlier row.`);
    }
    seenStudentIds.add(cleanId.toLowerCase());

    // Course normalization
    const course = normalizeCourse(rawFields.course || 'BS Information Technology');

    // Section normalization
    let section = rawFields.section.toUpperCase();
    if (!section) {
      const prefix = course.includes('Computer Science') ? 'BSCS' : course.includes('Information Systems') ? 'BSIS' : 'BSIT';
      section = `${prefix}-1A`;
      warnings.push(`No section provided, defaulted to ${section}.`);
    }

    // Year level normalization
    const yearLevel = normalizeYearLevel(rawFields.yearLevel || '1st Year');

    // Registration Type
    const regTypeRaw = rawFields.registrationType.toUpperCase();
    const registrationType: RegistrationType = regTypeRaw.includes('EARLY')
      ? 'EARLY BIRD'
      : regTypeRaw.includes('REG')
      ? 'REGULAR'
      : (options.defaultRegistrationType || 'REGULAR');

    const expectedAmount = registrationType === 'EARLY BIRD' ? 350 : 450;

    // Amount Paid parsing
    const numericAmount = parseFloat(rawFields.amount.replace(/[^0-9.]/g, ''));
    let actualAmount = isNaN(numericAmount) ? (rawFields.paymentStatus?.toUpperCase().includes('PAID') ? expectedAmount : 0) : numericAmount;

    // Payment Status
    let paymentStatus: PaymentStatus = 'UNPAID';
    const payRaw = rawFields.paymentStatus.toUpperCase();
    if (payRaw.includes('PENDING')) {
      paymentStatus = 'PENDING';
    } else if (payRaw.includes('PAID') && !payRaw.includes('UNPAID')) {
      paymentStatus = 'PAID';
    } else if (actualAmount > 0) {
      paymentStatus = 'PAID';
    } else {
      paymentStatus = 'UNPAID';
    }

    // Date Paid
    let datePaid = rawFields.datePaid;
    if (paymentStatus === 'PAID' && !datePaid) {
      datePaid = new Date().toISOString().slice(0, 10);
    }

    // Mythical Creature Group
    const groupAssignment = normalizeMythicalGroup(rawFields.groupAssignment, i);

    // Existing attendee check
    const existingAttendee = existingMap.get(cleanId.toLowerCase());
    const isExisting = !!existingAttendee;

    const record: AttendeeRegistration = {
      id: existingAttendee?.id || `reg-import-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      studentId: studentId.trim(),
      fullName: fullName.trim(),
      course,
      section,
      yearLevel,
      registrationType,
      amount: actualAmount,
      expectedAmount,
      actualAmount,
      paymentStatus,
      datePaid,
      groupAssignment,
      registeredAt: existingAttendee?.registeredAt || new Date().toISOString(),
      status: 'CONFIRMED',
    };

    validCount++;
    if (isExisting) {
      updateCount++;
    } else {
      newCount++;
    }

    parsedRows.push({
      rowNumber,
      isValid: true,
      isExisting,
      existingAttendee,
      record,
      warnings,
      rawFields,
    });
  }

  return {
    totalRows: tokenized.length - 1,
    validCount,
    invalidCount,
    newCount,
    updateCount,
    rows: parsedRows,
    headers: rawHeaders,
  };
}
