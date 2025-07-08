# Firebase Domain Setup Guide

## Issue
The error message indicates that your Vercel domain is not authorized for OAuth operations in Firebase.

## Steps to Fix

### 1. Go to Firebase Console
- Visit: https://console.firebase.google.com/
- Select your project: `prompt-pallete-c2abf`

### 2. Navigate to Authentication Settings
- Click "Authentication" in the left sidebar
- Click "Settings" tab
- Click "Authorized domains" tab

### 3. Add Your Vercel Domains
Add these domains to the authorized list:

**Current deployment domain:**
```
prompt-pallet-azmjwsdr8-team-coders.vercel.app
```

**Wildcard for future deployments:**
```
*.vercel.app
```

**Your custom domain (if any):**
```
prompt-pallet.vercel.app
```

### 4. Save Changes
Click "Add domain" for each entry and save.

## Verification
After adding the domains, try signing in again. The OAuth popup/redirect should work correctly.

## Note
You may need to wait a few minutes for the changes to propagate.
