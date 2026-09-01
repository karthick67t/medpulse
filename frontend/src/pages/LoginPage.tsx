import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { HealthcareDisclaimer } from '../components/HealthcareDisclaimer';
import { HeartPulse, Plus, KeyRound, Mail, User as UserIcon, ArrowRight, CheckCircle2, UserPlus, LogIn } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'signup';

  const [isSignUp, setIsSignUp] = useState(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Nurse');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const { login, addToast } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (searchParams.get('mode') === 'signup') {
      setIsSignUp(true);
    } else if (searchParams.get('mode') === 'signin') {
      setIsSignUp(false);
      setEmail('admin@medpulse.ai');
      setPassword('demo123');
    } else {
      setEmail('admin@medpulse.ai');
      setPassword('demo123');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(false);
    setErrorMsg('');
    setSuccessMsg('');

    if (isSignUp) {
      if (!name.trim()) {
        setErrorMsg('Please enter your full name.');
        return;
      }
      if (!email.trim() || !password.trim()) {
        setErrorMsg('Please provide your email and password.');
        return;
      }

      try {
        setLoading(true);
        // Save new user credentials to MySQL database
        const newUser = await api.signup(name.trim(), email.trim(), password.trim(), role);
        setSuccessMsg(`Account created for ${newUser.name}! Logging in with new credentials...`);
        addToast(`Welcome to CareTrack AI, ${newUser.name}!`, 'success');
        
        // Auto-login newly registered user with new credentials
        const success = await login(email.trim(), password.trim());
        if (success) {
          navigate('/dashboard');
        }
      } catch (err: any) {
        setErrorMsg(err.response?.data?.detail || 'Failed to create account in MySQL database.');
      } finally {
        setLoading(false);
      }
    } else {
      try {
        setLoading(true);
        // Verify credentials against MySQL database
        const success = await login(email.trim(), password.trim());
        if (success) {
          addToast('Signed in successfully!', 'success');
          navigate('/dashboard');
        } else {
          setErrorMsg('Invalid email or password in database.');
        }
      } catch (err: any) {
        setErrorMsg(err.response?.data?.detail || 'Invalid email or password.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleQuickFill = (demoEmail: string) => {
    setIsSignUp(false);
    setEmail(demoEmail);
    setPassword('demo123');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 lg:p-0">
      <div className="w-full max-w-5xl bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">
        {/* Left Section: Visual Presentation */}
        <div className="bg-emerald-900 text-white p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl" />

          <div className="relative z-10">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-10 h-10 rounded-2xl bg-white text-emerald-700 flex items-center justify-center font-bold shadow-md relative">
                <HeartPulse className="w-6 h-6 text-emerald-700" />
                <Plus className="w-3 h-3 absolute top-1 right-1 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">MedPulse</h2>
                <p className="text-xs text-emerald-300 font-medium">Stay ahead of every follow-up.</p>
              </div>
            </div>

            <h1 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight tracking-tight mb-4">
              Close the follow-up gap.
            </h1>
            <p className="text-emerald-100 text-sm leading-relaxed mb-8">
              Identify patients at risk of missing visits, understand why with transparent rules, and help your care team act earlier.
            </p>

            <div className="space-y-3 text-xs text-emerald-100 font-medium">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Explainable prediction priority queue</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>MySQL persistent patient care database</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Multi-hospital ready & ML pluggable architecture</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-8 border-t border-emerald-800/80">
            <p className="text-xs font-semibold text-emerald-200 uppercase tracking-widest">
              Predict risk. Understand why. Act earlier.
            </p>
          </div>
        </div>

        {/* Right Section: Auth Form */}
        <div className="p-8 lg:p-12 flex flex-col justify-between bg-white">
          <div>
            {/* Mode Switcher Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
              <div>
                <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {isSignUp ? 'New User Registration' : 'Sign In'}
                </h3>
                <p className="text-xs font-medium text-slate-500 mt-0.5">
                  {isSignUp
                    ? 'Enter your new credentials to save your account in MySQL.'
                    : 'Enter your registered credentials to access your workspace.'}
                </p>
              </div>

              <div className="flex bg-slate-100 p-1 rounded-xl shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(false);
                    setErrorMsg('');
                    setEmail('admin@caretrack.ai');
                    setPassword('demo123');
                  }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                    !isSignUp ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(true);
                    setErrorMsg('');
                    setEmail('');
                    setPassword('');
                  }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                    isSignUp ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign Up</span>
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 mb-4 bg-red-50 border border-red-200 text-red-800 text-xs font-semibold rounded-xl">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="p-3 mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                      placeholder="Dr. Karthick Geethanath"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address / Username</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                    placeholder={isSignUp ? 'newuser@caretrack.ai' : 'admin@caretrack.ai'}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
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
                disabled={loading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Saving credentials...' : isSignUp ? 'Save Account in MySQL & Sign In' : 'Sign In to Workspace'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Switch Text Footer */}
            <div className="mt-4 text-center">
              {isSignUp ? (
                <p className="text-xs text-slate-500">
                  Already have an account?{' '}
                  <button
                    onClick={() => { setIsSignUp(false); setEmail('admin@caretrack.ai'); setPassword('demo123'); }}
                    className="font-bold text-emerald-700 hover:underline"
                  >
                    Sign In here
                  </button>
                </p>
              ) : (
                <p className="text-xs text-slate-500">
                  New to CareTrack AI?{' '}
                  <button
                    onClick={() => { setIsSignUp(true); setEmail(''); setPassword(''); }}
                    className="font-bold text-emerald-700 hover:underline"
                  >
                    Create a new account (Sign Up)
                  </button>
                </p>
              )}
            </div>

            {/* Quick Demo Fill Buttons */}
            {!isSignUp && (
              <div className="mt-6 pt-4 border-t border-slate-100">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Or Quick Demo Login Accounts:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickFill('admin@caretrack.ai')}
                    className="p-2.5 bg-emerald-50/60 hover:bg-emerald-50 border border-emerald-100 rounded-xl text-left transition-colors"
                  >
                    <span className="block font-extrabold text-xs text-emerald-900">Admin Demo</span>
                    <span className="text-[10px] text-emerald-700">admin@caretrack.ai</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill('doctor@caretrack.ai')}
                    className="p-2.5 bg-emerald-50/60 hover:bg-emerald-50 border border-emerald-100 rounded-xl text-left transition-colors"
                  >
                    <span className="block font-extrabold text-xs text-emerald-900">Doctor Demo</span>
                    <span className="text-[10px] text-emerald-700">doctor@caretrack.ai</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <HealthcareDisclaimer />
        </div>
      </div>
    </div>
  );
};
