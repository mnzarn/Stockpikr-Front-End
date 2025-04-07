import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import * as React from 'react';
import { useLocation } from 'react-router-dom';
import '../../index';
import { Account } from './Drawer/Account';
import { Appearance } from './Drawer/Appearance';
import { Help } from './Drawer/Help';
import { Notifications } from './Drawer/Notifications';

const drawerWidth = 280;
const drawingContents = ['Account', 'Notifications', 'Help'];
const defaultSettingView = 'Account';

const componentMapping: Record<string, React.ComponentType<any>> = {
  Account: Account,
  Notifications: Notifications,
  Appearance: Appearance,
  Help: Help
};

export default function Settings() {
  const location = useLocation();

  const [selectedComponent, setSelectedComponent] = React.useState(location.state?.section || defaultSettingView);

  // Add this useEffect to handle state changes
  React.useEffect(() => {
    if (location.state?.section) {
      setSelectedComponent(location.state.section);
    }
  }, [location.state]);

  const handleItemClick = (setting: string) => {
    setSelectedComponent(setting);
  };
  const drawer = (
    <Box
      sx={{
        height: '100%',
        background: 'linear-gradient(180deg, var(--main-bg-color) 0%, var(--background-light) 100%)'
      }}
    >
      <Toolbar />
      <Divider />
      <List>
        {drawingContents.map((setting) => (
          <ListItem key={setting} disablePadding>
            <ListItemButton
              onClick={() => handleItemClick(setting)}
              sx={{
                borderRadius: '8px',
                mx: 1,
                '&:hover': {
                  backgroundColor: 'var(--border-color)'
                },
                '&.Mui-selected': {
                  backgroundColor: 'var(--border-color)',
                  '&:hover': {
                    backgroundColor: 'var(--border-color)'
                  }
                }
              }}
              selected={selectedComponent === setting}
            >
              <ListItemText
                primary={setting}
                sx={{
                  '& .MuiTypography-root': {
                    color: 'var(--primary-blue)',
                    fontFamily: 'var(--font-family)',
                    fontWeight: selectedComponent === setting ? 600 : 400
                  }
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
    </Box>
  );

  return (
    <Box
      sx={{
        display: 'flex',
        background: 'linear-gradient(180deg, var(--main-bg-color) 0%, var(--background-light) 100%)',
        minHeight: '90vh'
      }}
    >
      <Box
        component="nav"
        sx={{
          width: { sm: drawerWidth },
          flexShrink: { sm: 0 }
        }}
      >
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              top: '11%',
              borderRight: `1px solid var(--border-color)`,
              boxShadow: '4px 0 12px var(--border-color)'
            }
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          background: 'var(--main-bg-color)',
          borderRadius: '16px',
          m: 3,
          p: 4,
          boxShadow: `0 4px 12px var(--border-color)`
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            sx={{
              color: 'var(--primary-blue)',
              fontFamily: 'var(--font-family)',
              fontWeight: 700,
              mb: 4
            }}
          >
            {selectedComponent} Settings
          </Typography>
          <Typography component={'span'}>
            {selectedComponent && React.createElement(componentMapping[selectedComponent])}
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
