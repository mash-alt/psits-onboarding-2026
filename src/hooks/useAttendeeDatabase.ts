import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  AttendeeRegistration,
  AttendeeSearchState,
  AttendeeFilterState,
  AttendeeSortOption,
  AttendeePaginationState,
} from '../types';
import {
  getAttendees as getFirestoreAttendees,
  subscribeToAttendees,
  updateAttendee as updateFirestoreAttendee,
  deleteAttendee as deleteFirestoreAttendee,
  importAttendeesBatch as importFirestoreAttendees,
  AttendeeDoc,
} from '../services/firebase';

export const INITIAL_SEARCH_STATE: AttendeeSearchState = {
  query: '',
  field: 'ALL',
};

export const INITIAL_FILTER_STATE: AttendeeFilterState = {
  course: 'ALL',
  section: 'ALL',
  year: 'ALL',
  registrationType: 'ALL',
  group: 'ALL',
  paymentStatus: 'ALL',
  datePaid: '',
};

export const INITIAL_PAGINATION_STATE: AttendeePaginationState = {
  currentPage: 1,
  pageSize: 25,
};

function mapAttendeeDocToRegistration(doc: AttendeeDoc): AttendeeRegistration {
  // Normalize group ID to display name if lowercase
  const rawGroup = doc.groupId || 'Unassigned';
  const capitalizedGroup =
    rawGroup.charAt(0).toUpperCase() + rawGroup.slice(1).toLowerCase();

  return {
    id: doc.id,
    studentId: doc.studentId,
    fullName: doc.name,
    section: doc.section,
    yearLevel: (doc.year as '1st Year' | '2nd Year' | '3rd Year' | '4th Year') || '1st Year',
    course: doc.course,
    registrationType: doc.registrationType,
    amount: doc.actualAmount !== undefined ? doc.actualAmount : doc.expectedAmount,
    expectedAmount: doc.expectedAmount,
    actualAmount: doc.actualAmount,
    paymentStatus: doc.paymentStatus,
    datePaid: doc.datePaid,
    groupAssignment: capitalizedGroup,
    registeredAt: doc.registeredAt,
    status: 'CONFIRMED',
  };
}

