"use client";

import React, { useState, useEffect } from "react";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import Link from "next/link";
import { auth, googleProvider } from "@/firebase/client";
import { 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile,
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'firebase/auth';

type AuthFormProps = {
  mode: "signin" | "signup";
  onSubmit?: (form: { name?: string; email: string; password: string }) => void;
};

const AuthForm: React.FC<AuthFormProps> = ({ mode, onSubmit }) => {
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const isSignUp = mode === "signup";

  // Handle component mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check for existing authentication on mount
  useEffect(() => {
    if (!mounted) return;
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('User already authenticated, redirecting...');
        window.location.href = '/gallery';
      }
    });

    return () => unsubscribe();
  }, [mounted]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
        await updateProfile(userCredential.user, { displayName: form.name });
        setSuccess(true);
        alert('Account created successfully! Redirecting to sign in...');
        setTimeout(() => {
          window.location.href = '/sign-in';
        }, 2000);
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, form.email, form.password);
        setSuccess(true);
        alert('Welcome back! Redirecting to gallery...');
        setTimeout(() => {
          window.location.href = '/gallery';
        }, 1000);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      let errorMessage = err.message;
      
      // User-friendly error messages
      if (err.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email. Please sign up.';
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'Email is already registered. Please sign in.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle Google sign in
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        console.log('Google sign-in successful, redirecting...');
        setSuccess(true);
        alert(`Signed in as ${result.user.displayName}`);
        window.location.href = '/gallery';
      }
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
        setError('Google sign-in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle forgot password
  const handleForgotPassword = async () => {
    if (!form.email) {
      setError("Please enter your email address first");
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("Please enter a valid email address");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await sendPasswordResetEmail(auth, form.email);
      setResetEmailSent(true);
      setForgotPassword(false);
      setError(null);
      alert('Password reset email sent! Check your inbox and spam folder.');
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError('Failed to send password reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state until component is mounted
  if (!mounted) {
    return (
      <div className="bg-black bg-opacity-80 rounded-2xl shadow-2xl p-10 w-full max-w-md flex flex-col items-center justify-center h-96">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-gray-600 rounded-full animate-spin">
            <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" style={{animationDuration: '1s'}}></div>
          </div>
          <div className="absolute inset-0 w-16 h-16 m-2 border-4 border-purple-500 border-b-transparent rounded-full animate-spin" style={{animationDuration: '1.5s', animationDirection: 'reverse'}}></div>
          <div className="absolute inset-0 w-12 h-12 m-4 border-4 border-pink-500 border-r-transparent rounded-full animate-spin" style={{animationDuration: '2s'}}></div>
          
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
          </div>
        </div>
        
        <p className="text-white mt-6 text-lg font-medium animate-pulse">
          Loading Authentication...
        </p>
        
        <div className="flex space-x-1 mt-3">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
          <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/10 dark:bg-black/10 backdrop-blur-2xl rounded-3xl 
                  border border-white/20 dark:border-white/10
                  shadow-2xl shadow-black/10 dark:shadow-black/20
                  p-10  max-w-md flex flex-col items-center
                  relative overflow-hidden group w-screen">
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 via-purple-500/10 to-pink-500/10 
                      opacity-50 group-hover:opacity-70 transition-opacity duration-500"></div>
      <div className="relative z-10">
        <h2 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-pink-600 bg-clip-text text-transparent mb-1 justify-center text-center">
          Prompt Palette
        </h2>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-wide">
          {isSignUp ? "Create Your Account" : "Welcome Back"}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8 text-center">
          {isSignUp
            ? "Join us and start your journey!"
            : "Sign in to your account to continue"}
        </p>
      </div>

      {forgotPassword ? (
        <div className="w-full">
          <h3 className="text-xl font-bold text-white mb-4">Reset Password</h3>
          <p className="text-gray-400 mb-4 text-sm">
            Enter your email address and we'll send you a link to reset your password.
          </p>
          <div className="relative mb-4">
            <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              required
              autoComplete="email"
              suppressHydrationWarning
              className="w-full pl-10 pr-4 py-3 rounded-2xl 
                       bg-white/10 dark:bg-black/10 backdrop-blur-xl
                       border border-white/20 dark:border-white/10
                       text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       transition-all duration-300"
            />
          </div>
          
          {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}
          {resetEmailSent && (
            <p className="text-green-400 text-sm text-center mb-4">
              Password reset email sent! Check your inbox.
            </p>
          )}
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={loading}
              className={`flex-1 bg-gradient-to-r from-indigo-600 to-pink-600 text-white font-bold py-3 rounded-lg shadow-lg hover:scale-105 transition-transform ${
                loading ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
            
            <button
              type="button"
              onClick={() => setForgotPassword(false)}
              className="flex-1 bg-gray-700 text-white font-bold py-3 rounded-lg shadow-lg hover:bg-gray-600 transition"
            >
              Back to Login
            </button>
          </div>
        </div>
      ) : (
        <form className="w-full flex flex-col gap-5" onSubmit={handleSubmit}>
          {isSignUp && (
            <div className="relative">
              <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
            <input
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="Your Name"
              required
              autoComplete="name"
              suppressHydrationWarning
              className="w-full pl-10 pr-4 py-3 rounded-2xl 
                       bg-white/10 dark:bg-black/10 backdrop-blur-xl
                       border border-white/20 dark:border-white/10
                       text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       transition-all duration-300"
              />
            </div>
          )}

          <div className="relative">
            <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              required
              autoComplete="email"
              suppressHydrationWarning
              className="w-full pl-10 pr-4 py-3 rounded-2xl 
                       bg-white/10 dark:bg-black/10 backdrop-blur-xl
                       border border-white/20 dark:border-white/10
                       text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       transition-all duration-300"
            />
          </div>

          <div className="relative">
            <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
              minLength={6}
              required
              autoComplete={isSignUp ? "new-password" : "current-password"}
              suppressHydrationWarning
              className="w-full pl-10 pr-10 py-3 rounded-2xl 
                       bg-white/10 dark:bg-black/10 backdrop-blur-xl
                       border border-white/20 dark:border-white/10
                       text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       transition-all duration-300"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400"
              aria-label={showPassword ? "Hide password" : "Show password"} 
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          
          {!isSignUp && (
            <div className="text-right">
              <button 
                type="button" 
                onClick={() => setForgotPassword(true)}
                className="text-blue-400 text-sm hover:underline"
              >
                Forgot password?
              </button>
            </div>
          )}

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          {success && isSignUp && (
            <div className="text-green-400 text-sm text-center space-y-2">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
                <span>Account created successfully!</span>
              </div>
              <p className="text-xs text-green-300">Redirecting to sign in...</p>
            </div>
          )}
          {success && !isSignUp && (
            <div className="text-green-400 text-sm text-center space-y-2">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
                <span>Welcome back!</span>
              </div>
              <p className="text-xs text-green-300">Redirecting to gallery...</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`liquid-btn bg-gradient-to-r from-blue-500 to-purple-600 
                       hover:from-blue-600 hover:to-purple-700
                       text-white font-bold py-3 rounded-2xl shadow-2xl 
                       hover:scale-105 hover:shadow-blue-500/25 transition-all duration-300 ${
              loading ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>{isSignUp ? "Creating Account..." : "Signing In..."}</span>
              </div>
            ) : (
              isSignUp ? "Sign Up" : "Sign In"
            )}
          </button>
        </form>
      )}

      <div className="flex items-center my-6 w-full">
        <div className="flex-grow h-px bg-gray-700" />
        <span className="mx-3 text-gray-500">or</span>
        <div className="flex-grow h-px bg-gray-700" />
      </div>

      <button 
        className="w-full flex items-center justify-center gap-3 
                 bg-white/10 dark:bg-black/10 backdrop-blur-xl
                 border border-white/20 dark:border-white/10
                 hover:bg-white/20 dark:hover:bg-black/20 
                 text-gray-900 dark:text-white py-3 rounded-2xl 
                 transition-all duration-300 hover:scale-105
                 shadow-lg hover:shadow-xl"
        onClick={handleGoogleSignIn}
        disabled={loading}
      >
        <svg width="20" height="20" fill="currentColor" className="text-blue-500" viewBox="0 0 24 24">
          <path d="M21.805 10.023h-9.765v3.954h5.627c-.242 1.242-1.484 3.648-5.627 3.648-3.383 0-6.148-2.797-6.148-6.25s2.765-6.25 6.148-6.25c1.93 0 3.227.82 3.969 1.523l2.711-2.633c-1.711-1.594-3.906-2.57-6.68-2.57-5.523 0-10 4.477-10 10s4.477 10 10 10c5.742 0 9.547-4.023 9.547-9.695 0-.652-.07-1.148-.156-1.477z"/>
        </svg>
        Continue with Google
      </button>

      <p className="text-gray-500 mt-6 text-sm">
        {isSignUp ? (
          <>
            Already have an account?{" "}
            <Link href="/sign-in" className="text-blue-400 hover:underline">
              Sign in
            </Link>
          </>
        ) : (
          <>
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="text-blue-400 hover:underline">
              Sign up
            </Link>
          </>
        )}
      </p>
    </div>
  );
};

export default AuthForm;
