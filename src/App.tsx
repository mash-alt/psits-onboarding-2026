import React, { useState, useEffect } from 'react';
import { NavItem, MythicalCreatureGroup, AdminSubSection } from './types';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Navigation } from './components/layout/Navigation';
import { Footer } from './components/layout/Footer';
import { Marquee } from './components/layout/Marquee';
import { HeroSection } from './components/home/HeroSection';
import { GroupPreviewSection } from './components/home/GroupPreviewSection';
import { AttendeesView } from './components/views/AttendeesView';
import { GroupsView } from './components/views/GroupsView';
import { SpinWheelView } from './components/views/SpinWheelView';
import { LoginView } from './components/views/LoginView';
import { RegisterView } from './components/views/RegisterView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { GroupDetailModal } from './components/modals/GroupDetailModal';

function AppContent() {
  const [currentNav, setCurrentNav] = useState<NavItem>('HOME');
  const [adminSubSection, setAdminSubSection] = useState<AdminSubSection>('DASHBOARD');
  const [selectedGroup, setSelectedGroup] = useState<MythicalCreatureGroup | null>(null);
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string | null>(null);
  const { isRetro } = useTheme();

  // Sync initial route from URL path or hash (/login, /register, /admin, etc.)
  useEffect(() => {
    const handleUrlRoute = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase().replace('#/', '').replace('#', '');

      const route = hash || path;
      if (route.includes('admin/officers')) {
        setCurrentNav('ADMIN');
        setAdminSubSection('OFFICERS');
      } else if (route.includes('admin/settings')) {
        setCurrentNav('ADMIN');
        setAdminSubSection('SETTINGS');
      } else if (route.includes('admin/groups')) {
        setCurrentNav('ADMIN');
        setAdminSubSection('GROUPS');
      } else if (route.includes('admin')) {
        setCurrentNav('ADMIN');
        setAdminSubSection('DASHBOARD');
      } else if (route.includes('login') || route.includes('signup') || route.includes('sign-up')) {
        setCurrentNav('LOGIN');
      } else if (route.includes('register') || route.includes('registration')) {
        setCurrentNav('REGISTER');
      } else if (route.includes('attendee')) {
        setCurrentNav('ATTENDEES');
      } else if (route.includes('group')) {
        setCurrentNav('GROUPS');
      } else if (route.includes('spin') || route.includes('wheel')) {
        setCurrentNav('SPIN THE WHEEL');
      }
    };

    handleUrlRoute();
    window.addEventListener('hashchange', handleUrlRoute);
    window.addEventListener('popstate', handleUrlRoute);
    return () => {
      window.removeEventListener('hashchange', handleUrlRoute);
      window.removeEventListener('popstate', handleUrlRoute);
    };
  }, []);

  // Navigation handlers
  const handleNavigate = (item: NavItem, subSection?: AdminSubSection) => {
    setCurrentNav(item);
    if (subSection) {
      setAdminSubSection(subSection);
    }

    // Update URL hash for bookmarking and back-button support
    const slugMap: Record<NavItem, string> = {
      HOME: '',
      LOGIN: 'login',
      REGISTER: 'register',
      ATTENDEES: 'attendees',
      GROUPS: 'groups',
      'SPIN THE WHEEL': 'spin',
      ADMIN: 'admin',
    };

    const baseSlug = slugMap[item];
    const finalSlug =
      item === 'ADMIN' && subSection && subSection !== 'DASHBOARD'
        ? `admin/${subSection.toLowerCase()}`
        : baseSlug;

    if (finalSlug) {
      window.history.pushState(null, '', `#/${finalSlug}`);
    } else {
      window.history.pushState(null, '', window.location.pathname);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGroupSelect = (group: MythicalCreatureGroup) => {
    setSelectedGroup(group);
  };

  const handleViewRoster = (groupName: string) => {
    setSelectedGroup(null);
    setSelectedGroupFilter(groupName);
    handleNavigate('ATTENDEES');
  };

  return (
    <div
      className={`min-h-screen flex flex-col transition-none ${
        isRetro
          ? 'bg-[#008080] text-black font-sans selection:bg-[#000080] selection:text-white'
          : 'bg-[#FFFDF5] text-black font-sans selection:bg-[#FFD93D] selection:text-black'
      }`}
    >
      {/* Navigation Shell */}
      <Navigation
        currentNav={currentNav}
        onNavigate={handleNavigate}
      />

      {/* Top Event Marquee */}
      <Marquee
        text="PSITS // CCS DEPARTMENT // COLLEGE OF COMPUTER STUDIES // ACQUAINTANCE PARTY // 12 MYTHICAL CREATURE GROUPS // SYSTEM ONLINE // CONNECT // COMPETE // CHAOS //"
        variant="yellow"
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* 1. HOME VIEW */}
        {currentNav === 'HOME' && (
          <>
            <HeroSection
              onRegisterClick={() => handleNavigate('REGISTER')}
              onViewAttendeesClick={() => handleNavigate('ATTENDEES')}
              onExploreGroupsClick={() => {
                const el = document.getElementById('mythical-groups');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              onSpinWheelClick={() => handleNavigate('SPIN THE WHEEL')}
            />

            {/* Mid-page Accent Marquee */}
            <Marquee
              text="12 MYTHICAL CREATURE GROUPS // AUTHENTIC FILIPINO LORE // CCS DEPARTMENT // PSITS 2026 //"
              variant="black"
            />

            {/* 12 Mythical Creature Groups Section */}
            <GroupPreviewSection onSelectGroup={handleGroupSelect} />
          </>
        )}

        {/* 2. OFFICER LOGIN VIEW */}
        {currentNav === 'LOGIN' && (
          <LoginView
            onLoginSuccess={() => handleNavigate('ADMIN')}
            onNavigateToHome={() => handleNavigate('HOME')}
          />
        )}

        {/* 3. ATTENDEE REGISTRATION VIEW */}
        {currentNav === 'REGISTER' && (
          <RegisterView
            onNavigateToAttendees={(groupFilter) => {
              if (groupFilter) setSelectedGroupFilter(groupFilter);
              handleNavigate('ATTENDEES');
            }}
            onNavigateToHome={() => handleNavigate('HOME')}
          />
        )}

        {/* 5. ATTENDEES DIRECTORY */}
        {currentNav === 'ATTENDEES' && (
          <AttendeesView
            onOpenRegister={() => handleNavigate('REGISTER')}
            selectedGroupFilter={selectedGroupFilter}
            onClearGroupFilter={() => setSelectedGroupFilter(null)}
          />
        )}

        {/* 6. GROUPS DIRECTORY */}
        {currentNav === 'GROUPS' && (
          <GroupsView
            onSelectGroup={handleGroupSelect}
            onNavigateToAttendees={() => handleNavigate('ATTENDEES')}
            onNavigateToSpinWheel={() => handleNavigate('SPIN THE WHEEL')}
          />
        )}

        {/* 7. SPIN THE WHEEL */}
        {currentNav === 'SPIN THE WHEEL' && (
          <SpinWheelView
            onNavigateToAttendees={() => handleNavigate('ATTENDEES')}
            onNavigateToGroups={() => handleNavigate('GROUPS')}
            onSelectGroup={handleGroupSelect}
          />
        )}

        {/* 8. PSITS CONTROL CENTER (ADMINISTRATION & GOVERNANCE) */}
        {currentNav === 'ADMIN' && (
          <AdminDashboard
            initialSubSection={adminSubSection}
            onNavigateToRegister={() => handleNavigate('REGISTER')}
            onNavigateToAttendees={() => handleNavigate('ATTENDEES')}
            onNavigateToGroups={() => handleNavigate('GROUPS')}
            onNavigateToSpinWheel={() => handleNavigate('SPIN THE WHEEL')}
            onNavigateToHome={() => handleNavigate('HOME')}
          />
        )}
      </main>

      {/* Bottom Marquee Accent */}
      <Marquee
        text="PSITS ACQUAINTANCE PARTY // OCTOBER 24 2026 // 5:00 PM // CCS DEPARTMENT // COLLEGE OF COMPUTER STUDIES //"
        variant="red"
      />

      {/* Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenRegister={() => handleNavigate('REGISTER')}
      />

      {/* Group Detail Modal */}
      <GroupDetailModal
        group={selectedGroup}
        isOpen={!!selectedGroup}
        onClose={() => setSelectedGroup(null)}
        onViewRoster={handleViewRoster}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