export function useAttendeeDatabase(initialGroupFilter?: string | null) {
  // 1. Core Data State
  const [attendees, setAttendees] = useState<AttendeeRegistration[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 2. Search State
  const [searchState, setSearchState] = useState<AttendeeSearchState>(INITIAL_SEARCH_STATE);

  // 3. Filter State (Draft and Applied separated for explicit APPLY FILTERS workflow)
  const [draftFilters, setDraftFilters] = useState<AttendeeFilterState>(() => ({
    ...INITIAL_FILTER_STATE,
    group: initialGroupFilter || 'ALL',
  }));

  const [appliedFilters, setAppliedFilters] = useState<AttendeeFilterState>(() => ({
    ...INITIAL_FILTER_STATE,
    group: initialGroupFilter || 'ALL',
  }));

  // 4. Sort State
  const [sortOption, setSortOption] = useState<AttendeeSortOption>('STUDENT_ID_ASC');

  // 5. Pagination State
  const [pagination, setPagination] = useState<AttendeePaginationState>(INITIAL_PAGINATION_STATE);

  // Firestore is the source of truth; the production interface never falls back
  // to generated browser data.
  const loadAttendees = useCallback(async () => {
    setIsLoading(true);
    try {
      const docs = await getFirestoreAttendees();
      setAttendees(docs.map(mapAttendeeDocToRegistration));
    } catch {
      setAttendees([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAttendees();

    // Subscribe to real-time Firestore updates
    const unsubscribe = subscribeToAttendees((docs) => {
      if (docs && docs.length > 0) {
        setAttendees(docs.map(mapAttendeeDocToRegistration));
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [loadAttendees]);

  // Sync external group filter
  useEffect(() => {
    if (initialGroupFilter) {
      setDraftFilters((prev) => ({ ...prev, group: initialGroupFilter }));
      setAppliedFilters((prev) => ({ ...prev, group: initialGroupFilter }));
      setPagination((prev) => ({ ...prev, currentPage: 1 }));
    }
  }, [initialGroupFilter]);

  // Statistics across entire dataset
  const statistics = useMemo(() => {
    const total = attendees.length;
    let paid = 0;
    let unpaid = 0;
    let earlyBird = 0;
    let regular = 0;
    const groupCountMap = new Set<string>();

    attendees.forEach((a) => {
      if (a.paymentStatus === 'PAID') paid++;
      if (a.paymentStatus === 'UNPAID') unpaid++;
      if (a.registrationType === 'EARLY BIRD') earlyBird++;
      if (a.registrationType === 'REGULAR') regular++;
      if (a.groupAssignment && a.groupAssignment.trim()) {
        groupCountMap.add(a.groupAssignment.toLowerCase());
      }
    });

    return {
      totalAttendees: total,
      paid,
      unpaid,
      earlyBird,
      regular,
      activeGroupsCount: 12, // Exactly 12 official Mythical Creature Groups
    };
  }, [attendees]);

  // Available unique sections for dropdown
  const availableSections = useMemo(() => {
    const set = new Set<string>();
    attendees.forEach((a) => {
      if (a.section) set.add(a.section);
    });
    return Array.from(set).sort();
  }, [attendees]);

  // Filtered dataset
  const filteredAttendees = useMemo(() => {
    const q = searchState.query.trim().toLowerCase();

    return attendees.filter((att) => {
      // 1. Search Query Matching (Supports exact 8-digit match, name, course, section)
      if (q) {
        if (searchState.field === 'STUDENT_ID') {
          if (!att.studentId.toLowerCase().includes(q)) return false;
        } else if (searchState.field === 'NAME') {
          if (!att.fullName.toLowerCase().includes(q)) return false;
        } else if (searchState.field === 'COURSE') {
          if (!att.course?.toLowerCase().includes(q)) return false;
        } else if (searchState.field === 'SECTION') {
          if (!att.section.toLowerCase().includes(q)) return false;
        } else {
          // ALL fields matching
          const matchId = att.studentId.toLowerCase().includes(q);
          const matchName = att.fullName.toLowerCase().includes(q);
          const matchCourse = att.course ? att.course.toLowerCase().includes(q) : false;
          const matchSection = att.section.toLowerCase().includes(q);
          if (!matchId && !matchName && !matchCourse && !matchSection) return false;
        }
      }

      // 2. Applied Filter Matching
      if (appliedFilters.course !== 'ALL' && att.course !== appliedFilters.course) {
        return false;
      }

      if (appliedFilters.section !== 'ALL' && att.section !== appliedFilters.section) {
        return false;
      }

      if (appliedFilters.year !== 'ALL' && att.yearLevel !== appliedFilters.year) {
        return false;
      }

      if (
        appliedFilters.registrationType !== 'ALL' &&
        att.registrationType !== appliedFilters.registrationType
      ) {
        return false;
      }

      // Mythical Creature Group
      if (appliedFilters.group !== 'ALL') {
        const targetGroup = appliedFilters.group.toLowerCase();
        const assignedGroup = (att.groupAssignment || '').toLowerCase();
        if (targetGroup === 'unassigned') {
          if (assignedGroup !== '' && assignedGroup !== 'unassigned') return false;
        } else if (assignedGroup !== targetGroup) {
          return false;
        }
      }

      if (
        appliedFilters.paymentStatus !== 'ALL' &&
        att.paymentStatus !== appliedFilters.paymentStatus
      ) {
        return false;
      }

      if (appliedFilters.datePaid) {
        if (!att.datePaid || !att.datePaid.includes(appliedFilters.datePaid)) {
          return false;
        }
      }

      return true;
    });
  }, [attendees, searchState, appliedFilters]);

  // Sorted dataset
  const sortedAttendees = useMemo(() => {
    const list = [...filteredAttendees];

    list.sort((a, b) => {
      switch (sortOption) {
        case 'STUDENT_ID_ASC':
          return a.studentId.localeCompare(b.studentId, undefined, { numeric: true });
        case 'STUDENT_ID_DESC':
          return b.studentId.localeCompare(a.studentId, undefined, { numeric: true });
        case 'NAME_AZ':
          return a.fullName.localeCompare(b.fullName);
        case 'NAME_ZA':
          return b.fullName.localeCompare(a.fullName);
        case 'NEWEST_REGISTRATION':
          return new Date(b.registeredAt || 0).getTime() - new Date(a.registeredAt || 0).getTime();
        case 'OLDEST_REGISTRATION':
          return new Date(a.registeredAt || 0).getTime() - new Date(b.registeredAt || 0).getTime();
        case 'COURSE':
          return (a.course || '').localeCompare(b.course || '');
        case 'DATE_PAID':
          return (b.datePaid || '').localeCompare(a.datePaid || '');
        case 'MYTHICAL_GROUP':
          return (a.groupAssignment || '').localeCompare(b.groupAssignment || '');
        default:
          return 0;
      }
    });

    return list;
  }, [filteredAttendees, sortOption]);

  // Paginated dataset
  const totalPages = Math.max(1, Math.ceil(sortedAttendees.length / pagination.pageSize));
  const currentPageSafe = Math.min(pagination.currentPage, totalPages);

  const paginatedAttendees = useMemo(() => {
    const start = (currentPageSafe - 1) * pagination.pageSize;
    return sortedAttendees.slice(start, start + pagination.pageSize);
  }, [sortedAttendees, currentPageSafe, pagination.pageSize]);

  // Handlers for filter operations
  const applyDraftFilters = useCallback(() => {
    setAppliedFilters({ ...draftFilters });
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  }, [draftFilters]);

  const clearAllFilters = useCallback(() => {
    setDraftFilters(INITIAL_FILTER_STATE);
    setAppliedFilters(INITIAL_FILTER_STATE);
    setSearchState(INITIAL_SEARCH_STATE);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  }, []);

  const setSingleFilter = useCallback(
    <K extends keyof AttendeeFilterState>(key: K, value: AttendeeFilterState[K]) => {
      setDraftFilters((prev) => ({ ...prev, [key]: value }));
      setAppliedFilters((prev) => ({ ...prev, [key]: value }));
      setPagination((prev) => ({ ...prev, currentPage: 1 }));
    },
    []
  );

  // Handlers for attendee updates syncing to Firestore
  const handleUpdateAttendee = useCallback(async (updated: AttendeeRegistration) => {
    await updateFirestoreAttendee(updated.id, {
      studentId: updated.studentId,
      name: updated.fullName,
      section: updated.section,
      year: updated.yearLevel,
      course: updated.course,
      registrationType: updated.registrationType,
      actualAmount: updated.actualAmount !== undefined ? updated.actualAmount : updated.amount,
      paymentStatus: updated.paymentStatus,
      datePaid: updated.datePaid,
      groupId: (updated.groupAssignment || 'kapre').toLowerCase(),
    });
    setAttendees((prev) =>
      prev.map((a) => (a.id === updated.id ? { ...updated, id: updated.studentId } : a))
    );
  }, []);

  const handleUpdateAttendeeGroup = useCallback(
    async (attendee: AttendeeRegistration, newGroup: string) => {
      setAttendees((prev) =>
        prev.map((a) =>
          a.id === attendee.id ? { ...a, groupAssignment: newGroup } : a
        )
      );
      try {
        await updateFirestoreAttendee(attendee.id, {
          groupId: newGroup.toLowerCase(),
        });
      } catch (err) {
        console.error('Failed to update group in Firestore:', err);
      }
    },
    []
  );

  const handleDeleteAttendee = useCallback(async (attendee: AttendeeRegistration) => {
    await deleteFirestoreAttendee(attendee.id);
  }, []);

  // Bulk import handler with Firestore persistence
  const handleImportAttendees = useCallback(
    async (importedList: AttendeeRegistration[], overwriteExisting: boolean = true) => {
      const mappedDocs = importedList.map((item) => ({
        studentId: item.studentId,
        name: item.fullName,
        section: item.section,
        year: item.yearLevel,
        course: item.course,
        registrationType: item.registrationType,
        actualAmount: item.actualAmount !== undefined ? item.actualAmount : item.amount,
        paymentStatus: item.paymentStatus,
        groupId: (item.groupAssignment || 'kapre').toLowerCase(),
        datePaid: item.datePaid,
      }));

      const result = await importFirestoreAttendees(mappedDocs, overwriteExisting, 'csv-importer');
      await loadAttendees();
      return result;
    },
    [loadAttendees]
  );

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (appliedFilters.course !== 'ALL') count++;
    if (appliedFilters.section !== 'ALL') count++;
    if (appliedFilters.year !== 'ALL') count++;
    if (appliedFilters.registrationType !== 'ALL') count++;
    if (appliedFilters.group !== 'ALL') count++;
    if (appliedFilters.paymentStatus !== 'ALL') count++;
    if (appliedFilters.datePaid) count++;
    if (searchState.query.trim()) count++;
    return count;
  }, [appliedFilters, searchState.query]);

  return {
    attendees,
    sortedAttendees,
    paginatedAttendees,
    filteredCount: sortedAttendees.length,
    totalCount: attendees.length,
    statistics,
    isLoading,
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
    refreshData: loadAttendees,
  };
}
