// ============================================
// AUTHENTICATION MODULE
// ============================================

// DOM Elements
const loginScreen = document.getElementById('loginScreen');
const appContainer = document.getElementById('appContainer');
const userName = document.getElementById('userName');
const logoutBtn = document.getElementById('logoutBtn');
const googleLoginBtn = document.getElementById('googleLoginBtn');
const switchToAdmin = document.getElementById('switchToAdmin');
const adminLogin = document.getElementById('adminLogin');
const backToUserLogin = document.getElementById('backToUserLogin');
const adminEmail = document.getElementById('adminEmail');
const adminOTP = document.getElementById('adminOTP');
const adminLoginBtn = document.getElementById('adminLoginBtn');
const adminDashboardBtn = document.getElementById('adminDashboardBtn');

// Current user state
let currentUser = null;
let isAdmin = false;

// ============================================
// FIREBASE AUTH STATE LISTENER
// ============================================
auth.onAuthStateChanged(async (user) => {
    console.log("Auth state changed:", user ? user.email : "No user");
    
    if (user) {
        currentUser = user;
        await handleUserLogin(user);
    } else {
        showLoginScreen();
    }
});

// ============================================
// HANDLE USER LOGIN
// ============================================
async function handleUserLogin(user) {
    try {
        // Check if user exists in database
        const userDoc = await db.collection('users').doc(user.uid).get();
        
        if (!userDoc.exists) {
            // New user - show registration
            showRegistrationForm(user);
        } else {
            // Existing user - load app
            const userData = userDoc.data();
            isAdmin = userData.isAdmin || user.email === ADMIN_EMAIL;
            loadApp(user, userData);
        }
    } catch (error) {
        console.error("Error handling user login:", error);
        alert("Error: " + error.message);
        auth.signOut();
    }
}

// ============================================
// GOOGLE SIGN-IN
// ============================================
googleLoginBtn.addEventListener('click', async () => {
    console.log("Google sign-in clicked");
    
    try {
        // Show loading state
        googleLoginBtn.disabled = true;
        googleLoginBtn.innerHTML = '<img src="https://img.icons8.com/color/24/000000/google-logo.png"/> Signing in...';
        
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await auth.signInWithPopup(provider);
        
        console.log("✓ Google sign-in successful:", result.user.email);
        
    } catch (error) {
        console.error("✗ Google sign-in error:", error);
        
        // Handle specific errors
        if (error.code === 'auth/popup-blocked') {
            alert("Popup blocked! Please allow popups for this site.");
        } else if (error.code === 'auth/cancelled-popup-request') {
            // User cancelled, do nothing
        } else {
            alert("Sign-in failed: " + error.message);
        }
        
        // Reset button
        googleLoginBtn.disabled = false;
        googleLoginBtn.innerHTML = '<img src="https://img.icons8.com/color/48/000000/google-logo.png"/> Sign in with Google';
    }
});

