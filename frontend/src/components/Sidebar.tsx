import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ListChecks,
  Users,
  Calendar as CalendarIcon,
  SlidersHorizontal,
  ClipboardCheck,
  BarChart3,
  RefreshCw,
  FileCheck2,
  Cpu,
  Settings,
  HeartPulse,
  Plus,
  X
} from 'lucide-react';

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, route: '/dashboard' },
  { label: 'Priority Queue', icon: ListChecks, route: '/risk-queue' },
  { label: 'Patients', icon: Users, route: '/patients' },
  { label: 'Follow-up Calendar', icon: CalendarIcon, route: '/calendar' },
  { label: 'Risk Simulator', icon: SlidersHorizontal, route: '/simulator' },
  { label: 'Interventions', icon: ClipboardCheck, route: '/interventions' },
  { label: 'Analytics', icon: BarChart3, route: '/analytics' },
  { label: 'Care Continuity', icon: RefreshCw, route: '/continuity' },
  { label: 'Data Quality', icon: FileCheck2, route: '/data-quality' },
  { label: 'Model Intelligence', icon: Cpu, route: '/model-monitoring' },
];

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen = false, onCloseMobile }) => {
  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`w-64 bg-white text-slate-800 flex flex-col h-screen fixed lg:sticky top-0 z-40 shrink-0 border-r border-slate-200/80 shadow-md lg:shadow-2xs transition-transform duration-200 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 relative">
              <HeartPulse className="w-5 h-5 text-white" />
              <Plus className="w-2.5 h-2.5 absolute top-1 right-1 text-emerald-100 font-bold" />
            </div>
            <div>
              <h1 className="font-extrabold text-base text-slate-900 tracking-tight leading-none">MedPulse</h1>
              <p className="text-[11px] font-semibold text-emerald-700 mt-1">Stay ahead of every follow-up</p>
            </div>
          </div>

          {/* Close button on mobile */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.route}
                to={item.route}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 lg:py-2 rounded-xl font-medium text-xs transition-all duration-150 ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 font-bold shadow-2xs border border-emerald-200/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0 text-emerald-700" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Settings Link */}
        <div className="px-3 pt-1 border-t border-slate-100">
          <NavLink
            to="/settings"
            onClick={onCloseMobile}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 lg:py-2 rounded-xl font-medium text-xs transition-all duration-150 ${
                isActive
                  ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`
            }
          >
            <Settings className="w-4 h-4 text-emerald-700" />
            <span>Settings</span>
          </NavLink>
        </div>

        {/* System Status Footer */}
        <div className="p-3 m-3 rounded-xl bg-emerald-50/70 border border-emerald-100">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
            </span>
            <span className="text-xs font-bold text-emerald-900">Prediction Engine Online</span>
          </div>
          <p className="text-[10px] text-emerald-700 mt-0.5 font-mono">Weighted Rule Engine v2.0</p>
        </div>
      </aside>
    </>
  );
};
