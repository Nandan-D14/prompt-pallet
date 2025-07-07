# Deployment Checklist for Prompt Palette

## Pre-Deployment Setup

### 1. Firebase Project Setup
- [ ] Create Firebase project at [Firebase Console](https://console.firebase.google.com/)
- [ ] Enable Authentication with Email/Password provider
- [ ] Enable Google Authentication provider (optional)
- [ ] Create Firestore Database
- [ ] Generate service account key for Admin SDK
- [ ] Copy security rules from `firestore.rules` to Firebase Console

### 2. Environment Configuration
- [ ] Copy `.env.example` to `.env.local`
- [ ] Update all Firebase configuration values in `.env.local`
- [ ] Set your admin email in `NEXT_PUBLIC_ADMIN_EMAIL`
- [ ] Test environment setup with: `npm run env-check`

### 3. Code Quality Checks
- [ ] Run linting: `npm run lint`
- [ ] Test build: `npm run build`
- [ ] Fix any TypeScript errors
- [ ] Commit all changes to Git

## Deployment Options

### Option 1: Vercel CLI Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to production
vercel --prod
```

### Option 2: GitHub + Vercel Dashboard
```bash
# Push to GitHub
git add .
git commit -m "Ready for deployment"
git push origin main

# Then connect repository in Vercel dashboard
```

## Vercel Configuration

### Environment Variables in Vercel Dashboard
Add these in your Vercel project settings:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email@your_project_id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key_here\n-----END PRIVATE KEY-----"
NEXT_PUBLIC_ADMIN_EMAIL=your_admin_email@domain.com
```

### Vercel Configuration Files
- [ ] `vercel.json` is configured (already included)
- [ ] Functions timeout set to 30 seconds
- [ ] Build and install commands are correct

## Post-Deployment Configuration

### 1. Firebase Console Updates
- [ ] Add production domain to Firebase Authentication → Settings → Authorized domains
- [ ] Update Firestore security rules using `firestore.rules`
- [ ] Test authentication on production domain

### 2. Testing Checklist
- [ ] User registration works
- [ ] User login works
- [ ] Google authentication works (if enabled)
- [ ] Admin panel is accessible with admin email
- [ ] Gallery functionality works
- [ ] Profile updates work
- [ ] Image uploads work (if implemented)
- [ ] All API endpoints respond correctly

### 3. Performance & Monitoring
- [ ] Enable Vercel Analytics
- [ ] Monitor Firebase usage in Firebase Console
- [ ] Check Core Web Vitals
- [ ] Set up error monitoring

## Security Checklist

### Firebase Security
- [ ] Firestore security rules are properly configured
- [ ] Service account has minimal required permissions
- [ ] API keys are environment-specific
- [ ] No sensitive data in client-side code

### Vercel Security
- [ ] Environment variables are set in Vercel dashboard
- [ ] `.env.local` is not committed to Git
- [ ] HTTPS is enforced (automatic with Vercel)
- [ ] Domain is secured with SSL certificate

## Troubleshooting

### Common Issues
1. **Environment Variables Not Loading**
   - Check variable names match exactly
   - Redeploy after adding variables
   - Verify in Vercel dashboard

2. **Firebase Auth Errors**
   - Verify authorized domains
   - Check authentication providers are enabled
   - Ensure environment variables are correct

3. **Build Failures**
   - Check build logs in Vercel
   - Fix TypeScript errors
   - Verify all dependencies are installed

4. **Database Connection Issues**
   - Check Firestore rules
   - Verify service account permissions
   - Ensure private key formatting is correct

### Debug Commands
```bash
# Test everything locally
npm run deploy-prep

# Check specific issues
npm run env-check
npm run lint
npm run build
```

## Custom Domain Setup (Optional)

### 1. Vercel Domain Configuration
- [ ] Add custom domain in Vercel dashboard
- [ ] Update DNS records as instructed
- [ ] Verify SSL certificate is active

### 2. Firebase Domain Updates
- [ ] Add custom domain to Firebase authorized domains
- [ ] Update any hardcoded URLs in code
- [ ] Test authentication with custom domain

## Monitoring & Maintenance

### Regular Checks
- [ ] Monitor Firebase quotas and usage
- [ ] Check Vercel function logs
- [ ] Review security rules periodically
- [ ] Update dependencies regularly

### Performance Monitoring
- [ ] Set up Vercel Analytics
- [ ] Monitor Core Web Vitals
- [ ] Check Firebase performance tab
- [ ] Set up alerts for errors

## Final Verification

- [ ] All functionality works on production
- [ ] Admin panel is accessible
- [ ] Authentication flows work correctly
- [ ] Database operations are secure
- [ ] Performance is acceptable
- [ ] Error handling works properly

## Success! 🎉

Your Prompt Palette is now successfully deployed and ready for users!

### Next Steps
1. Share your application URL
2. Monitor usage and performance
3. Gather user feedback
4. Plan future enhancements

### Support
- Check `DEPLOYMENT.md` for detailed instructions
- Review `SETUP.md` for Firebase configuration
- Monitor logs for any issues
- Update dependencies regularly
