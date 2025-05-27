export interface IUserInfo {
  authID: string;
  userID: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  profilePic?: string;
  notifications: boolean;
}
