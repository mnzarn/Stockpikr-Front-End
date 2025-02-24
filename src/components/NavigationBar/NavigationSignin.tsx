import { Box, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import '../../index.css';

function NavigationSignin() {
  const handleLogin = () => {
    localStorage.setItem('isLoggedIn', 'true');
  };

  const signInButtonStyle = {
    backgroundColor: 'var(--navbar-bg-color)',
    color: 'var(--text-color)',
    textDecoration: 'none',
    borderRadius: '20px',
    padding: '10px 20px',
    fontWeight: 'bold',
    fontFamily: 'var(--font-family)',
    border: `2px var(--text-color) solid`,
    margin: '5px',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
    '&:before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: '-100%',
      width: '100%',
      height: '100%',
      background: 'linear-gradient(120deg, transparent, rgba(255,255,255,0.2), transparent)',
      transition: 'all 0.5s ease'
    },
    '&:hover': {
      backgroundColor: 'var(--settings-bg-color)',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
      '&:before': {
        left: '100%'
      }
    },
    '&:active': {
      transform: 'translateY(1px)'
    }
  };

  return (
    <Box
      sx={{
        flex: 1,
        display: { xs: 'none', md: 'flex' },
        width: '100%',
        justifyContent: 'flex-end'
      }}
    >
      <Button variant="contained" onClick={handleLogin} component={Link} to="/signin" sx={signInButtonStyle}>
        Sign In
      </Button>
    </Box>
  );
}

export default NavigationSignin;
