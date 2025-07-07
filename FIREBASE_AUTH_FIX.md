# Firebase Auth Domain Fix

## The Problem
You're getting `auth/unauthorized-domain` error because your local development domain is not authorized in Firebase.

## Quick Fix - Add Authorized Domains

1. **Go to Firebase Console:**
   - Visit: https://console.firebase.google.com/
   - Select your project: `prompt-pallete-c2abf`

2. **Navigate to Authentication Settings:**
   - Click "Authentication" in the left sidebar
   - Click on "Settings" tab
   - Click on "Authorized domains" tab

3. **Add These Domains:**
   ```
   localhost
   127.0.0.1
   ```

4. **If you're accessing via local IP, also add:**
   ```
   169.254.231.136
   ```

## Step-by-Step Instructions

### Option 1: Using Firebase Console (Recommended)

1. Open your browser and go to: https://console.firebase.google.com/project/prompt-pallete-c2abf/authentication/settings
2. Click "Add domain"
3. Add `localhost`
4. Click "Add domain" again
5. Add `127.0.0.1`
6. If needed, add your local IP `169.254.231.136`

### Option 2: Using Firebase CLI

Run these commands in your terminal:

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Set your project
firebase use prompt-pallete-c2abf

# Add authorized domains
firebase auth:export domains.json
# Edit the file to add your domains, then:
firebase auth:import domains.json
```

## Test the Fix

1. After adding the domains, refresh your browser
2. Try signing in with Google again
3. The error should be resolved

## Additional Notes

- The domains are case-sensitive
- You don't need to include the port number (`:3000`)
- `localhost` and `127.0.0.1` should cover most local development scenarios
- If you're still having issues, try adding `0.0.0.0` as well

## Common Local Development Domains to Add:
- `localhost`
- `127.0.0.1` 
- `0.0.0.0`
- Your local IP (if accessing from other devices)
