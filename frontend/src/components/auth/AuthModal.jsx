import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Mail, Lock, User, Phone, X, BookOpen } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";
import { apiFetch } from "../../lib/api";
import { API_URL } from "../../config";
import { useAuthModal } from "../../contexts/AuthModalContext";

export default function AuthModal() {
  const { isOpen, mode, setMode, redirectUrl, closeModal, openModal } = useAuthModal();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const githubCodeProcessed = useRef(false);

  const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID || "";

  // Reset form when modal opens/closes or mode changes
  useEffect(() => {
    setErrors({});
    setGlobalError(null);
    if (!isOpen) {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        password: "",
      });
    }
  }, [isOpen, mode]);

  useEffect(() => {
    // Check for GitHub OAuth callback code in URL
    const urlParams = new URLSearchParams(location.search);
    const code = urlParams.get("code");
    if (code && !githubCodeProcessed.current) {
      githubCodeProcessed.current = true;
      
      // Clear code from URL immediately to prevent Strict Mode double-firing
      window.history.replaceState({}, document.title, location.pathname);
      navigate(location.pathname, { replace: true });

      if (!isOpen) {
        openModal("login");
      }
      handleSocialLogin("github", code);
    }
  }, [location, isOpen, openModal, navigate]);

  const validateField = (id, value) => {
    let errorMsg = null;
    if (id === "firstName") {
      if (!value.trim()) errorMsg = "First name is required.";
      else if (!/^[A-Za-z\s\-']+$/.test(value))
        errorMsg = "Only letters, spaces, hyphens, and apostrophes.";
    } else if (id === "lastName") {
      if (!value.trim()) errorMsg = "Last name is required.";
    } else if (id === "email") {
      if (!value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
        errorMsg = "Please enter a valid email address.";
    } else if (id === "phoneNumber") {
      if (value && !/^[6-9]\d{9}$/.test(value))
        errorMsg = "Valid 10-digit Indian number required.";
    } else if (id === "password") {
      const pwd = value.trim();
      if (!pwd) errorMsg = "Password is required.";
      else if (/\s/.test(value)) errorMsg = "Password cannot contain spaces.";
      else if (pwd.length < 8) errorMsg = "Password must be at least 8 characters.";
    }
    return errorMsg;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    let formattedValue = value;
    if (id === "firstName" || id === "lastName") {
      formattedValue = value.replace(/\b\w/g, (char) => char.toUpperCase());
    } else if (id === "email") {
      formattedValue = value.toLowerCase();
    }
    setFormData((prev) => ({ ...prev, [id]: formattedValue }));

    const errorMsg = validateField(id, formattedValue);
    if (!errorMsg) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    } else {
      setErrors((prev) => ({ ...prev, [id]: errorMsg }));
    }
  };

  const handleAuthSuccess = async (access, refresh) => {
    localStorage.setItem("access", access);
    localStorage.setItem("refresh", refresh);

    try {
      const meRes = await apiFetch(`${API_URL}/api/accounts/me/`, {
        headers: { Authorization: `Bearer ${access}` },
      });
      let isAdmin = false;
      if (meRes.ok) {
        const user = await meRes.json();
        isAdmin = user.is_staff || user.is_superuser;
      }
      
      closeModal();

      if (isAdmin) {
        navigate("/admin");
      } else {
        navigate(redirectUrl || "/dashboard");
      }
    } catch (err) {
      closeModal();
      navigate(redirectUrl || "/dashboard");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError(null);

    const submitData = { ...formData };
    submitData.password = submitData.password.trim();

    const newErrors = {};
    if (mode === "signup") {
      Object.keys(submitData).forEach((key) => {
        const err = validateField(key, submitData[key]);
        if (err) newErrors[key] = err;
      });
    } else if (mode === "login") {
      const emailErr = validateField("email", submitData.email);
      if (emailErr) newErrors.email = emailErr;
      if (!submitData.password) newErrors.password = "Password is required.";
    } else if (mode === "forgot-password") {
      const emailErr = validateField("email", submitData.email);
      if (emailErr) newErrors.email = emailErr;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      if (mode === "forgot-password") {
        const response = await fetch(`${API_URL}/api/accounts/forgot-password/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: submitData.email }),
        });
        if (response.ok) {
          toast.success("If an account exists, a reset link has been sent.");
          setMode("login");
        } else {
          setGlobalError("Failed to send reset link.");
        }
      } else if (mode === "login") {
        const response = await fetch(`${API_URL}/api/accounts/login/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: submitData.email,
            password: submitData.password,
          }),
        });
        if (response.ok) {
          const data = await response.json();
          await handleAuthSuccess(data.access, data.refresh);
        } else {
          setGlobalError("Invalid email or password.");
        }
      } else {
        const response = await fetch(`${API_URL}/api/accounts/register/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            first_name: submitData.firstName,
            last_name: submitData.lastName,
            email: submitData.email,
            phone_number: submitData.phoneNumber || null,
            password: submitData.password,
          }),
        });
        if (response.ok) {
          // Auto login after signup by hitting the login endpoint
          const loginRes = await fetch(`${API_URL}/api/accounts/login/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: submitData.email,
              password: submitData.password,
            }),
          });
          if (loginRes.ok) {
              const data = await loginRes.json();
              await handleAuthSuccess(data.access, data.refresh);
          } else {
              setMode('login');
              setGlobalError("Account created! Please log in.");
          }
        } else {
          const data = await response.json();
          const fieldMap = {
            first_name: "firstName", last_name: "lastName",
            email: "email", phone_number: "phoneNumber", password: "password",
          };
          const newBackendErrors = {};
          let hasSpecificError = false;
          const globalErrors = [];
          Object.keys(data).forEach((key) => {
            const errorText = Array.isArray(data[key]) ? data[key][0] : data[key];
            if (fieldMap[key]) {
              newBackendErrors[fieldMap[key]] = errorText;
              hasSpecificError = true;
            } else if (key === "detail" || key === "non_field_errors") {
              globalErrors.push(errorText);
            } else {
              globalErrors.push(`${key}: ${errorText}`);
            }
          });
          if (hasSpecificError) setErrors((prev) => ({ ...prev, ...newBackendErrors }));
          if (globalErrors.length > 0) setGlobalError(globalErrors.join(" "));
          else if (!hasSpecificError) setGlobalError("Registration failed.");
        }
      }
    } catch (err) {
      setGlobalError("Network error. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider, token) => {
    setIsLoading(true);
    setGlobalError(null);
    try {
      const response = await fetch(`${API_URL}/api/accounts/social-login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, token }),
      });
      if (response.ok) {
        const data = await response.json();
        await handleAuthSuccess(data.access, data.refresh);
      } else {
        const data = await response.json();
        setGlobalError(data.error || "Social login failed");
      }
    } catch (err) {
      setGlobalError("Network error during social login");
    } finally {
      setIsLoading(false);
      if (provider === "github") {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  };

  const googleLogin = useGoogleLogin({
    flow: "auth-code",
    onSuccess: (tokenResponse) => handleSocialLogin("google", tokenResponse.code),
    onError: () => setGlobalError("Google Login Failed"),
  });

  const githubLogin = () => {
    if (!GITHUB_CLIENT_ID) {
      setGlobalError("GitHub login is not configured.");
      return;
    }
    window.location.assign(`https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=user:email`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 sm:p-6 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-surface border border-border-main shadow-2xl rounded-2xl w-full max-w-md overflow-hidden pointer-events-auto flex flex-col max-h-full"
            >
              {/* Header */}
              <div className="px-6 pt-6 pb-4 flex items-start justify-between">
                <div className="flex flex-col">
                  <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center text-primary mb-4">
                    <BookOpen size={24} />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight text-text-main">
                    {mode === "login" ? "Welcome back" : mode === "signup" ? "Create an account" : "Reset Password"}
                  </h2>
                  <p className="text-sm text-text-main/70 mt-1">
                    {mode === "login"
                      ? "Enter your details to access your bookings."
                      : mode === "signup"
                      ? "Join us to book workspaces and library seats."
                      : "Enter your email to receive a reset link."}
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 -mr-2 -mt-2 text-text-main/50 hover:text-text-main transition-colors rounded-full hover:bg-border-main/50"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Form Content (Scrollable if needed) */}
              <div className="px-6 pb-6 overflow-y-auto">
                <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                  {globalError && (
                    <div className="p-3 bg-error/10 border border-error/50 rounded text-error text-sm">
                      {globalError}
                    </div>
                  )}

                  {mode === "signup" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-text-main mb-1">First name</label>
                        <Input
                          id="firstName" type="text" placeholder="John"
                          value={formData.firstName} onChange={handleChange}
                          leftIcon={<User size={18} />} error={errors.firstName}
                          tabIndex={1}
                        />
                      </div>
                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-text-main mb-1">Last name</label>
                        <Input
                          id="lastName" type="text" placeholder="Doe"
                          value={formData.lastName} onChange={handleChange}
                          leftIcon={<User size={18} />} error={errors.lastName}
                          tabIndex={2}
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-text-main mb-1">Email address</label>
                    <Input
                      id="email" type="email" placeholder="name@example.com"
                      value={formData.email} onChange={handleChange}
                      leftIcon={<Mail size={18} />} error={errors.email}
                      tabIndex={3} required autoComplete="off"
                    />
                  </div>

                  {mode === "signup" && (
                    <div>
                      <label htmlFor="phoneNumber" className="block text-sm font-medium text-text-main mb-1">Phone number (Optional)</label>
                      <Input
                        id="phoneNumber" type="tel" placeholder="e.g. 1234567890"
                        value={formData.phoneNumber} onChange={handleChange}
                        leftIcon={<Phone size={18} />} error={errors.phoneNumber}
                        tabIndex={4}
                      />
                    </div>
                  )}

                  {mode !== "forgot-password" && (
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-text-main mb-1">Password</label>
                      <Input
                        id="password" type="password" placeholder="••••••••"
                        value={formData.password} onChange={handleChange}
                        leftIcon={<Lock size={18} />} error={errors.password}
                        tabIndex={5} required autoComplete={mode === "signup" ? "new-password" : "current-password"}
                      />
                    </div>
                  )}

                  {mode === "login" && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setMode("forgot-password")}
                        className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}

                  <Button type="submit" className="w-full mt-2" disabled={isLoading} tabIndex={6}>
                    {isLoading 
                      ? (mode === "login" ? "Signing in..." : mode === "signup" ? "Creating account..." : "Sending...") 
                      : (mode === "login" ? "Sign in" : mode === "signup" ? "Sign up" : "Send Reset Link")}
                  </Button>
                </form>

                {mode !== "forgot-password" && (
                  <div className="mt-6">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border-main" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="bg-surface px-4 text-text-main/50">Or continue with</span>
                      </div>
                    </div>
                    <div className="mt-6 grid grid-cols-2 gap-4">
                      <Button variant="outline" className="w-full" onClick={() => googleLogin()} disabled={isLoading}>
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Google
                      </Button>
                      <Button variant="outline" className="w-full" onClick={githubLogin} disabled={isLoading}>
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
                        </svg>
                        GitHub
                      </Button>
                    </div>
                  </div>
                )}

                <p className="mt-8 text-center text-sm text-text-main/70">
                  {mode === "login" 
                    ? "Don't have an account? " 
                    : mode === "signup" 
                    ? "Already have an account? " 
                    : "Remembered your password? "}
                  <button
                    type="button"
                    onClick={() => setMode(mode === "login" ? "signup" : "login")}
                    className="font-semibold text-primary hover:text-primary/80 transition-colors"
                  >
                    {mode === "login" ? "Sign up" : "Sign in"}
                  </button>
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
