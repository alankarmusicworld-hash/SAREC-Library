// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBTenogKVV_mTceFfT3hdiTvpBoCwntVq4",
  authDomain: "studio-352283987-adca9.firebaseapp.com",
  projectId: "studio-352283987-adca9",
  storageBucket: "studio-352283987-adca9.appspot.com",
  messagingSenderId: "322706202296",
  appId: "1:322706202296:web:db7fe086ea4d2e6dd7de4d",
  measurementId: "G-Y13P5E41N6"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
