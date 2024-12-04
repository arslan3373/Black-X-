import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth'; 

const firebaseConfig = {
  apiKey: "AIzaSyCfDFhe4ktr3a4bsmD6lLzQTLGDmyV2leI",
  authDomain: "startxblack-30b9c.firebaseapp.com",
  projectId: "startxblack-30b9c",
  storageBucket: "startxblack-30b9c.appspot.com",
  messagingSenderId: "7399434662",
  appId: "1:7399434662:web:10fc1c694c6652464fc767"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export { app };
  // Initialize Firebase Authentication
export const auth = getAuth(app);
