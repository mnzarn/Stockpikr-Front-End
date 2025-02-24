import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD8xCGvYXb6_7QADJHbeaTQYeVybLWNZDM",
  authDomain: "stockpikr-8afff.firebaseapp.com",
  projectId: "stockpikr-8afff",
  storageBucket: "stockpikr-8afff.firebasestorage.app",
  messagingSenderId: "849793303924",
  appId: "1:849793303924:web:bc597f8a417d9a4496d821"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

export { app, auth };

