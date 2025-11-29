// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyD21R1yQ2yf2xFRsP63E7odCAH_0o14exw",
  authDomain: "badminton-scheduler-site.firebaseapp.com",
  databaseURL: "https://badminton-scheduler-site-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "badminton-scheduler-site",
  storageBucket: "badminton-scheduler-site.appspot.com",
  messagingSenderId: "520644414832",
  appId: "1:520644414832:web:cd836fb6454ade5d3093b5"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { app, db };
