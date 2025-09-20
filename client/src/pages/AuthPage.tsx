import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/UserContext";
import { getXRProps } from "../utils/xr";

const AuthPage = () => {
  const navigate = useNavigate();
  const { login, signup, isAuthenticated } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    rememberMe: false,
  });

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear errors when user starts typing
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      if (isLogin) {
        // Login
        if (!formData.username || !formData.password) {
          setError("Please fill in all fields");
          return;
        }

        const success = await login(formData.username, formData.password);
        if (success) {
          setSuccess("Login successful! Redirecting...");
          setTimeout(() => navigate("/"), 1000);
        } else {
          setError("Invalid username or password");
        }
      } else {
        // Signup
        if (!formData.username || !formData.email || !formData.password) {
          setError("Please fill in all required fields");
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          setError("Passwords do not match");
          return;
        }

        if (formData.password.length < 6) {
          setError("Password must be at least 6 characters long");
          return;
        }

        const success = await signup(
          formData.username,
          formData.email,
          formData.password
        );
        if (success) {
          setSuccess("Account created successfully! Redirecting...");
          setTimeout(() => navigate("/"), 1000);
        } else {
          setError("Username or email already exists");
        }
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError("");
    setSuccess("");
    setFormData({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      rememberMe: false,
    });
  };

  return (
    <div {...getXRProps()} className="min-h-screen relative overflow-hidden">
      {/* Background overlay */}
      <div {...getXRProps()} className="absolute inset-0 opacity-40">
        <div
          {...getXRProps()}
          className="absolute inset-0 bg-gradient-to-r from-slate-800/50 via-slate-700/30 to-slate-800/50"
        />
        <div
          {...getXRProps()}
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent"
        />
        <div
          {...getXRProps()}
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-red-900/15 via-transparent to-transparent"
        />
      </div>

      {/* Navigation */}
      <nav
        {...getXRProps()}
        className="relative bg-slate-800/90 backdrop-blur-lg border-b border-slate-700/50 shadow-2xl"
      >
        <div {...getXRProps()} className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <div {...getXRProps()} className="flex justify-between items-center">
            <Link
              to="/"
              {...getXRProps()}
              className="text-2xl font-bold bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 bg-clip-text text-transparent tracking-wider"
            >
              YG-EXAMPLE
            </Link>
            <Link
              to="/"
              {...getXRProps()}
              className="px-4 py-2 bg-gradient-to-r from-slate-600 to-slate-800 hover:from-slate-500 hover:to-slate-700 text-white rounded-lg text-sm font-bold transition-all duration-300 shadow-xl border border-slate-500/30 hover:border-slate-400/50 tracking-wider"
            >
              BACK TO HOME
            </Link>
          </div>
        </div>
      </nav>

      {/* Auth Form */}
      <div {...getXRProps()} className="relative max-w-md mx-auto px-6 py-16">
        <div
          {...getXRProps()}
          className="bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-600/50 shadow-2xl p-8 ring-1 ring-slate-700/30"
        >
          {/* Toggle Buttons */}
          <div
            {...getXRProps()}
            className="flex bg-slate-700/50 rounded-xl p-1 mb-8"
          >
            <button
              onClick={toggleMode}
              {...getXRProps()}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all duration-300 tracking-wider ${
                isLogin
                  ? "bg-gradient-to-r from-purple-600 to-purple-800 text-white shadow-xl"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              LOGIN
            </button>
            <button
              onClick={toggleMode}
              {...getXRProps()}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all duration-300 tracking-wider ${
                !isLogin
                  ? "bg-gradient-to-r from-purple-600 to-purple-800 text-white shadow-xl"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              SIGN UP
            </button>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div
              {...getXRProps()}
              className="mb-6 p-4 bg-red-900/50 border border-red-600/50 rounded-lg"
            >
              <p {...getXRProps()} className="text-red-200 text-sm text-center">
                {error}
              </p>
            </div>
          )}

          {success && (
            <div
              {...getXRProps()}
              className="mb-6 p-4 bg-green-900/50 border border-green-600/50 rounded-lg"
            >
              <p
                {...getXRProps()}
                className="text-green-200 text-sm text-center"
              >
                {success}
              </p>
            </div>
          )}

          {/* Form Header */}
          <div {...getXRProps()} className="text-center mb-8">
            <h1
              {...getXRProps()}
              className="text-3xl font-bold text-slate-100 mb-2 tracking-wider"
            >
              {isLogin ? "WELCOME BACK" : "JOIN THE DUEL"}
            </h1>
            <p {...getXRProps()} className="text-slate-300">
              {isLogin
                ? "Enter your credentials to continue"
                : "Create your duelist account"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username/Email */}
            <div>
              <label
                {...getXRProps()}
                htmlFor="username"
                className="block text-sm font-bold text-slate-200 mb-2 uppercase tracking-wider"
              >
                {isLogin ? "Email or Username" : "Username"}
              </label>
              <input
                {...getXRProps()}
                id="username"
                name="username"
                type={isLogin ? "text" : "text"}
                placeholder={
                  isLogin ? "Enter your email or username" : "Choose a username"
                }
                value={formData.username}
                onChange={handleInputChange}
                disabled={isLoading}
                className="w-full px-4 py-3 bg-slate-700/50 border-2 border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all backdrop-blur-sm disabled:opacity-50"
              />
            </div>

            {/* Email (Sign up only) */}
            {!isLogin && (
              <div>
                <label
                  {...getXRProps()}
                  htmlFor="email"
                  className="block text-sm font-bold text-slate-200 mb-2 uppercase tracking-wider"
                >
                  Email Address
                </label>
                <input
                  {...getXRProps()}
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-slate-700/50 border-2 border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all backdrop-blur-sm disabled:opacity-50"
                />
              </div>
            )}

            {/* Password */}
            <div>
              <label
                {...getXRProps()}
                htmlFor="password"
                className="block text-sm font-bold text-slate-200 mb-2 uppercase tracking-wider"
              >
                Password
              </label>
              <input
                {...getXRProps()}
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                disabled={isLoading}
                className="w-full px-4 py-3 bg-slate-700/50 border-2 border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all backdrop-blur-sm disabled:opacity-50"
              />
            </div>

            {/* Confirm Password (Sign up only) */}
            {!isLogin && (
              <div>
                <label
                  {...getXRProps()}
                  htmlFor="confirmPassword"
                  className="block text-sm font-bold text-slate-200 mb-2 uppercase tracking-wider"
                >
                  Confirm Password
                </label>
                <input
                  {...getXRProps()}
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-slate-700/50 border-2 border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all backdrop-blur-sm disabled:opacity-50"
                />
              </div>
            )}

            {/* Remember Me / Forgot Password */}
            {isLogin && (
              <div
                {...getXRProps()}
                className="flex items-center justify-between text-sm"
              >
                <label
                  {...getXRProps()}
                  className="flex items-center text-slate-300"
                >
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    {...getXRProps()}
                    className="mr-2 rounded disabled:opacity-50"
                  />
                  Remember me
                </label>
                <button
                  {...getXRProps()}
                  type="button"
                  className="text-purple-400 hover:text-purple-300 font-medium disabled:opacity-50"
                  disabled={isLoading}
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button
              {...getXRProps()}
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-700 text-white rounded-lg text-sm font-bold transition-all duration-300 shadow-xl border border-purple-500/30 hover:border-purple-400/50 disabled:border-slate-500/30 tracking-wider disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {isLogin ? "LOGGING IN..." : "CREATING ACCOUNT..."}
                </span>
              ) : isLogin ? (
                "LOGIN TO DUEL"
              ) : (
                "CREATE ACCOUNT"
              )}
            </button>

            {/* Divider */}
            <div {...getXRProps()} className="relative">
              <div
                {...getXRProps()}
                className="absolute inset-0 flex items-center"
              >
                <div
                  {...getXRProps()}
                  className="w-full border-t border-slate-600"
                />
              </div>
              <div
                {...getXRProps()}
                className="relative flex justify-center text-sm"
              >
                <span
                  {...getXRProps()}
                  className="px-2 bg-slate-800 text-slate-400"
                >
                  OR
                </span>
              </div>
            </div>

            {/* Social Login Placeholder */}
            <button
              {...getXRProps()}
              type="button"
              className="w-full py-3 px-4 bg-slate-700/50 hover:bg-slate-700/80 border-2 border-slate-600 hover:border-slate-500 text-slate-100 rounded-lg text-sm font-bold transition-all duration-300 tracking-wider"
            >
              CONTINUE WITH KONAMI ID
            </button>
          </form>

          {/* Terms */}
          {!isLogin && (
            <p
              {...getXRProps()}
              className="text-xs text-slate-400 text-center mt-6 leading-relaxed"
            >
              By creating an account, you agree to our Terms of Service and
              Privacy Policy.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
