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

// Initialize Firebase Auth
auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
        // Check if user is admin
        checkAdminStatus(user.email);
        // Show app
        loginScreen.style.display = 'none';
        appContainer.style.display = 'block';
        // Set user name
        userName.textContent = user.displayName || user.email;
    } else {
        // Show login screen
        loginScreen.style.display = 'flex';
        appContainer.style.display = 'none';
        currentUser = null;
        isAdmin = false;
    }
});

// Google Sign-in
googleLoginBtn.addEventListener('click', () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then((result) => {
            // Check if user exists in database
            checkUserRegistration(result.user);
        })
        .catch((error) => {
            console.error('Login error:', error);
            alert('Login failed: ' + error.message);
        });
});

// Check if user is registered
function checkUserRegistration(user) {
    db.collection('users').doc(user.uid).get()
        .then((doc) => {
            if (!doc.exists) {
                // User not registered, show registration form
                showRegistrationForm(user);
            }
        })
        .catch((error) => {
            console.error('Error checking user:', error);
        });
}

// Show registration form for new users
function showRegistrationForm(user) {
    const registrationModal = document.createElement('div');
    registrationModal.className = 'modal';
    registrationModal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h3>Welcome! Please register your name</h3>
            <input type="text" id="userNameInput" placeholder="Your Name" class="input-field">
            <button id="registerBtn" class="btn">Register</button>
        </div>
    `;
    document.body.appendChild(registrationModal);
    
    // Close button
    registrationModal.querySelector('.close').onclick = () => {
        document.body.removeChild(registrationModal);
        auth.signOut();
    };
    
    // Register button
    registrationModal.querySelector('#registerBtn').onclick = () => {
        const name = document.getElementById('userNameInput').value.trim();
        if (name) {
            db.collection('users').doc(user.uid).set({
                name: name,
                email: user.email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            })
            .then(() => {
                document.body.removeChild(registrationModal);
                alert('Registration successful!');
            })
            .catch((error) => {
                console.error('Registration error:', error);
                alert('Registration failed: ' + error.message);
            });
        } else {
            alert('Please enter your name');
        }
    };
}

// Admin Login
switchToAdmin.addEventListener('click', () => {
    adminLogin.style.display = 'block';
    googleLoginBtn.style.display = 'none';
    switchToAdmin.style.display = 'none';
});

backToUserLogin.addEventListener('click', () => {
    adminLogin.style.display = 'none';
    googleLoginBtn.style.display = 'block';
    switchToAdmin.style.display = 'block';
});

adminLoginBtn.addEventListener('click', () => {
    const email = adminEmail.value.trim();
    const otp = adminOTP.value.trim();
    
    if (email === ADMIN_EMAIL && otp === ADMIN_OTP) {
        // Create custom token for admin
        auth.signInAnonymously()
            .then(() => {
                // Set admin flag
                isAdmin = true;
                // Show admin dashboard button
                adminDashboardBtn.style.display = 'block';
                alert('Admin login successful!');
            })
            .catch((error) => {
                console.error('Admin login error:', error);
                alert('Login failed: ' + error.message);
            });
    } else {
        alert('Invalid admin credentials');
    }
});

// Check if user is admin
function checkAdminStatus(email) {
    if (email === ADMIN_EMAIL) {
        isAdmin = true;
        adminDashboardBtn.style.display = 'block';
    }
}

// Logout
logoutBtn.addEventListener('click', () => {
    auth.signOut()
        .then(() => {
            isAdmin = false;
            adminDashboardBtn.style.display = 'none';
        })
        .catch((error) => {
            console.error('Logout error:', error);
        });
});

// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all tabs
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
        
        // Add active class to clicked tab
        btn.classList.add('active');
        document.getElementById(btn.dataset.tab).classList.add('active');
    });
});
