import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { HealthcareDisclaimer } from '../components/HealthcareDisclaimer';
import {
  HeartPulse,
  Plus,
  ArrowRight,
  PlayCircle,
  ShieldCheck,
  TrendingUp,
  Database,
  Brain,
  Search,
  ListChecks,
  PhoneCall,
  RefreshCw,
  ListOrdered,
  Lightbulb,
  CalendarCheck,
  SlidersHorizontal,
  BarChart3,
  UsersRound,
  Smartphone,
  Route as RouteIcon,
  Activity,
  Menu,
  X,
  User,
  KeyRound,
  CheckCircle2,
  LogIn,
  Lock,
  UserPlus
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Embedded Landing Page Auth Form state (Sign In vs Sign Up)
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState('');
  const [usernameOrEmail, setUsernameOrEmail] = useState('admin@medpulse.ai');
  const [password, setPassword] = useState('demo123');
  const [role, setRole] = useState('Nurse');
  const [loggingIn, setLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const { login, user, addToast } = useAuth();
  const navigate = useNavigate();

  const handleEmbeddedAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError('');
    setSuccessMsg('');

    if (isSignUp) {
      if (!fullName.trim()) {
        setLoginError('Please enter your full name.');
        setLoggingIn(false);
        return;
      }
      if (!usernameOrEmail.trim() || !password.trim()) {
        setLoginError('Please enter your email and password.');
        setLoggingIn(false);
        return;
      }

      try {
        const newUser = await api.signup(fullName.trim(), usernameOrEmail.trim(), password.trim(), role);
        setSuccessMsg(`Account created for ${newUser.name}! Logging in with new credentials...`);
        addToast(`Welcome to CareTrack AI, ${newUser.name}!`, 'success');

        const success = await login(usernameOrEmail.trim(), password.trim());
        if (success) {
          navigate('/dashboard');
        }
      } catch (err: any) {
        setLoginError(err.response?.data?.detail || 'Failed to create account in MySQL database.');
      } finally {
        setLoggingIn(false);
      }
    } else {
      try {
        const success = await login(usernameOrEmail.trim(), password.trim());
        if (success) {
          addToast('Signed in successfully!', 'success');
          navigate('/dashboard');
        } else {
          setLoginError('Invalid email or password in database.');
        }
      } catch (err: any) {
        setLoginError(err.response?.data?.detail || 'Invalid credentials.');
      } finally {
        setLoggingIn(false);
      }
    }
  };

  const handleQuickDemoFill = (type: 'admin' | 'doctor') => {
    setIsSignUp(false);
    if (type === 'admin') {
      setUsernameOrEmail('admin@caretrack.ai');
      setPassword('demo123');
    } else {
      setUsernameOrEmail('doctor@caretrack.ai');
      setPassword('demo123');
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* 1. TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-6 lg:px-12 py-4 flex items-center justify-between">
        {/* Brand Identity */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-600/20 relative">
            <HeartPulse className="w-6 h-6 text-white" />
            <Plus className="w-3 h-3 absolute top-1 right-1 text-emerald-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl text-slate-900 tracking-tight">MedPulse</span>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-200">
                AI-Powered Care
              </span>
            </div>
            <p className="text-[11px] font-semibold text-emerald-700 tracking-wide">
              Stay ahead of every follow-up.
            </p>
          </div>
        </div>

        {/* Center Nav Items */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-600">
          <button onClick={() => scrollToSection('how-it-works')} className="hover:text-emerald-700 transition-colors">
            How It Works
          </button>
          <button onClick={() => scrollToSection('features')} className="hover:text-emerald-700 transition-colors">
            Features
          </button>
          <button onClick={() => scrollToSection('impact')} className="hover:text-emerald-700 transition-colors">
            Impact
          </button>
          <button onClick={() => scrollToSection('about')} className="hover:text-emerald-700 transition-colors">
            About
          </button>
        </nav>

        {/* Top-Corner Actions */}
        <div className="hidden md:flex items-center gap-2.5">
          {user ? (
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <span>Go to Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <>
              <button
                onClick={() => {
                  setIsSignUp(false);
                  setUsernameOrEmail('admin@caretrack.ai');
                  setPassword('demo123');
                  scrollToSection('landing-login');
                }}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs rounded-xl transition-all flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5 text-slate-600" />
                <span>Sign In</span>
              </button>
              <button
                onClick={() => {
                  setIsSignUp(true);
                  setFullName('');
                  setUsernameOrEmail('');
                  setPassword('');
                  scrollToSection('landing-login');
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Sign Up / Register</span>
              </button>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[76px] bg-white border-b border-slate-200 p-6 space-y-4 shadow-xl z-40">
          <button onClick={() => scrollToSection('how-it-works')} className="block w-full text-left font-bold text-sm text-slate-700">
            How It Works
          </button>
          <button onClick={() => scrollToSection('features')} className="block w-full text-left font-bold text-sm text-slate-700">
            Features
          </button>
          <button onClick={() => scrollToSection('impact')} className="block w-full text-left font-bold text-sm text-slate-700">
            Impact
          </button>
          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => { setIsSignUp(false); scrollToSection('landing-login'); }}
              className="w-full py-2.5 bg-slate-100 text-slate-800 font-bold text-xs rounded-xl"
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsSignUp(true); scrollToSection('landing-login'); }}
              className="w-full py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl"
            >
              Sign Up / Register
            </button>
          </div>
        </div>
      )}

      {/* 2. HERO SECTION WITH EMBEDDED AUTH FORM DIRECTLY ON LANDING PAGE */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:py-24 bg-gradient-to-b from-white via-slate-50 to-emerald-50/40">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Left Column */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-100/80 text-emerald-900 font-extrabold text-xs rounded-full border border-emerald-200 shadow-2xs">
              <HeartPulse className="w-4 h-4 text-emerald-600 animate-pulse" />
              <span>Predict follow-up risk • Understand why • Act earlier</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
              Hospitals lose track of patients who need follow-up. <br />
              <span className="text-emerald-700">We fix that gap.</span>
            </h1>

            <p className="text-2xl font-black text-emerald-600 tracking-tight">
              Predict. Explain. Act.
            </p>

            <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-xl">
              CareTrack AI helps hospitals identify patients who may miss their next follow-up, understand why they are at risk, and prioritize proactive outreach before care is interrupted.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                onClick={() => { setIsSignUp(false); scrollToSection('landing-login'); }}
                className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-600/25 flex items-center gap-2 transition-all"
              >
                <span>Sign In & Access Platform</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => { setIsSignUp(true); scrollToSection('landing-login'); }}
                className="px-6 py-3.5 bg-white hover:bg-emerald-50 text-emerald-800 font-extrabold text-sm rounded-xl border border-emerald-200 flex items-center gap-2 transition-all shadow-xs"
              >
                <UserPlus className="w-4.5 h-4.5 text-emerald-700" />
                <span>Create New Account (Sign Up)</span>
              </button>
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-2 text-xs font-semibold text-slate-500 pt-3">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>MySQL persistent database • Decision-support prototype</span>
            </div>
          </div>

          {/* Hero Right Column: EMBEDDED AUTH FORM DIRECTLY ON LANDING PAGE */}
          <div id="landing-login" className="lg:col-span-6 relative">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xl space-y-5 relative">
              {/* Form Mode Header & Tabs */}
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900 leading-tight">
                    {isSignUp ? 'New User Registration' : 'Hospital Workspace Sign In'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isSignUp ? 'Create your account in the MySQL database' : 'Enter credentials to access platform'}
                  </p>
                </div>

                <div className="flex bg-slate-100 p-1 rounded-xl shrink-0">
                  <button
                    type="button"
                    onClick={() => { setIsSignUp(false); setLoginError(''); setUsernameOrEmail('admin@caretrack.ai'); setPassword('demo123'); }}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                      !isSignUp ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsSignUp(true); setLoginError(''); setUsernameOrEmail(''); setPassword(''); }}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                      isSignUp ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Sign Up</span>
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs font-semibold rounded-xl">
                  {loginError}
                </div>
              )}

              {successMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl">
                  {successMsg}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleEmbeddedAuthSubmit} className="space-y-4">
                {isSignUp && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                        placeholder="Dr. Karthick Geethanath"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address / Username
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={usernameOrEmail}
                      onChange={(e) => setUsernameOrEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                      placeholder={isSignUp ? "newuser@caretrack.ai" : "admin or admin@caretrack.ai"}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {isSignUp && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Hospital Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                    >
                      <option value="Nurse">Nurse / Care Coordinator</option>
                      <option value="Doctor">Doctor / Clinical Lead</option>
                      <option value="Admin">Hospital Administrator</option>
                      <option value="Reception">Reception Staff</option>
                    </select>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loggingIn}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                >
                  <span>
                    {loggingIn
                      ? 'Processing MySQL Authentication...'
                      : isSignUp
                      ? 'Create MySQL Account & Enter Platform'
                      : 'Sign In to Care Workspace'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Toggle Text */}
              <div className="text-center pt-1">
                {isSignUp ? (
                  <p className="text-xs text-slate-500">
                    Already registered?{' '}
                    <button
                      onClick={() => { setIsSignUp(false); setUsernameOrEmail('admin@caretrack.ai'); setPassword('demo123'); }}
                      className="font-bold text-emerald-700 hover:underline"
                    >
                      Sign In here
                    </button>
                  </p>
                ) : (
                  <p className="text-xs text-slate-500">
                    New user?{' '}
                    <button
                      onClick={() => { setIsSignUp(true); setUsernameOrEmail(''); setPassword(''); }}
                      className="font-bold text-emerald-700 hover:underline"
                    >
                      Sign Up with new credentials
                    </button>
                  </p>
                )}
              </div>

              {/* Quick Demo Login Fill Buttons */}
              {!isSignUp && (
                <div className="pt-3 border-t border-slate-100">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Quick Demo One-Click Sign In:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleQuickDemoFill('admin')}
                      className="p-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-left transition-colors"
                    >
                      <span className="block font-extrabold text-xs text-emerald-900">Admin Account</span>
                      <span className="text-[10px] font-mono text-emerald-700">admin / demo123</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickDemoFill('doctor')}
                      className="p-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-left transition-colors"
                    >
                      <span className="block font-extrabold text-xs text-emerald-900">Doctor Account</span>
                      <span className="text-[10px] font-mono text-emerald-700">doctor / demo123</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3. IMPACT STATISTICS STRIP */}
      <section id="impact" className="max-w-7xl mx-auto px-6 lg:px-12 my-12">
        <div className="bg-emerald-800 text-white rounded-3xl p-8 lg:p-12 shadow-xl relative overflow-hidden">
          <div className="mb-8 max-w-xl">
            <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight">Better follow-up. Better continuity of care.</h2>
            <p className="text-emerald-100 text-xs mt-1">Measurable operational efficiency across hospital registries.</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center lg:text-left">
            <div className="border-l-4 border-emerald-400 pl-4">
              <p className="text-3xl lg:text-4xl font-black font-mono tracking-tight">1,000+</p>
              <p className="text-xs font-semibold text-emerald-200 mt-1 uppercase tracking-wider">Patients Monitored</p>
            </div>
            <div className="border-l-4 border-emerald-400 pl-4">
              <p className="text-3xl lg:text-4xl font-black font-mono tracking-tight text-amber-300">432</p>
              <p className="text-xs font-semibold text-emerald-200 mt-1 uppercase tracking-wider">High-Risk Patients</p>
            </div>
            <div className="border-l-4 border-emerald-400 pl-4">
              <p className="text-3xl lg:text-4xl font-black font-mono tracking-tight">92%</p>
              <p className="text-xs font-semibold text-emerald-200 mt-1 uppercase tracking-wider">Outreach Tracking</p>
            </div>
            <div className="border-l-4 border-emerald-400 pl-4">
              <p className="text-3xl lg:text-4xl font-black font-mono tracking-tight text-emerald-300">0.912</p>
              <p className="text-xs font-semibold text-emerald-200 mt-1 uppercase tracking-wider">ROC AUC Score</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section id="how-it-works" className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 space-y-12">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">Workflow</span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              How CareTrack AI operates in your hospital
            </h2>
            <p className="text-xs text-slate-500 mt-2">
              From raw appointment attendance records to actionable clinical prioritization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 hover:border-emerald-300 transition-all">
              <span className="text-2xl font-black font-mono text-emerald-600 block mb-2">01</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Ingest</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Connect patient history, missed visits, distance, and treatment parameters from MySQL.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 hover:border-emerald-300 transition-all">
              <span className="text-2xl font-black font-mono text-emerald-600 block mb-2">02</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Predict</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Calculate an objective follow-up risk score (0–100) using a transparent rule engine.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 hover:border-emerald-300 transition-all">
              <span className="text-2xl font-black font-mono text-emerald-600 block mb-2">03</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Understand</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Show exactly which factors contributed to the patient's risk in plain language.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 hover:border-emerald-300 transition-all">
              <span className="text-2xl font-black font-mono text-emerald-600 block mb-2">04</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3">
                <ListChecks className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Prioritize</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Rank patients so care teams can focus their limited outreach capacity where it matters most.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 hover:border-emerald-300 transition-all">
              <span className="text-2xl font-black font-mono text-emerald-600 block mb-2">05</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3">
                <PhoneCall className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Intervene</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Provide operational suggestions such as calls, reminders, and appointment rescheduling.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 hover:border-emerald-300 transition-all">
              <span className="text-2xl font-black font-mono text-emerald-600 block mb-2">06</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3">
                <RefreshCw className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Learn</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Track intervention and appointment outcomes to create a foundation for future model improvement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FEATURES GRID */}
      <section id="features" className="py-16 lg:py-24 bg-emerald-50/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 space-y-12">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">Platform Features</span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">More than a risk score.</h2>
            <p className="text-xs text-slate-500 mt-2">
              Everything your care team needs to turn prediction into action.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <ListOrdered className="w-6 h-6 text-emerald-600" />
              <h3 className="text-base font-extrabold text-slate-900">Priority Risk Queue</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Automatically rank patients from highest to lowest follow-up risk based on mathematical scoring.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <Lightbulb className="w-6 h-6 text-emerald-600" />
              <h3 className="text-base font-extrabold text-slate-900">Explainable Predictions</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Every risk score comes with transparent factor cards detailing exact point impact and severity.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <CalendarCheck className="w-6 h-6 text-emerald-600" />
              <h3 className="text-base font-extrabold text-slate-900">Appointment Timeline</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                View attended, missed, cancelled, and upcoming appointments in a clean vertical timeline.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <PhoneCall className="w-6 h-6 text-emerald-600" />
              <h3 className="text-base font-extrabold text-slate-900">Actionable Interventions</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Turn risk factors into practical outreach workflows such as calls, SMS, transport, and teleconsultations.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <SlidersHorizontal className="w-6 h-6 text-emerald-600" />
              <h3 className="text-base font-extrabold text-slate-900">Risk Simulator</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Explore how changes in patient circumstances live-affect calculated risk scores.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <BarChart3 className="w-6 h-6 text-emerald-600" />
              <h3 className="text-base font-extrabold text-slate-900">Hospital Analytics</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Understand follow-up trends across your patient population with scatter plots and department breakdowns.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. ABOUT SECTION */}
      <section id="about" className="py-16 lg:py-24 bg-emerald-50/60">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">About CareTrack AI</span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Built around one simple idea.</h2>
          <p className="text-2xl lg:text-3xl font-black text-emerald-900 leading-snug">
            "A patient missing a follow-up should never become just another number in a spreadsheet."
          </p>
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto">
            CareTrack AI helps care teams identify potential follow-up gaps early, understand the factors behind them, and take informed operational action.
          </p>
        </div>
      </section>

      {/* 7. FINAL CTA */}
      <section className="bg-emerald-800 text-white py-16 px-6 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight">Close the follow-up gap.</h2>
          <p className="text-emerald-100 text-sm max-w-xl mx-auto">
            Give your care team the intelligence to know who needs attention before a follow-up is missed.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => { setIsSignUp(false); scrollToSection('landing-login'); }}
              className="px-8 py-3.5 bg-white text-emerald-900 hover:bg-emerald-50 font-black text-sm rounded-xl shadow-xl transition-all"
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsSignUp(true); scrollToSection('landing-login'); }}
              className="px-8 py-3.5 bg-emerald-600 text-white hover:bg-emerald-700 font-black text-sm rounded-xl shadow-xl transition-all"
            >
              Sign Up / Register New User
            </button>
          </div>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-12 px-6 lg:px-12 text-slate-600">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold relative">
                <HeartPulse className="w-4 h-4 text-white" />
              </div>
              <span className="font-extrabold text-base text-slate-900 tracking-tight">MedPulse</span>
            </div>
            <p className="text-xs text-slate-500">Closing the follow-up gap.</p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase text-slate-900 tracking-wider mb-3">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => { setIsSignUp(false); scrollToSection('landing-login'); }} className="hover:text-emerald-700">Sign In</button></li>
              <li><button onClick={() => { setIsSignUp(true); scrollToSection('landing-login'); }} className="hover:text-emerald-700">Sign Up / Register</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase text-slate-900 tracking-wider mb-3">Resources</h4>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => scrollToSection('how-it-works')} className="hover:text-emerald-700">How It Works</button></li>
              <li><button onClick={() => scrollToSection('features')} className="hover:text-emerald-700">Features</button></li>
              <li><button onClick={() => scrollToSection('impact')} className="hover:text-emerald-700">Impact</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase text-slate-900 tracking-wider mb-3">Company</h4>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => scrollToSection('about')} className="hover:text-emerald-700">About</button></li>
              <li><span className="text-slate-400">Contact: support@medpulse.ai</span></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
          <span>© 2026 MedPulse. All rights reserved.</span>
          <span>Decision-support prototype. Not a substitute for clinical judgment.</span>
        </div>
      </footer>
    </div>
  );
};
