import { Avatar, Box, IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import { signOut } from 'firebase/auth';
import * as React from 'react';
import { Link } from 'react-router-dom';
import '../../index.css';
import { auth } from '../../services/FirebaseConfig';
import { UserApiService } from '../../services/UserApiService';

// Interface matching the user data structure
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

const settings = [
  { title: 'Settings', key: 'settings' },
  { title: 'Logout', key: 'logout' }
];

function NavigationAccount() {
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
  const [userInfo, setUserInfo] = React.useState<IUserInfo | null>(null);

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = async () => {
    try {
      console.log('🚨 Logging out...');
      
      // Close menu immediately to improve responsiveness
      handleCloseUserMenu();

      // Clear session-related data
      localStorage.removeItem('isLoggedIn');
      sessionStorage.clear();

      // Sign out from Firebase too
      await signOut(auth);
      console.log('✅ Firebase signOut successful');

      // Notify other components (like NavigationHeader) of logout
      window.dispatchEvent(new Event('userLogout'));

      // Force a page reload to reset state and redirect to dashboard
      window.location.href = '/#/dashboard';
    } catch (error) {
      console.error('❌ Error logging out:', error);
    }
  };

  // Define queryUserInfo outside of useEffect for better separation of concerns
  const queryUserInfo = React.useCallback(async () => {
    try {
      const user = await UserApiService.fetchUserDetails();
      if (user) {
        setUserInfo(user); // Set the entire user object as it matches our interface
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  }, []);

  React.useEffect(() => {
    // Check if user is already logged in and fetch info immediately
    const currentUser = auth.currentUser;
    if (currentUser) {
      queryUserInfo();
    }

    // Set up listener for auth state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        queryUserInfo();
      }
    });

    return () => unsubscribe();
  }, [queryUserInfo]);

  return (
    <Box sx={{ flexGrow: 0 }}>
      <Tooltip title="Open settings">
        <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
          <Avatar src={userInfo?.profilePic} alt="User Avatar" />
        </IconButton>
      </Tooltip>
      <Menu
        sx={{ mt: '45px' }}
        id="menu-appbar"
        anchorEl={anchorElUser}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        open={Boolean(anchorElUser)}
        onClose={handleCloseUserMenu}
      >
        {settings.map((s) =>
          s.key === 'logout' ? (
            <MenuItem
              key={s.key}
              onClick={handleLogout}
              style={{ textDecoration: 'none', fontFamily: 'Raleway', fontWeight: 500 }}
            >
              {s.title}
            </MenuItem>
          ) : (
            <Link
              key={s.key}
              style={{
                textAlign: 'center',
                color: 'black',
                textDecoration: 'none',
                display: 'block',
                width: '100%'
              }}
              to={s.key}
              onClick={handleCloseUserMenu}
            >
              <MenuItem>
                <span style={{ fontFamily: 'Raleway', fontWeight: 500 }}>{s.title}</span>
              </MenuItem>
            </Link>
          )
        )}
      </Menu>
    </Box>
  );
}

export default NavigationAccount;
