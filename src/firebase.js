import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCoV5LkFJBTGYVkYiqEfGObG8ssFCHtagY",
  authDomain: "mod-pos.firebaseapp.com",
  databaseURL: "https://mod-pos-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "mod-pos",
  storageBucket: "mod-pos.firebasestorage.app",
  messagingSenderId: "305044305596",
  appId: "1:305044305596:web:51276b693010c784f542b9"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();