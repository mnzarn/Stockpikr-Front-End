import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Paper,
  Switch,
  TextField,
  Typography
} from '@mui/material';
import React, { useState } from 'react';

import '../../../index.css';
interface SecuritySettingsProps {
  twoFactorAuth: boolean;
}

export const Security: React.FC<SecuritySettingsProps> = ({ twoFactorAuth }) => {
  const [twoFactorAuthToggle, setTwoFactorAuthToggle] = useState(twoFactorAuth);
  const [isChangePasswordDialogOpen, setChangePasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleTwoFactorAuthToggle = () => {
    setTwoFactorAuthToggle(!twoFactorAuthToggle);
  };

  const handleOpenChangePasswordDialog = () => {
    setChangePasswordDialogOpen(true);
  };

  const handleCloseChangePasswordDialog = () => {
    setChangePasswordDialogOpen(false);
    setCurrentPassword('');
    setNewPassword('');
  };

  const handleChangePassword = () => {
    handleCloseChangePasswordDialog();
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
          Security & Privacy
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
          Manage your account security settings and privacy preferences
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
            Two-Factor Authentication:
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={twoFactorAuthToggle}
                onChange={handleTwoFactorAuthToggle}
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
                {twoFactorAuthToggle ? 'Enabled' : 'Disabled'}
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
            Password:
          </Typography>
          <Button
            variant="contained"
            onClick={handleOpenChangePasswordDialog}
            sx={{
              backgroundColor: 'var(--primary-blue)',
              color: 'var(--text-color)',
              fontFamily: 'var(--font-family)',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: 'var(--secondary-blue)'
              }
            }}
          >
            Change Password
          </Button>
        </Box>
      </Box>

      <Dialog
        open={isChangePasswordDialogOpen}
        onClose={handleCloseChangePasswordDialog}
        PaperProps={{
          sx: {
            borderRadius: 2,
            backgroundColor: 'var(--main-bg-color)',
            border: `1px solid var(--border-color)`
          }
        }}
      >
        <DialogTitle
          sx={{
            color: 'var(--primary-blue)',
            fontFamily: 'var(--font-family)',
            fontWeight: 600
          }}
        >
          Change Password
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Current Password"
            type="password"
            fullWidth
            margin="normal"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'var(--border-color)'
                },
                '&:hover fieldset': {
                  borderColor: 'var(--primary-blue)'
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'var(--primary-blue)'
                }
              }
            }}
          />
          <TextField
            label="New Password"
            type="password"
            fullWidth
            margin="normal"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'var(--border-color)'
                },
                '&:hover fieldset': {
                  borderColor: 'var(--primary-blue)'
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'var(--primary-blue)'
                }
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ padding: 2 }}>
          <Button
            onClick={handleCloseChangePasswordDialog}
            sx={{
              color: 'var(--secondary-blue)',
              fontFamily: 'var(--font-family)',
              textTransform: 'none'
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleChangePassword}
            variant="contained"
            sx={{
              backgroundColor: 'var(--primary-blue)',
              color: 'var(--text-color)',
              fontFamily: 'var(--font-family)',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: 'var(--secondary-blue)'
              }
            }}
          >
            Change Password
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};
