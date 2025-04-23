// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyA0ZNy7HDe2X1SWCkZnVRh6EUHSmEdItzY",
  authDomain: "matdb-84bc3.firebaseapp.com",
  projectId: "matdb-84bc3",
  storageBucket: "matdb-84bc3.firebasestorage.app", // 원래 값 유지
  messagingSenderId: "266599280018",
  appId: "1:266599280018:web:9a189c03940d62d354654b",
  measurementId: "G-ZC0SVYWPHS",
  // 필요한 databaseURL 유지
  databaseURL: "https://matdb-84bc3-default-rtdb.asia-southeast1.firebasedatabase.app"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const database = getDatabase(app);

export { app, auth, db, database, analytics };