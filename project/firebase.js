import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyAMyuZNp5BJzFLb4KLEdojCJu5pTypgzu0",
    authDomain: "live-quiz-3821c.firebaseapp.com",
    projectId: "live-quiz-3821c",
    storageBucket: "live-quiz-3821c.appspot.com",
    messagingSenderId: "887366464770",
    appId: "1:887366464770:web:14ace4d2878220afd5be1b",
    measurementId: "G-PWC5CVKJZ7"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, collection, addDoc, getDocs, doc, getDoc, auth, signInWithEmailAndPassword, signOut };