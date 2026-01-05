// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBFB9cXsaKojJDwLhYffUgqMuoA_19TNlc",
    authDomain: "doclicitante.firebaseapp.com",
    projectId: "doclicitante",
    storageBucket: "doclicitante.firebasestorage.app",
    messagingSenderId: "816161468548",
    appId: "1:816161468548:web:8af29ae521cbada89d12d1",
    measurementId: "G-YLQCNZLFZX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);