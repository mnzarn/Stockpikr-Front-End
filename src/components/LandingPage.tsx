import { Box, Button, Container, List, ListItem, ListItemText, Typography } from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';
import LogoImage from '../assets/images/logo-title-light-mode.png';

const LandingPage: React.FC = () => {
  return (
    <Container
      style={{
        margin: '50px auto',
        padding: '50px',
        display: 'flex',
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '1200px'
      }}
    >
      <Container
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px',
          flex: 1
        }}
      >
        <Box
          component="img"
          sx={{
            height: '150px',
            marginRight: '10px'
          }}
          alt="StockPikr"
          src={LogoImage}
        />
        <Typography
          variant="h3"
          component="h3"
          style={{
            color: '#182b39',
            margin: '5px',
            fontFamily: "'Raleway', sans-serif",
            fontWeight: 300
          }}
        >
          Create Your Watchlists
        </Typography>
        <div style={{ maxWidth: '500px', margin: 'auto', textAlign: 'center' }}>
          <Typography
            variant="body1"
            color="textPrimary"
            style={{
              color: '#182b39',
              margin: '5px',
              fontFamily: "'Raleway', sans-serif",
              fontWeight: 500
            }}
          >
            Create a free StockPikr account to build your Watchlist and explore amazing features:
          </Typography>
          <List
            style={{
              maxWidth: '500px',
              margin: 'auto',
              textAlign: 'center',
              fontFamily: "'Raleway', sans-serif",
              fontWeight: 500
            }}
          >
            <ListItem style={{ textAlign: 'center' }}>
              <ListItemText style={{ textAlign: 'center' }}>
                <Typography
                  variant="body1"
                  color="textPrimary"
                  style={{ fontFamily: "'Raleway', sans-serif", fontWeight: 500 }}
                >
                  ✨ Provides easy filtering and viewing of watchlists
                </Typography>
              </ListItemText>
            </ListItem>
            <ListItem style={{ textAlign: 'center' }}>
              <ListItemText style={{ textAlign: 'center' }}>
                <Typography
                  variant="body1"
                  color="textPrimary"
                  style={{ fontFamily: "'Raleway', sans-serif", fontWeight: 500 }}
                >
                  📈 Track stock price movement on one screen
                </Typography>
              </ListItemText>
            </ListItem>
            <ListItem style={{ textAlign: 'center' }}>
              <ListItemText style={{ textAlign: 'center' }}>
                <Typography
                  variant="body1"
                  color="textPrimary"
                  style={{ fontFamily: "'Raleway', sans-serif", fontWeight: 500 }}
                >
                  📊 Comprehensive analysis on individual stocks
                </Typography>
              </ListItemText>
            </ListItem>
            <ListItem style={{ textAlign: 'center' }}>
              <ListItemText style={{ textAlign: 'center' }}>
                <Typography
                  variant="body1"
                  color="textPrimary"
                  style={{ fontFamily: "'Raleway', sans-serif", fontWeight: 500 }}
                >
                  📝 Build a plan before investing your money
                </Typography>
              </ListItemText>
            </ListItem>
          </List>
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
              border: '2px black solid'
            }}
            component={Link}
            to="/signin"
          >
            Login to Access your personalized Watchlist, Dashboard and More Now!
          </Button>
        </div>

      </Container>
      <div style={{ margin: '50', padding: '50', flex: 1 }}>
        <img
          src={require('../assets/images/image-landing-page.jpg')}
          alt="StockPikr Image"
          style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }} />
      </div>
    </Container>
  );
};

export default LandingPage;
