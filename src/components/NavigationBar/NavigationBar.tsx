import { AppBar, Button, Container, Toolbar } from '@mui/material';
import { Link } from 'react-router-dom';
import LogoImage from '../../assets/images/logo-title-light-mode.png';
import NavigationLogin from './NavigationLogin';

import '../../index.css';

function NavigationHeader() {
  return (
    <AppBar position="static" sx={{ backgroundColor: 'var(--navbar-bg-color)', fontFamily: 'Raleway' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <img src={LogoImage} alt="Logo" style={{ height: '50px', marginRight: '10px', borderRadius: '10px' }} />
          </Link>
      {/* Top navigation buttons */}
        <Button
          variant="contained"
          color="primary"
          style={{
            backgroundColor: 'var(--navbar-bg-color)',
            textDecoration: 'none',
            borderRadius: '20px',
            padding: '10px 20px',
            fontWeight: 'bold',
            fontFamily: 'inherit',
            border: '2px white solid',
            margin: '5px',
          }}
          component={Link}
          to="../../dashboard/signedoutdashboard"
        >
          Dashboard
        </Button>
        <Button
          variant="contained"
          color="primary"
          style={{
            backgroundColor: 'var(--navbar-bg-color)',
            textDecoration: 'none',
            borderRadius: '20px',
            padding: '10px 20px',
            fontWeight: 'bold',
            fontFamily: 'inherit',
            border: '2px white solid',
            margin: '5px',
          }}
          component={Link}
          to="../..//watchlist"
        >
          Watchlist
        </Button>
        <Button
          variant="contained"
          color="primary"
          style={{
            backgroundColor: 'var(--navbar-bg-color)',
            textDecoration: 'none',
            borderRadius: '20px',
            padding: '10px 20px',
            fontWeight: 'bold',
            fontFamily: 'inherit',
            border: '2px white solid',
            margin: '5px',
          }}
          component={Link}
          to="../..//positions"
        >
          Positions
        </Button>
      <NavigationLogin />
      </Toolbar>
      </Container>
    </AppBar>
  );
}
export default NavigationHeader;
