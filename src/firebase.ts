import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where,
  deleteDoc,
  onSnapshot
} from "firebase/firestore";
import config from "../firebase-applet-config.json";

// Initialize Firebase with the workspace-provided config
const app = initializeApp({
  apiKey: config.apiKey,
  authDomain: config.authDomain,
  projectId: config.projectId,
  storageBucket: config.storageBucket,
  messagingSenderId: config.messagingSenderId,
  appId: config.appId
});

// Initialize Firestore
const db = getFirestore(app, config.firestoreDatabaseId || undefined);

export { db, collection, doc, setDoc, getDoc, getDocs, query, where, deleteDoc, onSnapshot };
export default db;
