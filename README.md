# 🎨 Prompt Palette - AI Image Gallery Platform

[![Next.js](https://img.shields.io/badge/Next.js-15.3.4-black)](https://nextjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-11.10.0-orange)](https://firebase.google.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.0-teal)](https://tailwindcss.com/)

A modern full-stack AI image gallery platform built with **Next.js 15**, **Firebase**, and **TypeScript**. Features real-time gallery updates, user authentication, admin tools, and AI-powered image prompts.

---

## ✨ Features

### 🔐 Authentication
- Email/password login with Firebase Auth
- Secure session-based authentication
- Role-based access control (admin/user)
- Protected routes using Next.js middleware

### 🖼️ Gallery Management
- Real-time photo gallery (Firestore)
- Filter by tags and keywords
- Responsive masonry layout
- Lightbox with keyboard navigation

### 👤 User Features
- Like/save photos to profile
- Personal gallery management
- Download and share photos
- Profile editing and preferences

### 🛠️ Admin Tools
- Upload new images with metadata
- Bulk delete/edit/tag photos
- Manage users and roles
- Monitor real-time analytics
- Email alerts for new uploads

### 🎨 UI/UX Design
- Glassmorphism UI
- Dark/light mode toggle
- Smooth transitions (Framer Motion)
- Responsive design (mobile/tablet/desktop)

### 🧠 AI Integration
- Prompt-based AI image generation (OpenAI, Stability, etc.)
- Prompt history and reuse
- (Optional) Smart auto-tagging with AI

---

## 🚀 Quick Start

### ✅ Prerequisites
- Node.js 18+
- Firebase project (Firestore + Auth)
- Git (for cloning repo)
- Vercel account (for deployment)

### 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Nandan-D14/prompt-pallet/
   cd prompt-palette
   npm install
Environment Setup
```
cp .env.example .env.local
```
Fill in your Firebase configuration and other keys.

Firebase Configuration

Enable Authentication → Email/Password

Enable Cloud Firestore

Enable Cloud Storage (optional)

Configure Firestore Rules (see below)

Run Development Server
```
npm run dev
Visit: http://localhost:3000
```

🔒 Firestore Security Rules (Example)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /photos/{photoId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

📁 Project Structure
```
prompt-palette/
├── app/                    # Next.js 15 App Router
│   ├── (auth)/            # Login/Register routes
│   ├── (root)/            # Main routes (home, gallery, profile)
│   ├── api/               # Server-side route handlers
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/                # Reusable UI elements
│   ├── Gallery.tsx
│   ├── Lightbox.tsx
│   └── SavedPhotosGallery.tsx
├── firebase/              # Firebase config
│   ├── client.ts
│   └── admin.ts
├── lib/                   # Helper functions
│   ├── actions/
│   ├── db/
│   └── utils/
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript types/interfaces
└── middleware.ts          # Auth protection middleware
```

🛠️ Tech Stack
Frontend: Next.js 15, React 19, TypeScript

Backend: Firebase Admin SDK, Next.js API routes

Database: Firestore (NoSQL)

Authentication: Firebase Auth

Storage: Firebase Storage (optional)

Styling: Tailwind CSS 4.0

Animations: Framer Motion

Icons: Lucide, React Icons

Deployment: Vercel (recommended)


🚀 Deployment (Vercel)
Install Vercel CLI
```
npm install -g vercel
```

Run Checks
```
npm run deploy-check
Deploy to Production
```
```
vercel --prod
For detailed deployment setup, see DEPLOYMENT_GUIDE.md
```

🧪 Testing & Validation
```
npm run lint          # Lint project with ESLint
npm run type-check    # TypeScript type validation
npm run deploy-check  # Combined pre-deploy test suite
```
   
