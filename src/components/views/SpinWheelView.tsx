import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  AttendeeRegistration,
  MythicalCreatureGroup,
} from '../../types';
import { OFFICIAL_MYTHICAL_GROUPS } from '../../data/mythicalGroups';
import {
  getAttendees as getFirestoreAttendees,
  subscribeToAttendees,
  getSpinHistory as getFirestoreSpinHistory,
  createSpinRecord as createFirestoreSpinRecord,
  clearSpinHistory as clearFirestoreSpinHistory,
  removeSpinRecord as removeFirestoreSpinRecord,
  setSpinWinnerRemoval,
  subscribeToSpinHistory,
  AttendeeDoc,
  SpinHistoryDoc,
  Prize,
  getEventSettings,
  subscribeToEventSettings,
  updateEventSettings,
} from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  Play,
  RotateCcw,
  UserX,
  UserCheck,
  Search,
  Filter,
  Trophy,
  Sparkles,
  Volume2,
  VolumeX,
  Users,
  History,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Crown,
  Maximize2,
  Minimize2,
  Gift,
  Pencil,
} from 'lucide-react';

export interface SpinWheelViewProps {
  onNavigateToAttendees?: () => void;
  onNavigateToGroups?: () => void;
  onSelectGroup?: (group: MythicalCreatureGroup) => void;
}

