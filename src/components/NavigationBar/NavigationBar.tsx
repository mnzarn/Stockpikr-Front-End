import { AppBar, Box, Button, Container, Menu, MenuItem, Toolbar } from '@mui/material';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import LogoImage from '../../assets/images/logo-title-light-mode.png';
import '../../index.css';
import NavigationLogin from './NavigationLogin';

function NavigationHeader() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleSettingsHover = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuLeave = () => {
    setAnchorEl(null);
  };

  const navButtonStyle = {
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
    '&:hover': {
      backgroundColor: 'var(--settings-bg-color)',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)'
    },
    '&:active': {
      transform: 'translateY(1px)'
    }
  };

  const menuItems = [
    { name: 'Account', path: '../../settings', section: 'Account' },
    { name: 'Notifications', path: '../../settings', section: 'Notifications' },
    { name: 'Security', path: '../../settings', section: 'Security' },
    { name: 'Help', path: '../../settings', section: 'Help' }
  ];

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: 'var(--navbar-bg-color)',
          fontFamily: 'var(--font-family)',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}
      >
        <Container maxWidth="xl">
          <Toolbar
            disableGutters
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.5rem 0'
            }}
          >
            <Box
              component={Link}
              to="/"
              sx={{
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                '&:hover img': {
                  transform: 'scale(1.05)'
                }
              }}
            >
              <img
                src={LogoImage}
                alt="Logo"
                style={{
                  height: '50px',
                  marginRight: '10px',
                  borderRadius: '10px',
                  transition: 'transform 0.3s ease'
                }}
              />
            </Box>

            <Box
              sx={{
                display: 'flex',
                gap: '10px',
                flex: 1,
                justifyContent: 'center'
              }}
            >
              <Button variant="contained" component={Link} to="../..//dashboard/" sx={navButtonStyle}>
                Dashboard
              </Button>
              <Button variant="contained" component={Link} to="../..//watchlist" sx={navButtonStyle}>
                Watchlist
              </Button>
              <Button variant="contained" component={Link} to="../..//positions" sx={navButtonStyle}>
                Positions
              </Button>
            </Box>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <Button
                variant="contained"
                component={Link}
                to="/settings"
                onMouseOver={handleSettingsHover}
                sx={navButtonStyle}
              >
                ⚙️ Settings
              </Button>
              <Menu
                id="settings-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuLeave}
                MenuListProps={{
                  onMouseLeave: handleMenuLeave
                }}
                sx={{
                  pointerEvents: 'auto',
                  '& .MuiPaper-root': {
                    backgroundColor: 'var(--navbar-bg-color)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    marginTop: '8px'
                  }
                }}
                PaperProps={{
                  onMouseLeave: handleMenuLeave
                }}
              >
                {menuItems.map((item) => (
                  <MenuItem
                    key={item.name}
                    component={Link}
                    to={item.path}
                    state={{ section: item.section }}
                    onClick={handleMenuLeave}
                    sx={{
                      color: 'var(--text-color)',
                      fontFamily: 'var(--font-family)',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: 'var(--settings-bg-color)'
                      }
                    }}
                  >
                    {item.name}
                  </MenuItem>
                ))}
              </Menu>
              <NavigationLogin />
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      <Toolbar />
    </>
  );
}

export default NavigationHeader;
