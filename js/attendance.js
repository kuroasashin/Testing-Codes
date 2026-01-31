// DOM Elements
const presentBtn = document.getElementById('presentBtn');
const rsoBtn = document.getElementById('rsoBtn');
const rsiBtn = document.getElementById('rsiBtn');
const lateBtn = document.getElementById('lateBtn');
const leaveBtn = document.getElementById('leaveBtn');

const rsoModal = document.getElementById('rsoModal');
const rsiModal = document.getElementById('rsiModal');
const lateModal = document.getElementById('lateModal');
const leaveModal = document.getElementById('leaveModal');

const rsoSymptom = document.getElementById('rsoSymptom');
const rsoLocation = document.getElementById('rsoLocation');
const rsiSymptom = document.getElementById('rsiSymptom');
const lateReason = document.getElementById('lateReason');
const lateTime = document.getElementById('lateTime');
const leaveType = document.getElementById('leaveType');

const submitRsoBtn = document.getElementById('submitRsoBtn');
const submitRsiBtn = document.getElementById('submitRsiBtn');
const submitLateBtn = document.getElementById('submitLateBtn');
const submitLeaveBtn = document.getElementById('submitLeaveBtn');

// Constants
const OFFICE_LAT = 1.3500;
const OFFICE_LNG = 103.8991;
const RADIUS = 250; // meters

// Modal close buttons
document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.onclick = function() {
        this.parentElement.parentElement.style.display = 'none';
    }
});

// Present Button
presentBtn.addEventListener('click', () => {
    checkLocationAndMarkPresent();
});

// RSO Button
rsoBtn.addEventListener('click', () => {
    rsoModal.style.display = 'block';
    rsoSymptom.value = '';
    rsoLocation.value = '';
});

// RSI Button
rsiBtn.addEventListener('click', () => {
    rsiModal.style.display = 'block';
    rsiSymptom.value = '';
});

// Late Button
lateBtn.addEventListener('click', () => {
    lateModal.style.display = 'block';
    lateReason.value = '';
    lateTime.value = '';
});

// Leave Button
leaveBtn.addEventListener('click', () => {
    leaveModal.style.display = 'block';
    leaveType.value = 'FullDay';
});

// Submit RSO
submitRsoBtn.addEventListener('click', () => {
    const symptom = rsoSymptom.value.trim();
    const location = rsoLocation.value.trim();
    
    if (!symptom || !location) {
        alert('Please fill in all fields');
        return;
    }
    
    submitAttendance('RSO', { symptom, location });
    rsoModal.style.display = 'none';
});

// Submit RSI
submitRsiBtn.addEventListener('click', () => {
    const symptom = rsiSymptom.value.trim();
    
    if (!symptom) {
        alert('Please enter symptom');
        return;
    }
    
    submitAttendance('RSI', { symptom });
    rsiModal.style.display = 'none';
});

// Submit Late
submitLateBtn.addEventListener('click', () => {
    const reason = lateReason.value.trim();
    const time = lateTime.value;
    
    if (!reason || !time) {
        alert('Please fill in all fields');
        return;
    }
    
    submitAttendance('Late', { reason, time });
    lateModal.style.display = 'none';
});

// Submit Leave
submitLeaveBtn.addEventListener('click', () => {
    const type = leaveType.value;
    submitAttendance('Leave', { type });
    leaveModal.style.display = 'none';
});

// Check location and mark present
function checkLocationAndMarkPresent() {
    if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser');
        return;
    }
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;
            
            const distance = calculateDistance(userLat, userLng, OFFICE_LAT, OFFICE_LNG);
            
            if (distance <= RADIUS) {
                submitAttendance('Present', {});
            } else {
                alert(`You are ${Math.round(distance)}m away from the office. You must be within ${RADIUS}m to mark present.`);
            }
        },
        (error) => {
            console.error('Geolocation error:', error);
            alert('Unable to get your location. Please enable location services.');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
}

// Calculate distance between two coordinates (Haversine formula)
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

// Submit attendance to Firebase
function submitAttendance(type, data) {
    if (!currentUser) {
        alert('You must be logged in to submit attendance');
        return;
    }
    
    const attendanceData = {
        userId: currentUser.uid,
        userName: currentUser.displayName || currentUser.email,
        type: type,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        ...data
    };
    
    db.collection('attendance').add(attendanceData)
        .then(() => {
            alert(`${type} attendance submitted successfully!`);
        })
        .catch((error) => {
            console.error('Error submitting attendance:', error);
            alert('Failed to submit attendance: ' + error.message);
        });
}
