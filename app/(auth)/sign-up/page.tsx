"use client";
import AuthForm from "@/components/AuthForm";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AuthProvider } from "@/contexts/AuthContext";

export default function SignUpPage() {
  return (
    <AuthProvider>
      <ProtectedRoute requireAuth={false}>
        <div className="min-h-screen w-screen flex items-center justify-center bg-black/80">
          <AuthForm mode="signup" />
        </div>
      </ProtectedRoute>
    </AuthProvider>
  );
}
