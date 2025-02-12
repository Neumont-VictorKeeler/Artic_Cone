import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDJaFu_OLN1C_STGYDfSLLAn3P3Hd9t92o",
    authDomain: "articcone-af9e1.firebaseapp.com",
    databaseURL: "https://articcone-af9e1-default-rtdb.firebaseio.com/",
    projectId: "articcone-af9e1",
    storageBucket: "articcone-af9e1.appspot.com",
    messagingSenderId: "544992861666",
    appId: "1:544992861666:web:c9b54174aa4acffd35edbb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const firestore = getFirestore(app);
