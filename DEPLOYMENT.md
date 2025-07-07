# Deployment Guide

## Quick Deployment (Vercel)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Connect your GitHub repository
   - Import the project
   - Configure environment variables (see below)
   - Deploy

## Environment Variables Setup

### For Vercel Dashboard:

Add these environment variables in your Vercel project settings:

```env
# Firebase Client Config
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email@your_project_id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
your_private_key_here
-----END PRIVATE KEY-----"

# Admin Configuration
NEXT_PUBLIC_ADMIN_EMAIL=your_admin_email@domain.com
```

### Firebase Security Rules

Update your Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Gallery items are readable by all authenticated users
    match /gallery/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
  }
}
```

## Firebase Console Setup

### 1. Authentication Settings
- Go to Authentication → Settings → Authorized domains
- Add your production domain (e.g., `your-app.vercel.app`)

### 2. Firestore Database
- Ensure Firestore is enabled
- Update security rules (see above)

### 3. Storage (if using images)
- Enable Firebase Storage
- Configure CORS for your domain

## Domain Configuration

### Custom Domain (Optional)
1. In Vercel dashboard, go to your project
2. Click "Domains" tab
3. Add your custom domain
4. Update DNS records as instructed
5. Add custom domain to Firebase authorized domains

## Performance Optimization

### 1. Build Optimization
The project is already configured with:
- Dynamic imports for Firebase
- Code splitting
- Image optimization
- CSS optimization

### 2. Caching Strategy
- Static assets are cached automatically
- API routes use appropriate cache headers
- Firebase SDK is cached client-side

## Monitoring and Analytics

### 1. Vercel Analytics
- Enable in Vercel dashboard
- Monitor performance and user behavior

### 2. Firebase Analytics
- Already configured with `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`
- View analytics in Firebase console

## Troubleshooting

### Common Issues:

1. **Environment Variables Not Working**
   - Ensure all variables are set in Vercel dashboard
   - Redeploy after adding variables
   - Check variable names match exactly

2. **Firebase Auth Issues**
   - Verify authorized domains in Firebase console
   - Check that domain is added to both development and production

3. **Build Failures**
   - Check build logs in Vercel
   - Ensure all dependencies are in package.json
   - Verify TypeScript types are correct

4. **Database Connection Issues**
   - Verify Firestore rules allow your operations
   - Check service account permissions
   - Ensure private key is formatted correctly

### Debug Commands:

```bash
# Test build locally
npm run build

# Check environment variables
npm run env-check

# Lint code
npm run lint
```

## Security Checklist

- [ ] Environment variables are set in production
- [ ] Firebase security rules are configured
- [ ] Service account has minimal required permissions
- [ ] HTTPS is enforced (automatic with Vercel)
- [ ] API routes have proper authentication
- [ ] Admin routes are protected
- [ ] Sensitive data is not exposed in client code

## Post-Deployment

1. **Test all functionality**
   - User registration/login
   - Admin panel access
   - Gallery uploads
   - Profile updates

2. **Monitor performance**
   - Check Vercel analytics
   - Monitor Firebase usage
   - Watch for errors in logs

3. **Set up alerts**
   - Configure Firebase monitoring
   - Set up Vercel deployment notifications

## Scaling Considerations

- **Firebase Firestore**: Scales automatically
- **Vercel Functions**: 10s timeout by default (configured for 30s)
- **Storage**: Consider Firebase Storage quotas
- **Authentication**: Firebase handles scaling

Your app is now ready for production! 🚀
