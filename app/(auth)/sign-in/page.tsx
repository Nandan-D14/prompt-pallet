// "use client";
// import React, { useState } from "react";
// import { FaEye, FaEyeSlash } from "react-icons/fa";

// const SignInPage = () => {
//   const [form, setForm] = useState({ email: "", password: "" });
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//     setError(null);
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);

//     // Simulated authentication
//     setTimeout(() => {
//       if (form.email === "user@email.com" && form.password === "password123") {
//         setError(null);
//         alert("Signed in!");
//         // navigate or set user state here
//       } else {
//         setError("Invalid email or password.");
//       }
//       setLoading(false);
//     }, 1200);
//   };

//   return (
//     <div
//       className="min-h-screen flex items-center justify-center"
//       style={{
//         background: "rgba(0,0,0,0.7)",
//         backgroundImage:
//           "radial-gradient(circle at 20% 20%, #222 0%, transparent 70%), radial-gradient(circle at 80% 80%, #444 0%, transparent 70%)",
//       }}
//     >
//       <div className="bg-black bg-opacity-80 rounded-2xl shadow-2xl p-10 w-full max-w-md flex flex-col items-center">
//         <h1 className="text-3xl font-extrabold text-white mb-2 tracking-wide">
//           Welcome Back
//         </h1>
//         <p className="text-gray-400 mb-8 text-center">
//           Sign in to your account to continue
//         </p>
//         <form className="w-full flex flex-col gap-5" onSubmit={handleSubmit}>
//           <input
//             name="email"
//             type="email"
//             value={form.email}
//             onChange={handleChange}
//             placeholder="Email"
//             className="px-4 py-3 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
//             required
//           />
//           <div className="relative">
//             <input
//               name="password"
//               type={showPassword ? "text" : "password"}
//               value={form.password}
//               onChange={handleChange}
//               placeholder="Password"
//               className="px-4 py-3 pr-12 w-full rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
//               required
//             />
//             <button
//               type="button"
//               className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
//               onClick={() => setShowPassword((prev) => !prev)}
//               aria-label={showPassword ? "Hide password" : "Show password"}
//             >
//               {showPassword ? <FaEyeSlash /> : <FaEye />}
//             </button>
//           </div>

//           {error && (
//             <div className="text-red-400 text-sm text-center">{error}</div>
//           )}

//           <button
//             type="submit"
//             disabled={loading}
//             className={`bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 rounded-lg shadow-lg hover:scale-105 transition-transform ${
//               loading ? "opacity-60 cursor-not-allowed" : ""
//             }`}
//           >
//             {loading ? "Signing In..." : "Sign In"}
//           </button>
//         </form>

//         <div className="flex items-center my-6 w-full">
//           <div className="flex-grow h-px bg-gray-700" />
//           <span className="mx-3 text-gray-500">or</span>
//           <div className="flex-grow h-px bg-gray-700" />
//         </div>

//         <button
//           className="w-full flex items-center justify-center gap-3 bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-lg transition"
//         >
//           <svg width="20" height="20" fill="currentColor" className="text-blue-500" viewBox="0 0 24 24">
//             <path d="M21.805 10.023h-9.765v3.954h5.627c-.242 1.242-1.484 3.648-5.627 3.648-3.383 0-6.148-2.797-6.148-6.25s2.765-6.25 6.148-6.25c1.93 0 3.227.82 3.969 1.523l2.711-2.633c-1.711-1.594-3.906-2.57-6.68-2.57-5.523 0-10 4.477-10 10s4.477 10 10 10c5.742 0 9.547-4.023 9.547-9.695 0-.652-.07-1.148-.156-1.477z"/>
//           </svg>
//           Sign in with Google
//         </button>

//         <p className="text-gray-500 mt-6 text-sm">
//           Don&apos;t have an account?{" "}
//           <a href="/sign-up" className="text-blue-400 hover:underline">
//             Sign up
//           </a>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default SignInPage;

"use client";
import AuthForm from "@/components/AuthForm";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black/80">
      <AuthForm mode="signin" />
    </div>
  );
}
