import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAstgKz-B4y8JQ9itjps3X0Bi9Ejp_IDic",
  authDomain: "attendance-app-b925d.firebaseapp.com",
  projectId: "attendance-app-b925d",
  storageBucket: "attendance-app-b925d.firebasestorage.app",
  messagingSenderId: "426942187843",
  appId: "1:426942187843:web:9da18fa850795fff6b47f6",
  measurementId: "G-W51CT4P4MD"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const auth = firebase.auth();
const db = firebase.firestore();

// Admin credentials (store securely in production)
const ADMIN_EMAIL = "tan123kee@gmail.com";
const ADMIN_OTP = "123456"; // Change this in production!
