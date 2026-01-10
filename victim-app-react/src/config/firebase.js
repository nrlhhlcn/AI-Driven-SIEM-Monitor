// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
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

// Initialize Firestore
const db = getFirestore(app);

// Initialize Authentication
const auth = getAuth(app);

export { app, db, auth };

