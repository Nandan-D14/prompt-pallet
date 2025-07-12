import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { ThemeProvider } from "@/contexts/ThemeContext";
import GlassyNavigation from "@/components/GlassyNavigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Prompt Pallete",
  description: `The ultimate home for your AI image prompts. Easily store and access
              your best commands to consistently generate amazing art. Your
              creativity, supercharged.`
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased 
                   bg-black
                   min-h-screen transition-colors duration-300 text-white`}
      >
        <ThemeProvider >
          <div className="relative min-h-screen">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-4 -left-4 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl opacity-30 animate-pulse"></div>
              <div className="absolute -top-4 -right-4 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl opacity-30 animate-pulse animation-delay-2000"></div>
              <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500/10 rounded-full filter blur-3xl opacity-30 animate-pulse animation-delay-4000"></div>
              <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-cyan-500/10 rounded-full filter blur-3xl opacity-20 animate-pulse animation-delay-6000"></div>
            </div>
            
            <main className="relative z-10">
              {children}
            </main>
          </div>
        </ThemeProvider>
        <ToastProvider />
      </body>
    </html>
  );
}
