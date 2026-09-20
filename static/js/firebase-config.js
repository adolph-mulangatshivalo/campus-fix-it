import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyBCEXePtVBq8Z7pjIEFxcEIAlh0XQvVm0Q",
    authDomain: "campus-fix-it-web-app.firebaseapp.com",
    projectId: "campus-fix-it-web-app",
    storageBucket: "campus-fix-it-web-app.firebasestorage.app",
    messagingSenderId: "401729966285",
    appId: "1:401729966285:web:b10210ba1af62d7d431984",
    measurementId: "G-72WP14X85G"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
