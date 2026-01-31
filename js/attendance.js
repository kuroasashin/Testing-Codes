// ============================================
// ATTENDANCE MODULE
// ============================================

// Constants
const OFFICE_LAT = 1.3500;
const OFFICE_LNG = 103.8991;
const RADIUS = 250; // meters

// DOM Elements
let presentBtn, rsoBtn, rsiBtn, lateBtn, leaveBtn;
let rsoModal, rsiModal, lateModal, leaveModal;
let rsoSymptom, rsoLocation, rsiSymptom, lateReason, lateTime, leaveType;
let submitRsoBtn, submitRsiBtn, submitLateBtn, submitLeaveBtn;

// ============================================
// INITIALIZE ATTENDANCE MODULE
// ============================================
function initializeAttendance() {
    console.log("✓ Initializing attendance module");
    
    // Get DOM elements
    presentBtn = document.getElementById('presentBtn');
    rsoBtn = document.getElementById('rsoBtn');
    rsiBtn = document.getElementById('rsiBtn');
    lateBtn = document.getElementById('lateBtn');
    leaveBtn = document.getElementById('leaveBtn');

    rsoModal = document.getElementById('rsoModal');
    rsiModal = document.getElementById('rsiModal');
    lateModal = document.getElementById('lateModal');
    leaveModal = document.getElementById('leaveModal');

    rsoSymptom = document.getElementById('rsoSymptom');
    rsoLocation = document.getElementById('rsoLocation');
    rsiSymptom = document.getElementById('rsiSymptom');
    lateReason = document.getElementById('lateReason');
    lateTime = document.getElementById('lateTime');
    leaveType = document.getElementById('leaveType');

    submitRsoBtn = document.getElementById('submitRsoBtn');
    submitRsiBtn = document.getElementById('submitRsiBtn');
    submitLateBtn = document.getElementById('submitLateBtn');
    submitLeaveBtn = document.getElementById('submitLeaveBtn');
    
    // Setup event listeners
    setupEventListeners();
}

// ============================================
// SETUP EVENT LISTENERS
// ============================================
function setupEventListeners() {
    // Modal close buttons
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.onclick = function() {
            this.parentElement.parentElement.style.display = 'none';
        }
    });
    
    // Outside click to close modals
    window.onclick = function(event) {
        if (event.target.className === 'modal') {
            event.target.style.display = 'none';
        }
    };
    
    // Present Button
    if (presentBtn) {
        presentBtn.addEventListener('click', checkLocationAndMarkPresent);
    }
    
    // RSO Button
    if (rsoBtn) {
        rsoBtn.addEventListener('click', () => {
            rsoModal.style.display = 'block';
            rsoSymptom.value = '';
            rsoLocation.value = '';
        });
    }
    
    // RSI Button
    if (rsiBtn) {
        rsiBtn.addEventListener('click', () => {
            rsiModal.style.display = 'block';
            rsiSymptom.value = '';
        });
    }
    
    // Late Button
    if (lateBtn) {
        lateBtn.addEventListener('click', () => {
            lateModal.style.display = 'block';
            lateReason.value = '';
            lateTime.value = '';
        });
    }
    
    // Leave Button
    if (leaveBtn) {
        leaveBtn.addEventListener('click', () => {
            leaveModal.style.display = 'block';
            leaveType.value = 'FullDay';
        });
    }
    
    // Submit buttons
    if (submitRsoBtn) {
        submitRsoBtn.addEventListener('click', submitRSO);
    }
    if (submitRsiBtn) {
        submitRsiBtn.addEventListener('click', submitRSI);
    }
    if (submitLateBtn) {
        submitLateBtn.addEventListener('click', submitLate);
    }
    if (submitLeaveBtn) {
        submitLeaveBtn.addEventListener('click', submitLeave);
    }
}

// ============================================
// ATTENDANCE SUBMISSION FUNCTIONS
// ============================================
function submitRSO() {
    const symptom = rsoSymptom.value.trim();
    const location = rsoLocation.value.trim();
    
    if (!symptom || !location) {
        alert('Please fill in all fields');
        return;
    }
    
    submitAttendance('RSO', { symptom, location });
    rsoModal.style.display = 'none';
}

function submitRSI() {
    const symptom = rsiSymptom.value.trim();
    
    if (!symptom) {
        alert('Please enter symptom');
        return;
    }
    
    submitAttendance('RSI', { symptom });
    rsiModal.style.display = 'none';
}

function submitLate() {
    const reason = lateReason.value.trim();
    const time = lateTime.value;
    
    if (!reason || !time) {
        alert('Please fill in all fields');
        return;
    }
    
    submitAttendance('Late', { reason, time });
    lateModal.style.display = 'none';
}

function submitLeave() {
    const type = leaveType.value;
    submitAttendance('Leave', { type });
    leaveModal.style.display = 'none';
}

// ============================================
// LOCATION CHECKING
// ============================================
function checkLocationAndMarkPresent() {
    if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser');
        return;
    }
    
    presentBtn.disabled = true;
    presentBtn.textContent = 'Checking location...';
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;
            
            const distance = calculateDistance(userLat, userLng, OFFICE_LAT, OFFICE_LNG);
            
            presentBtn.disabled = false;
            presentBtn.textContent = 'Present';
            
            if (distance <= RADIUS) {
                submitAttendance('Present', {});
            } else {
                alert(`❌ You are ${Math.round(distance)}m away from the office.\nYou must be within ${RADIUS}m to mark present.`);
            }
        },
        (error) => {
            presentBtn.disabled = false;
            presentBtn.textContent = 'Present';
            
            console.error('Geolocation error:', error);
            let errorMsg = 'Unable to get your location.\n';
            
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMsg += 'Please enable location services.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMsg += 'Location information is unavailable.';
                    break;
                case error.TIMEOUT:
                    errorMsg += 'Location request timed out.';
                    break;
                default:
                    errorMsg += 'An unknown error occurred.';
            }
            
            alert(errorMsg);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
}

// ============================================
// CALCULATE DISTANCE (Haversine formula)
// ============================================
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    return R * c;
}

// ============================================
// SUBMIT ATTENDANCE TO FIREBASE
// ============================================
function submitAttendance(type, data) {
    if (!currentUser) {
        alert('You must be logged in to submit attendance');
        return;
    }
    
    const attendanceData = {
        userId: currentUser.uid,
        userName: currentUser.displayName || 
                 (currentUser.email ? currentUser.email.split('@')[0] : 'Unknown'),
        userEmail: currentUser.email || '',
        type: type,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        ...data
    };
    
    db.collection('attendance').add(attendanceData)
        .then(() => {
            alert(`✅ ${type} attendance submitted successfully!`);
            console.log("✓ Attendance submitted:", type);
        })
        .catch((error) => {
            console.error('✗ Error submitting attendance:', error);
            alert('Failed to submit attendance: ' + error.message);
        });
}

console.log("✓ Attendance module loaded");
