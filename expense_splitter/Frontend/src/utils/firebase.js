// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "group-expense-splitter-3d14b.firebaseapp.com",
  projectId: "group-expense-splitter-3d14b",
  storageBucket: "group-expense-splitter-3d14b.firebasestorage.app",
  messagingSenderId: "166448637767",
  appId: "1:166448637767:web:f7a04356d570b4f24c4e62"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app)

const provider = new GoogleAuthProvider()

export {auth, provider} 