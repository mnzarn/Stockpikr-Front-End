import {
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography
} from '@mui/material';
import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../index.css';
import { UserApiService } from '../../services/UserApiService';

const pages = [
  { title: 'Dashboard', key: 'dashboard' },
  { title: 'Watchlist', key: 'watchlist' },
  { title: 'My Positions', key: 'positions' }
];
const settings = [
  { title: 'Settings', key: 'settings' },
  { title: 'Logout', key: 'logout' }
];

function NavigationAccount() {
  const navigate = useNavigate();
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
  const [userInfo, setUserInfo] = React.useState<{ [key: string]: string }>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    profilePic: ''
  });

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem('isLoggedIn');
      window.location.href = '/StockPikr_Frontend/#/signin';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  React.useEffect(() => {
    const queryUserInfo = async () => {
      const user = await UserApiService.fetchUserDetails();
      console.log(user);
      if (user) {
        setUserInfo({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          profilePic: user.profilePic
        });
      }
    };
    queryUserInfo();
    console.log("userInfo?.profilePic")
    console.log(userInfo?.profilePic)
  }, []);

  return (
    <>
      <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
        <IconButton
          size="large"
          aria-label="account of current user"
          aria-controls="menu-appbar"
          aria-haspopup="true"
          onClick={handleOpenNavMenu}
          color="inherit"
        ></IconButton>
        <Menu
          id="menu-appbar"
          anchorEl={anchorElNav}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left'
          }}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left'
          }}
          open={Boolean(anchorElNav)}
          onClose={handleCloseNavMenu}
          sx={{
            display: { xs: 'block', md: 'none' }
          }}
        >
          {pages.map((page) => (
            <MenuItem key={page.key} onClick={handleCloseNavMenu}>
              <Typography textAlign="center">{page.title}</Typography>
              <Link style={{ textAlign: 'center' }} to={page.key}>
                {page.title}
              </Link>
            </MenuItem>
          ))}
        </Menu>
      </Box>
      <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
        {pages.map((page) => (
          <Box key={page.key} sx={{ my: 2, marginLeft: 2, marginRight: 2 }}>
            <Link style={{ color: 'white', textDecoration: 'none' }} to={page.key}>
              {page.title}
            </Link>
          </Box>
        ))}
      </Box>
      <Box sx={{ flexGrow: 0 }}>
        <Tooltip title="Open settings">
          <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
            <Avatar
              src={userInfo?.profilePic}
              alt="User Avatar" />
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
          {settings.map((s) => (
            (s.key === 'logout') ? (
              <MenuItem key={s.key} onClick={handleLogout} style={{ textDecoration: 'none', fontFamily: 'Raleway', fontWeight: 500 }}>
                {s.title}
              </MenuItem>
            ) : (
              <MenuItem key={s.key} onClick={handleCloseUserMenu}>
                <Link style={{ textAlign: 'center', color: 'black', textDecoration: 'none', fontFamily: 'Raleway', fontWeight: 500 }} to={s.key}>
                  {s.title}
                </Link>
              </MenuItem>
            )
          ))}
        </Menu>
      </Box>
    </>
  );
}
export default NavigationAccount;
