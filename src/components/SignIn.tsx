import GoogleIcon from '@mui/icons-material/Google';
import { Box, Button, Card, Stack } from '@mui/material';
import LogoImage from '../assets/images/logo-title-light-mode.png';

export default function SignIn() {
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
        <Button
          fullWidth
          size="large"
          color="inherit"
          variant="outlined"
          href="https://stockpikr2.azurewebsites.net/login/federated/google"
          startIcon={<GoogleIcon />}
        />
          Sign In with Google
        </Button>
      </Card>
    </Stack>
  );
}
