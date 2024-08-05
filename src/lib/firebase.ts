import { FirebaseApp, initializeApp } from 'firebase/app';
import { getAuth, Auth, connectAuthEmulator } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore, Firestore } from "firebase/firestore";
import { connectStorageEmulator, getStorage, FirebaseStorage } from "firebase/storage";
import { connectDatabaseEmulator, getDatabase, Database } from 'firebase/database';

let firebaseApp: FirebaseApp | undefined;
let auth: Auth | undefined;
let firestore: Firestore | undefined;
let storage: FirebaseStorage | undefined;
let database: Database | undefined;

const useEmulator = () => import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true';

export const initializeFirebase = () => {
  if (!firebaseApp) {
    try {
      firebaseApp = initializeApp({
        apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTHDOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECTID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGEBUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGINGSENDERID,
        appId: import.meta.env.VITE_FIREBASE_APPID,
        databaseURL: import.meta.env.VITE_FIREBASE_DATABASEURL,
      });
      console.log("Firebase initialized successfully");
    } catch (error) {
      console.error("Error initializing Firebase:", error);
    }
  }
};

export const useAuth = (): Auth => {
  if (!auth && firebaseApp) {
    auth = getAuth(firebaseApp);
    if (useEmulator()) {
      connectAuthEmulator(auth, 'http://localhost:9099');
    }
  }
  if (!auth) throw new Error("Auth not initialized");
  return auth;
};

export const useFirestore = (): Firestore => {
  if (!firestore && firebaseApp) {
    firestore = getFirestore(firebaseApp);
    if (useEmulator()) {
      connectFirestoreEmulator(firestore, 'localhost', 8080);
    }
  }
  if (!firestore) throw new Error("Firestore not initialized");
  return firestore;
};

export const useStorage = (): FirebaseStorage => {
  if (!storage && firebaseApp) {
    storage = getStorage(firebaseApp);
    if (useEmulator()) {
      connectStorageEmulator(storage, 'localhost', 9199);
    }
  }
  if (!storage) throw new Error("Storage not initialized");
  return storage;
};

export const useDatabase = (): Database => {
  if (!database && firebaseApp) {
    database = getDatabase(firebaseApp);
    if (useEmulator()) {
      connectDatabaseEmulator(database, 'localhost', 1010);
    } 
  }
  if (!database) throw new Error("Database not initialized");
  return database;
};

export const isFirebaseInitialized = () => !!firebaseApp;