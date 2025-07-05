"use client";

import React, { useState } from "react";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

type AuthFormProps = {
  mode: "signin" | "signup";
  onSubmit?: (form: { name?: string; email: string; password: string }) => void;
};

const AuthForm: React.FC<AuthFormProps> = ({ mode, onSubmit }) => {
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
      if (isSignUp) {
        // Sign up with Firebase
        const { createUserWithEmailAndPassword, updateProfile } = await import("firebase/auth");
        const { auth } = await import("@/firebase/client");
        const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
        if (form.name) {
          await updateProfile(userCredential.user, { displayName: form.name });
        }
        setSuccess(true);
        // Send welcome email
        await sendWelcomeEmail(form.email);
        // Force reload to update all user contexts
        window.location.replace("/gallery");
      } else {
        // Sign in with Firebase
        const { signInWithEmailAndPassword } = await import("firebase/auth");
        const { auth } = await import("@/firebase/client");
        await signInWithEmailAndPassword(auth, form.email, form.password);
        setSuccess(true);
        // Send welcome email after login
        await sendWelcomeEmail(form.email);
        window.location.replace("/gallery");
      }
      onSubmit?.(form);
    } catch (err: any) {
      setError(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  // Google sign in
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const { GoogleAuthProvider, signInWithPopup } = await import("firebase/auth");
      const { auth } = await import("@/firebase/client");
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      setSuccess(true);
      // Force reload to update all user contexts
      window.location.replace("/gallery");
    } catch (err: any) {
      setError(err.message || "Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  // Handle forgot password
  const handleForgotPassword = async () => {
    if (!form.email) {
      setError("Please enter your email address");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const { sendPasswordResetEmail } = await import("firebase/auth");
      const { auth } = await import("@/firebase/client");
      await sendPasswordResetEmail(auth, form.email);
      setResetEmailSent(true);
      setForgotPassword(false);
    } catch (err: any) {
      setError(err.message || "Failed to send password reset email.");
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
      // await fetch('/api/send-welcome-email', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email })
      // });
    } catch (error) {
      console.error("Failed to send welcome email:", error);
    }
  };

  return (
    <div className="bg-black bg-opacity-80 rounded-2xl shadow-2xl p-10 w-full max-w-md flex flex-col items-center">
      <h2 className="text-xl font-bold text-blue-400 mb-1">Prompt Palette</h2>
      <h1 className="text-3xl font-extrabold text-white mb-2 tracking-wide">
        {isSignUp ? "Create Your Account" : "Welcome Back"}
      </h1>
      <p className="text-gray-400 mb-8 text-center">
        {isSignUp
          ? "Join us and start your journey!"
          : "Sign in to your account to continue"}
      </p>

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
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              className="w-full pl-10 pr-10 py-3 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
            <p className="text-green-400 text-sm text-center">
              Account created! Check your email.
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`bg-gradient-to-r from-indigo-600 to-pink-600 text-white font-bold py-3 rounded-lg shadow-lg hover:scale-105 transition-transform ${
              loading ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Processing..." : isSignUp ? "Sign Up" : "Sign In"}
          </button>
        </form>
      )}

      <div className="flex items-center my-6 w-full">
        <div className="flex-grow h-px bg-gray-700" />
        <span className="mx-3 text-gray-500">or</span>
        <div className="flex-grow h-px bg-gray-700" />
      </div>

      <button 
      className="w-full flex items-center justify-center gap-3 bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-lg transition"
      
        onClick={handleGoogleSignIn}
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
            <a href="/sign-in" className="text-blue-400 hover:underline">
              Sign in
            </a>
          </>
        ) : (
          <>
            Don&apos;t have an account?{" "}
            <a href="/sign-up" className="text-blue-400 hover:underline">
              Sign up
            </a>
          </>
        )}
      </p>
    </div>
  );
};

export default AuthForm;
