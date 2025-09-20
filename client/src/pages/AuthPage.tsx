import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/UserContext";
import { getXRProps } from "../utils/xr";
import Layout from "../components/Layout";

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
        if (!formData.username || !formData.password) {
          setError("Please fill in all fields");
          return;
        }
        const ok = await login(formData.username, formData.password);
        if (ok) {
          setSuccess("Login successful! Redirecting...");
          setTimeout(() => navigate("/"), 1000);
        } else {
          setError("Invalid username or password");
        }
      } else {
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
        const ok = await signup(
          formData.username,
          formData.email,
          formData.password
        );
        if (ok) {
          setSuccess("Account created successfully! Redirecting...");
          setTimeout(() => navigate("/"), 1000);
        } else {
          setError("Username or email already exists");
        }
      }
    } catch {
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
    <Layout header="SIGN-UP / LOGIN">
      <div {...getXRProps()} className="max-w-md mx-auto">
        <div {...getXRProps()} className="border border-slate-700 p-8">
          {/* Toggle */}
          <div {...getXRProps()} className="flex mb-8 gap-2">
            <button
              onClick={() => (isLogin ? undefined : toggleMode())}
              {...getXRProps()}
              className={`flex-1 py-2 px-4 border text-sm tracking-wider ${
                isLogin
                  ? "bg-slate-900 text-white border-slate-700"
                  : "text-slate-400 border-slate-700 hover:text-white"
              }`}
            >
              LOGIN
            </button>
            <button
              onClick={() => (!isLogin ? undefined : toggleMode())}
              {...getXRProps()}
              className={`flex-1 py-2 px-4 border text-sm tracking-wider ${
                !isLogin
                  ? "bg-slate-900 text-white border-slate-700"
                  : "text-slate-400 border-slate-700 hover:text-white"
              }`}
            >
              SIGN UP
            </button>
          </div>

          {/* Messages */}
          {error && (
            <div
              {...getXRProps()}
              className="mb-6 p-3 border border-red-600 text-red-300 text-sm text-center"
            >
              {error}
            </div>
          )}
          {success && (
            <div
              {...getXRProps()}
              className="mb-6 p-3 border border-green-600 text-green-300 text-sm text-center"
            >
              {success}
            </div>
          )}

          {/* Header */}
          <div {...getXRProps()} className="text-center mb-6">
            <div {...getXRProps()} className="text-slate-200 tracking-wider">
              {isLogin ? "WELCOME BACK" : "JOIN THE DUEL"}
            </div>
            <div {...getXRProps()} className="text-slate-400 text-sm">
              {isLogin
                ? "Enter your credentials to continue"
                : "Create your duelist account"}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                {...getXRProps()}
                htmlFor="username"
                className="block text-xs text-slate-400 mb-2 tracking-widest"
              >
                {isLogin ? "Email or Username" : "Username"}
              </label>
              <input
                {...getXRProps()}
                id="username"
                name="username"
                type="text"
                placeholder={
                  isLogin ? "Enter your email or username" : "Choose a username"
                }
                value={formData.username}
                onChange={handleInputChange}
                disabled={isLoading}
                 autoComplete="off"
                className="w-full px-3 py-2 bg-black border border-slate-700 text-slate-100 placeholder-slate-500"
              />
            </div>

            {!isLogin && (
              <div>
                <label
                  {...getXRProps()}
                  htmlFor="email"
                  className="block text-xs text-slate-400 mb-2 tracking-widest"
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
                   autoComplete="off"
                  className="w-full px-3 py-2 bg-black border border-slate-700 text-slate-100 placeholder-slate-500"
                />
              </div>
            )}

            <div>
              <label
                {...getXRProps()}
                htmlFor="password"
                className="block text-xs text-slate-400 mb-2 tracking-widest"
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
                 autoComplete="off"
                className="w-full px-3 py-2 bg-black border border-slate-700 text-slate-100 placeholder-slate-500"
              />
            </div>

            {!isLogin && (
              <div>
                <label
                  {...getXRProps()}
                  htmlFor="confirmPassword"
                  className="block text-xs text-slate-400 mb-2 tracking-widest"
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
                   autoComplete="off"
                  className="w-full px-3 py-2 bg-black border border-slate-700 text-slate-100 placeholder-slate-500"
                />
              </div>
            )}



            <button
              {...getXRProps()}
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 border text-sm tracking-wider ${
                isLoading
                  ? "border-slate-800 text-slate-500"
                  : "border-slate-700 text-slate-100 hover:bg-slate-900"
              }`}
            >
              {isLoading
                ? isLogin
                  ? "LOGGING IN..."
                  : "CREATING ACCOUNT..."
                : isLogin
                ? "LOGIN TO DUEL"
                : "CREATE ACCOUNT"}
            </button>

            <div {...getXRProps()} className="relative">
              <div
                {...getXRProps()}
                className="absolute inset-0 flex items-center"
              >

              </div>

            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default AuthPage;
