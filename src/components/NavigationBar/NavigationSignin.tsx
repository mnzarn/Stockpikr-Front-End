import {
    Box,
    Button,
  } from '@mui/material';
  import * as React from 'react';
  import { Link } from 'react-router-dom';
  import '../../index.css';

  function NavigationSignin() {

    const handleLogin = () => {
      localStorage.setItem('isLoggedIn', 'true');
    }

    return (
        <>
          <Box sx={{ flex: 1, display: { xs: 'none', md: 'flex' }, width: "100%", justifyContent: "flex-end"}}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleLogin}
              style={{
                backgroundColor: 'var(--navbar-bg-color)',
                textDecoration: 'none',
                borderRadius: '20px',
                padding: '10px 20px',
                fontWeight: 'bold',
                fontFamily: 'inherit',
                border: '2px white solid',
              }}
              component={Link}
              to="/signin"
            >
              Sign In
            </Button>
          </Box>
        </>
    );
  }
  export default NavigationSignin;
  
