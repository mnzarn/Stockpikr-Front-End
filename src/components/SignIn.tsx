import GoogleIcon from '@mui/icons-material/Google';
import { Box, Button, Card, Stack } from '@mui/material';
import LogoImage from '../assets/images/logo-title-light-mode.png';
import '../index.css';

export default function SignIn() {
  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      sx={{
        background: 'linear-gradient(135deg, var(--background-light) 0%, #E5EFF8 100%)',
        minHeight: '100vh',
        padding: '20px',
        fontFamily: 'var(--font-family)'
      }}
    >
      <Card
        sx={{
          p: { xs: 4, md: 5 },
          width: 1,
          maxWidth: 420,
          borderRadius: '16px',
          boxShadow: '0 8px 24px var(--border-color)',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.3)'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4
          }}
        >
          <Box
            component="img"
            sx={{
              height: '100px',
              animation: 'float 3s ease-in-out infinite',
              '@keyframes float': {
                '0%, 100%': { transform: 'translateY(0)' },
                '50%': { transform: 'translateY(-10px)' }
              }
            }}
            alt="StockPikr"
            src={LogoImage}
          />

          <Button
            fullWidth
            size="large"
            variant="contained"
            href="http://40.78.98.127:5000/auth/google"
            startIcon={<GoogleIcon />}
            sx={{
              backgroundColor: 'var(--primary-blue)',
              color: 'var(--text-color)',
              borderRadius: '12px',
              padding: '12px 0',
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'none',
              fontFamily: 'var(--font-family)',
              border: '2px solid var(--primary-blue)',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'var(--secondary-blue)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 12px var(--border-color)'
              }
            }}
          >
            Sign In with Google
          </Button>
        </Box>
      </Card>
    </Stack>
  );
}
