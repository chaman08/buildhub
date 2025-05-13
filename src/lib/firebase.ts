
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  sendEmailVerification,
  PhoneAuthProvider,
  signInWithPhoneNumber,
  RecaptchaVerifier
} from "firebase/auth";

// Your web app's Firebase configuration
// Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyATTpaFdWlxF7iNGzF5S5KBDDavKw1vOOE",
  authDomain: "buildhub-9fe45.firebaseapp.com",
  projectId: "buildhub-9fe45",
  storageBucket: "buildhub-9fe45.firebasestorage.app",
  messagingSenderId: "419992680674",
  appId: "1:419992680674:web:2058290ea706a398db46bb",
  measurementId: "G-RX6P3ZXZ1Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);

// Setup RecaptchaVerifier with invisible mode
export const setupRecaptcha = (containerId: string) => {
  return new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {
      // reCAPTCHA solved, allow signInWithPhoneNumber.
    }
  });
};

export default app;
