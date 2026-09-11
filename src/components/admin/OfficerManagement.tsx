import React, { useState } from 'react';
import { Officer, UserRole } from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { AddOfficerModal } from './AddOfficerModal';
import {
  Users,
  UserPlus,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Edit,
  Trash2,
  Lock,
  Unlock,
  Shuffle,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Mail,
  Calendar,
} from 'lucide-react';

export interface OfficerManagementProps {
  officers: Officer[];
  currentUserRole: UserRole;
  onAddOfficer: (data: { name: string; email: string; password?: string; role: 'ADMIN' | 'OFFICER' }) => Promise<void>;
  onUpdateOfficer: (updated: Officer) => void;
  onDeleteOfficer: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onChangeRole: (id: string, newRole: 'ADMIN' | 'OFFICER') => void;
}

export const OfficerManagement: React.FC<OfficerManagementProps> = ({
  officers,
  currentUserRole,
  onAddOfficer,
  onUpdateOfficer,
  onDeleteOfficer,
  onToggleStatus,
  onChangeRole,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'OFFICER'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOfficer, setEditingOfficer] = useState<Officer | null>(null);
  const [officerToDelete, setOfficerToDelete] = useState<Officer | null>(null);

  const isAdmin = currentUserRole === 'ADMIN';

  const filteredOfficers = officers.filter((off) => {
    const q = searchQuery.toLowerCase().trim();
    const matchQuery =
      off.name.toLowerCase().includes(q) ||
      off.email.toLowerCase().includes(q) ||
      off.role.toLowerCase().includes(q);
    const matchRole = roleFilter === 'ALL' || off.role === roleFilter;
    return matchQuery && matchRole;
  });

  const handleOpenAdd = () => {
    setEditingOfficer(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (officer: Officer) => {
    setEditingOfficer(officer);
    setIsModalOpen(true);
  };

  const handleModalSave = async (data: {
    name: string;
    email: string;
    password?: string;
    role: 'ADMIN' | 'OFFICER';
    status?: 'ACTIVE' | 'DISABLED';
  }) => {
    if (editingOfficer) {
      onUpdateOfficer({
        ...editingOfficer,
        name: data.name,
        email: data.email,
        role: data.role,
        status: data.status || editingOfficer.status,
      });
    } else {
      await onAddOfficer(data);
    }
  };

  const handleConfirmDelete = () => {
    if (officerToDelete) {
      onDeleteOfficer(officerToDelete.id);
      setOfficerToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Bar */}
      <div className="bg-[#FFFFFF] border-4 border-black p-5 shadow-[6px_6px_0px_#000000] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] font-black uppercase bg-black text-[#FFD93D] px-2 py-0.5 border border-black">
              ADMINISTRATION
            </span>
            <span className="text-xs font-mono font-bold text-gray-500 uppercase">
              PERSONNEL & PRIVILEGE DIRECTORY
            </span>
          </div>
          <h2 className="text-2xl font-black uppercase text-black tracking-tight">
            OFFICER MANAGEMENT
          </h2>
          <p className="text-xs font-mono font-bold text-gray-600 mt-1">
            Manage PSITS event committee officers, grant administrative credentials, and audit access activity.
          </p>
        </div>

        {/* Admin only Action Button */}
        {isAdmin ? (
          <Button
            variant="primary"
            size="lg"
            onClick={handleOpenAdd}
            leftIcon={<UserPlus className="w-5 h-5 stroke-[2.5]" />}
          >
            ADD OFFICER
          </Button>
        ) : (
          <div className="p-3 bg-[#FFFDF5] border-2 border-black font-mono text-xs text-gray-700 font-bold flex items-center gap-2">
            <Lock className="w-4 h-4 text-black shrink-0" />
            <span>OPERATIONAL ROLE: OFFICER CREATION RESTRICTED TO SYSTEM ADMINS</span>
          </div>
        )}
      </div>

      {/* Role Restriction Notice for Non-Admins */}
      {!isAdmin && (
        <div className="p-4 bg-[#FFD93D] border-4 border-black font-mono text-xs font-bold text-black flex items-start gap-3 shadow-[4px_4px_0px_#000000]">
          <ShieldAlert className="w-5 h-5 stroke-[3] shrink-0 text-black mt-0.5" />
          <div>
            <div className="font-black uppercase text-sm">OFFICER VIEW-ONLY ACCESS</div>
            <p className="mt-1">
              You are currently authenticated as an <strong>OFFICER</strong>. In accordance with security architecture, administrative modification controls (Add Officer, Edit, Disable, Delete, and Change Role) are hidden and restricted to <strong>ADMINS</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Search and Filter Controls */}
      <div className="bg-[#FFFFFF] border-4 border-black p-4 shadow-[4px_4px_0px_#000000] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search by officer name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto font-mono text-xs">
          <span className="font-bold text-gray-600 uppercase">ROLE FILTER:</span>
          <button
            onClick={() => setRoleFilter('ALL')}
            className={`px-2.5 py-1 font-black uppercase border-2 border-black shadow-[2px_2px_0px_#000000] cursor-pointer transition-all ${
              roleFilter === 'ALL'
                ? 'bg-black text-[#FFD93D]'
                : 'bg-white text-black hover:bg-gray-100'
            }`}
          >
            ALL ({officers.length})
          </button>
          <button
            onClick={() => setRoleFilter('ADMIN')}
            className={`px-2.5 py-1 font-black uppercase border-2 border-black shadow-[2px_2px_0px_#000000] cursor-pointer transition-all ${
              roleFilter === 'ADMIN'
                ? 'bg-[#FF6B6B] text-black'
                : 'bg-white text-black hover:bg-gray-100'
            }`}
          >
            ADMINS ({officers.filter((o) => o.role === 'ADMIN').length})
          </button>
          <button
            onClick={() => setRoleFilter('OFFICER')}
            className={`px-2.5 py-1 font-black uppercase border-2 border-black shadow-[2px_2px_0px_#000000] cursor-pointer transition-all ${
              roleFilter === 'OFFICER'
                ? 'bg-[#FFD93D] text-black'
                : 'bg-white text-black hover:bg-gray-100'
            }`}
          >
            OFFICERS ({officers.filter((o) => o.role === 'OFFICER').length})
          </button>
        </div>
      </div>

      {/* Officers Table (Desktop) */}
      <div className="border-4 border-black bg-[#FFFFFF] shadow-[8px_8px_0px_#000000] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black text-[#FFD93D] font-mono text-[11px] font-black uppercase tracking-wider border-b-4 border-black">
                <th className="py-3 px-4 border-r-2 border-black/40">NAME</th>
                <th className="py-3 px-4 border-r-2 border-black/40">EMAIL</th>
                <th className="py-3 px-3 border-r-2 border-black/40 text-center">ROLE</th>
                <th className="py-3 px-3 border-r-2 border-black/40 text-center">STATUS</th>
                <th className="py-3 px-3 border-r-2 border-black/40">DATE CREATED</th>
                <th className="py-3 px-3 border-r-2 border-black/40">LAST LOGIN</th>
                {isAdmin && <th className="py-3 px-4 text-center">ADMIN ACTIONS</th>}
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black text-xs font-bold uppercase font-mono">
              {filteredOfficers.map((officer, idx) => {
                const isEven = idx % 2 === 0;
                const isUserAdmin = officer.role === 'ADMIN';
                const isActive = officer.status === 'ACTIVE';

                return (
                  <tr
                    key={officer.id}
                    className={`hover:bg-[#FFFDF5] transition-colors ${
                      isEven ? 'bg-white' : 'bg-[#FAFAFA]'
                    } ${!isActive ? 'opacity-70 bg-gray-50' : ''}`}
                  >
                    {/* Name */}
                    <td className="py-3.5 px-4 font-black border-r-2 border-black text-black">
                      <div className="flex items-center gap-2">
                        <span className="text-base">
                          {isUserAdmin ? '🛡️' : '🎖️'}
                        </span>
                        <span>{officer.name}</span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-3.5 px-4 border-r-2 border-black text-gray-700 lowercase">
                      {officer.email}
                    </td>

                    {/* Role */}
                    <td className="py-3.5 px-3 border-r-2 border-black text-center">
                      <span
                        className={`inline-block px-2 py-0.5 font-mono font-black text-[10px] uppercase border border-black shadow-[1px_1px_0px_#000000] ${
                          isUserAdmin
                            ? 'bg-[#FF6B6B] text-black'
                            : 'bg-[#FFD93D] text-black'
                        }`}
                      >
                        {officer.role}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3 border-r-2 border-black text-center">
                      {isActive ? (
                        <span className="inline-flex items-center gap-1 bg-[#10B981] text-black px-2 py-0.5 text-[10px] font-mono font-black border border-black">
                          <CheckCircle2 className="w-3 h-3" />
                          ACTIVE
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-gray-300 text-gray-700 px-2 py-0.5 text-[10px] font-mono font-black border border-black">
                          <Lock className="w-3 h-3" />
                          DISABLED
                        </span>
                      )}
                    </td>

                    {/* Date Created */}
                    <td className="py-3.5 px-3 border-r-2 border-black text-gray-600 text-[11px] whitespace-nowrap">
                      {officer.dateCreated
                        ? new Date(officer.dateCreated).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'AUG 15, 2026'}
                    </td>

                    {/* Last Login */}
                    <td className="py-3.5 px-3 border-r-2 border-black text-gray-600 text-[11px] whitespace-nowrap">
                      {officer.lastLogin.includes('T')
                        ? new Date(officer.lastLogin).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : officer.lastLogin}
                    </td>

                    {/* Admin Actions (ONLY EXPOSED TO ADMINS) */}
                    {isAdmin && (
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5 flex-wrap justify-center">
                          {/* Change Role Button */}
                          <button
                            onClick={() =>
                              onChangeRole(
                                officer.id,
                                isUserAdmin ? 'OFFICER' : 'ADMIN'
                              )
                            }
                            className="px-2 py-1 bg-white hover:bg-[#C4B5FD] text-black font-mono font-black text-[10px] border-2 border-black shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1"
                            title={`Promote/Demote to ${isUserAdmin ? 'OFFICER' : 'ADMIN'}`}
                          >
                            <Shuffle className="w-3 h-3" />
                            <span>{isUserAdmin ? 'DEMOTE' : 'PROMOTE'}</span>
                          </button>

                          {/* Edit Officer */}
                          <button
                            onClick={() => handleOpenEdit(officer)}
                            className="px-2 py-1 bg-white hover:bg-[#FFD93D] text-black font-mono font-black text-[10px] border-2 border-black shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1"
                            title="Edit Officer Profile"
                          >
                            <Edit className="w-3 h-3" />
                            <span>EDIT</span>
                          </button>

                          {/* Toggle Active/Disabled */}
                          <button
                            onClick={() => onToggleStatus(officer.id)}
                            className={`px-2 py-1 font-mono font-black text-[10px] border-2 border-black shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1 ${
                              isActive
                                ? 'bg-white hover:bg-gray-200 text-black'
                                : 'bg-[#10B981] hover:bg-[#0ea5e9] text-black'
                            }`}
                            title={isActive ? 'Disable Officer' : 'Enable Officer'}
                          >
                            {isActive ? (
                              <>
                                <Lock className="w-3 h-3" />
                                <span>DISABLE</span>
                              </>
                            ) : (
                              <>
                                <Unlock className="w-3 h-3" />
                                <span>ENABLE</span>
                              </>
                            )}
                          </button>

                          {/* Delete Officer */}
                          <button
                            onClick={() => setOfficerToDelete(officer)}
                            className="px-2 py-1 bg-white hover:bg-[#FF6B6B] text-black font-mono font-black text-[10px] border-2 border-black shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1"
                            title="Delete Officer"
                          >
                            <Trash2 className="w-3 h-3 stroke-[2.5]" />
                            <span>DELETE</span>
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Officer Modal */}
      <AddOfficerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleModalSave}
        initialOfficer={editingOfficer}
      />

      {/* Delete Officer Confirmation Dialog */}
      {officerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white border-4 sm:border-8 border-black p-6 shadow-[12px_12px_0px_#000000] max-w-md w-full font-mono space-y-4">
            <div className="flex items-center gap-2 text-[#FF6B6B] font-black text-sm uppercase">
              <AlertTriangle className="w-5 h-5 stroke-[3]" />
              CONFIRM OFFICER DELETION
            </div>
            <p className="text-xs font-bold text-black">
              Are you sure you want to permanently delete officer <strong>{officerToDelete.name}</strong> ({officerToDelete.email})? This action revokes all event dashboard privileges immediately.
            </p>
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-black/20">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOfficerToDelete(null)}
              >
                CANCEL
              </Button>
              <Button
                variant="accent"
                size="sm"
                onClick={handleConfirmDelete}
                leftIcon={<Trash2 className="w-4 h-4" />}
              >
                DELETE OFFICER
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
