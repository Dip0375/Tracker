// Authentication Guard for Dashboard
(function() {
    const auth = window.firebaseAuth;
    const db = window.firebaseDb;

    // Check authentication state
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            // User is signed in
            await updateUserDisplay(user);
            setupLogout();
        } else {
            // No user signed in, redirect to signin
            if (!window.location.pathname.includes('signin.html') && 
                !window.location.pathname.includes('signup.html')) {
                window.location.href = 'signin.html';
            }
        }
    });

    async function updateUserDisplay(user) {
        try {
            const userDoc = await db.collection('users').doc(user.uid).get();
            const userData = userDoc.data();
            
            const userName = document.getElementById('user-name');
            if (userName) {
                userName.textContent = user.displayName || userData?.firstName || user.email;
            }

            const userAvatar = document.getElementById('user-avatar');
            if (userAvatar && user.photoURL) {
                userAvatar.src = user.photoURL;
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }

    function setupLogout() {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                try {
                    await auth.signOut();
                    window.location.href = 'signin.html';
                } catch (error) {
                    console.error('Logout error:', error);
                    alert('Error signing out. Please try again.');
                }
            });
        }
    }
})();
