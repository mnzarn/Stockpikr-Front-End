import { signOut } from "firebase/auth";
import { useAsyncError } from '../components/GlobalErrorBoundary';
import { IUserInfo } from '../interfaces/IUser';
import { auth } from '../services/FirebaseConfig';
import { BaseApiService } from './ApiService';

export class UserApiService extends BaseApiService {
  protected static endpoint = `${this.baseEndpoint}/users`;
  //----------------------------------------------------------------//
  //                           Public
  //----------------------------------------------------------------//

  public static async fetchUserDetails(): Promise<IUserInfo | null> {
    try {
      const response = await super.fetchData<IUserInfo>(`${this.endpoint}/temp`);
      return response;
    } catch (error) {
      console.log('error fetching user details: ', error);
      return null;
    }
  }

  // public static async isUserLoggedIn(): Promise<boolean> {
  //   try {
  //     const response = await super.fetchData<boolean>(`${this.baseEndpoint}/login/active`);
  //     console.log(response);
  //     return response == true;
  //   } catch (error) {
  //     console.log("error fetching user's logged in state: ", error);
  //     return false;
  //   }
  // }
  
  public static async isUserLoggedIn(): Promise<boolean> {
    return new Promise((resolve) => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        resolve(user !== null); 
        unsubscribe();
      });
    });
  }

  // public static async logout(): Promise<void> {
  //   const throwError = useAsyncError();
  //   try {
  //     await fetch(`${this.endpoint}/logout`, {
  //       method: 'GET',
  //       credentials: 'include'
  //     });
  //   } catch (error) {
  //     throwError(error);
  //   }
  // }
  public static async logout(): Promise<void> {
    const throwError = useAsyncError();
    try {
      await signOut(auth);  
    } catch (error) {
      throwError(error);
    }
  }   
}
