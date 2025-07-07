"use client";

import React, { useState, useEffect } from "react";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { firebaseToast } from "@/lib/utils/toast";
import { firebaseService } from "@/lib/firebase-service";
import Link from "next/link";

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
    
    const checkAuth = async () => {
      try {
        const { auth } = await import('@/firebase/client');
        const { onAuthStateChanged } = await import('firebase/auth');
        
        onAuthStateChanged(auth, (user) => {
          if (user) {
            // User is already signed in, redirect to gallery
            console.log('User already authenticated, redirecting...');
            window.location.href = '/gallery';
          }
        });
      } catch (error: any) {
        console.error('Auth check error:', error);
      }
    };
    
    checkAuth();
  }, [mounted]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      let result;
      
      if (isSignUp) {
        result = await firebaseService.signUpWithEmail(form.email, form.password, form.name);
      } else {
        result = await firebaseService.signInWithEmail(form.email, form.password);
      }
      
      if (result.success) {
        setSuccess(true);
        console.log(`${isSignUp ? 'Sign up' : 'Sign in'} successful, redirecting...`);
        
        // Send welcome email
        await sendWelcomeEmail(form.email);
        
        if (isSignUp) {
          // For sign up, show success message then redirect to sign in after creating account
          firebaseToast.success('Account created successfully! Redirecting to sign in...');
          setTimeout(() => {
            window.location.href = "/sign-in";
          }, 2000);
        } else {
          // For sign in, redirect directly to gallery
          firebaseToast.success('Welcome back! Redirecting to gallery...');
          setTimeout(() => {
            window.location.href = "/gallery";
          }, 1000);
        }
      } else {
        setError(result.message);
        
        // Handle specific redirections for error cases
        if (result.message.includes('No account found') && !isSignUp) {
          // Show option to sign up
          setTimeout(() => {
            const shouldSignUp = window.confirm('No account found with this email. Would you like to create an account?');
            if (shouldSignUp) {
              window.location.href = '/sign-up';
            }
          }, 1000);
        } else if (result.message.includes('already registered') && isSignUp) {
          // Show option to sign in
          setTimeout(() => {
            const shouldSignIn = window.confirm('Email is already registered. Would you like to sign in instead?');
            if (shouldSignIn) {
              window.location.href = '/sign-in';
            }
          }, 1000);
        }
      }
      
      onSubmit?.(form);
    } catch (err: any) {
      const errorMessage = err.message || "Authentication failed.";
      setError(errorMessage);
      firebaseToast.authError(err);
    } finally {
      setLoading(false);
    }
  };

  // Google sign in
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await firebaseService.signInWithGoogle();
      
      if (result.success && result.user) {
        console.log('Google sign-in successful, redirecting...');
        setSuccess(true);
        
        // Send welcome email
        await sendWelcomeEmail(result.user.email || '');
        
        firebaseToast.success('Google sign-in successful! Redirecting...');
        setTimeout(() => {
          window.location.href = '/gallery';
        }, 1000);
      } else {
        // Only show error if it's not a user cancellation
        if (!result.message.includes('cancelled')) {
          setError(result.message || 'Google sign-in failed');
        }
      }
    } catch (err: any) {
      const errorMessage = err.message || "Google sign-in failed.";
      setError(errorMessage);
      firebaseToast.authError(err);
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
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("Please enter a valid email address");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await firebaseService.resetPassword(form.email);
      
      if (result.success) {
        setResetEmailSent(true);
        setForgotPassword(false);
        setError(null);
        firebaseToast.success('Password reset email sent! Check your inbox and spam folder.');
        
        // Show additional guidance
        setTimeout(() => {
          alert('Please check your email inbox (and spam folder) for password reset instructions. The email may take a few minutes to arrive.');
        }, 2000);
      } else {
        setError(result.message || 'Failed to send password reset email');
      }
    } catch (err: any) {
      const errorMessage = err.message || "Failed to send password reset email.";
      setError(errorMessage);
      firebaseToast.authError(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle sending welcome email after login
  const sendWelcomeEmail = async (email: string) => {
    try {
      // This would typically call an API endpoint to send the email
      // For now, we'll just log it as this would require a server-side implementation
      console.log(`Welcome email would be sent to ${email}`);
      // In a real implementation, you would call your backend API
      await fetch('/api/send-welcome-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
    } catch (error) {
      console.error("Failed to send welcome email:", error);
    }
  };

  // Show loading state until component is mounted
  if (!mounted) {
    return (
      <div className="bg-black bg-opacity-80 rounded-2xl shadow-2xl p-10 w-full max-w-md flex flex-col items-center justify-center h-96">
        <div className="relative">
          {/* Multi-ring loader */}
          <div className="w-20 h-20 border-4 border-gray-600 rounded-full animate-spin">
            <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" style={{animationDuration: '1s'}}></div>
          </div>
          <div className="absolute inset-0 w-16 h-16 m-2 border-4 border-purple-500 border-b-transparent rounded-full animate-spin" style={{animationDuration: '1.5s', animationDirection: 'reverse'}}></div>
          <div className="absolute inset-0 w-12 h-12 m-4 border-4 border-pink-500 border-r-transparent rounded-full animate-spin" style={{animationDuration: '2s'}}></div>
          
          {/* Center pulsing dot */}
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
              minLength={8}
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

      {/* Temporarily disabled Google Sign-in due to domain issue */}
      <div className="w-full">
        <button 
          className="w-full flex items-center justify-center gap-3 
                   bg-gray-600/50 dark:bg-gray-700/50 backdrop-blur-xl
                   border border-gray-500/20 dark:border-gray-600/20
                   text-gray-400 dark:text-gray-500 py-3 rounded-2xl 
                   cursor-not-allowed
                   shadow-lg"
          disabled
          title="Google Sign-in temporarily disabled. Please use email/password or see instructions below."
        >
          <svg width="20" height="20" fill="currentColor" className="text-gray-500" viewBox="0 0 24 24">
            <path d="M21.805 10.023h-9.765v3.954h5.627c-.242 1.242-1.484 3.648-5.627 3.648-3.383 0-6.148-2.797-6.148-6.25s2.765-6.25 6.148-6.25c1.93 0 3.227.82 3.969 1.523l2.711-2.633c-1.711-1.594-3.906-2.57-6.68-2.57-5.523 0-10 4.477-10 10s4.477 10 10 10c5.742 0 9.547-4.023 9.547-9.695 0-.652-.07-1.148-.156-1.477z"/>
          </svg>
          Google Sign-in (Temporarily Disabled)
        </button>
        <div className="mt-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <p className="text-yellow-400 text-xs text-center">
            📝 <strong>Google Sign-in Fix:</strong> Add "localhost" and "127.0.0.1" to Firebase authorized domains
          </p>
          <p className="text-yellow-300 text-xs text-center mt-1">
            <a href="https://console.firebase.google.com/project/prompt-pallete-c2abf/authentication/settings" 
               target="_blank" 
               rel="noopener noreferrer" 
               className="underline hover:text-yellow-200">
              Click here to fix → Firebase Console
            </a>
          </p>
        </div>
      </div>

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
