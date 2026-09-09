import React, { useState, useMemo } from 'react';
import { MythicalCreatureGroup, AttendeeRegistration } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { getStoredAttendees } from '../../data/eventStore';
import {
  Users,
  Search,
  CheckCircle2,
  AlertCircle,
  Download,
  Filter,
  Layers,
  Sparkles,
  Cpu,
  Bookmark,
  X
} from 'lucide-react';

export interface GroupRosterModalProps {
  group: MythicalCreatureGroup | null;
  isOpen: boolean;
  onClose: () => void;
  totalEventAttendees: number;
}

export const GroupRosterModal: React.FC<GroupRosterModalProps> = ({
  group,
  isOpen,
  onClose,
  totalEventAttendees,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [yearFilter, setYearFilter] = useState<string>('ALL');
  const [courseFilter, setCourseFilter] = useState<string>('ALL');

  // Pull all live attendees for this group from the persistent store
  const allAttendees = useMemo(() => {
    if (!isOpen) return [];
    return getStoredAttendees();
  }, [isOpen]);

  const groupMembers = useMemo(() => {
    if (!group) return [];
    const groupNameLower = group.name.toLowerCase();
    return allAttendees.filter((att) => {
      const assignedLower = (att.groupAssignment || '').toLowerCase();
      // Handle alias for Magkukulam / Mangkukulam
      if (groupNameLower === 'magkukulam' || groupNameLower === 'mangkukulam') {
        return assignedLower === 'magkukulam' || assignedLower === 'mangkukulam';
      }
      return assignedLower === groupNameLower;
    });
  }, [allAttendees, group]);

  // Filtered members by search query, course, and year
  const filteredMembers = useMemo(() => {
    return groupMembers.filter((m) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.studentId.includes(searchQuery.trim());

      const matchesYear = yearFilter === 'ALL' || m.yearLevel === yearFilter;
      const matchesCourse = courseFilter === 'ALL' || m.course === courseFilter;

      return matchesSearch && matchesYear && matchesCourse;
    });
  }, [groupMembers, searchQuery, yearFilter, courseFilter]);

  if (!group) return null;

  const percentage =
    totalEventAttendees > 0
      ? ((groupMembers.length / totalEventAttendees) * 100).toFixed(1)
      : '0.0';

  const isDarkFaction = group.color === '#000000';

  // Export roster to CSV
  const handleExportCSV = () => {
    const headers = ['Student ID', 'Full Name', 'Course', 'Section', 'Year Level', 'Mythical Group', 'Status'];
    const rows = groupMembers.map((m) => [
      m.studentId,
      `"${m.fullName}"`,
      `"${m.course}"`,
      m.section,
      m.yearLevel,
      m.groupAssignment,
      m.status,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PSITS_Roster_${group.name.toUpperCase()}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${group.name.toUpperCase()} ROSTER`}
      subtitle={`OFFICIAL MYTHICAL CREATURE GROUP // ${group.tagline}`}
      badge="OFFICIAL GROUP ROSTER"
      headerVariant={group.color === '#FF6B6B' ? 'red' : group.color === '#C4B5FD' ? 'violet' : 'yellow'}
      maxWidth="3xl"
      footer={
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] font-mono font-black uppercase text-gray-600 flex items-center gap-1">
            <span>SHOWING</span>
            <span className="bg-black text-[#FFD93D] px-1.5 py-0.5">{filteredMembers.length}</span>
            <span>OF {groupMembers.length} REGISTERED FACTION MEMBERS</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              leftIcon={<Download className="w-4 h-4 stroke-[2.5]" />}
            >
              EXPORT CSV
            </Button>
            <Button variant="secondary" size="sm" onClick={onClose}>
              CLOSE ROSTER
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Faction Identity Banner */}
        <div
          className="border-4 border-black p-5 shadow-[6px_6px_0px_#000000] flex flex-col md:flex-row md:items-center justify-between gap-4"
          style={{
            backgroundColor: isDarkFaction ? '#18181B' : group.color,
            color: isDarkFaction ? '#FFFFFF' : '#000000',
          }}
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white text-black border-4 border-black flex items-center justify-center text-3xl shadow-[4px_4px_0px_#000000] shrink-0 font-black">
              {group.symbol}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-black uppercase tracking-widest bg-black text-[#FFD93D] px-2 py-0.5">
                  MYTHICAL CREATURE GROUP
                </span>
                <span className="font-mono text-[10px] font-black uppercase tracking-widest bg-white text-black px-2 py-0.5 border border-black">
                  {percentage}% OF ATTENDEES
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight mt-1 leading-none">
                {group.name}
              </h2>
              <p className="text-xs font-bold uppercase tracking-wide opacity-90 mt-1">
                {group.element}
              </p>
            </div>
          </div>

          {/* Member Count & Capacity KPI */}
          <div className="bg-white text-black border-4 border-black p-3 shadow-[4px_4px_0px_#000000] shrink-0 text-center min-w-[170px]">
            <div className="text-[10px] font-mono font-black text-gray-500 uppercase tracking-wider">
              OFFICIAL COUNT
            </div>
            <div className="text-3xl font-black font-mono text-black leading-tight">
              {groupMembers.length}
            </div>
            <div className="text-[11px] font-bold uppercase text-gray-700">
              {percentage}% of Total Event
            </div>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-[#FFFDF5] border-4 border-black p-4 shadow-[4px_4px_0px_#000000] space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="sm:col-span-6 relative">
              <label htmlFor="roster-search" className="sr-only">Search roster members</label>
              <Search className="w-4 h-4 text-black absolute left-3 top-1/2 -translate-y-1/2 stroke-[2.5]" />
              <input
                id="roster-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="SEARCH NAME OR STUDENT ID..."
                className="w-full pl-9 pr-3 py-2 bg-white text-black border-3 border-black font-mono text-xs uppercase font-bold focus:outline-none focus:bg-[#FFD93D] placeholder-gray-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-black hover:text-[#FF6B6B]"
                >
                  <X className="w-3.5 h-3.5 stroke-[3]" />
                </button>
              )}
            </div>

            {/* Year Level Filter */}
            <div className="sm:col-span-3">
              <select
                aria-label="Filter by Year Level"
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="w-full py-2 px-2 bg-white text-black border-3 border-black font-mono text-xs font-bold uppercase focus:outline-none focus:bg-[#FFD93D]"
              >
                <option value="ALL">ALL YEARS</option>
                <option value="1st Year">1ST YEAR</option>
                <option value="2nd Year">2ND YEAR</option>
                <option value="3rd Year">3RD YEAR</option>
                <option value="4th Year">4TH YEAR</option>
              </select>
            </div>

            {/* Course Filter */}
            <div className="sm:col-span-3">
              <select
                aria-label="Filter by Course"
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="w-full py-2 px-2 bg-white text-black border-3 border-black font-mono text-xs font-bold uppercase focus:outline-none focus:bg-[#FFD93D]"
              >
                <option value="ALL">ALL COURSES</option>
                <option value="BS Information Technology">BSIT</option>
                <option value="BS Computer Science">BSCS</option>
                <option value="BS Information Systems">BSIS</option>
                <option value="Associate in Computer Technology">ACT</option>
              </select>
            </div>
          </div>
        </div>

        {/* Member List Table / Cards */}
        <div className="border-4 border-black bg-white shadow-[6px_6px_0px_#000000] overflow-hidden">
          <div className="bg-black text-[#FFD93D] px-4 py-2 flex items-center justify-between font-mono text-xs font-black uppercase tracking-wider border-b-3 border-black">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>GROUP MEMBER LIST ({filteredMembers.length})</span>
            </div>
            <span className="hidden sm:inline text-white text-[10px]">
              STUDENT ID // NAME // COURSE // SECTION // YEAR
            </span>
          </div>

          <div className="max-h-[380px] overflow-y-auto divide-y-3 divide-black">
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member, index) => (
                <div
                  key={member.id || member.studentId}
                  className="p-3.5 hover:bg-[#FFFDF5] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <span className="w-7 h-7 bg-black text-white font-mono text-xs font-black flex items-center justify-center shrink-0">
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-black bg-[#FFD93D] text-black px-1.5 py-0.5 border border-black">
                          {member.studentId}
                        </span>
                        <h4 className="font-black text-sm uppercase tracking-tight text-black">
                          {member.fullName}
                        </h4>
                      </div>
                      <div className="text-xs font-bold text-gray-700 uppercase mt-0.5 flex items-center gap-2 flex-wrap">
                        <span className="text-black font-black">{member.course}</span>
                        <span>•</span>
                        <span className="font-mono font-black bg-gray-100 px-1 border border-black">
                          {member.section}
                        </span>
                        <span>•</span>
                        <span className="font-mono">{member.yearLevel}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <Badge
                      variant={member.status === 'CHECKED_IN' ? 'yellow' : 'white'}
                      size="sm"
                    >
                      {member.status === 'CHECKED_IN' ? 'CHECKED IN' : 'CONFIRMED'}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center space-y-2">
                <AlertCircle className="w-8 h-8 text-gray-400 mx-auto" />
                <p className="font-black uppercase text-sm text-black">
                  NO MEMBERS MATCH CURRENT SEARCH CRITERIA
                </p>
                <p className="font-mono text-xs text-gray-600">
                  Try clearing the search query or changing your course/year filters.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Group Info Stamp */}
        <div className="p-3 bg-black text-[#FFD93D] text-[11px] font-mono font-black uppercase flex flex-col sm:flex-row items-center justify-between gap-2 border-2 border-black">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-[#FF6B6B] inline-block"></span>
            <span>OFFICIAL MYTHICAL CREATURE GROUP</span>
          </span>
          <span className="text-white text-[10px]">
            12 BALANCED MYTHICAL CREATURE GROUPS
          </span>
        </div>
      </div>
    </Modal>
  );
};
