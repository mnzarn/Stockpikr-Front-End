import LockIcon from '@mui/icons-material/Lock';
import { Box, Button, Paper } from '@mui/material';
import { Link } from 'react-router-dom';

const MyPositions = () => {
  const handleLogin = () => {
    localStorage.setItem('isLoggedIn', 'true');
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px" padding={3}>
      <Paper
        elevation={3}
        sx={{
          width: '100%',
          maxWidth: '400px',
          padding: 4,
          borderRadius: '10px',
          textAlign: 'center'
        }}
      >
        <LockIcon
          sx={{
            fontSize: 48,
            color: 'text.secondary',
            marginBottom: 2
          }}
        />
        <h2
          style={{
            fontSize: '1.5rem',
            fontWeight: 600,
            marginBottom: '1rem'
          }}
        >
          Sign In Required
        </h2>
        <p
          style={{
            color: 'text.secondary',
            marginBottom: '2rem'
          }}
        >
          Please sign in to access your positions page and view your portfolio details.
        </p>
        <Button
          variant="contained"
          color="primary"
          onClick={handleLogin}
          component={Link}
          to="/signin"
          style={{
            backgroundColor: 'var(--navbar-bg-color)',
            textDecoration: 'none',
            borderRadius: '20px',
            padding: '10px 20px',
            fontWeight: 'bold',
            fontFamily: 'inherit',
            border: '2px white solid'
          }}
        >
          Sign In
        </Button>
      </Paper>
    </Box>
  );
};

export default MyPositions;
