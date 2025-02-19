import * as React from 'react';
import { Account } from './Drawer/Account';
import { Appearance } from './Drawer/Appearance';
import { Help } from './Drawer/Help';
import { Notifications } from './Drawer/Notifications';
import { Security } from './Drawer/Security';

import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import '../../index';

const drawerWidth = 280;
const drawingContents = ['Account', 'Notifications', 'Security', 'Help'];
const defaultSettingView = 'Account';

const componentMapping: Record<string, React.ComponentType<any>> = {
  Account: Account,
  Notifications: Notifications,
  Security: Security,
  Appearance: Appearance,
  Help: Help
};

export default function Settings() {
  const [selectedComponent, setSelectedComponent] = React.useState(defaultSettingView);

  const handleItemClick = (setting: string) => {
    setSelectedComponent(setting);
  };

  const drawer = (
    <Box sx={{ 
      height: '100%',
      background: 'linear-gradient(180deg, #ffffff 0%, #f8faff 100%)'
    }}>
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
                  backgroundColor: 'rgba(26, 54, 93, 0.08)',
                },
                '&.Mui-selected': {
                  backgroundColor: 'rgba(26, 54, 93, 0.12)',
                  '&:hover': {
                    backgroundColor: 'rgba(26, 54, 93, 0.16)',
                  }
                }
              }}
              selected={selectedComponent === setting}
            >
              <ListItemText 
                primary={setting} 
                sx={{
                  '& .MuiTypography-root': {
                    color: '#1a365d',
                    fontFamily: "'Raleway', sans-serif",
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
        background: 'linear-gradient(180deg, #ffffff 0%, #f8faff 100%)',
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
              borderRight: '1px solid rgba(26, 54, 93, 0.12)',
              boxShadow: '4px 0 12px rgba(26, 54, 93, 0.05)'
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
          background: '#ffffff',
          borderRadius: '16px',
          m: 3,
          p: 4,
          boxShadow: '0 4px 12px rgba(26, 54, 93, 0.08)'
        }}
      >
        <Container maxWidth="lg">
          <Typography 
            variant="h4" 
            sx={{ 
              color: '#1a365d',
              fontFamily: "'Raleway', sans-serif",
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
