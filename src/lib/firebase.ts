
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyATTpaFdWlxF7iNGzF5S5KBDDavKw1vOOE",
  authDomain: "buildhub-9fe45.firebaseapp.com",
  projectId: "buildhub-9fe45",
  storageBucket: "buildhub-9fe45.firebasestorage.app",
  messagingSenderId: "419992680674",
  appId: "1:419992680674:web:f238e7c0d10bc6ffdb46bb",
  measurementId: "G-QFREXDJ4ZM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
