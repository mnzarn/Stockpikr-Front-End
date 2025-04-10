import MenuIcon from '@mui/icons-material/Menu';
import {
  AppBar,
  Box,
  Button,
  Container,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Toolbar
} from '@mui/material';
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import LogoImage from '../../assets/images/logo-title-light-mode.png';
import '../../index.css';
import { auth } from "../../services/FirebaseConfig";
import SearchBar from '../SearchBar';
import NavigationAccount from './NavigationAccount';
import NavigationSignin from './NavigationSignin';

function NavigationHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

  // local storage
  /*useEffect(() => {
    const checkUserLoggedIn = async () => {
      const loggedIn = await UserApiService.isUserLoggedIn();
      setIsUserLoggedIn(loggedIn);
    };

    checkUserLoggedIn();

    // Listen for logout event to update UI
    const handleUserLogout = () => setIsUserLoggedIn(false);
    const handleUserLogin = () => setIsUserLoggedIn(true);

    window.addEventListener("userLogout", handleUserLogout);
    window.addEventListener("userLogin", handleUserLogin);

    return () => {
      window.removeEventListener("userLogout", handleUserLogout);
      window.removeEventListener("userLogin", handleUserLogin);
    };*/

    // firebase auth state
    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        console.log("🔍 Firebase Auth State Changed:", user);

        if (user) {
          console.log("✅ User is logged in:", user.email);
        } else {
          console.log("🚪 User is logged out");
        }

        setIsUserLoggedIn(!!user); // true if logged in, false if not
      });
    
      return () => unsubscribe();

  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navButtonStyle = {
    backgroundColor: 'var(--navbar-bg-color)',
    color: 'var(--text-color)',
    textDecoration: 'none',
    borderRadius: '20px',
    padding: '8px 16px',  // Reduced padding
    fontWeight: 'bold',
    fontFamily: 'var(--font-family)',
    border: `2px var(--text-color) solid`,
    margin: '0 3px',  // Reduced margin
    fontSize: '0.9rem', // Slightly smaller font
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: 'var(--settings-bg-color)',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)'
    },
    '&:active': {
      transform: 'translateY(1px)'
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Watchlist', path: '/watchlist' },
    { name: 'Positions', path: '/positions' }
  ];

  // Mobile drawer content
  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Box
        component={Link}
        to="/"
        sx={{
          display: 'flex',
          justifyContent: 'center',
          padding: '10px 0',
          textDecoration: 'none'
        }}
      >
        <img
          src={LogoImage}
          alt="Logo"
          style={{
            height: '40px',
            borderRadius: '10px'
          }}
        />
      </Box>
      
      {isUserLoggedIn && (
        <Box sx={{ px: 2, py: 1 }}>
          <SearchBar />
        </Box>
      )}
      
      <List>
        {navItems.map((item) => (
          <ListItem 
            key={item.name} 
            component={Link} 
            to={item.path}
            sx={{
              textAlign: 'center',
              padding: '10px',
              color: 'var(--primary-blue)',
              fontFamily: 'var(--font-family)',
              fontWeight: 'bold',
              textDecoration: 'none'
            }}
          >
            <ListItemText primary={item.name} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: 'var(--navbar-bg-color)',
          fontFamily: 'var(--font-family)',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          height: '64px' // Fixed height for sleek appearance
        }}
      >
        <Container maxWidth="xl" sx={{ height: '100%' }}>
          <Toolbar
            disableGutters
            sx={{
              display: 'flex',
              alignItems: 'center',
              padding: '0', // Remove padding
              minHeight: '64px !important', // Override Material-UI default
              height: '100%'
            }}
          >
            {/* Logo - visible on all screen sizes */}
            <Box
              component={Link}
              to="/"
              sx={{
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                mr: 2,
                '&:hover img': {
                  transform: 'scale(1.05)'
                }
              }}
            >
              <img
                src={LogoImage}
                alt="Logo"
                style={{
                  height: '40px', // Smaller logo
                  marginRight: '10px',
                  borderRadius: '10px',
                  transition: 'transform 0.3s ease'
                }}
              />
            </Box>

            {/* Mobile menu button - only visible on mobile */}
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ 
                display: { xs: 'flex', md: 'none' },
                marginLeft: 'auto'
              }}
            >
              <MenuIcon />
            </IconButton>

            {/* Desktop view - properly aligned sections */}
            <Box sx={{ 
              display: { xs: 'none', md: 'flex' },
              width: '100%',
              alignItems: 'center',
              height: '100%'
            }}>
              {/* Center navigation buttons */}
              <Box sx={{ 
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '5px', // Reduced gap
                flex: '0 0 auto',
                margin: '0 auto',
                height: '100%'
              }}>
                {navItems.map((item) => (
                  <Button 
                    key={item.name}
                    variant="contained" 
                    component={Link} 
                    to={item.path} 
                    sx={navButtonStyle}
                  >
                    {item.name}
                  </Button>
                ))}
              </Box>
              
              {/* Login/Account section with search bar aligned to the right */}
              <Box sx={{ 
                display: 'flex',
                alignItems: 'center',
                marginLeft: 'auto',
                flexShrink: 0,
                height: '100%'
              }}
              >
                {isUserLoggedIn ? <NavigationAccount /> : <NavigationSignin />}
                {/*<NavigationLogin />*/}
              </Box>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile navigation drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: 280,
            backgroundColor: 'var(--main-bg-color)'
          },
        }}
      >
        {drawer}
      </Drawer>
      
      <Toolbar sx={{ minHeight: '64px !important' }} /> {/* Adjust spacing below navbar */}
    </>
  );
}

export default NavigationHeader;
