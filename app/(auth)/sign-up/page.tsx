"use client";
import AuthForm from "@/components/AuthForm";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black/80">
      <AuthForm mode="signup" />
    </div>
  );
}
