import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore/lite";
/*
 * Please don't store in this file configuration information
 */

// import admin from "firebase-admin";
const firebaseConfig = {
  apiKey: "AIzaSyAT95vCOmsON3sqdH038SboAnmf1V-nQHc",
  authDomain: "almanon-trading-db.firebaseapp.com",
  projectId: "almanon-trading-db",
  storageBucket: "almanon-trading-db.appspot.com",
  messagingSenderId: "1026691589416",
  appId: "1:1026691589416:web:d8ed790796f7a8af5d1c1d",
  measurementId: "G-0508F939MQ",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default db;
