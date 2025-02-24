import GoogleIcon from '@mui/icons-material/Google';
import { Box, Button, Card, Stack } from '@mui/material';
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useEffect, useState } from 'react';
import LogoImage from '../assets/images/logo-title-light-mode.png';
import { auth } from '../services/FirebaseConfig';
export default function SignIn() {
  const [errorMessage, setErrorMessage] = useState('');

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider); 
      window.location.href = '/dashboard';
    } catch (error) {
      setErrorMessage((error as Error).message);
    }
  };

  // If already signed in, redirect to dashboard
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        window.location.href = '/#/dashboard';
      }
    });

    return () => unsubscribe(); 
  }, []);

  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      sx={{
        backgroundColor: (t) => (t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900]),
        minHeight: '100vh'
      }}
    >
      <Card
        sx={{
          p: 5,
          width: 1,
          maxWidth: 420
        }}
      >
        <Box
          component="img"
          sx={{
            height: '100px'
          }}
          alt="StockPikr"
          src={LogoImage}
        />
        {errorMessage && <p>{errorMessage}</p>}
        <Button
          fullWidth
          size="large"
          color="inherit"
          variant="outlined"
          onClick={handleGoogleSignIn}
          //href="https://agreeable-ground-08e4a8b1e.4.azurestaticapps.net/auth/google/callback"
          startIcon={<GoogleIcon />}
        >
          Sign In with Google
        </Button>
      </Card>
    </Stack>
  );
}
