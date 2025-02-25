import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../services/FirebaseConfig";

export const getUserID = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        resolve(user.uid);
      } else {
        reject(new Error("No user signed in"));
      }
    });
  });
};
