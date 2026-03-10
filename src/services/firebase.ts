import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAme6CI2tDRgjcFhVf21w9neEKycfaCPxM",
  authDomain: "nini-learning-system.firebaseapp.com",
  projectId: "nini-learning-system",
  storageBucket: "nini-learning-system.firebasestorage.app",
  messagingSenderId: "688657476620",
  appId: "1:688657476620:web:48a91c03d198731aa8d229",
  measurementId: "G-8N9B1EGT5B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
