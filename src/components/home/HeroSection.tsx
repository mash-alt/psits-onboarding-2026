import React from 'react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { StatCard } from '../ui/StatCard';
import {
  Users,
  Calendar,
  Zap,
  Activity,
  ArrowRight,
  Terminal,
  Radio,
  Sparkles,
  Dices,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export interface HeroSectionProps {
  eventName: string;
  tagline: string;
  eventDate: string;
  callTime: string;
  venue: string;
  registrationStatus: string;
  onRegisterClick: () => void;
  onViewAttendeesClick: () => void;
  onExploreGroupsClick: () => void;
  onSpinWheelClick?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  eventName,
  tagline,
  eventDate,
  callTime,
  venue,
  registrationStatus,
  onRegisterClick,
  onViewAttendeesClick,
  onExploreGroupsClick,
  onSpinWheelClick,
}) => {
  const { isRetro } = useTheme();

  if (isRetro) {
    return (
      <section className="w-full pt-4 pb-10 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Windows 95 Event Window */}
          <div className="bg-[#C0C0C0] border-2 border-t-[#FFFFFF] border-l-[#FFFFFF] border-r-[#000000] border-b-[#000000] shadow-[inset_1px_1px_0px_#DFDFDF,inset_-1px_-1px_0px_#808080] p-1 mb-6">
            {/* Window Titlebar */}
            <div className="bg-gradient-to-r from-[#000080] to-[#1084d0] text-white px-3 py-1 flex items-center justify-between font-bold text-xs select-none mb-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-[#FFFF00] border border-black inline-block"></span>
                <span>{eventName} - SYSTEM CONTROL PANEL</span>
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

            {/* Inner Content Area */}
            <div className="bg-[#FFFFFF] p-6 border-2 border-t-[#808080] border-l-[#808080] border-r-[#FFFFFF] border-b-[#FFFFFF] text-black space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#C0C0C0] pb-4">
                <div>
                  <div className="inline-block bg-[#000080] text-white text-[11px] font-bold px-2 py-0.5 uppercase mb-1">
                    COLLEGE OF COMPUTER STUDIES (CCS)
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-black">
                    {eventName}
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-700 mt-1">
                    {tagline}
                  </p>
                </div>

                <div className="bg-[#E8E8E8] border border-t-[#808080] border-l-[#808080] border-r-white border-b-white p-2.5 text-xs text-black min-w-[220px]">
                  <div className="flex justify-between py-0.5 font-bold">
                    <span>DATE:</span>
                    <span>{eventDate}</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span>TIME:</span>
                    <span>{callTime}</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span>VENUE:</span>
                    <span>{venue}</span>
                  </div>
                  <div className="flex justify-between py-0.5 text-[#008000] font-bold">
                    <span>STATUS:</span>
                    <span>{registrationStatus} / READY</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Toolbar */}
              <div>
                <div className="text-xs font-bold text-gray-700 uppercase mb-2">
                  DIRECT COMMANDS:
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={onRegisterClick}
                    leftIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    REGISTER ATTENDEE
                  </Button>

                  <Button
                    variant="secondary"
                    size="md"
                    onClick={onViewAttendeesClick}
                    leftIcon={<Users className="w-3.5 h-3.5" />}
                  >
                    VIEW ATTENDEES
                  </Button>

                  <Button
                    variant="secondary"
                    size="md"
                    onClick={onExploreGroupsClick}
                    leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                  >
                    GROUPS
                  </Button>

                  <Button
                    variant="secondary"
                    size="md"
                    onClick={onSpinWheelClick || onExploreGroupsClick}
                    leftIcon={<Dices className="w-3.5 h-3.5" />}
                  >
                    SPIN THE WHEEL
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              label="REGISTRATION STATUS"
              value={registrationStatus}
              subtext={`REGISTRATION ${registrationStatus}`}
              badge={registrationStatus}
              variant="yellow"
              icon={<Activity className="w-4 h-4" />}
              trend="100% UPTIME"
            />

            <StatCard
              label="REGISTERED ATTENDEES"
              value="384 / 450"
              subtext="85% CAPACITY FILLED"
              badge="PHASE 1"
              variant="white"
              icon={<Users className="w-4 h-4" />}
              trend="+24 TODAY"
            />

            <StatCard
              label="MYTHICAL GROUPS"
              value="12 / 12"
              subtext="ALL ROSTERS BALANCED"
              badge="BALANCED"
              variant="violet"
              icon={<Zap className="w-4 h-4" />}
              trend="12 FACTIONS"
            />

            <StatCard
              label="EVENT DATE"
              value={eventDate}
              subtext={`${callTime} // ${venue}`}
              badge={eventDate.split(',').pop()?.trim() || 'EVENT'}
              variant="red"
              icon={<Calendar className="w-4 h-4" />}
              trend="ACTIVE"
            />
          </div>
        </div>
      </section>
    );
  }

  // Neo-Brutalist default
  return (
    <section className="relative w-full pt-8 pb-16 overflow-hidden">
      {/* Background Decorative Tech Grid & Accents */}
      <div className="absolute inset-0 bg-grid-pattern opacity-60 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Floating Top Decorative Badges & Labels */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="bg-black text-[#FFD93D] font-mono text-xs sm:text-sm px-3 py-1 font-black uppercase border-3 border-black shadow-[3px_3px_0px_#000000]">
              CCS DEPARTMENT // COLLEGE OF COMPUTER STUDIES
            </span>
            <Badge variant="red" size="md" tilt="left" icon={<Radio className="w-3.5 h-3.5 animate-pulse" />}>
              SYSTEM ONLINE
            </Badge>
            <Badge variant="yellow" size="md" tilt="right">
              REGISTRATION {registrationStatus}
            </Badge>
          </div>

          <div className="hidden md:flex items-center gap-2 font-mono text-xs font-black uppercase text-black bg-[#FFFFFF] border-3 border-black px-3 py-1 shadow-[3px_3px_0px_#000000]">
            <Terminal className="w-3.5 h-3.5" />
            <span>NODE // ASG-2026-CCS</span>
          </div>
        </div>

        {/* Massive Hero Typography & Composition */}
        <div className="relative border-8 border-black bg-[#FFFFFF] p-6 sm:p-10 lg:p-14 shadow-[16px_16px_0px_#000000] overflow-hidden">
          {/* Top Hazard Accent Stripe */}
          <div className="absolute top-0 left-0 right-0 h-4 bg-hazard-stripes border-b-4 border-black"></div>

          {/* Decorative Corner Watermarks & Stamps */}
          <div className="absolute -right-6 -bottom-6 opacity-10 font-black text-9xl font-mono select-none pointer-events-none text-black">
            2026
          </div>

          {/* Floating Sticker Tags on the card */}
          <div className="absolute right-4 top-8 sm:right-8 sm:top-10 flex flex-col items-end gap-2 z-20">
            <div className="bg-[#C4B5FD] text-black font-black text-xs sm:text-sm uppercase px-3 py-1 border-3 border-black shadow-[4px_4px_0px_#000000] rotate-3 hover:rotate-0 transition-transform">
              ⚡ 12 GROUPS
            </div>
            <div className="bg-[#FF6B6B] text-black font-black text-[11px] sm:text-xs uppercase px-2.5 py-0.5 border-3 border-black shadow-[3px_3px_0px_#000000] -rotate-2">
              MYTHICAL CREATURE GROUPS
            </div>
          </div>

          {/* Main Massive Headline */}
          <div className="pt-4 sm:pt-6 space-y-1 sm:space-y-2">
            <div className="inline-block">
              <span className="text-4xl sm:text-7xl lg:text-9xl font-black uppercase tracking-tighter text-black leading-none block">
                PSITS
              </span>
            </div>

            <div className="relative inline-block my-1">
              {/* Offset Yellow Block Highlight */}
              <div className="absolute -inset-2 bg-[#FFD93D] border-4 border-black -rotate-1 shadow-[6px_6px_0px_#000000]"></div>
              <span className="relative text-3xl sm:text-6xl lg:text-8xl font-black uppercase tracking-tight text-black leading-none px-2 block">
                ACQUAINTANCE
              </span>
            </div>

            <div>
              <span
                className="text-4xl sm:text-7xl lg:text-9xl font-black uppercase tracking-tighter text-black leading-none block"
                style={{
                  WebkitTextStroke: '3px black',
                  color: '#FFFDF5',
                  textShadow: '6px 6px 0px #FF6B6B',
                }}
              >
                PARTY
              </span>
            </div>
          </div>

          {/* The Triad Pillar Stickers: CONNECT // COMPETE // CHAOS */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 my-8 pt-2">
            <div className="bg-[#FFD93D] text-black font-black uppercase text-sm sm:text-lg px-4 py-2 border-4 border-black shadow-[4px_4px_0px_#000000] -rotate-2">
              CONNECT
            </div>
            <div className="bg-[#FF6B6B] text-black font-black uppercase text-sm sm:text-lg px-4 py-2 border-4 border-black shadow-[4px_4px_0px_#000000] rotate-1">
              COMPETE
            </div>
            <div className="bg-[#C4B5FD] text-black font-black uppercase text-sm sm:text-lg px-4 py-2 border-4 border-black shadow-[4px_4px_0px_#000000] -rotate-3">
              CHAOS
            </div>
            <span className="text-xs sm:text-sm font-mono font-black uppercase bg-black text-[#FFFDF5] px-3 py-1 border-2 border-black ml-auto hidden md:inline-block">
              // 12 OFFICIAL MYTHICAL CREATURE GROUPS
            </span>
          </div>

          {/* Subtitle / Event Description */}
          <div className="max-w-3xl mb-8 space-y-2">
            <p className="text-base sm:text-xl font-black text-black uppercase tracking-tight leading-snug">
              {tagline}
            </p>
            <p className="text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wide font-mono">
              [OFFICER_PROTOCOL: GROUP_MANAGEMENT] // 12 BALANCED MYTHICAL CREATURE GROUPS
            </p>
          </div>

          {/* Large CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
            <Button
              variant="primary"
              size="xl"
              onClick={onRegisterClick}
              rightIcon={<ArrowRight className="w-6 h-6 stroke-[3]" />}
              className="text-base sm:text-xl py-4 sm:py-5 px-8"
            >
              REGISTER NOW →
            </Button>

            <Button
              variant="secondary"
              size="xl"
              onClick={onViewAttendeesClick}
              leftIcon={<Users className="w-5 h-5 stroke-[2.5]" />}
              className="text-sm sm:text-base py-4"
            >
              VIEW ATTENDEES
            </Button>

            <Button
              variant="violet"
              size="lg"
              onClick={onExploreGroupsClick}
              leftIcon={<Sparkles className="w-5 h-5 stroke-[2.5]" />}
              className="text-sm sm:text-base py-4 sm:ml-auto"
            >
              12 GROUPS ROSTER
            </Button>
          </div>

        </div>

        {/* 4 Primary Event Metric StatCards Below Hero */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-10">
          <StatCard
            label="REGISTRATION STATUS"
            value={registrationStatus}
            subtext={`REGISTRATION ${registrationStatus}`}
            badge={registrationStatus}
            variant="yellow"
            icon={<Activity className="w-6 h-6 stroke-[2.5]" />}
            trend="100% UPTIME"
          />

          <StatCard
            label="REGISTERED ATTENDEES"
            value="384 / 450"
            subtext="85% CAPACITY FILLED"
            badge="PHASE 1"
            variant="white"
            icon={<Users className="w-6 h-6 stroke-[2.5]" />}
            trend="+24 TODAY"
          />

          <StatCard
            label="12 MYTHICAL GROUPS"
            value="12 / 12"
            subtext="ALL ROSTERS BALANCED"
            badge="LOCKED"
            variant="violet"
            icon={<Zap className="w-6 h-6 stroke-[2.5]" />}
            trend="12 GROUPS"
          />

          <StatCard
            label="EVENT DATE"
            value={eventDate}
            subtext={`${callTime} // ${venue}`}
            badge={eventDate.split(',').pop()?.trim() || 'EVENT'}
            variant="red"
            icon={<Calendar className="w-6 h-6 stroke-[2.5]" />}
            trend="COUNTDOWN ON"
          />
        </div>
      </div>
    </section>
  );
};
