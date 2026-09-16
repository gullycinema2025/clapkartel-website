// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDjFhmKerTQYP5JamR3IHXz2ZjAyMYcsgo",
    authDomain: "gullycinema-9463c.firebaseapp.com",
    projectId: "gullycinema-9463c",
    storageBucket: "gullycinema-9463c.firebasestorage.app",
    messagingSenderId: "586333346683",
    appId: "1:586333346683:web:af9823ac2b6b90f92bbbde"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = getAuth(app);

// Set language for SMS templates
auth.languageCode = 'en';

// Robust check to auto-enable test mode in development or local network environments
const hostname = window.location.hostname;
const isDevEnvironment =
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('10.') ||
    hostname.startsWith('172.') ||
    window.location.search.includes('testMode=true') ||
    process.env.NODE_ENV === 'development';

if (isDevEnvironment) {
    // Bypass reCAPTCHA on local/development — configure test phone numbers in Firebase Console:
    // Firebase Console → Authentication → Settings → Phone numbers for testing
    // Add: +918106458788  →  OTP code: 123456  (or any 6-digit code you prefer)
    auth.settings.appVerificationDisabledForTesting = true;
    // console.log('🔧 Firebase Test Mode: ENABLED (development/local network detected)');
    // console.log('📱 Use test phone +918106458788 with OTP 123456 from Firebase Console');
} else {
    auth.settings.appVerificationDisabledForTesting = false;
    console.log('🔧 Firebase Test Mode: DISABLED - Using real reCAPTCHA');
}

// Initialize Firestore with experimentalForceLongPolling to prevent CORS stream blocks
const db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
});

export { app, auth, db };
