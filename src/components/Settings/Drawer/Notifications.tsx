import { Box, Divider, FormControlLabel, Paper, Switch, Typography } from '@mui/material';
import React, { useState } from 'react';
import '../../../index.css';

interface NotificationsProps {
  emailNotifications: boolean;
  phoneNotifications: boolean;
}

export const Notifications: React.FC<NotificationsProps> = ({ emailNotifications, phoneNotifications }) => {
  const [emailToggle, setEmailToggle] = useState(emailNotifications);
  const [phoneToggle, setPhoneToggle] = useState(phoneNotifications);

  const handleEmailToggle = () => {
    setEmailToggle(!emailToggle);
  };

  const handlePhoneToggle = () => {
    setPhoneToggle(!phoneToggle);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        padding: 4,
        maxWidth: 800,
        margin: 'auto',
        borderRadius: 3,
        background: `linear-gradient(135deg, var(--background-light) 0%, var(--main-bg-color) 100%)`,
        border: `1px solid var(--border-color)`,
        boxShadow: `0 8px 24px var(--border-color)`
      }}
    >
      <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
        <Typography
          variant="h4"
          sx={{
            color: 'var(--primary-blue)',
            fontFamily: 'var(--font-family)',
            fontWeight: 700,
            mb: 3
          }}
        >
          Notification Preferences
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: 'var(--secondary-blue)',
            fontFamily: 'var(--font-family)',
            textAlign: 'center',
            maxWidth: '600px'
          }}
        >
          Manage how you receive notifications and updates
        </Typography>
      </Box>

      <Divider
        sx={{
          marginBottom: 4,
          borderColor: 'var(--border-color)'
        }}
      />

      <Box
        display="grid"
        gap={3}
        sx={{
          '& .MuiTypography-root': {
            fontFamily: 'var(--font-family)'
          }
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            alignItems: { xs: 'flex-start', sm: 'center' },
            padding: 2,
            borderRadius: 2,
            backgroundColor: 'var(--background-light)',
            border: `1px solid var(--border-color)`
          }}
        >
          <Typography
            variant="body1"
            sx={{
              color: 'var(--secondary-blue)',
              fontWeight: 600,
              minWidth: 200
            }}
          >
            Email Notifications:
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={emailToggle}
                onChange={handleEmailToggle}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: 'var(--primary-blue)',
                    '&:hover': {
                      backgroundColor: 'var(--border-color)'
                    }
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: 'var(--primary-blue)'
                  }
                }}
              />
            }
            label={
              <Typography
                sx={{
                  color: 'var(--primary-blue)',
                  fontFamily: 'var(--font-family)'
                }}
              >
                {emailToggle ? 'Enabled' : 'Disabled'}
              </Typography>
            }
          />
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            alignItems: { xs: 'flex-start', sm: 'center' },
            padding: 2,
            borderRadius: 2,
            backgroundColor: 'var(--background-light)',
            border: `1px solid var(--border-color)`
          }}
        >
          <Typography
            variant="body1"
            sx={{
              color: 'var(--secondary-blue)',
              fontWeight: 600,
              minWidth: 200
            }}
          >
            Phone Notifications:
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={phoneToggle}
                onChange={handlePhoneToggle}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: 'var(--primary-blue)',
                    '&:hover': {
                      backgroundColor: 'var(--border-color)'
                    }
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: 'var(--primary-blue)'
                  }
                }}
              />
            }
            label={
              <Typography
                sx={{
                  color: 'var(--primary-blue)',
                  fontFamily: 'var(--font-family)'
                }}
              >
                {phoneToggle ? 'Enabled' : 'Disabled'}
              </Typography>
            }
          />
        </Box>

        <Typography
          variant="h5"
          sx={{
            color: 'var(--primary-blue)',
            fontFamily: 'var(--font-family)',
            fontWeight: 600,
            mt: 3,
            mb: 2
          }}
        >
          Additional Settings
        </Typography>

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            alignItems: { xs: 'flex-start', sm: 'center' },
            padding: 2,
            borderRadius: 2,
            backgroundColor: 'var(--background-light)',
            border: `1px solid var(--border-color)`
          }}
        >
          <Typography
            variant="body1"
            sx={{
              color: 'var(--secondary-blue)',
              fontWeight: 600,
              minWidth: 200
            }}
          >
            Push Notifications:
          </Typography>
          <FormControlLabel
            control={
              <Switch
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: 'var(--primary-blue)',
                    '&:hover': {
                      backgroundColor: 'var(--border-color)'
                    }
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: 'var(--primary-blue)'
                  }
                }}
              />
            }
            label={
              <Typography
                sx={{
                  color: 'var(--primary-blue)',
                  fontFamily: 'var(--font-family)'
                }}
              >
                Allow
              </Typography>
            }
          />
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            alignItems: { xs: 'flex-start', sm: 'center' },
            padding: 2,
            borderRadius: 2,
            backgroundColor: 'var(--background-light)',
            border: `1px solid var(--border-color)`
          }}
        >
          <Typography
            variant="body1"
            sx={{
              color: 'var(--secondary-blue)',
              fontWeight: 600,
              minWidth: 200
            }}
          >
            Preview Mode:
          </Typography>
          <FormControlLabel
            control={
              <Switch
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: 'var(--primary-blue)',
                    '&:hover': {
                      backgroundColor: 'var(--border-color)'
                    }
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: 'var(--primary-blue)'
                  }
                }}
              />
            }
            label={
              <Typography
                sx={{
                  color: 'var(--primary-blue)',
                  fontFamily: 'var(--font-family)'
                }}
              >
                Show Previews in Notifications
              </Typography>
            }
          />
        </Box>
      </Box>
    </Paper>
  );
};
