# Firebase Setup Guide for IP Tracking Dashboard

## 🔥 Firebase Configuration

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Enter project name: `ip-tracker-dashboard`
4. Follow the setup wizard

### Step 2: Enable Authentication

1. In Firebase Console, go to **Authentication**
2. Click "Get Started"
3. Enable **Email/Password** sign-in method
4. (Optional) Enable other providers like Google, GitHub

### Step 3: Create Firestore Database

1. Go to **Firestore Database**
2. Click "Create Database"
3. Start in **Production Mode** (or Test Mode for development)
4. Choose your region

### Step 4: Get Firebase Config

1. Go to **Project Settings** (gear icon)
2. Scroll to "Your apps" section
3. Click the web icon `</>`
4. Register your app
5. Copy the `firebaseConfig` object

### Step 5: Update Configuration

Open `frontend/js/firebase-config.js` and replace the config:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
};
```

### Step 6: Set Firestore Security Rules

In Firestore, go to **Rules** tab and add:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // IP logs - authenticated users only
    match /ipLogs/{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // URI logs - authenticated users only
    match /uriLogs/{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Malicious files - authenticated users only
    match /maliciousFiles/{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Action history - authenticated users only
    match /actionHistory/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 📁 Firestore Collections Structure

### users
```javascript
{
  uid: "user_id",
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  organization: "Company Name",
  role: "analyst",
  createdAt: "2024-01-01T00:00:00.000Z",
  lastLogin: "2024-01-01T00:00:00.000Z",
  isActive: true
}
```

### ipLogs
```javascript
{
  ipAddress: "192.168.1.1",
  status: "BLOCKED",
  severity: "HIGH",
  source: "WAF",
  reason: "Suspicious activity",
  location: "US",
  actionTakenBy: "SOC Analyst",
  notes: "Additional notes",
  createdAt: "2024-01-01T00:00:00.000Z",
  userId: "user_id"
}
```

### uriLogs
```javascript
{
  uri: "https://malicious.com",
  status: "BLOCKED",
  threatType: "PHISHING",
  severity: "CRITICAL",
  reason: "Phishing attempt",
  associatedIps: ["192.168.1.1"],
  actionTakenBy: "SOC Analyst",
  notes: "Additional notes",
  createdAt: "2024-01-01T00:00:00.000Z",
  userId: "user_id"
}
```

### maliciousFiles
```javascript
{
  fileName: "malware.exe",
  fileHash: "abc123...",
  hashType: "SHA256",
  fileType: "exe",
  status: "QUARANTINED",
  malwareType: "TROJAN",
  severity: "CRITICAL",
  blockLocation: "ENDPOINT",
  associatedIps: ["192.168.1.1"],
  associatedUris: ["https://malicious.com"],
  actionTakenBy: "SOC Analyst",
  notes: "Additional notes",
  createdAt: "2024-01-01T00:00:00.000Z",
  userId: "user_id"
}
```

### actionHistory
```javascript
{
  entityType: "IP",
  entityId: "192.168.1.1",
  action: "IP_BLOCKED",
  performedBy: "SOC Analyst",
  details: "Blocked due to suspicious activity",
  timestamp: "2024-01-01T00:00:00.000Z",
  userId: "user_id"
}
```

## 🚀 Running the Application

### Development Mode

1. Open `frontend/signin.html` in a browser
2. Create a new account
3. Verify email (check spam folder)
4. Sign in to access dashboard

### Production Deployment

#### Option 1: Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in project
firebase init

# Select:
# - Hosting
# - Use existing project
# - Public directory: frontend
# - Single-page app: No

# Deploy
firebase deploy
```

#### Option 2: Vercel/Netlify

1. Connect your GitHub repository
2. Set build settings:
   - Build command: (none)
   - Publish directory: `frontend`
3. Deploy

## 🔒 Security Best Practices

1. **Never commit Firebase config with real credentials to public repos**
2. **Use environment variables for sensitive data**
3. **Enable App Check** for additional security
4. **Set up Firebase Security Rules** properly
5. **Enable email verification** before allowing access
6. **Implement rate limiting** for authentication
7. **Use HTTPS only** in production
8. **Regular security audits** of Firestore rules

## 🧪 Testing

### Test User Creation
1. Go to `signup.html`
2. Fill in all fields
3. Complete captcha
4. Submit form
5. Check Firebase Console > Authentication

### Test Sign In
1. Go to `signin.html`
2. Enter credentials
3. Complete captcha
4. Should redirect to dashboard

### Test Protected Routes
1. Try accessing `index.html` without signing in
2. Should redirect to `signin.html`

## 📝 Features Implemented

✅ Firebase Authentication (Email/Password)
✅ User registration with email verification
✅ Secure sign-in with session management
✅ Remember me functionality
✅ Password strength validation
✅ Captcha verification
✅ Protected dashboard routes
✅ User profile management
✅ Logout functionality
✅ Firestore integration ready
✅ Responsive design
✅ Error handling

## 🔧 Troubleshooting

### Issue: "Firebase is not defined"
**Solution:** Ensure Firebase CDN scripts are loaded before your custom scripts

### Issue: "Permission denied" in Firestore
**Solution:** Check Firestore security rules and ensure user is authenticated

### Issue: Email verification not received
**Solution:** Check spam folder, verify SMTP settings in Firebase Console

### Issue: Redirect loop
**Solution:** Clear browser cache and localStorage

## 📞 Support

For issues or questions:
- Check Firebase Console logs
- Review browser console for errors
- Verify all configuration steps completed
- Ensure Firebase project is active and billing enabled (if needed)

## 🎉 Next Steps

1. Customize Firebase config with your project details
2. Set up Firestore collections
3. Configure security rules
4. Test authentication flow
5. Deploy to production
6. Monitor usage in Firebase Console
