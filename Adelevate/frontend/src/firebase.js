import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Create a Web App in Firebase console and paste its config here:
const firebaseConfig = {
    apiKey: "AIzaSyDbfkXILvCX97PRL3BEgKwOAZfS8uO34bs",
    authDomain: "pristine-lodge-459019-p4.firebaseapp.com",
    projectId: "pristine-lodge-459019-p4",
    storageBucket: "pristine-lodge-459019-p4.firebasestorage.app",
    messagingSenderId: "1087056959880",
    appId: "1:1087056959880:web:59f9c5430798e32c4e023d"
};


export const app = initializeApp(firebaseConfig);

// IMPORTANT: target your named database "adelevate"
export const db = getFirestore(app, "adelevate");
