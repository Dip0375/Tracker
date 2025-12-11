// Enhanced Authentication with Firebase Integration

class AuthManager {
    constructor() {
        this.auth = window.firebaseAuth;
        this.db = window.firebaseDb;
        this.initializeAuth();
        this.generateCaptcha();
        this.setupEventListeners();
        this.initializeSecurity();
    }

    initializeAuth() {
        // Check if we're on signup or signin page
        this.isSignupPage = document.getElementById('signup-form') !== null;
        this.isSigninPage = document.getElementById('signin-form') !== null;

        // Initialize password strength checker for signup
        if (this.isSignupPage) {
            this.initializePasswordStrength();
        }
    }

    setupEventListeners() {
        // Password toggle functionality
        this.setupPasswordToggle();

        // Captcha refresh
        const captchaRefresh = document.getElementById('captcha-refresh');
        if (captchaRefresh) {
            captchaRefresh.addEventListener('click', () => this.generateCaptcha());
        }

        // Form submissions
        if (this.isSignupPage) {
            const signupForm = document.getElementById('signup-form');
            signupForm.addEventListener('submit', (e) => this.handleSignup(e));
            
            // Real-time validation
            this.setupSignupValidation();
        }

        if (this.isSigninPage) {
            const signinForm = document.getElementById('signin-form');
            signinForm.addEventListener('submit', (e) => this.handleSignin(e));
        }

        // Robot check animation
        const robotCheck = document.getElementById('not-robot');
        if (robotCheck) {
            robotCheck.addEventListener('change', this.handleRobotCheck);
        }
    }

    setupPasswordToggle() {
        const toggleButtons = document.querySelectorAll('.password-toggle');
        toggleButtons.forEach(button => {
            button.addEventListener('click', () => {
                const input = button.parentElement.querySelector('input');
                const icon = button.querySelector('i');
                
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                } else {
                    input.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            });
        });
    }

    generateCaptcha() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
        let captcha = '';
        for (let i = 0; i < 6; i++) {
            captcha += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        const captchaText = document.getElementById('captcha-text');
        if (captchaText) {
            captchaText.textContent = captcha;
            this.currentCaptcha = captcha;
        }
    }

    initializePasswordStrength() {
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirm-password');
        
        if (passwordInput) {
            passwordInput.addEventListener('input', () => {
                this.checkPasswordStrength(passwordInput.value);
                this.validateSignupForm();
            });
        }

        if (confirmPasswordInput) {
            confirmPasswordInput.addEventListener('input', () => {
                this.checkPasswordMatch();
                this.validateSignupForm();
            });
        }
    }

    checkPasswordStrength(password) {
        const requirements = {
            length: password.length >= 12,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /\d/.test(password),
            special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
        };

        // Update requirement indicators
        Object.keys(requirements).forEach(req => {
            const element = document.getElementById(`req-${req}`);
            if (element) {
                const icon = element.querySelector('i');
                if (requirements[req]) {
                    element.classList.add('valid');
                    element.classList.remove('invalid');
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-check');
                } else {
                    element.classList.add('invalid');
                    element.classList.remove('valid');
                    icon.classList.remove('fa-check');
                    icon.classList.add('fa-times');
                }
            }
        });

        // Calculate strength
        const validCount = Object.values(requirements).filter(Boolean).length;
        const strengthFill = document.getElementById('strength-fill');
        const strengthText = document.getElementById('strength-text');

        if (strengthFill && strengthText) {
            // Remove all strength classes
            strengthFill.className = 'strength-fill';
            strengthText.className = 'strength-text';

            let strengthLevel = '';
            let strengthMessage = '';

            if (validCount === 0 || password.length === 0) {
                strengthMessage = 'Enter a password';
            } else if (validCount <= 2) {
                strengthLevel = 'weak';
                strengthMessage = 'Weak password';
            } else if (validCount <= 3) {
                strengthLevel = 'fair';
                strengthMessage = 'Fair password';
            } else if (validCount <= 4) {
                strengthLevel = 'good';
                strengthMessage = 'Good password';
            } else {
                strengthLevel = 'strong';
                strengthMessage = 'Strong password';
            }

            if (strengthLevel) {
                strengthFill.classList.add(strengthLevel);
                strengthText.classList.add(strengthLevel);
            }
            strengthText.textContent = strengthMessage;
        }

        return validCount === 5;
    }

