// Firebase Authentication Manager (CDN version)
const auth = window.firebaseAuth;
const db = window.firebaseDb;

class FirebaseAuthManager {
    constructor() {
        this.currentUser = null;
        this.authStateListeners = [];
        this.initializeAuthListener();
    }

    // Initialize authentication state listener
    initializeAuthListener() {
        auth.onAuthStateChanged((user) => {
            this.currentUser = user;
            this.notifyAuthStateListeners(user);
            
            if (user) {
                this.handleUserSignedIn(user);
            } else {
                this.handleUserSignedOut();
            }
        });
    }

    // Add auth state listener
    addAuthStateListener(callback) {
        this.authStateListeners.push(callback);
    }

    // Notify all auth state listeners
    notifyAuthStateListeners(user) {
        this.authStateListeners.forEach(callback => callback(user));
    }

    // Sign up new user
    async signUp(userData) {
        try {
            const { email, password, firstName, lastName, organization } = userData;
            
            // Create user account
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Update user profile
            await user.updateProfile({
                displayName: `${firstName} ${lastName}`
            });

            // Save additional user data to Firestore
            await db.collection('users').doc(user.uid).set({
                firstName,
                lastName,
                email,
                organization,
                role: 'analyst',
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
                isActive: true,
                preferences: {
                    theme: 'light',
                    notifications: true,
                    autoRefresh: true
                }
            });

            // Send email verification
            await user.sendEmailVerification();

            return {
                success: true,
                user,
                message: 'Account created successfully! Please check your email for verification.'
            };
        } catch (error) {
            return {
                success: false,
                error: error.code,
                message: this.getErrorMessage(error.code)
            };
        }
    }

    // Sign in user
    async signIn(email, password, rememberMe = false) {
        try {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Update last login time
            await this.updateUserLastLogin(user.uid);

            // Set persistence based on remember me
            if (rememberMe) {
                localStorage.setItem('rememberUser', 'true');
            } else {
                localStorage.removeItem('rememberUser');
            }

            return {
                success: true,
                user,
                message: 'Sign in successful!'
            };
        } catch (error) {
            return {
                success: false,
                error: error.code,
                message: this.getErrorMessage(error.code)
            };
        }
    }

    // Sign out user
    async signOut() {
        try {
            await auth.signOut();
            localStorage.removeItem('rememberUser');
            sessionStorage.clear();
            
            return {
                success: true,
                message: 'Signed out successfully'
            };
        } catch (error) {
            return {
                success: false,
                error: error.code,
                message: 'Error signing out'
            };
        }
    }

    // Reset password
    async resetPassword(email) {
        try {
            await auth.sendPasswordResetEmail(email);
            return {
                success: true,
                message: 'Password reset email sent! Check your inbox.'
            };
        } catch (error) {
            return {
                success: false,
                error: error.code,
                message: this.getErrorMessage(error.code)
            };
        }
    }

    // Get current user data from Firestore
    async getCurrentUserData() {
        if (!this.currentUser) return null;

        try {
            const userDoc = await db.collection('users').doc(this.currentUser.uid).get();
            if (userDoc.exists) {
                return userDoc.data();
            }
            return null;
        } catch (error) {
            console.error('Error fetching user data:', error);
            return null;
        }
    }

    // Update user last login
    async updateUserLastLogin(uid) {
        try {
            await db.collection('users').doc(uid).set({
                lastLogin: new Date().toISOString()
            }, { merge: true });
        } catch (error) {
            console.error('Error updating last login:', error);
        }
    }

    // Handle user signed in
    handleUserSignedIn(user) {
        console.log('User signed in:', user.email);
        
        // Redirect to dashboard if on auth pages
        const currentPage = window.location.pathname;
        if (currentPage.includes('signin.html') || currentPage.includes('signup.html')) {
            window.location.href = 'index.html';
        }
    }

    // Handle user signed out
    handleUserSignedOut() {
        console.log('User signed out');
        
        // Redirect to signin if on protected pages
        const currentPage = window.location.pathname;
        if (currentPage.includes('index.html') || currentPage === '/') {
            window.location.href = 'signin.html';
        }
    }

    // Check if user is authenticated
    isAuthenticated() {
        return this.currentUser !== null;
    }

    // Get user display name
    getUserDisplayName() {
        if (!this.currentUser) return 'Guest';
        return this.currentUser.displayName || this.currentUser.email;
    }

    // Get user email
    getUserEmail() {
        return this.currentUser?.email || '';
    }

    // Get user photo URL
    getUserPhotoURL() {
        return this.currentUser?.photoURL || 'https://via.placeholder.com/40';
    }

    // Convert Firebase error codes to user-friendly messages
    getErrorMessage(errorCode) {
        const errorMessages = {
            'auth/email-already-in-use': 'This email is already registered. Please use a different email or sign in.',
            'auth/weak-password': 'Password is too weak. Please use at least 6 characters.',
            'auth/invalid-email': 'Please enter a valid email address.',
            'auth/user-not-found': 'No account found with this email address.',
            'auth/wrong-password': 'Incorrect password. Please try again.',
            'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
            'auth/network-request-failed': 'Network error. Please check your connection.',
            'auth/invalid-credential': 'Invalid email or password. Please try again.',
            'auth/user-disabled': 'This account has been disabled. Please contact support.',
            'auth/operation-not-allowed': 'This operation is not allowed. Please contact support.',
            'auth/requires-recent-login': 'Please sign in again to complete this action.'
        };

        return errorMessages[errorCode] || 'An unexpected error occurred. Please try again.';
    }

    // Security features
    async checkSecurityThreats() {
        // Check for suspicious login patterns
        const loginAttempts = parseInt(localStorage.getItem('loginAttempts') || '0');
        const lastAttempt = localStorage.getItem('lastLoginAttempt');
        
        if (loginAttempts >= 5) {
            const timeDiff = Date.now() - parseInt(lastAttempt || '0');
            if (timeDiff < 15 * 60 * 1000) { // 15 minutes
                return {
                    blocked: true,
                    message: 'Account temporarily locked due to multiple failed attempts. Try again in 15 minutes.'
                };
            } else {
                // Reset attempts after cooldown
                localStorage.removeItem('loginAttempts');
                localStorage.removeItem('lastLoginAttempt');
            }
        }

        return { blocked: false };
    }

    // Track failed login attempts
    trackFailedAttempt() {
        const attempts = parseInt(localStorage.getItem('loginAttempts') || '0') + 1;
        localStorage.setItem('loginAttempts', attempts.toString());
        localStorage.setItem('lastLoginAttempt', Date.now().toString());
    }

    // Clear failed attempts on successful login
    clearFailedAttempts() {
        localStorage.removeItem('loginAttempts');
        localStorage.removeItem('lastLoginAttempt');
    }
}

// Create and export singleton instance
const firebaseAuth = new FirebaseAuthManager();
export default firebaseAuth;