'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Mail, KeyRound, ArrowRight, ArrowLeft, CheckCircle2, Lock } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();

  // Steps: 'REQUEST_CODE' | 'ENTER_CODE' | 'SET_NEW_PASSWORD' | 'SUCCESS'
  const [step, setStep] = useState<'REQUEST_CODE' | 'ENTER_CODE' | 'SET_NEW_PASSWORD' | 'SUCCESS'>('REQUEST_CODE');

  const [email, setEmail] = useState('fragreafragrance@gmail.com');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [changeToken, setChangeToken] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [codePreview, setCodePreview] = useState<string | null>(null);

  // 1. Send Code
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to dispatch verification code');
      }

      setResetToken(data.resetToken);
      if (data.codePreview) {
        setCodePreview(data.codePreview);
      }
      setSuccessMsg(data.message || 'Verification code sent to your email.');
      setStep('ENTER_CODE');
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch verification code');
    } finally {
      setLoading(false);
    }
  };

  // 2. Verify Code
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, resetToken }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Invalid verification code');
      }

      setChangeToken(data.changeToken);
      setSuccessMsg('Code verified. Set your new master password.');
      setStep('SET_NEW_PASSWORD');
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  // 3. Set New Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/admin/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword, changeToken }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setSuccessMsg(data.message || 'Password updated successfully.');
      setStep('SUCCESS');
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-noir-950 flex flex-col justify-center items-center p-6 text-ivory-100 font-sans">
      <div className="w-full max-w-md space-y-8">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-block group">
            <span className="text-3xl font-serif tracking-[0.3em] block text-ivory-100 group-hover:text-gold-300 transition-colors">
              FRAGREA
            </span>
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold-400 font-light mt-1 block">
              Security Verification Gate
            </span>
          </Link>
          <p className="text-xs text-ivory-400 font-light">
            Maison administrator credential recovery & verification.
          </p>
        </div>

        {/* Security Box */}
        <div className="border border-gold-dim bg-noir-900/90 backdrop-blur-xl p-8 space-y-6 shadow-2xl relative">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <KeyRound className="w-5 h-5 text-gold-400" />
            <h2 className="text-xs uppercase tracking-[0.25em] text-ivory-200 font-medium">
              {step === 'REQUEST_CODE' && 'Request Verification Code'}
              {step === 'ENTER_CODE' && 'Enter Verification Code'}
              {step === 'SET_NEW_PASSWORD' && 'Create New Master Password'}
              {step === 'SUCCESS' && 'Password Updated'}
            </h2>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="p-3.5 bg-red-950/40 border border-red-800/60 text-red-300 text-xs leading-relaxed animate-in fade-in">
              {error}
            </div>
          )}

          {successMsg && step !== 'SUCCESS' && (
            <div className="p-3.5 bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs leading-relaxed animate-in fade-in">
              {successMsg}
            </div>
          )}

          {codePreview && step === 'ENTER_CODE' && (
            <div className="p-3 bg-gold-400/10 border border-gold-400/30 text-gold-300 text-xs flex items-center justify-between">
              <span>Security Code Preview:</span>
              <span className="font-mono font-bold tracking-widest text-sm text-gold-200">{codePreview}</span>
            </div>
          )}

          {/* STEP 1: REQUEST CODE */}
          {step === 'REQUEST_CODE' && (
            <form onSubmit={handleSendCode} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-ivory-400 block">
                  Administrator Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-noir-950 border border-white/10 px-4 py-3 text-xs text-ivory-100 focus:outline-none focus:border-gold-400 transition-colors pl-10"
                    placeholder="admin@fragrea.com"
                  />
                  <Mail className="w-4 h-4 text-ivory-400 absolute left-3.5 top-3.5" />
                </div>
                <p className="text-[10px] text-ivory-400/70 font-light">
                  A 6-digit one-time authorization code will be sent to this email.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gold-400 hover:bg-gold-300 text-noir-950 py-3.5 text-xs uppercase tracking-[0.2em] font-medium transition-colors flex items-center justify-center gap-2 shadow-luxury disabled:opacity-50"
              >
                <span>{loading ? 'Dispatching Code...' : 'Send Verification Code'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="text-center pt-2">
                <Link
                  href="/admin/login"
                  className="text-[11px] text-ivory-400 hover:text-gold-300 transition-colors flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Return to Admin Login</span>
                </Link>
              </div>
            </form>
          )}

          {/* STEP 2: ENTER CODE */}
          {step === 'ENTER_CODE' && (
            <form onSubmit={handleVerifyCode} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-ivory-400 block">
                  6-Digit Verification Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-noir-950 border border-gold-400/40 px-4 py-3 text-center tracking-[0.5em] text-lg font-mono text-gold-300 focus:outline-none focus:border-gold-400 transition-colors"
                  placeholder="------"
                  autoFocus
                />
                <p className="text-[10px] text-ivory-400/70 text-center font-light">
                  Code sent to <span className="text-ivory-200 font-medium">{email}</span> (valid for 15 mins)
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full bg-gold-400 hover:bg-gold-300 text-noir-950 py-3.5 text-xs uppercase tracking-[0.2em] font-medium transition-colors flex items-center justify-center gap-2 shadow-luxury disabled:opacity-50"
              >
                <span>{loading ? 'Verifying...' : 'Verify Code'}</span>
                <ShieldCheck className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-between text-[11px] text-ivory-400 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('REQUEST_CODE')}
                  className="hover:text-gold-300 transition-colors flex items-center gap-1"
                >
                  <ArrowLeft className="w-3 h-3" /> Change Email
                </button>
                <button
                  type="button"
                  onClick={handleSendCode}
                  className="text-gold-400 hover:text-gold-300 transition-colors"
                >
                  Resend Code
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: SET NEW PASSWORD */}
          {step === 'SET_NEW_PASSWORD' && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-ivory-400 block">
                  New Master Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-noir-950 border border-white/10 px-4 py-3 text-xs text-ivory-100 focus:outline-none focus:border-gold-400 transition-colors pl-10"
                    placeholder="Minimum 8 characters"
                  />
                  <Lock className="w-4 h-4 text-ivory-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-ivory-400 block">
                  Confirm Master Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-noir-950 border border-white/10 px-4 py-3 text-xs text-ivory-100 focus:outline-none focus:border-gold-400 transition-colors pl-10"
                    placeholder="Repeat new password"
                  />
                  <Lock className="w-4 h-4 text-ivory-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gold-400 hover:bg-gold-300 text-noir-950 py-3.5 text-xs uppercase tracking-[0.2em] font-medium transition-colors flex items-center justify-center gap-2 shadow-luxury disabled:opacity-50"
              >
                <span>{loading ? 'Updating Password...' : 'Save New Password'}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* STEP 4: SUCCESS */}
          {step === 'SUCCESS' && (
            <div className="text-center space-y-6 py-4 animate-in zoom-in-95">
              <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-sm uppercase tracking-widest text-ivory-100 font-medium">
                  Password Updated Successfully
                </h3>
                <p className="text-xs text-ivory-400 font-light max-w-xs mx-auto">
                  Your administrator credentials have been securely updated. You can now access the Maison portal.
                </p>
              </div>

              <Link
                href="/admin/login"
                className="w-full inline-flex items-center justify-center gap-2 bg-gold-400 hover:bg-gold-300 text-noir-950 py-3.5 text-xs uppercase tracking-[0.2em] font-medium transition-colors shadow-luxury"
              >
                <span>Proceed to Admin Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Maison Footer Note */}
        <div className="text-center text-[10px] text-ivory-500 uppercase tracking-widest font-light">
          FRAGREA MAISON VAULT &bull; HAUTE PARFUMERIE
        </div>
      </div>
    </div>
  );
}