    checkPasswordMatch() {
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const matchIndicator = document.getElementById('password-match');

        if (matchIndicator) {
            if (confirmPassword.length === 0) {
                matchIndicator.textContent = '';
                matchIndicator.className = 'password-match';
            } else if (password === confirmPassword) {
                matchIndicator.textContent = '✓ Passwords match';
                matchIndicator.className = 'password-match match';
            } else {
                matchIndicator.textContent = '✗ Passwords do not match';
                matchIndicator.className = 'password-match no-match';
            }
        }

        return password === confirmPassword && password.length > 0;
    }

    setupSignupValidation() {
        const inputs = document.querySelectorAll('#signup-form input[required]');
        inputs.forEach(input => {
            input.addEventListener('input', () => this.validateSignupForm());
            input.addEventListener('blur', () => this.validateSignupForm());
        });

        const checkboxes = document.querySelectorAll('#signup-form input[type="checkbox"][required]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => this.validateSignupForm());
        });
    }

    validateSignupForm() {
        const password = document.getElementById('password').value;
        const isPasswordStrong = this.checkPasswordStrength(password);
        const isPasswordMatch = this.checkPasswordMatch();
        
        const requiredInputs = document.querySelectorAll('#signup-form input[required]:not([type="checkbox"])');
        const allInputsFilled = Array.from(requiredInputs).every(input => input.value.trim() !== '');
        
        const requiredCheckboxes = document.querySelectorAll('#signup-form input[type="checkbox"][required]');
        const allCheckboxesChecked = Array.from(requiredCheckboxes).every(checkbox => checkbox.checked);
        
        const signupBtn = document.getElementById('signup-btn');
        const isValid = allInputsFilled && allCheckboxesChecked && isPasswordStrong && isPasswordMatch;
        
        if (signupBtn) {
            signupBtn.disabled = !isValid;
        }
    }

    handleRobotCheck(event) {
        const checkbox = event.target;
        const robotIcon = checkbox.closest('.robot-check').querySelector('i');
        
        if (checkbox.checked) {
            robotIcon.style.color = 'var(--success-color)';
            robotIcon.classList.remove('fa-robot');
            robotIcon.classList.add('fa-check-circle');
            
            // Add verification animation
            setTimeout(() => {
                robotIcon.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    robotIcon.style.transform = 'scale(1)';
                }, 200);
            }, 100);
        } else {
            robotIcon.style.color = 'var(--text-light)';
            robotIcon.classList.remove('fa-check-circle');
            robotIcon.classList.add('fa-robot');
            robotIcon.style.transform = 'scale(1)';
        }
    }

    validateCaptcha(userInput) {
        return userInput === this.currentCaptcha;
    }

    showMessage(message, type = 'error') {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.error-message, .success-message');
        existingMessages.forEach(msg => msg.remove());

        // Create new message
        const messageDiv = document.createElement('div');
        messageDiv.className = type === 'success' ? 'success-message' : 'error-message';
        messageDiv.textContent = message;

        // Insert message at the top of the form
        const form = document.querySelector('.auth-form');
        form.insertBefore(messageDiv, form.firstChild);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }

    async handleSignup(event) {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        const captchaInput = document.getElementById('captcha-input').value;
        const robotCheck = document.getElementById('not-robot').checked;
        const signupBtn = document.getElementById('signup-btn');

        // Validate captcha
        if (!this.validateCaptcha(captchaInput)) {
            this.showMessage('Invalid captcha. Please try again.');
            this.generateCaptcha();
            document.getElementById('captcha-input').value = '';
            return;
        }

        // Validate robot check
        if (!robotCheck) {
            this.showMessage('Please verify that you are not a robot.');
            return;
        }

        // Show loading state
        signupBtn.classList.add('loading');
        signupBtn.disabled = true;

        try {
            // Firebase signup
            const email = formData.get('email');
            const password = formData.get('password');
            const firstName = formData.get('firstName');
            const lastName = formData.get('lastName');
            const organization = formData.get('organization');

            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            await user.updateProfile({
                displayName: `${firstName} ${lastName}`
            });

            await this.db.collection('users').doc(user.uid).set({
                firstName,
                lastName,
                email,
                organization,
                role: 'analyst',
                createdAt: new Date().toISOString(),
                isActive: true
            });

            await user.sendEmailVerification();

            this.showMessage('Account created successfully! Please check your email.', 'success');
            form.reset();
            this.generateCaptcha();
            
            setTimeout(() => {
                window.location.href = 'signin.html';
            }, 2000);
        } catch (error) {
            console.error('Signup error:', error);
            const errorMsg = this.getFirebaseErrorMessage(error.code);
            this.showMessage(errorMsg);
        } finally {
            signupBtn.classList.remove('loading');
            signupBtn.disabled = false;
        }
    }

    async handleSignin(event) {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        const captchaInput = document.getElementById('captcha-input').value;
        const robotCheck = document.getElementById('not-robot').checked;
        const signinBtn = document.getElementById('signin-btn');

        // Validate captcha
        if (!this.validateCaptcha(captchaInput)) {
            this.showMessage('Invalid captcha. Please try again.');
            this.generateCaptcha();
            document.getElementById('captcha-input').value = '';
            return;
        }

        // Validate robot check
        if (!robotCheck) {
            this.showMessage('Please verify that you are not a robot.');
            return;
        }

        // Show loading state
        signinBtn.classList.add('loading');
        signinBtn.disabled = true;

        try {
            // Firebase signin
            const email = formData.get('email');
            const password = formData.get('password');
            const rememberMe = document.getElementById('remember-me').checked;

            const persistence = rememberMe ? 
                firebase.auth.Auth.Persistence.LOCAL : 
                firebase.auth.Auth.Persistence.SESSION;
            
            await this.auth.setPersistence(persistence);
            await this.auth.signInWithEmailAndPassword(email, password);

            // Update last login
            const user = this.auth.currentUser;
            if (user) {
                await this.db.collection('users').doc(user.uid).update({
                    lastLogin: new Date().toISOString()
                });
            }

            this.showMessage('Sign in successful! Redirecting...', 'success');
            localStorage.removeItem('loginAttempts');
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } catch (error) {
            console.error('Signin error:', error);
            const errorMsg = this.getFirebaseErrorMessage(error.code);
            this.showMessage(errorMsg);
            this.generateCaptcha();
            document.getElementById('captcha-input').value = '';
            
            const attempts = parseInt(localStorage.getItem('loginAttempts') || '0') + 1;
            localStorage.setItem('loginAttempts', attempts.toString());
            
            if (attempts >= 5) {
                this.showMessage('Too many failed attempts. Please try again later.');
                signinBtn.disabled = true;
            }
        } finally {
            signinBtn.classList.remove('loading');
            signinBtn.disabled = false;
        }
    }

    // Enhanced security features
    detectSuspiciousActivity() {
        let attemptCount = parseInt(localStorage.getItem('loginAttempts') || '0');
        const lastAttempt = localStorage.getItem('lastLoginAttempt');
        const now = Date.now();
        
        // Reset attempts after 15 minutes
        if (lastAttempt && (now - parseInt(lastAttempt)) > 15 * 60 * 1000) {
            attemptCount = 0;
        }
        
        attemptCount++;
        localStorage.setItem('loginAttempts', attemptCount.toString());
        localStorage.setItem('lastLoginAttempt', now.toString());
        
        // Lock account after 5 failed attempts
        if (attemptCount >= 5) {
            this.showMessage('Too many failed attempts. Please try again in 15 minutes.');
            return true;
        }
        
        return false;
    }

    getFirebaseErrorMessage(code) {
        const errors = {
            'auth/email-already-in-use': 'Email already registered',
            'auth/weak-password': 'Password too weak (min 6 characters)',
            'auth/invalid-email': 'Invalid email address',
            'auth/user-not-found': 'No account found',
            'auth/wrong-password': 'Incorrect password',
            'auth/too-many-requests': 'Too many attempts. Try later',
            'auth/network-request-failed': 'Network error'
        };
        return errors[code] || 'An error occurred. Please try again.';
    }

    initializeSecurity() {
        // Check for suspicious activity
        if (this.detectSuspiciousActivity() && this.isSigninPage) {
            const signinBtn = document.getElementById('signin-btn');
            if (signinBtn) {
                signinBtn.disabled = true;
            }
        }

        // Add additional security headers
        document.addEventListener('contextmenu', (e) => {
            // Disable right-click on sensitive elements
            if (e.target.closest('.captcha-display, .password-requirements')) {
                e.preventDefault();
            }
        });

        // Prevent password field inspection
        const passwordFields = document.querySelectorAll('input[type="password"]');
        passwordFields.forEach(field => {
            field.addEventListener('copy', (e) => e.preventDefault());
            field.addEventListener('cut', (e) => e.preventDefault());
        });
    }
}

