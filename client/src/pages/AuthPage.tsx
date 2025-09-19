import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div enable-xr className="min-h-screen relative overflow-hidden">
      {/* Background overlay */}
      <div enable-xr className="absolute inset-0 opacity-40">
        <div enable-xr className="absolute inset-0 bg-gradient-to-r from-slate-800/50 via-slate-700/30 to-slate-800/50" />
        <div enable-xr className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent" />
        <div enable-xr className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-red-900/15 via-transparent to-transparent" />
      </div>

      {/* Navigation */}
      <nav enable-xr className="relative bg-slate-800/90 backdrop-blur-lg border-b border-slate-700/50 shadow-2xl">
        <div enable-xr className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <div enable-xr className="flex justify-between items-center">
            <Link to="/" enable-xr className="text-2xl font-bold bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 bg-clip-text text-transparent tracking-wider">
              YU-GI-OH! VAULT
            </Link>
            <Link
              to="/"
              enable-xr
              className="px-4 py-2 bg-gradient-to-r from-slate-600 to-slate-800 hover:from-slate-500 hover:to-slate-700 text-white rounded-lg text-sm font-bold transition-all duration-300 shadow-xl border border-slate-500/30 hover:border-slate-400/50 tracking-wider"
            >
              BACK TO HOME
            </Link>
          </div>
        </div>
      </nav>

      {/* Auth Form */}
      <div enable-xr className="relative max-w-md mx-auto px-6 py-16">
        <div enable-xr className="bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-600/50 shadow-2xl p-8 ring-1 ring-slate-700/30">
          {/* Toggle Buttons */}
          <div enable-xr className="flex bg-slate-700/50 rounded-xl p-1 mb-8">
            <button
              onClick={() => setIsLogin(true)}
              enable-xr
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all duration-300 tracking-wider ${
                isLogin
                  ? 'bg-gradient-to-r from-purple-600 to-purple-800 text-white shadow-xl'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              LOGIN
            </button>
            <button
              onClick={() => setIsLogin(false)}
              enable-xr
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all duration-300 tracking-wider ${
                !isLogin
                  ? 'bg-gradient-to-r from-purple-600 to-purple-800 text-white shadow-xl'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              SIGN UP
            </button>
          </div>

          {/* Form Header */}
          <div enable-xr className="text-center mb-8">
            <h1 enable-xr className="text-3xl font-bold text-slate-100 mb-2 tracking-wider">
              {isLogin ? 'WELCOME BACK' : 'JOIN THE DUEL'}
            </h1>
            <p enable-xr className="text-slate-300">
              {isLogin ? 'Enter your credentials to continue' : 'Create your duelist account'}
            </p>
          </div>

          {/* Form */}
          <form className="space-y-6">
            {/* Username/Email */}
            <div>
              <label enable-xr htmlFor="email" className="block text-sm font-bold text-slate-200 mb-2 uppercase tracking-wider">
                {isLogin ? 'Email or Username' : 'Username'}
              </label>
              <input
                enable-xr
                id="email"
                type={isLogin ? 'email' : 'text'}
                placeholder={isLogin ? 'Enter your email or username' : 'Choose a username'}
                className="w-full px-4 py-3 bg-slate-700/50 border-2 border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all backdrop-blur-sm"
              />
            </div>

            {/* Email (Sign up only) */}
            {!isLogin && (
              <div>
                <label enable-xr htmlFor="signup-email" className="block text-sm font-bold text-slate-200 mb-2 uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  enable-xr
                  id="signup-email"
                  type="email"
                  placeholder="Enter your email address"
                  className="w-full px-4 py-3 bg-slate-700/50 border-2 border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all backdrop-blur-sm"
                />
              </div>
            )}

            {/* Password */}
            <div>
              <label enable-xr htmlFor="password" className="block text-sm font-bold text-slate-200 mb-2 uppercase tracking-wider">
                Password
              </label>
              <input
                enable-xr
                id="password"
                type="password"
                placeholder="Enter your password"
                className="w-full px-4 py-3 bg-slate-700/50 border-2 border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all backdrop-blur-sm"
              />
            </div>

            {/* Confirm Password (Sign up only) */}
            {!isLogin && (
              <div>
                <label enable-xr htmlFor="confirm-password" className="block text-sm font-bold text-slate-200 mb-2 uppercase tracking-wider">
                  Confirm Password
                </label>
                <input
                  enable-xr
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm your password"
                  className="w-full px-4 py-3 bg-slate-700/50 border-2 border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all backdrop-blur-sm"
                />
              </div>
            )}

            {/* Remember Me / Forgot Password */}
            {isLogin && (
              <div enable-xr className="flex items-center justify-between text-sm">
                <label enable-xr className="flex items-center text-slate-300">
                  <input type="checkbox" enable-xr className="mr-2 rounded" />
                  Remember me
                </label>
                <button enable-xr type="button" className="text-purple-400 hover:text-purple-300 font-medium">
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button
              enable-xr
              type="submit"
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 text-white rounded-lg text-sm font-bold transition-all duration-300 shadow-xl border border-purple-500/30 hover:border-purple-400/50 tracking-wider"
            >
              {isLogin ? 'LOGIN TO DUEL' : 'CREATE ACCOUNT'}
            </button>

            {/* Divider */}
            <div enable-xr className="relative">
              <div enable-xr className="absolute inset-0 flex items-center">
                <div enable-xr className="w-full border-t border-slate-600" />
              </div>
              <div enable-xr className="relative flex justify-center text-sm">
                <span enable-xr className="px-2 bg-slate-800 text-slate-400">OR</span>
              </div>
            </div>

            {/* Social Login Placeholder */}
            <button
              enable-xr
              type="button"
              className="w-full py-3 px-4 bg-slate-700/50 hover:bg-slate-700/80 border-2 border-slate-600 hover:border-slate-500 text-slate-100 rounded-lg text-sm font-bold transition-all duration-300 tracking-wider"
            >
              CONTINUE WITH KONAMI ID
            </button>
          </form>

          {/* Terms */}
          {!isLogin && (
            <p enable-xr className="text-xs text-slate-400 text-center mt-6 leading-relaxed">
              By creating an account, you agree to our Terms of Service and Privacy Policy.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