// ============================================
// ADMIN LOGIN
// ============================================
adminLoginBtn.addEventListener('click', async () => {
    const email = adminEmail.value.trim();
    const otp = adminOTP.value.trim();
    
    console.log("Admin login attempt:", email);
    
    // Validation
    if (!email || !otp) {
        alert("Please fill in all fields");
        return;
    }
    
    // Check credentials
    if (email === ADMIN_EMAIL && otp === ADMIN_OTP) {
        try {
            // Show loading state
            adminLoginBtn.disabled = true;
            adminLoginBtn.textContent = "Logging in...";
            
            // Create admin user in database if not exists
            const adminUser = {
                email: email,
                name: "Administrator",
                isAdmin: true,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            // Sign in anonymously first
            const anonUser = await auth.signInAnonymously();
            
            // Store admin info in database
            await db.collection('users').doc(anonUser.user.uid).set(adminUser);
            
            // Mark as admin
            isAdmin = true;
            
            console.log("✓ Admin login successful");
            
            // Load admin app
            loadApp(anonUser.user, adminUser);
            
        } catch (error) {
            console.error("✗ Admin login error:", error);
            alert("Login failed: " + error.message);
            adminLoginBtn.disabled = false;
            adminLoginBtn.textContent = "Login";
        }
    } else {
        alert("Invalid admin credentials");
    }
});

// ============================================
// REGISTRATION FORM
// ============================================
function showRegistrationForm(user) {
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'registrationModal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h3>📝 Welcome! Please Register</h3>
            <p><strong>Email:</strong> ${user.email}</p>
            <input type="text" id="userNameInput" placeholder="Enter your full name" class="input-field" autofocus>
            <button id="registerBtn" class="btn">Register & Continue</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close button
    modal.querySelector('.close').onclick = () => {
        document.body.removeChild(modal);
        auth.signOut();
    };
    
    // Register button
    modal.querySelector('#registerBtn').onclick = async () => {
        const name = document.getElementById('userNameInput').value.trim();
        
        if (!name) {
            alert("Please enter your name");
            return;
        }
        
        try {
            // Save user to database
            await db.collection('users').doc(user.uid).set({
                name: name,
                email: user.email,
                isAdmin: user.email === ADMIN_EMAIL,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            console.log("✓ User registered:", name);
            
            // Remove modal and load app
            document.body.removeChild(modal);
            loadApp(user, { name, email: user.email, isAdmin: user.email === ADMIN_EMAIL });
            
        } catch (error) {
            console.error("✗ Registration error:", error);
            alert("Registration failed: " + error.message);
        }
    };
    
    // Allow Enter key to submit
    document.getElementById('userNameInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            modal.querySelector('#registerBtn').click();
        }
    });
}

// ============================================
// LOAD APP
// ============================================
function loadApp(user, userData) {
    console.log("✓ Loading app for:", userData.name || user.email);
    
    // Set user display name
    userName.textContent = userData.name || user.email;
    
    // Show admin dashboard button if admin
    if (userData.isAdmin || user.email === ADMIN_EMAIL) {
        adminDashboardBtn.style.display = 'block';
        isAdmin = true;
    }
    
    // Hide login screen, show app
    loginScreen.style.display = 'none';
    appContainer.style.display = 'block';
    
    // Initialize attendance module
    if (typeof initializeAttendance !== 'undefined') {
        initializeAttendance();
    }
}

// ============================================
// SHOW LOGIN SCREEN
// ============================================
function showLoginScreen() {
    console.log("Showing login screen");
    loginScreen.style.display = 'flex';
    appContainer.style.display = 'none';
    currentUser = null;
    isAdmin = false;
}

// ============================================
// LOGOUT
// ============================================
logoutBtn.addEventListener('click', async () => {
    try {
        await auth.signOut();
        console.log("✓ User signed out");
        showLoginScreen();
    } catch (error) {
        console.error("Logout error:", error);
        alert("Logout failed: " + error.message);
    }
});

// ============================================
// SWITCH TO ADMIN LOGIN
// ============================================
switchToAdmin.addEventListener('click', () => {
    adminLogin.style.display = 'block';
    document.getElementById('userLogin').style.display = 'none';
    switchToAdmin.style.display = 'none';
});

backToUserLogin.addEventListener('click', () => {
    adminLogin.style.display = 'none';
    document.getElementById('userLogin').style.display = 'block';
    switchToAdmin.style.display = 'block';
});

// ============================================
// TAB SWITCHING
// ============================================
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
        
        // Add active to clicked
        btn.classList.add('active');
        document.getElementById(btn.dataset.tab).classList.add('active');
        
        // Load admin dashboard if clicked
        if (btn.dataset.tab === 'adminDashboard' && typeof loadAdminDashboard === 'function') {
            loadAdminDashboard();
        }
    });
});

// ============================================
// INITIALIZATION
// ============================================
console.log("✓ Auth module loaded");
