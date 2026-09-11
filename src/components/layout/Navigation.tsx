import React, { useState } from 'react';
import { NavItem } from '../../types';
import { Menu, X, Flame, Shield, User, ArrowRight, LogOut, Monitor } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { StyleModeToggle } from './StyleModeToggle';

export interface NavigationProps {
  currentNav: NavItem;
  onNavigate: (item: NavItem) => void;
  onOpenRegister?: () => void;
  onOpenLogin?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentNav,
  onNavigate,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, userProfile, role, isOfficer, isAdmin, signOut } = useAuth();
  const { isRetro } = useTheme();

  const displayName = userProfile?.name || user?.displayName || user?.email?.split('@')[0] || '';
  const displayRole = (userProfile?.role || role || 'OFFICER').toUpperCase();

  const navItems: { label: NavItem; isAction?: boolean }[] = [
    { label: 'HOME' },
    { label: 'REGISTER', isAction: true },
    { label: 'ATTENDEES' },
    { label: 'GROUPS' },
    { label: 'SPIN THE WHEEL' },
    { label: 'ADMIN' },
    { label: 'LOGIN', isAction: true },
  ];

  const handleNavClick = (item: NavItem) => {
    setIsMobileMenuOpen(false);
    onNavigate(item);
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Logout error:', err);
    }
    onNavigate('HOME');
  };

  if (isRetro) {
    return (
      <header className="sticky top-0 z-40 w-full bg-[#C0C0C0] border-b-2 border-b-black shadow-[0px_2px_0px_#808080] font-sans">
        {/* Retro Window Title Bar */}
        <div className="bg-gradient-to-r from-[#000080] to-[#1084d0] text-white px-3 py-1 flex items-center justify-between text-xs font-bold select-none border-b border-black">
          <div className="flex items-center gap-2 truncate">
            <span className="w-3 h-3 bg-[#FFFF00] inline-block border border-black shrink-0"></span>
            <span className="truncate">PSITS ACQUAINTANCE PARTY '97 - CCS DEPARTMENT</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Style Toggle embedded in title bar or right strip */}
            <div className="hidden sm:block">
              <StyleModeToggle />
            </div>

            <div className="flex items-center gap-0.5">
              <span className="w-4 h-3.5 bg-[#C0C0C0] text-black text-[9px] font-bold flex items-center justify-center border border-t-white border-l-white border-r-black border-b-black shadow-[inset_0.5px_0.5px_0px_#DFDFDF]">
                _
              </span>
              <span className="w-4 h-3.5 bg-[#C0C0C0] text-black text-[9px] font-bold flex items-center justify-center border border-t-white border-l-white border-r-black border-b-black shadow-[inset_0.5px_0.5px_0px_#DFDFDF]">
                □
              </span>
              <span className="w-4 h-3.5 bg-[#C0C0C0] text-black text-[9px] font-bold flex items-center justify-center border border-t-white border-l-white border-r-black border-b-black shadow-[inset_0.5px_0.5px_0px_#DFDFDF]">
                ✕
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Toggle Bar when on small screens */}
        <div className="sm:hidden px-2 py-1 bg-[#E8E8E8] border-b border-[#808080] flex items-center justify-between">
          <StyleModeToggle />
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="px-2 py-1 bg-[#C0C0C0] border border-t-white border-l-white border-r-black border-b-black text-xs font-bold"
          >
            {isMobileMenuOpen ? 'CLOSE MENU' : 'MENU'}
          </button>
        </div>

        {/* Retro 1997 Menu & Toolbar */}
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-1.5 flex items-center justify-between gap-2">
          {/* Brand stamp */}
          <button
            onClick={() => handleNavClick('HOME')}
            className="flex items-center gap-1.5 px-2 py-1 bg-[#C0C0C0] border border-t-white border-l-white border-r-black border-b-black text-xs font-bold cursor-pointer hover:bg-[#D4D4D4] active:border-t-black active:border-l-black active:border-r-white active:border-b-white"
          >
            <span className="bg-[#000080] text-white px-1 font-mono text-[10px]">CCS</span>
            <span className="hidden sm:inline">PSITS PARTY</span>
          </button>

          {/* Desktop Toolbar buttons */}
          <nav className="hidden lg:flex items-center gap-1 flex-wrap">
            {navItems.map((item) => {
              const isActive = currentNav === item.label;
              const isRegister = item.label === 'REGISTER';
              const isLogin = item.label === 'LOGIN';

              if (isLogin) {
                if (user) {
                  return (
                    <div key="retro-user" className="flex items-center gap-1 ml-2">
                      <span className="px-2 py-1 bg-[#FFFFFF] border border-t-[#808080] border-l-[#808080] border-r-white border-b-white text-[11px] font-bold text-black">
                        {displayRole}: {displayName}
                      </span>
                      <button
                        onClick={handleLogout}
                        className="px-2 py-1 bg-[#C0C0C0] border border-t-white border-l-white border-r-black border-b-black text-[11px] font-bold text-black hover:bg-[#D4D4D4] cursor-pointer"
                      >
                        LOGOUT
                      </button>
                    </div>
                  );
                }

                return (
                  <button
                    key={item.label}
                    onClick={() => handleNavClick(item.label)}
                    className={`
                      px-2.5 py-1 text-xs font-bold uppercase transition-none cursor-pointer
                      ${
                        isActive
                          ? 'bg-[#000080] text-white border-2 border-t-[#000020] border-l-[#000020] border-r-[#6090E0] border-b-[#6090E0]'
                          : 'bg-[#C0C0C0] text-black border border-t-white border-l-white border-r-black border-b-black hover:bg-[#D4D4D4]'
                      }
                    `}
                  >
                    LOGIN
                  </button>
                );
              }

              return (
                <button
                  key={item.label}
                  onClick={() => handleNavClick(item.label)}
                  className={`
                    px-2.5 py-1 text-xs font-bold uppercase transition-none cursor-pointer select-none
                    ${
                      isActive
                        ? 'bg-[#E8E8E8] text-black border-2 border-t-[#000000] border-l-[#000000] border-r-[#FFFFFF] border-b-[#FFFFFF] shadow-[inset_1px_1px_0px_#808080] font-black'
                        : isRegister
                        ? 'bg-[#FFFF00] text-black border border-t-white border-l-white border-r-black border-b-black hover:bg-[#FFFF70]'
                        : 'bg-[#C0C0C0] text-black border border-t-white border-l-white border-r-black border-b-black hover:bg-[#D4D4D4]'
                    }
                  `}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Mobile menu trigger */}
          <div className="lg:hidden flex items-center gap-1">
            <button
              onClick={() => handleNavClick('REGISTER')}
              className="px-2 py-1 bg-[#FFFF00] text-black text-xs font-bold border border-t-white border-l-white border-r-black border-b-black"
            >
              REGISTER
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="px-2 py-1 bg-[#C0C0C0] text-black text-xs font-bold border border-t-white border-l-white border-r-black border-b-black"
            >
              {isMobileMenuOpen ? '✕' : '☰ MENU'}
            </button>
          </div>
        </div>

        {/* Retro Mobile Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-[#C0C0C0] border-t-2 border-t-[#808080] p-3 shadow-[0px_4px_0px_#000000]">
            <div className="space-y-1">
              <div className="bg-[#000080] text-white px-2 py-1 text-xs font-bold">
                PROGRAM SECTIONS
              </div>
              <div className="grid grid-cols-1 gap-1 pt-1">
                {navItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => handleNavClick(item.label)}
                    className={`
                      w-full text-left px-3 py-1.5 text-xs font-bold uppercase border border-t-white border-l-white border-r-black border-b-black
                      ${currentNav === item.label ? 'bg-[#000080] text-white' : 'bg-[#FFFFFF] text-black'}
                    `}
                  >
                    ▶ {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>
    );
  }

  // Neo-Brutalist default
  return (
    <header className="sticky top-0 z-40 w-full bg-[#FFFDF5] border-b-4 border-black">
      {/* Top announcement mini-bar */}
      <div className="bg-black text-[#FFD93D] px-4 py-1 flex items-center justify-between text-[11px] font-mono font-black uppercase tracking-widest border-b-2 border-black">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-none bg-[#FF6B6B] animate-ping"></span>
          <span>SYS.EVENT // PSITS ACQUAINTANCE PARTY 2026</span>
        </div>

        <div className="flex items-center gap-4 text-[#FFFDF5]">
          <div className="hidden md:flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-[#FFD93D] inline-block"></span>
              <span>CCS DEPT</span>
            </span>
            <span>//</span>
            <span>12 MYTHICAL CREATURE GROUPS</span>
            <span>//</span>
            <span className="text-[#FF6B6B] animate-pulse">OCTOBER 24, 2026</span>
          </div>
          {/* Style Mode Toggle embedded in top bar */}
          <StyleModeToggle />
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand Identity */}
          <button
            onClick={() => handleNavClick('HOME')}
            className="flex items-center gap-3 text-left group cursor-pointer focus:outline-none"
          >
            <div className="w-12 h-12 bg-[#FFD93D] border-4 border-black flex items-center justify-center font-black text-xl shadow-[3px_3px_0px_#000000] group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-[5px_5px_0px_#000000] transition-all">
              CCS
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-[10px] font-black uppercase tracking-widest bg-black text-[#FFD93D] px-1.5 py-0.5 w-fit border border-black">
                CCS DEPT // COMPUTER STUDIES
              </span>
              <span className="text-lg sm:text-xl font-black uppercase tracking-tight text-black group-hover:text-[#FF6B6B] transition-colors leading-none mt-0.5">
                ACQUAINTANCE PARTY
              </span>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1.5">
            {navItems.map((item) => {
              const isActive = currentNav === item.label;
              const isRegister = item.label === 'REGISTER';
              const isLogin = item.label === 'LOGIN';

              if (isRegister) {
                return (
                  <button
                    key={item.label}
                    onClick={() => handleNavClick(item.label)}
                    className="ml-2 px-4 py-2 bg-[#FFD93D] text-black font-black uppercase text-xs tracking-wider border-3 border-black shadow-[3px_3px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_#000000] active:translate-x-1 active:translate-y-1 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Flame className="w-3.5 h-3.5 fill-black" />
                    <span>REGISTER NOW</span>
                  </button>
                );
              }

              if (isLogin) {
                if (user) {
                  return (
                    <div key="user-badge" className="flex items-center gap-2 ml-1">
                      <button
                        onClick={() => handleNavClick('ADMIN')}
                        className="px-3 py-2 bg-[#C4B5FD] text-black font-black uppercase text-xs tracking-wider border-3 border-black shadow-[3px_3px_0px_#000000] flex items-center gap-1.5 cursor-pointer hover:bg-white"
                        title={displayName}
                      >
                        <User className="w-3.5 h-3.5" />
                        <span className="max-w-[120px] truncate">{displayName} ({displayRole})</span>
                      </button>
                      <button
                        onClick={handleLogout}
                        className="p-2 bg-black text-white hover:text-[#FF6B6B] border-3 border-black shadow-[3px_3px_0px_#000000] cursor-pointer"
                        title="Sign Out"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                }

                return (
                  <button
                    key={item.label}
                    onClick={() => handleNavClick(item.label)}
                    className="px-3.5 py-2 bg-black text-[#FFFFFF] hover:text-[#FFD93D] font-black uppercase text-xs tracking-wider border-3 border-black shadow-[3px_3px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_#000000] active:translate-x-1 active:translate-y-1 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>LOGIN</span>
                  </button>
                );
              }

              if (item.label === 'ADMIN') {
                return (
                  <button
                    key={item.label}
                    onClick={() => handleNavClick('ADMIN')}
                    className={`
                      px-3 py-2 font-black uppercase text-xs tracking-wider border-3 transition-all cursor-pointer select-none flex items-center gap-1.5
                      ${
                        isActive
                          ? 'bg-black text-[#FFD93D] border-black shadow-[3px_3px_0px_#FFD93D]'
                          : 'bg-white text-black border-black hover:bg-[#FFD93D] shadow-[2px_2px_0px_#000000]'
                      }
                    `}
                  >
                    <Shield className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>ADMIN</span>
                  </button>
                );
              }

              return (
                <button
                  key={item.label}
                  onClick={() => handleNavClick(item.label)}
                  className={`
                    px-3 py-2 font-black uppercase text-xs tracking-wider border-3 transition-all cursor-pointer select-none
                    ${
                      isActive
                        ? 'bg-black text-[#FFD93D] border-black shadow-[3px_3px_0px_#FFD93D]'
                        : 'bg-transparent text-black border-transparent hover:border-black hover:bg-[#FFFFFF] hover:shadow-[3px_3px_0px_#000000]'
                    }
                  `}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Mobile Brutalist Square Hamburger Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => handleNavClick('REGISTER')}
              className="px-3 py-1.5 bg-[#FFD93D] text-black font-black uppercase text-xs tracking-wider border-3 border-black shadow-[2px_2px_0px_#000000]"
            >
              REGISTER
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle navigation drawer"
              className="w-12 h-12 bg-black text-[#FFD93D] border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_#FFD93D] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
            >
              {isMobileMenuOpen ? (
                <X className="w-7 h-7 stroke-[3]" />
              ) : (
                <Menu className="w-7 h-7 stroke-[3]" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t-4 border-black bg-[#FFD93D] p-6 shadow-[0px_10px_0px_#000000]">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b-4 border-black pb-3">
              <span className="font-mono text-xs font-black uppercase tracking-widest text-black">
                NAVIGATION ROSTER
              </span>
              <span className="font-mono text-xs font-bold text-black bg-white px-2 py-0.5 border-2 border-black">
                12 MYTHICAL GROUPS
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {navItems.map((item) => {
                const isActive = currentNav === item.label;
                const isSpecial = item.label === 'REGISTER';
                const isLogin = item.label === 'LOGIN';

                return (
                  <button
                    key={item.label}
                    onClick={() => handleNavClick(item.label)}
                    className={`
                      w-full text-left p-3.5 font-black uppercase text-sm tracking-wider border-4 border-black flex items-center justify-between transition-all cursor-pointer
                      ${
                        isSpecial
                          ? 'bg-[#FFD93D] text-black shadow-[4px_4px_0px_#000000]'
                          : isLogin
                          ? 'bg-black text-white shadow-[4px_4px_0px_#FFD93D]'
                          : isActive
                          ? 'bg-[#C4B5FD] text-black shadow-[4px_4px_0px_#000000]'
                          : 'bg-white text-black hover:bg-[#FFFDF5] shadow-[3px_3px_0px_#000000]'
                      }
                    `}
                  >
                    <span className="flex items-center gap-2">
                      {isSpecial && <Flame className="w-4 h-4 fill-black" />}
                      {item.label}
                    </span>
                    <ArrowRight className="w-4 h-4 stroke-[3]" />
                  </button>
                );
              })}
            </div>

            {/* Event Info Stamp */}
            <div className="p-3 bg-[#FFFFFF] border-3 border-black text-xs font-bold uppercase space-y-1">
              <div className="flex justify-between text-gray-600 font-mono text-[10px]">
                <span>ORG: PSITS CCS DEPT</span>
                <span>COLLEGE OF COMPUTER STUDIES</span>
              </div>
              <p className="text-black font-black">
                12 OFFICIAL MYTHICAL CREATURE GROUPS
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
