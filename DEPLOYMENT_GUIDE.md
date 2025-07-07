# Prompt Palette - Complete Deployment Guide

## 🚀 Quick Overview

This is a complete Next.js application with Firebase integration for gallery management, user authentication, and real-time features. The app includes admin functionality, photo management, user saved/liked photos, and AI integration.

## 📋 Prerequisites

- Node.js 18+ installed
- Firebase project created
- Git installed
- Vercel account (for deployment) or preferred hosting platform

## 🔧 Local Development Setup

### 1. Clone and Install Dependencies

```bash
git clone <your-repository-url>
cd prompt-pallete
npm install
```

### 2. Firebase Configuration

#### A. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication (Email/Password provider)
4. Enable Firestore Database
5. Enable Storage (if using file uploads)

#### B. Get Firebase Configuration
1. Go to Project Settings > General > Your apps
2. Add a web app and copy the configuration
3. For Firebase Admin, go to Project Settings > Service Accounts
4. Generate a new private key and download the JSON file

#### C. Set Up Environment Variables
1. Copy `.env.example` to `.env.local`
2. Fill in your Firebase configuration:

```env
# Firebase Client (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-ABCDEFGHIJ

# Firebase Admin (Private)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Private_Key_Here\n-----END PRIVATE KEY-----\n"

# Admin Email
NEXT_PUBLIC_ADMIN_EMAIL=your_admin_email@domain.com
```

### 3. Firestore Security Rules

Update your Firestore rules in the Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Gallery collection - readable by all, writable by admins only
    match /gallery/{document} {
      allow read: if true;
      allow write: if request.auth != null && 
                  get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
    
    // Users collection - users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null && 
                 get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
  }
}
```

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## 🏗️ Project Structure

```
prompt-pallete/
├── app/                          # Next.js 13+ App Router
│   ├── (auth)/                  # Authentication routes
│   ├── (root)/                  # Main application routes
│   ├── api/                     # API routes
│   └── globals.css              # Global styles
├── components/                   # React components
│   ├── ui/                      # UI components
│   ├── Gallery.tsx              # Main gallery component
│   └── SavedPhotosGallery.tsx   # User saved photos
├── firebase/                     # Firebase configuration
│   ├── client.ts                # Client-side config
│   └── admin.ts                 # Server-side config
├── lib/                         # Utility libraries
│   ├── actions/                 # Server actions
│   ├── db/                      # Database utilities
│   └── utils/                   # Helper functions
├── types/                       # TypeScript type definitions
└── middleware.ts                # Next.js middleware
```

## 🎯 Key Features

### ✅ Implemented Features

1. **User Authentication**
   - Email/password sign up and sign in
   - Protected routes with middleware
   - Admin role management

2. **Gallery Management**
   - Real-time photo gallery with Firestore
   - Admin can upload, edit, and delete photos
   - Photo metadata (tags, colors, orientation)
   - Advanced filtering and search

3. **User Interactions**
   - Like photos (persisted to user profile)
   - Save photos to personal collection
   - Share and download photos
   - Lightbox for photo viewing

4. **Admin Features**
   - Admin dashboard
   - Photo upload and management
   - User management
   - Email notifications for new photos

5. **UI/UX**
   - Modern glassmorphism design
   - Responsive layout
   - Smooth animations with Framer Motion
   - Loading states and error handling

## 🚀 Deployment

### Option 1: Vercel (Recommended)

1. **Connect Repository**
   ```bash
   npm install -g vercel
   vercel login
   vercel
   ```

2. **Environment Variables**
   In Vercel dashboard, add all environment variables from `.env.local`

3. **Build Settings**
   - Framework: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

### Option 2: Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   npm start
   ```

2. **Server Requirements**
   - Node.js 18+
   - Environment variables configured
   - HTTPS enabled (required for Firebase Auth)

## 🔧 Configuration

### Admin Setup

1. Create a user account with your admin email
2. The email specified in `NEXT_PUBLIC_ADMIN_EMAIL` will automatically have admin privileges
3. Admin users can access:
   - `/admin-dashboard`
   - `/admin-gallery-upload`
   - `/admin-gallery-manage`
   - `/admin-users`

### Email Notifications (Optional)

To enable email notifications for new photos:

1. Configure SMTP settings in environment variables
2. Add subscriber emails to `NOTIFICATION_EMAIL_*` variables
3. Check the "Notify subscribers" option when uploading photos

## 🧪 Testing

### Run Tests
```bash
npm run lint          # ESLint
npm run type-check     # TypeScript checking
npm run test          # Run tests (if configured)
```

### Manual Testing Checklist

- [ ] User registration and login
- [ ] Gallery browsing and filtering
- [ ] Photo like/save functionality
- [ ] Admin photo upload
- [ ] Admin photo editing
- [ ] Lightbox navigation
- [ ] Responsive design on mobile
- [ ] Real-time updates

## 🐛 Troubleshooting

### Common Issues

1. **Firebase Connection Errors**
   - Verify all environment variables are set
   - Check Firebase project configuration
   - Ensure Firestore and Auth are enabled

2. **Admin Access Issues**
   - Confirm admin email matches `NEXT_PUBLIC_ADMIN_EMAIL`
   - Check user document in Firestore has `isAdmin: true`

3. **Build Errors**
   - Run `npm run lint` to check for code issues
   - Verify all dependencies are installed
   - Check TypeScript errors with `npm run type-check`

4. **Authentication Issues**
   - Verify Firebase Auth configuration
   - Check network connectivity
   - Ensure HTTPS in production

## 📱 Production Checklist

Before going live:

- [ ] Environment variables configured
- [ ] Firebase security rules updated
- [ ] Admin email configured
- [ ] HTTPS enabled
- [ ] Error monitoring set up
- [ ] Analytics configured (optional)
- [ ] Backup strategy in place
- [ ] Performance testing completed

## 🔒 Security Considerations

- Firebase security rules restrict admin operations
- Environment variables are properly protected
- Client-side admin checks are backed by server-side validation
- User data is properly scoped and protected

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Firebase console for errors
3. Check browser console for client-side errors
4. Review server logs for API issues

## 🚀 Next Steps

Potential enhancements:
- Image optimization and CDN integration
- Advanced search with Algolia
- Social login providers
- Bulk photo operations
- Advanced analytics
- Comment system
- Photo collections/albums
