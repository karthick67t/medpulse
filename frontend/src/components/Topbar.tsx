import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { api } from '../api/client';
import { useNavigate } from 'react-router-dom';
import { LanguageList, SupportedLanguage } from '../i18n/translations';
import { Search, Bell, RotateCcw, Shield, ChevronDown, Check, Globe, Eye, Menu } from 'lucide-react';

interface TopbarProps {
  onToggleMobileSidebar?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onToggleMobileSidebar }) => {
  const { user, role, setRole, demoMode, addToast } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>('en');

  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/patients?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleResetData = async () => {
    if (confirm('Are you sure you want to reset all synthetic data back to default demo state?')) {
      setIsResetting(true);
      try {
        await api.resetDemoData();
        addToast('Synthetic dataset and demo state reset successfully!', 'success');
        window.location.reload();
      } catch (err) {
        addToast('Failed to reset demo data.', 'error');
      } finally {
        setIsResetting(false);
      }
    }
  };

  const handleLanguageChange = (langCode: SupportedLanguage) => {
    setCurrentLang(langCode);
    setShowLangMenu(false);
    const langObj = LanguageList.LANGUAGES.find(l => l.code === langCode);
    addToast(`Language updated to ${langObj?.name} (${langObj?.nativeName})`, 'info');
  };

  const rolesList: UserRole[] = ['Admin', 'Doctor', 'Nurse', 'Reception'];

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 lg:px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Toggle Button */}
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Toggle mobile menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-48 sm:w-64 lg:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
          />
        </form>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Demo Mode Badge */}
        {demoMode && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-amber-800 text-[11px] font-bold tracking-wider">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            DEMO MODE
          </div>
        )}

        {/* Multilingual Selector */}
        <div className="relative">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg border border-slate-200 transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-700" />
            <span>{LanguageList.LANGUAGES.find(l => l.code === currentLang)?.nativeName}</span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          {showLangMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-40">
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Select Language
              </div>
              {LanguageList.LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => handleLanguageChange(l.code)}
                  className="w-full text-left px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold">{l.nativeName}</span>
                    <span className="text-[10px] text-slate-400 ml-1.5">({l.name})</span>
                  </div>
                  {currentLang === l.code && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Reset Demo Data Button */}
        <button
          onClick={handleResetData}
          disabled={isResetting}
          title="Reset Synthetic Dataset"
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors border border-slate-200"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
          <span>Reset</span>
        </button>

        {/* Role Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200 transition-colors"
          >
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>{role}</span>
            <ChevronDown className="w-3 h-3 ml-0.5 text-emerald-600" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-40">
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Switch Active Role
              </div>
              {rolesList.map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setRole(r);
                    setShowRoleMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                >
                  <span>{r}</span>
                  {role === r && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl relative transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-40">
              <h4 className="text-xs font-bold text-slate-800 border-b pb-2 mb-2">High Priority Alerts</h4>
              <div className="space-y-2 text-xs">
                <div className="p-2 bg-red-50 border border-red-100 rounded-lg">
                  <p className="font-semibold text-red-900">Risk Acceleration Watchlist</p>
                  <p className="text-red-700 text-[11px]">Demo Patient A (P1024) score 92/100 (+18 pts).</p>
                </div>
                <div className="p-2 bg-amber-50 border border-amber-100 rounded-lg">
                  <p className="font-semibold text-amber-900">Capacity Warning</p>
                  <p className="text-amber-700 text-[11px]">42/50 daily outreach slots assigned today.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            {user ? user.name.charAt(0) : 'C'}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-bold text-slate-900 leading-none">{user?.name || 'Care Team'}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{user?.email || 'admin@medpulse.ai'}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