// Initialize authentication when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const authManager = new AuthManager();
    authManager.initializeSecurity();
});

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthManager;
}
            robotIcon.classList.add('fa-check-circle');
        } else {
            robotIcon.style.color = 'var(--text-light)';
            robotIcon.classList.remove('fa-check-circle');
            robotIcon.classList.add('fa-robot');
        }
    }

    validateCaptcha() {
        const captchaInput = document.getElementById('captcha-input');
        if (!captchaInput) return false;
        
        const userInput = captchaInput.value.trim();
        const isValid = userInput === this.currentCaptcha;
        
        if (!isValid) {
            captchaInput.classList.add('error');
            this.showError('Invalid captcha. Please try again.');
            this.generateCaptcha();
            captchaInput.value = '';
        } else {
            captchaInput.classList.remove('error');
            captchaInput.classList.add('success');
        }
        
        return isValid;
    }

    async handleSignup(event) {
        event.preventDefault();
        
        if (!this.validateCaptcha()) {
            return;
        }

        const submitBtn = document.getElementById('signup-btn');
        const formData = new FormData(event.target);
        
        // Add loading state
        submitBtn.classList.add('loading');
        
        try {
            // Simulate API call
            await this.simulateApiCall();
            
            // Get form data
            const userData = {
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                email: formData.get('email'),
                organization: formData.get('organization'),
                password: formData.get('password')
            };
            
            console.log('Signup data:', userData);
            
            // Show success message
            this.showSuccess('Account created successfully! Please check your email for verification.');
            
            // Redirect after delay
            setTimeout(() => {
                window.location.href = 'signin.html';
            }, 2000);
            
        } catch (error) {
            this.showError('Failed to create account. Please try again.');
        } finally {
            submitBtn.classList.remove('loading');
        }
    }

    async handleSignin(event) {
        event.preventDefault();
        
        if (!this.validateCaptcha()) {
            return;
        }

        const submitBtn = document.getElementById('signin-btn');
        const formData = new FormData(event.target);
        
        // Add loading state
        submitBtn.classList.add('loading');
        
        try {
            // Simulate API call
            await this.simulateApiCall();
            
            // Get form data
            const loginData = {
                email: formData.get('email'),
                password: formData.get('password'),
                rememberMe: formData.get('remember-me') === 'on'
            };
            
            console.log('Login data:', loginData);
            
            // Show success message
            this.showSuccess('Login successful! Redirecting to dashboard...');
            
            // Redirect after delay
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
            
        } catch (error) {
            this.showError('Invalid email or password. Please try again.');
        } finally {
            submitBtn.classList.remove('loading');
        }
    }

    async simulateApiCall() {
        // Simulate network delay
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate random success/failure for demo
                if (Math.random() > 0.1) { // 90% success rate
                    resolve();
                } else {
                    reject(new Error('API Error'));
                }
            }, 1500);
        });
    }

    showError(message) {
        this.showMessage(message, 'error');
    }

    showSuccess(message) {
        this.showMessage(message, 'success');
    }

    showMessage(message, type) {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.error-message, .success-message');
        existingMessages.forEach(msg => msg.remove());
        
        // Create new message
        const messageDiv = document.createElement('div');
        messageDiv.className = `${type}-message`;
        messageDiv.textContent = message;
        
        // Insert at the top of the form
        const form = document.querySelector('.auth-form');
        if (form) {
            form.insertBefore(messageDiv, form.firstChild);
            
            // Auto-remove after 5 seconds
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.remove();
                }
            }, 5000);
        }
    }
}

// Initialize authentication when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AuthManager();
});

// Additional utility functions
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

// Export for potential use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthManager;
}