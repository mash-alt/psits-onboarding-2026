import React, { useState, useEffect } from 'react';
import { NavItem, MythicalCreatureGroup, AdminSubSection } from './types';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
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
import { DEFAULT_EVENT_SETTINGS, EventSettingsDoc, getEventSettings, subscribeToEventSettings } from './services/firebase';

function AppContent() {
  const [currentNav, setCurrentNav] = useState<NavItem>('HOME');
  const [adminSubSection, setAdminSubSection] = useState<AdminSubSection>('DASHBOARD');
  const [selectedGroup, setSelectedGroup] = useState<MythicalCreatureGroup | null>(null);
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string | null>(null);
  const { isRetro } = useTheme();
  const { user, loading: authLoading } = useAuth();
  const [eventSettings, setEventSettings] = useState<EventSettingsDoc>(DEFAULT_EVENT_SETTINGS);

  useEffect(() => {
    getEventSettings().then(setEventSettings);
    return subscribeToEventSettings(setEventSettings);
  }, []);

  const eventDateLabel = new Intl.DateTimeFormat('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  }).format(new Date(`${eventSettings.eventDate}T00:00:00`));
  const eventTimeLabel = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric', minute: '2-digit',
  }).format(new Date(`1970-01-01T${eventSettings.callTime || '17:00'}:00`));

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
        text={`${eventSettings.eventName} // ${eventSettings.tagline} // ${eventDateLabel} // 12 MYTHICAL CREATURE GROUPS // SYSTEM ONLINE //`}
        variant="yellow"
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* 1. HOME VIEW */}
        {currentNav === 'HOME' && (
          <>
            <HeroSection
              eventName={eventSettings.eventName}
              tagline={eventSettings.tagline}
              eventDate={eventDateLabel}
              callTime={eventTimeLabel}
              venue={eventSettings.venue || 'Main Auditorium'}
              registrationStatus={eventSettings.registrationStatus}
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
        {currentNav === 'ADMIN' && authLoading && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-mono font-black text-sm uppercase">
            Restoring secure session...
          </div>
        )}
        {currentNav === 'ADMIN' && !authLoading && !user && (
          <LoginView
            onLoginSuccess={() => handleNavigate('ADMIN')}
            onNavigateToHome={() => handleNavigate('HOME')}
          />
        )}
        {currentNav === 'ADMIN' && !authLoading && user && (
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
        text={`${eventSettings.eventName} // ${eventDateLabel} // ${eventTimeLabel} // ${eventSettings.venue || 'MAIN AUDITORIUM'} // ${eventSettings.department || 'CCS DEPARTMENT'} //`}
        variant="red"
      />

      {/* Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenRegister={() => handleNavigate('REGISTER')}
        eventName={eventSettings.eventName}
        eventDate={eventDateLabel}
        callTime={eventTimeLabel}
        venue={eventSettings.venue || 'Main Auditorium'}
        registrationStatus={eventSettings.registrationStatus}
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
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
