// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAbwlZJGAE_kUKlLPLpbxxbPx3up-Jb5Ko",
  authDomain: "portfoy-de9a0.firebaseapp.com",
  projectId: "portfoy-de9a0",
  storageBucket: "portfoy-de9a0.firebasestorage.app",
  messagingSenderId: "1087189523461",
  appId: "1:1087189523461:web:6858c32ea203424b70106c",
  measurementId: "G-FKCBMTRG7N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics (sadece browser'da çalışır)
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

// Initialize Firestore
const db = getFirestore(app);

// Initialize Auth
const auth = getAuth(app);

export { app, analytics, db, auth };

