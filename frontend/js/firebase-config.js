// Firebase Configuration for CDN usage (compatible with Vercel)
const firebaseConfig = {
  apiKey: "AIzaSyBWdnZIWMnV1BaXA23r0p7-x9PIRKaqv5k",
  authDomain: "ip-tracker-dashboard.firebaseapp.com",
  projectId: "ip-tracker-dashboard",
  storageBucket: "ip-tracker-dashboard.firebasestorage.app",
  messagingSenderId: "66496253784",
  appId: "1:66496253784:web:94c037d7249a77a7221f2d"
};

// Initialize Firebase using CDN (for Vercel compatibility)
firebase.initializeApp(firebaseConfig);

// Export Firebase services for global access
window.firebaseAuth = firebase.auth();
window.firebaseDb = firebase.firestore();

// Export config for other modules
window.firebaseConfig = firebaseConfig;