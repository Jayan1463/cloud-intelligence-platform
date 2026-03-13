import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBt4dmjsZifOgkI6e-uXzKa6w88Yd5kQmE",
  authDomain: "cloud-intelligence-platform.firebaseapp.com",
  projectId: "cloud-intelligence-platform",
  storageBucket: "cloud-intelligence-platform.firebasestorage.app",
  messagingSenderId: "125321296659",
  appId: "1:125321296659:web:ecfdba1980d9911f3ff8e6"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export const auth = getAuth(app);