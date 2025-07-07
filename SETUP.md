# Firebase Setup Guide

## Quick Start

1. **Create Environment File**
   ```bash
   cp .env.example .env.local
   ```

2. **Configure Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or select existing one
   - Enable Authentication (Email/Password + Google)
   - Enable Firestore Database
   - Generate service account key for Admin SDK

3. **Update .env.local with your Firebase configuration**

## Detailed Steps

### 1. Firebase Console Setup

#### Authentication Setup:
1. Go to Authentication → Sign-in method
2. Enable "Email/Password" provider
3. Enable "Google" provider (add your domain)

#### Firestore Setup:
1. Go to Firestore Database → Create database
2. Start in test mode (you can secure it later)
3. Choose a location close to your users

### 2. Get Firebase Configuration

#### Client Configuration:
1. Go to Project Settings → General
2. Scroll down to "Your apps" 
3. Click "Web app" icon to create/view web app
4. Copy the config object values

#### Admin SDK Configuration:
1. Go to Project Settings → Service accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Extract the values for .env.local

### 3. Update .env.local

```env
# Firebase Client Configuration (from Firebase Console → Project Settings)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Firebase Admin SDK (from downloaded service account JSON)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email@your_project_id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key_here\n-----END PRIVATE KEY-----"

# Admin Configuration (your email address)
NEXT_PUBLIC_ADMIN_EMAIL=your_admin_email@domain.com
```

### 4. Verify Setup

Run the environment check:
```bash
node check-env.js
```

All items should show "✓ Set"

### 5. Start Development Server

```bash
npm run dev
```

## Troubleshooting

### Common Issues:

1. **Hydration Errors**: These are caused by browser extensions and are handled automatically
2. **Authentication Not Working**: Check console for detailed error messages
3. **Admin Panel Not Accessible**: Ensure your email matches NEXT_PUBLIC_ADMIN_EMAIL
4. **CORS Errors**: Make sure your domain is added to Firebase Auth settings

### Debug Steps:

1. Check browser console for error messages
2. Verify environment variables are loaded correctly
3. Check Firebase console for authentication attempts
4. Verify Firestore security rules allow your operations

## Security Notes

- Never commit .env.local to version control
- Use environment-specific configurations for production
- Set up proper Firestore security rules before going live
- Consider using Firebase App Check for additional security
