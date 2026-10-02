import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { connectAuthEmulator, getAuth, type Auth } from "firebase/auth";
import {
  connectFirestoreEmulator,
  getFirestore,
  type Firestore,
} from "firebase/firestore";
import {
  connectStorageEmulator,
  getStorage,
  type FirebaseStorage,
} from "firebase/storage";

import { emulatorConfig, firebaseConfig } from "./config";

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;
let storageInstance: FirebaseStorage | null = null;

const getFirebaseApp = () => {
  app ??= getApps().length ? getApp() : initializeApp(firebaseConfig);
  return app;
};

export const getFirebaseAuth = () => {
  if (!authInstance) {
    authInstance = getAuth(getFirebaseApp());
    if (emulatorConfig.enabled) {
      const { host, authPort } = emulatorConfig;
      connectAuthEmulator(authInstance, `http://${host}:${authPort}`, {
        disableWarnings: true,
      });
    }
  }
  return authInstance;
};

export const getFirebaseDb = () => {
  if (!dbInstance) {
    dbInstance = getFirestore(getFirebaseApp());
    if (emulatorConfig.enabled) {
      const { host, firestorePort } = emulatorConfig;
      connectFirestoreEmulator(dbInstance, host, firestorePort);
    }
  }
  return dbInstance;
};

export const getFirebaseStorage = () => {
  if (!storageInstance) {
    storageInstance = getStorage(getFirebaseApp());
    if (emulatorConfig.enabled) {
      const { host, storagePort } = emulatorConfig;
      connectStorageEmulator(storageInstance, host, storagePort);
    }
  }
  return storageInstance;
};
