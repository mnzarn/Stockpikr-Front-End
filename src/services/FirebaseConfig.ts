import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: window.ENV?.REACT_APP_FIREBASE_API_KEY,
  authDomain: window.ENV?.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: window.ENV?.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: window.ENV?.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: window.ENV?.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: window.ENV?.REACT_APP_FIREBASE_APP_ID
};

console.log("Firebase API Key:", firebaseConfig.apiKey);

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

export { app, auth };