export const SpinWheelView: React.FC<SpinWheelViewProps> = ({
  onNavigateToAttendees,
  onNavigateToGroups,
  onSelectGroup,
}) => {
  const { user, isAdmin } = useAuth();
  const wheelStageRef = useRef<HTMLDivElement>(null);

  // Master attendee data & spin history
  const [allAttendees, setAllAttendees] = useState<AttendeeRegistration[]>([]);
  const [spinHistory, setSpinHistory] = useState<SpinHistoryDoc[]>([]);

  // Removed/excluded winners tracking
  const [removedWinnerIds, setRemovedWinnerIds] = useState<Set<string>>(new Set());

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('ALL');
  const [sectionFilter, setSectionFilter] = useState('ALL');
  const [yearFilter, setYearFilter] = useState('ALL');
  const [groupFilter, setGroupFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [participantPage, setParticipantPage] = useState(1);
  const [participantPageSize, setParticipantPageSize] = useState(25);
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<Set<string>>(new Set());

  // Wheel animation states
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotationDegrees, setRotationDegrees] = useState(0);
  const [activeWinner, setActiveWinner] = useState<AttendeeRegistration | null>(null);
  const [activeWinnerGroup, setActiveWinnerGroup] = useState<MythicalCreatureGroup | null>(null);
  const [currentScrambledName, setCurrentScrambledName] = useState<string>('READY TO DRAW');
  const [currentScrambledId, setCurrentScrambledId] = useState<string>('ID // --------');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [selectedPrizeId, setSelectedPrizeId] = useState('');
  const [prizeName, setPrizeName] = useState('');
  const [prizeValue, setPrizeValue] = useState('');
  const [editingPrizeId, setEditingPrizeId] = useState<string | null>(null);
  const activePrize = prizes.find((prize) => prize.id === selectedPrizeId) || null;

  // Map AttendeeDoc to AttendeeRegistration format
  const mapDocToRegistration = (doc: AttendeeDoc): AttendeeRegistration => {
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
  };

  // Audio synthesizer using Web Audio API
  const playArcadeTone = (freq: number, duration: number = 0.06, type: OscillatorType = 'square') => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // audio context muted or restricted by browser
    }
  };

  // Load data on mount & subscribe to Firestore updates
  useEffect(() => {
    getFirestoreAttendees().then((docs) => {
      setAllAttendees(docs.map(mapDocToRegistration));
    });
    getFirestoreSpinHistory().then(setSpinHistory);

    const unsubAttendees = subscribeToAttendees((docs) => {
      setAllAttendees(docs.map(mapDocToRegistration));
    });

    const unsubSpins = subscribeToSpinHistory((history) => {
      setSpinHistory(history);
    });

    return () => {
      unsubAttendees();
      unsubSpins();
    };
  }, []);

  useEffect(() => {
    getEventSettings().then((settings) => setPrizes(settings.prizes || []));
    return subscribeToEventSettings((settings) => setPrizes(settings.prizes || []));
  }, []);

  useEffect(() => {
    const syncFullscreen = () => setIsFullscreen(document.fullscreenElement === wheelStageRef.current);
    document.addEventListener('fullscreenchange', syncFullscreen);
    return () => document.removeEventListener('fullscreenchange', syncFullscreen);
  }, []);

  const toggleFullscreen = async () => {
    if (!wheelStageRef.current) return;
    if (document.fullscreenElement) await document.exitFullscreen();
    else await wheelStageRef.current.requestFullscreen();
  };

  const savePrize = async () => {
    const name = prizeName.trim();
    const value = prizeValue.trim();
    if (!name || !value || !isAdmin) return;
    const next = editingPrizeId
      ? prizes.map((prize) => prize.id === editingPrizeId ? { ...prize, name, value } : prize)
      : [...prizes, { id: `prize-${Date.now().toString(36)}`, name, value }];
    await updateEventSettings({ prizes: next }, user?.email || 'admin');
    setPrizes(next);
    setPrizeName('');
    setPrizeValue('');
    setEditingPrizeId(null);
  };

  const removePrize = async (id: string) => {
    if (!isAdmin) return;
    const next = prizes.filter((prize) => prize.id !== id);
    await updateEventSettings({ prizes: next }, user?.email || 'admin');
    if (selectedPrizeId === id) setSelectedPrizeId('');
    if (editingPrizeId === id) { setEditingPrizeId(null); setPrizeName(''); setPrizeValue(''); }
  };

  // Compute distinct filter options dynamically
  const filterOptions = useMemo(() => {
    const courses = Array.from(new Set(allAttendees.map((a) => a.course))).filter(Boolean);
    const sections = Array.from(new Set(allAttendees.map((a) => a.section))).filter(Boolean).sort();
    const years = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
    const groups = OFFICIAL_MYTHICAL_GROUPS.map((g) => g.name);

    return { courses, sections, years, groups };
  }, [allAttendees]);

  // Filtered participant pool (kept in memory, NOT rendered as 500+ DOM nodes)
  const filteredParticipants = useMemo(() => {
    return allAttendees.filter((attendee) => {
      // Search query filter
      const matchesSearch =
        searchQuery.trim() === '' ||
        attendee.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        attendee.studentId.includes(searchQuery.trim());

      // Dropdown filters
      const matchesCourse = courseFilter === 'ALL' || attendee.course === courseFilter;
      const matchesSection = sectionFilter === 'ALL' || attendee.section === sectionFilter;
      const matchesYear = yearFilter === 'ALL' || attendee.yearLevel === yearFilter;
      const matchesPayment = paymentFilter === 'ALL' || attendee.paymentStatus === paymentFilter;

      // Group filter (handling Magkukulam / Mangkukulam alias)
      let matchesGroup = true;
      if (groupFilter !== 'ALL') {
        const targetLower = groupFilter.toLowerCase();
        const assignedLower = (attendee.groupAssignment || '').toLowerCase();
        if (targetLower === 'magkukulam' || targetLower === 'mangkukulam') {
          matchesGroup = assignedLower === 'magkukulam' || assignedLower === 'mangkukulam';
        } else {
          matchesGroup = assignedLower === targetLower;
        }
      }

      return matchesSearch && matchesCourse && matchesSection && matchesYear && matchesPayment && matchesGroup;
    });
  }, [allAttendees, searchQuery, courseFilter, sectionFilter, yearFilter, paymentFilter, groupFilter]);

  const eligiblePool = useMemo(
    () => filteredParticipants.filter((attendee) => !removedWinnerIds.has(attendee.studentId)),
    [filteredParticipants, removedWinnerIds]
  );

  const participantPages = Math.max(1, Math.ceil(filteredParticipants.length / participantPageSize));
  const safeParticipantPage = Math.min(participantPage, participantPages);
  const paginatedParticipants = useMemo(() => {
    const start = (safeParticipantPage - 1) * participantPageSize;
    return filteredParticipants.slice(start, start + participantPageSize);
  }, [filteredParticipants, safeParticipantPage, participantPageSize]);

  const setParticipantExcluded = (studentIds: string[], excluded: boolean) => {
    setRemovedWinnerIds((previous) => {
      const next = new Set(previous);
      studentIds.forEach((studentId) => excluded ? next.add(studentId) : next.delete(studentId));
      return next;
    });
  };

  const toggleParticipantSelection = (studentId: string) => setSelectedParticipantIds((previous) => {
    const next = new Set(previous);
    next.has(studentId) ? next.delete(studentId) : next.add(studentId);
    return next;
  });

  // Execute Spin
  const handleSpin = () => {
    if (isSpinning || eligiblePool.length === 0) return;

    setIsSpinning(true);
    setShowWinnerModal(false);
    setActiveWinner(null);
    setActiveWinnerGroup(null);

    // Initial launch audio
    playArcadeTone(350, 0.15, 'sawtooth');

    // Uniformly pick winning attendee from the eligible filtered pool
    const winningIndex = Math.floor(Math.random() * eligiblePool.length);
    const selectedWinner = eligiblePool[winningIndex];

    // Identify winning group for wheel landing alignment
    const winnerGroupName = (selectedWinner.groupAssignment || '').toLowerCase();
    let matchedGroup = OFFICIAL_MYTHICAL_GROUPS.find(
      (g) =>
        g.name.toLowerCase() === winnerGroupName ||
        (g.id === 'magkukulam' && winnerGroupName === 'mangkukulam')
    );
    if (!matchedGroup) {
      matchedGroup = OFFICIAL_MYTHICAL_GROUPS[0];
    }

    // Determine target slice angle (12 slices = 30 deg each)
    const groupSliceIndex = OFFICIAL_MYTHICAL_GROUPS.findIndex((g) => g.id === matchedGroup!.id);
    const sliceAngle = 360 / OFFICIAL_MYTHICAL_GROUPS.length;
    // Pointer is at the top (0 deg). Segment center:
    const targetSliceCenter = (groupSliceIndex * sliceAngle) + (sliceAngle / 2);
    // Extra rotations (5 to 8 full revolutions)
    const extraRevolutions = 5 + Math.floor(Math.random() * 3);
    const totalTargetDegrees = (extraRevolutions * 360) + (360 - targetSliceCenter);

    setRotationDegrees((prev) => prev + totalTargetDegrees);

    // Rapid-cycle names in the digital readout during spin (arcade suspense without DOM weight)
    let cycleCount = 0;
    const scrambleInterval = setInterval(() => {
      cycleCount++;
      const randomCandidate = eligiblePool[Math.floor(Math.random() * eligiblePool.length)];
      if (randomCandidate) {
        setCurrentScrambledName(randomCandidate.fullName.toUpperCase());
        setCurrentScrambledId(`STUDENT ID: ${randomCandidate.studentId}`);
      }

      // Play tick audio on ticks
      if (cycleCount % 2 === 0) {
        playArcadeTone(500 + (cycleCount % 8) * 60, 0.03, 'square');
      }
    }, 60);

    // Deceleration & Landing timeout
    setTimeout(() => {
      clearInterval(scrambleInterval);
      setIsSpinning(false);
      setActiveWinner(selectedWinner);
      setActiveWinnerGroup(matchedGroup!);
      setCurrentScrambledName(selectedWinner.fullName.toUpperCase());
      setCurrentScrambledId(`STUDENT ID: ${selectedWinner.studentId}`);
      setShowWinnerModal(true);

      // Record to persistent Firestore spinHistory collection
      createFirestoreSpinRecord({
        winnerAttendeeId: selectedWinner.id,
        winnerName: selectedWinner.fullName,
        winnerStudentId: selectedWinner.studentId,
        groupId: matchedGroup!.id,
        spunBy: user?.email || 'officer',
        prizeId: activePrize?.id,
        prizeName: activePrize?.name,
        prizeValue: activePrize?.value,
      }).catch((err) => {
        console.error('Error saving spin record to Firestore:', err);
      });

      // Triumphant fanfare
      playArcadeTone(523.25, 0.15, 'triangle'); // C5
      setTimeout(() => playArcadeTone(659.25, 0.15, 'triangle'), 150); // E5
      setTimeout(() => playArcadeTone(783.99, 0.35, 'triangle'), 300); // G5
    }, 4000);
  };

  // Reset wheel position and filters
  const handleReset = () => {
    if (isSpinning) return;
    setRotationDegrees(0);
    setActiveWinner(null);
    setActiveWinnerGroup(null);
    setCurrentScrambledName('READY TO DRAW');
    setCurrentScrambledId('ID // --------');
    setShowWinnerModal(false);
  };

  // Exclude current winner from future spins
  const handleRemoveWinner = (studentId: string) => {
    setRemovedWinnerIds((prev) => {
      const next = new Set(prev);
      next.add(studentId);
      return next;
    });
    spinHistory.filter((record) => record.winnerStudentId === studentId).forEach((record) => {
      setSpinWinnerRemoval(record.id, true).catch(() => undefined);
    });
  };

  // Re-admit winner to pool
  const handleIncludeWinner = (studentId: string) => {
    setRemovedWinnerIds((prev) => {
      const next = new Set(prev);
      next.delete(studentId);
      return next;
    });
    spinHistory.filter((record) => record.winnerStudentId === studentId).forEach((record) => {
      setSpinWinnerRemoval(record.id, false).catch(() => undefined);
    });
  };

  // Clear spin history in Firestore
  const handleClearHistory = async () => {
    if (window.confirm('Are you sure you want to clear the entire spin history log?')) {
      try {
        await clearFirestoreSpinHistory();
        setSpinHistory([]);
      } catch (err) {
        console.error('Error clearing spin history:', err);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Banner & Header */}
      <div className="bg-[#FFFDF5] border-8 border-black p-6 sm:p-8 shadow-[10px_10px_0px_#000000] relative">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-black text-[#FFD93D] font-mono text-xs px-2.5 py-1 font-black uppercase border-2 border-black">
                SYS.RANDOMIZER // 500+ CAPABLE
              </span>
              <Badge variant="red" size="sm">
                EVENT ACTIVITY ENGINE
              </Badge>
              <Badge variant="yellow" size="sm">
                12 CREATURE GROUPS
              </Badge>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-black leading-none">
              SPIN THE{' '}
              <span className="bg-[#FFD93D] px-2 border-4 border-black inline-block -rotate-1 shadow-[4px_4px_0px_#000000]">
                WHEEL
              </span>
            </h1>

            <p className="text-xs sm:text-sm font-mono font-bold text-gray-700 uppercase">
              LIVE EVENT RAFFLE AND ATTENDEE RANDOMIZER
            </p>
          </div>

          {/* Quick SFX & Pool Counters */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="px-4 py-2.5 bg-white text-black border-3 border-black font-black uppercase text-xs flex items-center justify-center gap-2 shadow-[3px_3px_0px_#000000] cursor-pointer hover:bg-gray-100"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span>SFX: {soundEnabled ? 'ON' : 'MUTED'}</span>
            </button>

            <div className="p-3 bg-black text-[#FFD93D] border-3 border-black text-center font-mono shadow-[3px_3px_0px_#000000]">
              <div className="text-[10px] uppercase font-bold text-white">ACTIVE PARTICIPANT POOL</div>
              <div className="text-2xl font-black">{eligiblePool.length} ELIGIBLE</div>
              <div className="text-[10px] text-gray-400">
                {removedWinnerIds.size} REMOVED // {allAttendees.length} TOTAL
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="bg-white border-4 border-black shadow-[6px_6px_0px_#000000] overflow-hidden">
        <div className="bg-black text-[#FFD93D] px-4 py-3 flex flex-wrap items-center justify-between gap-3 font-mono font-black uppercase text-xs">
          <span>Participant Management</span>
          <span className="text-white">Total: {allAttendees.length} // Eligible: {allAttendees.length - removedWinnerIds.size} // Excluded: {removedWinnerIds.size}</span>
        </div>
        <div className="p-4 border-b-4 border-black grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input value={searchQuery} onChange={(event) => { setSearchQuery(event.target.value); setParticipantPage(1); }} placeholder="SEARCH ID OR NAME" className="border-3 border-black px-3 py-2 font-mono text-xs font-bold" aria-label="Search spin participants" />
          <select value={courseFilter} onChange={(event) => { setCourseFilter(event.target.value); setParticipantPage(1); }} className="border-3 border-black px-2 py-2 font-mono text-xs font-bold"><option value="ALL">ALL COURSES</option>{filterOptions.courses.map((course) => <option key={course} value={course}>{course}</option>)}</select>
          <select value={sectionFilter} onChange={(event) => { setSectionFilter(event.target.value); setParticipantPage(1); }} className="border-3 border-black px-2 py-2 font-mono text-xs font-bold"><option value="ALL">ALL SECTIONS</option>{filterOptions.sections.map((section) => <option key={section} value={section}>{section}</option>)}</select>
          <select value={yearFilter} onChange={(event) => { setYearFilter(event.target.value); setParticipantPage(1); }} className="border-3 border-black px-2 py-2 font-mono text-xs font-bold"><option value="ALL">ALL YEARS</option>{filterOptions.years.map((year) => <option key={year} value={year}>{year}</option>)}</select>
          <select value={groupFilter} onChange={(event) => { setGroupFilter(event.target.value); setParticipantPage(1); }} className="border-3 border-black px-2 py-2 font-mono text-xs font-bold"><option value="ALL">ALL GROUPS</option>{filterOptions.groups.map((group) => <option key={group} value={group}>{group}</option>)}</select>
          <select value={paymentFilter} onChange={(event) => { setPaymentFilter(event.target.value); setParticipantPage(1); }} className="border-3 border-black px-2 py-2 font-mono text-xs font-bold"><option value="ALL">ALL PAYMENTS</option><option value="PAID">PAID</option><option value="PENDING">PENDING</option><option value="UNPAID">UNPAID</option></select>
          <select value={participantPageSize} onChange={(event) => { setParticipantPageSize(Number(event.target.value)); setParticipantPage(1); }} className="border-3 border-black px-2 py-2 font-mono text-xs font-bold" aria-label="Participants per page"><option value={25}>25 PER PAGE</option><option value={50}>50 PER PAGE</option><option value={100}>100 PER PAGE</option></select>
          <div className="flex gap-2"><Button variant="dark" size="sm" onClick={() => setParticipantExcluded(Array.from(selectedParticipantIds), true)} disabled={selectedParticipantIds.size === 0}>EXCLUDE SELECTED</Button><Button variant="outline" size="sm" onClick={() => setParticipantExcluded(Array.from(selectedParticipantIds), false)} disabled={selectedParticipantIds.size === 0}>INCLUDE</Button></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-xs"><thead className="bg-[#FFFDF5] border-b-3 border-black font-mono font-black uppercase"><tr><th className="p-3"><input type="checkbox" aria-label="Select all on this page" checked={paginatedParticipants.length > 0 && paginatedParticipants.every((participant) => selectedParticipantIds.has(participant.studentId))} onChange={(event) => setSelectedParticipantIds((previous) => { const next = new Set(previous); paginatedParticipants.forEach((participant) => event.target.checked ? next.add(participant.studentId) : next.delete(participant.studentId)); return next; })} /></th><th className="p-3">Student ID</th><th className="p-3">Name</th><th className="p-3">Course</th><th className="p-3">Section</th><th className="p-3">Year</th><th className="p-3">Group</th><th className="p-3">Status</th><th className="p-3">Pool</th></tr></thead><tbody>
            {paginatedParticipants.map((participant) => { const excluded = removedWinnerIds.has(participant.studentId); return <tr key={participant.id} className="border-b-2 border-black"><td className="p-3"><input type="checkbox" checked={selectedParticipantIds.has(participant.studentId)} onChange={() => toggleParticipantSelection(participant.studentId)} aria-label={`Select ${participant.fullName}`} /></td><td className="p-3 font-mono font-black">{participant.studentId}</td><td className="p-3 font-black uppercase">{participant.fullName}</td><td className="p-3">{participant.course}</td><td className="p-3">{participant.section}</td><td className="p-3">{participant.yearLevel}</td><td className="p-3">{participant.groupAssignment}</td><td className="p-3">{participant.paymentStatus}</td><td className="p-3"><button onClick={() => setParticipantExcluded([participant.studentId], !excluded)} className={`border-2 border-black px-2 py-1 font-black ${excluded ? 'bg-white' : 'bg-[#FF6B6B]'}`}>{excluded ? 'INCLUDE' : 'EXCLUDE'}</button></td></tr>; })}
            {paginatedParticipants.length === 0 && <tr><td colSpan={9} className="p-8 text-center font-black uppercase">{allAttendees.length === 0 ? 'No participants. There are currently no registered attendees.' : 'No matching participants.'}</td></tr>}
          </tbody></table>
        </div>
        <div className="p-3 bg-[#FFFDF5] flex items-center justify-between gap-3 font-mono text-xs font-black"><span>PAGE {safeParticipantPage} OF {participantPages} // SELECT ALL ON THIS PAGE</span><div className="flex gap-2"><Button variant="outline" size="sm" disabled={safeParticipantPage === 1} onClick={() => setParticipantPage((page) => Math.max(1, page - 1))}>PREV</Button><Button variant="outline" size="sm" disabled={safeParticipantPage === participantPages} onClick={() => setParticipantPage((page) => Math.min(participantPages, page + 1))}>NEXT</Button></div></div>
      </section>

      <section className="bg-white border-4 border-black p-5 shadow-[6px_6px_0px_#000000] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-3 border-black pb-3">
          <div className="flex items-center gap-2"><Gift className="w-5 h-5" /><div><h2 className="font-black uppercase">Prize board</h2><p className="text-[10px] font-mono font-bold uppercase text-gray-600">Choose the prize awarded by the next spin</p></div></div>
          <select value={selectedPrizeId} onChange={(event) => setSelectedPrizeId(event.target.value)} className="border-3 border-black px-3 py-2 font-mono font-black text-xs bg-[#FFFDF5]" aria-label="Prize for next spin">
            <option value="">NO PRIZE SELECTED</option>
            {prizes.map((prize) => <option key={prize.id} value={prize.id}>{prize.name.toUpperCase()} — {prize.value}</option>)}
          </select>
        </div>
        {isAdmin ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_180px_auto] gap-2">
              <input value={prizeName} onChange={(event) => setPrizeName(event.target.value)} placeholder="PRIZE NAME — E.G. GCASH" className="border-3 border-black px-3 py-2 font-mono text-xs font-bold" />
              <input value={prizeValue} onChange={(event) => setPrizeValue(event.target.value)} placeholder="VALUE — E.G. ₱100" className="border-3 border-black px-3 py-2 font-mono text-xs font-bold" />
              <Button variant="primary" size="sm" onClick={() => savePrize().catch((error) => console.error('Failed to save prize:', error))}>{editingPrizeId ? 'UPDATE' : 'ADD PRIZE'}</Button>
            </div>
            {editingPrizeId && <button onClick={() => { setEditingPrizeId(null); setPrizeName(''); setPrizeValue(''); }} className="text-[10px] font-mono font-black uppercase underline">Cancel edit</button>}
            {prizes.length > 0 && <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {prizes.map((prize) => <div key={prize.id} className={`border-3 border-black px-3 py-2 flex items-center justify-between gap-2 ${selectedPrizeId === prize.id ? 'bg-[#FFD93D]' : 'bg-[#FFFDF5]'}`}><button onClick={() => setSelectedPrizeId(prize.id)} className="text-left min-w-0"><span className="block font-black uppercase text-xs truncate">{prize.name}</span><span className="font-mono font-bold text-[11px]">{prize.value}</span></button><span className="flex gap-1"><button aria-label={`Edit ${prize.name}`} onClick={() => { setEditingPrizeId(prize.id); setPrizeName(prize.name); setPrizeValue(prize.value); }} className="p-1 border-2 border-black bg-white"><Pencil className="w-3 h-3" /></button><button aria-label={`Remove ${prize.name}`} onClick={() => removePrize(prize.id).catch((error) => console.error('Failed to remove prize:', error))} className="p-1 border-2 border-black bg-[#FF6B6B]"><Trash2 className="w-3 h-3" /></button></span></div>)}
            </div>}
          </>
        ) : <p className="text-[10px] font-mono font-bold uppercase text-gray-600">An administrator manages the prize board. You can select an available prize for this draw.</p>}
      </section>

      {/* Main Wheel Arena Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Visual Wheel Stage & High-Speed Readout (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div ref={wheelStageRef} className={`bg-white border-8 border-black p-6 sm:p-8 shadow-[12px_12px_0px_#000000] flex flex-col items-center relative overflow-hidden ${isFullscreen ? 'w-screen h-screen justify-center bg-[#FFFDF5]' : ''}`}>
            <button onClick={() => toggleFullscreen().catch(() => undefined)} className="absolute right-4 top-4 z-30 p-2 bg-white border-3 border-black shadow-[3px_3px_0px_#000000]" aria-label={isFullscreen ? 'Exit fullscreen' : 'Open fullscreen'}>
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
            {activePrize && <div className="absolute left-4 top-4 z-30 bg-[#FFD93D] border-3 border-black px-3 py-2 shadow-[3px_3px_0px_#000000] text-center"><div className="text-[9px] font-mono font-black uppercase">Prize for this draw</div><div className="font-black uppercase text-sm">{activePrize.name} — {activePrize.value}</div></div>}
            {/* Top Pointer Ticker */}
            <div className="z-20 -mb-5 flex flex-col items-center">
              <div className="w-0 h-0 border-l-[18px] border-l-transparent border-r-[18px] border-r-transparent border-t-[34px] border-t-black drop-shadow-[0_4px_0_#FFD93D] animate-bounce" />
              <div className="w-3 h-3 bg-[#FF6B6B] border-2 border-black -mt-2 rotate-45" />
            </div>

            {/* The Single Lightweight Canvas / SVG Wheel (Zero 500+ DOM Nodes) */}
            <div className={`relative my-4 ${isFullscreen ? 'w-[min(70vw,55vh)] h-[min(70vw,55vh)]' : 'w-[320px] h-[320px] sm:w-[420px] sm:h-[420px]'}`}>
              <svg
                viewBox="0 0 400 400"
                className="w-full h-full filter drop-shadow-[6px_6px_0px_#000000]"
                style={{
                  transform: `rotate(${rotationDegrees}deg)`,
                  transition: isSpinning
                    ? 'transform 4s cubic-bezier(0.15, 0.9, 0.25, 1)'
                    : 'none',
                }}
              >
                {/* Outer Rim */}
                <circle cx="200" cy="200" r="195" fill="#000000" stroke="#000000" strokeWidth="8" />

                {/* 12 Mythical Creature Group Slices */}
                {OFFICIAL_MYTHICAL_GROUPS.map((group, index) => {
                  const sliceAngle = 360 / 12; // 30 deg
                  const startAngle = (index * sliceAngle - 90) * (Math.PI / 180);
                  const endAngle = ((index + 1) * sliceAngle - 90) * (Math.PI / 180);
                  const x1 = 200 + 190 * Math.cos(startAngle);
                  const y1 = 200 + 190 * Math.sin(startAngle);
                  const x2 = 200 + 190 * Math.cos(endAngle);
                  const y2 = 200 + 190 * Math.sin(endAngle);

                  // Text angle at center of wedge
                  const midAngle = (index * sliceAngle + sliceAngle / 2 - 90);
                  const textRad = midAngle * (Math.PI / 180);
                  const textX = 200 + 120 * Math.cos(textRad);
                  const textY = 200 + 120 * Math.sin(textRad);

                  const isDarkWedge = group.color === '#000000';

                  return (
                    <g key={group.id}>
                      {/* Wedge Path */}
                      <path
                        d={`M 200 200 L ${x1} ${y1} A 190 190 0 0 1 ${x2} ${y2} Z`}
                        fill={group.color}
                        stroke="#000000"
                        strokeWidth="3.5"
                      />

                      {/* Group Name & Symbol */}
                      <g transform={`rotate(${midAngle + 90}, ${textX}, ${textY})`}>
                        <text
                          x={textX}
                          y={textY - 14}
                          textAnchor="middle"
                          fill={isDarkWedge ? '#FFFFFF' : '#000000'}
                          fontSize="11"
                          fontWeight="900"
                          fontFamily="monospace"
                          letterSpacing="1"
                        >
                          {group.name.toUpperCase()}
                        </text>
                        <text
                          x={textX}
                          y={textY + 12}
                          textAnchor="middle"
                          fontSize="18"
                        >
                          {group.symbol}
                        </text>
                      </g>
                    </g>
                  );
                })}

                {/* Center Hub */}
                <circle cx="200" cy="200" r="44" fill="#FFFFFF" stroke="#000000" strokeWidth="6" />
                <circle cx="200" cy="200" r="36" fill="#FFD93D" stroke="#000000" strokeWidth="3" />
                <text
                  x="200"
                  y="196"
                  textAnchor="middle"
                  fill="#000000"
                  fontSize="12"
                  fontWeight="900"
                  fontFamily="monospace"
                >
                  PSITS
                </text>
                <text
                  x="200"
                  y="212"
                  textAnchor="middle"
                  fill="#000000"
                  fontSize="10"
                  fontWeight="900"
                  fontFamily="monospace"
                >
                  SPIN
                </text>
              </svg>
            </div>

            {/* High-Suspense Digital CRT Scrambler (Cycles candidates with zero DOM overhead) */}
            <div className="w-full bg-black border-4 border-black p-4 mt-2 shadow-[6px_6px_0px_#FFD93D] text-center space-y-1">
              <div className="text-[10px] font-mono font-black uppercase tracking-widest text-gray-400 flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-[#FF6B6B] animate-ping inline-block"></span>
                <span>PARTICIPANT SCRAMBLER // RANDOM SELECTION STREAM</span>
              </div>
              <div className="text-xl sm:text-2xl font-black font-mono text-[#FFD93D] tracking-tight truncate">
                {currentScrambledName}
              </div>
              <div className="text-xs font-mono text-white font-bold tracking-wider">
                {currentScrambledId}
              </div>
            </div>

            {/* Main Wheel Controls Bar */}
            <div className="w-full mt-6 grid grid-cols-1 sm:grid-cols-12 gap-3">
              <button
                onClick={handleSpin}
                disabled={isSpinning || eligiblePool.length === 0}
                className={`
                  sm:col-span-8 py-4 px-6 font-black uppercase text-base tracking-wider border-4 border-black
                  shadow-[6px_6px_0px_#000000] transition-all cursor-pointer flex items-center justify-center gap-3
                  ${
                    isSpinning || eligiblePool.length === 0
                      ? 'bg-gray-300 text-gray-600 border-gray-600 cursor-not-allowed shadow-none'
                      : 'bg-[#FFD93D] hover:bg-black hover:text-[#FFD93D] text-black hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0px_#000000] active:translate-x-1 active:translate-y-1'
                  }
                `}
              >
                <Play className="w-5 h-5 fill-current" />
                <span>{isSpinning ? 'SPINNING THE WHEEL...' : 'SPIN THE WHEEL NOW'}</span>
              </button>

              <button
                onClick={handleReset}
                disabled={isSpinning}
                className="sm:col-span-4 py-4 px-4 bg-white hover:bg-gray-100 text-black font-black uppercase text-xs tracking-wider border-4 border-black shadow-[4px_4px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4 stroke-[2.5]" />
                <span>RESET WHEEL</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Participant Pool Filters & Search (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border-6 border-black p-5 sm:p-6 shadow-[8px_8px_0px_#000000] space-y-4">
            <div className="flex items-center justify-between border-b-3 border-black pb-3">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-black stroke-[2.5]" />
                <h3 className="text-xl font-black uppercase tracking-tight text-black">
                  PARTICIPANT POOL
                </h3>
              </div>
              <span className="font-mono text-xs font-black bg-[#FFD93D] text-black px-2 py-0.5 border border-black">
                {eligiblePool.length} ELIGIBLE
              </span>
            </div>

            {/* Filter Form Controls */}
            <div className="space-y-3 text-xs font-mono font-bold">
              {/* Search */}
              <div>
                <label htmlFor="pool-search" className="block text-[11px] uppercase text-gray-700 mb-1">
                  SEARCH ATTENDEE (NAME OR STUDENT ID):
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-black absolute left-3 top-1/2 -translate-y-1/2 stroke-[2.5]" />
                  <input
                    id="pool-search"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="E.G. PEREZ OR 84920184..."
                    className="w-full pl-9 pr-3 py-2 bg-[#FFFDF5] text-black border-3 border-black uppercase font-bold focus:outline-none focus:bg-[#FFD93D]"
                  />
                </div>
              </div>

              {/* Course Filter */}
              <div>
                <label htmlFor="course-select" className="block text-[11px] uppercase text-gray-700 mb-1">
                  COURSE FILTER:
                </label>
                <select
                  id="course-select"
                  value={courseFilter}
                  onChange={(e) => setCourseFilter(e.target.value)}
                  className="w-full py-2 px-3 bg-[#FFFDF5] text-black border-3 border-black uppercase font-bold focus:outline-none focus:bg-[#FFD93D]"
                >
                  <option value="ALL">ALL COURSES (ALL CCS)</option>
                  {filterOptions.courses.map((course) => (
                    <option key={course} value={course}>
                      {course}
                    </option>
                  ))}
                </select>
              </div>

              {/* Section Filter */}
              <div>
                <label htmlFor="section-select" className="block text-[11px] uppercase text-gray-700 mb-1">
                  SECTION FILTER:
                </label>
                <select
                  id="section-select"
                  value={sectionFilter}
                  onChange={(e) => setSectionFilter(e.target.value)}
                  className="w-full py-2 px-3 bg-[#FFFDF5] text-black border-3 border-black uppercase font-bold focus:outline-none focus:bg-[#FFD93D]"
                >
                  <option value="ALL">ALL SECTIONS</option>
                  {filterOptions.sections.map((section) => (
                    <option key={section} value={section}>
                      {section}
                    </option>
                  ))}
                </select>
              </div>

              {/* Year Filter */}
              <div>
                <label htmlFor="year-select" className="block text-[11px] uppercase text-gray-700 mb-1">
                  YEAR LEVEL FILTER:
                </label>
                <select
                  id="year-select"
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  className="w-full py-2 px-3 bg-[#FFFDF5] text-black border-3 border-black uppercase font-bold focus:outline-none focus:bg-[#FFD93D]"
                >
                  <option value="ALL">ALL YEAR LEVELS</option>
                  {filterOptions.years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              {/* Group Filter */}
              <div>
                <label htmlFor="group-select" className="block text-[11px] uppercase text-gray-700 mb-1">
                  MYTHICAL CREATURE GROUP FILTER:
                </label>
                <select
                  id="group-select"
                  value={groupFilter}
                  onChange={(e) => setGroupFilter(e.target.value)}
                  className="w-full py-2 px-3 bg-[#FFFDF5] text-black border-3 border-black uppercase font-bold focus:outline-none focus:bg-[#FFD93D]"
                >
                  <option value="ALL">ALL 12 MYTHICAL GROUPS</option>
                  {filterOptions.groups.map((group) => (
                    <option key={group} value={group}>
                      {group.toUpperCase()} GROUP
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Filter Reset */}
            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setCourseFilter('ALL');
                  setSectionFilter('ALL');
                  setYearFilter('ALL');
                  setGroupFilter('ALL');
                }}
                className="text-[11px] font-mono font-black uppercase text-gray-700 hover:text-[#FF6B6B] underline cursor-pointer"
              >
                CLEAR ALL FILTERS
              </button>

              {removedWinnerIds.size > 0 && (
                <button
                  onClick={() => setRemovedWinnerIds(new Set())}
                  className="text-[11px] font-mono font-black uppercase text-blue-700 hover:text-black underline cursor-pointer flex items-center gap-1"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>RESTORE {removedWinnerIds.size} EXCLUDED</span>
                </button>
              )}
            </div>
          </div>

          {/* Active Removed Winners List (if any) */}
          {removedWinnerIds.size > 0 && (
            <div className="bg-[#FFFDF5] border-4 border-black p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono font-black uppercase">
                <span className="flex items-center gap-1.5 text-gray-700">
                  <UserX className="w-4 h-4 text-[#FF6B6B]" />
                  <span>REMOVED WINNERS ({removedWinnerIds.size})</span>
                </span>
                <button
                  onClick={() => setRemovedWinnerIds(new Set())}
                  className="text-[10px] font-black bg-black text-[#FFD93D] px-2 py-0.5"
                >
                  INCLUDE ALL BACK
                </button>
              </div>
              <div className="max-h-28 overflow-y-auto space-y-1 font-mono text-xs">
                {Array.from(removedWinnerIds).map((id: string) => {
                  const student = allAttendees.find((a) => a.studentId === id);
                  return (
                    <div
                      key={id}
                      className="p-1.5 bg-white border-2 border-black flex items-center justify-between"
                    >
                      <span className="font-bold truncate">{student?.fullName || id}</span>
                      <button
                        onClick={() => handleIncludeWinner(id)}
                        className="text-[10px] font-black uppercase bg-[#FFD93D] hover:bg-black hover:text-white px-1.5 py-0.5 border border-black cursor-pointer"
                      >
                        INCLUDE
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* WINNER SHOWCASE MODAL / CARD */}
      {showWinnerModal && activeWinner && activeWinnerGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white border-8 border-black p-6 sm:p-8 shadow-[16px_16px_0px_#000000] space-y-6 relative animate-in zoom-in-95">
            {/* Massive WINNER! Banner */}
            <div className="bg-[#FF6B6B] border-4 border-black p-4 text-center shadow-[6px_6px_0px_#000000] relative overflow-hidden">
              <div className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-white flex items-center justify-center gap-3">
                <Crown className="w-8 h-8 sm:w-12 sm:h-12 text-[#FFD93D] fill-current" />
                <span>WINNER!</span>
                <Crown className="w-8 h-8 sm:w-12 sm:h-12 text-[#FFD93D] fill-current" />
              </div>
              <div className="text-xs font-mono font-black uppercase tracking-widest text-black bg-[#FFD93D] border-2 border-black inline-block px-3 py-0.5 mt-2">
                OFFICIAL PSITS EVENT DRAW WINNER
              </div>
            </div>

            {/* Winner Identity Dossier */}
            <div className="bg-[#FFFDF5] border-4 border-black p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-black pb-3">
                <div>
                  <div className="text-[11px] font-mono font-black text-gray-500 uppercase">
                    STUDENT NAME:
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black uppercase text-black">
                    {activeWinner.fullName}
                  </h2>
                </div>

                <div className="text-left sm:text-right">
                  <div className="text-[11px] font-mono font-black text-gray-500 uppercase">
                    STUDENT ID:
                  </div>
                  <div className="font-mono text-xl font-black bg-black text-[#FFD93D] px-2.5 py-1 inline-block">
                    {activeWinner.studentId}
                  </div>
                </div>
              </div>

              {activePrize && (
                <div className="bg-[#FFD93D] border-4 border-black p-4 text-center shadow-[4px_4px_0px_#000000]">
                  <div className="text-[10px] font-mono font-black uppercase">Awarded prize</div>
                  <div className="text-2xl font-black uppercase">{activePrize.name} — {activePrize.value}</div>
                </div>
              )}

              {/* Course & Section Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-2.5 bg-white border-2 border-black">
                  <span className="text-[10px] font-mono text-gray-500 uppercase block">COURSE</span>
                  <span className="font-black text-xs uppercase text-black">{activeWinner.course}</span>
                </div>
                <div className="p-2.5 bg-white border-2 border-black">
                  <span className="text-[10px] font-mono text-gray-500 uppercase block">SECTION</span>
                  <span className="font-mono font-black text-xs uppercase text-black">{activeWinner.section}</span>
                </div>
                <div className="p-2.5 bg-white border-2 border-black">
                  <span className="text-[10px] font-mono text-gray-500 uppercase block">YEAR LEVEL</span>
                  <span className="font-mono font-black text-xs uppercase text-black">{activeWinner.yearLevel}</span>
                </div>
              </div>

              {/* REQUIRED: VISUALLY PROMINENT MYTHICAL CREATURE GROUP */}
              <div
                className="border-4 border-black p-5 shadow-[6px_6px_0px_#000000] flex items-center justify-between gap-4 mt-4"
                style={{
                  backgroundColor:
                    activeWinnerGroup.color === '#000000'
                      ? '#18181B'
                      : activeWinnerGroup.color,
                  color: activeWinnerGroup.color === '#000000' ? '#FFFFFF' : '#000000',
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white text-black border-4 border-black flex items-center justify-center text-3xl shadow-[3px_3px_0px_#000000] shrink-0 font-black">
                    {activeWinnerGroup.symbol}
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-black uppercase tracking-widest bg-black text-[#FFD93D] px-2 py-0.5">
                      MYTHICAL CREATURE GROUP
                    </span>
                    <h3 className="text-3xl sm:text-4xl font-black uppercase tracking-tight leading-none mt-1">
                      {activeWinnerGroup.name}
                    </h3>
                    <p className="text-xs font-bold uppercase tracking-wide opacity-90 mt-1">
                      {activeWinnerGroup.tagline}
                    </p>
                  </div>
                </div>

                <div className="hidden sm:block text-right shrink-0">
                  <Badge variant="black" size="md">
                    OFFICIAL GROUP
                  </Badge>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {removedWinnerIds.has(activeWinner.studentId) ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleIncludeWinner(activeWinner.studentId)}
                    leftIcon={<UserCheck className="w-4 h-4 stroke-[3]" />}
                  >
                    INCLUDE IN NEXT SPINS
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleRemoveWinner(activeWinner.studentId)}
                    leftIcon={<UserX className="w-4 h-4 stroke-[3]" />}
                  >
                    REMOVE FROM NEXT SPINS
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setShowWinnerModal(false)}
                >
                  DONE / CONTINUE
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SPIN HISTORY SECTION */}
      <div className="bg-white border-6 border-black p-6 sm:p-8 shadow-[10px_10px_0px_#000000] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-4 border-black pb-4">
          <div className="flex items-center gap-3">
            <History className="w-6 h-6 text-black stroke-[2.5]" />
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight text-black leading-none">
                SPIN HISTORY
              </h2>
              <p className="text-xs font-bold text-gray-600 uppercase mt-1">
                Official chronological draw ledger of winning participants
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-black bg-black text-[#FFD93D] px-2.5 py-1">
              {spinHistory.length} SPINS RECORDED
            </span>
            {spinHistory.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="px-3 py-1.5 bg-white hover:bg-[#FF6B6B] hover:text-white text-black font-black uppercase text-xs border-2 border-black flex items-center gap-1.5 shadow-[2px_2px_0px_#000000] cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>CLEAR LOG</span>
              </button>
            )}
          </div>
        </div>

        {/* History Table */}
        <div className="border-4 border-black overflow-x-auto shadow-[4px_4px_0px_#000000]">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-black text-[#FFD93D] border-b-3 border-black uppercase font-black tracking-wider">
              <tr>
                <th className="py-3 px-4">SPIN #</th>
                <th className="py-3 px-4">WINNER NAME</th>
                <th className="py-3 px-4">STUDENT ID</th>
                <th className="py-3 px-4">COURSE & SECTION</th>
                <th className="py-3 px-4">MYTHICAL GROUP</th>
                <th className="py-3 px-4">PRIZE</th>
                <th className="py-3 px-4">TIMESTAMP</th>
                <th className="py-3 px-4 text-right">POOL STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black bg-white">
              {spinHistory.length > 0 ? (
                spinHistory.map((record) => {
                  const studentId = record.winnerStudentId || (record as any).studentId || '';
                  const isExcluded = removedWinnerIds.has(studentId);
                  const groupObj = OFFICIAL_MYTHICAL_GROUPS.find(
                    (g) =>
                      g.id === (record.groupId || '').toLowerCase() ||
                      g.name.toLowerCase() === (record.groupId || (record as any).groupAssignment || '').toLowerCase()
                  );
                  const groupName = groupObj?.name || record.groupId || 'Kapre';

                  return (
                    <tr key={record.id} className="hover:bg-[#FFFDF5] transition-colors">
                      <td className="py-3 px-4 font-black text-black">
                        #{String(record.spinNumber).padStart(2, '0')}
                      </td>
                      <td className="py-3 px-4 font-black uppercase text-black text-sm">
                        {record.winnerName}
                      </td>
                      <td className="py-3 px-4">
                        <span className="bg-[#FFD93D] text-black px-1.5 py-0.5 border border-black font-black">
                          {studentId}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-black uppercase">
                        {record.prizeName ? <><span>{record.prizeName}</span><span className="block text-[10px] font-mono">{record.prizeValue}</span></> : '—'}
                      </td>
                      <td className="py-3 px-4 font-bold uppercase text-gray-800">
                        {(record as any).section || 'CCS'} • {(record as any).yearLevel || 'Student'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className="px-2 py-0.5 border border-black font-black uppercase text-[11px] inline-flex items-center gap-1.5"
                          style={{
                            backgroundColor: groupObj ? groupObj.color : '#FFD93D',
                            color: groupObj?.color === '#000000' ? '#FFFFFF' : '#000000',
                          }}
                        >
                          <span>{groupObj?.symbol || '⚡'}</span>
                          <span>{groupName}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 font-bold">{record.timestamp}</td>
                      <td className="py-3 px-4 text-right">
                        {isExcluded ? (
                          <button
                            onClick={() => handleIncludeWinner(record.winnerStudentId)}
                            className="text-[10px] font-black uppercase bg-white hover:bg-[#FFD93D] text-black px-2 py-1 border border-black cursor-pointer shadow-[1px_1px_0px_#000000]"
                          >
                            RE-INCLUDE
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRemoveWinner(record.winnerStudentId)}
                            className="text-[10px] font-black uppercase bg-[#FF6B6B] text-white px-2 py-1 border border-black cursor-pointer shadow-[1px_1px_0px_#000000]"
                          >
                            REMOVE
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500 font-bold uppercase">
                    NO SPINS RECORDED YET. CLICK &ldquo;SPIN THE WHEEL NOW&rdquo; TO COMMENCE ACTIVITY!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
