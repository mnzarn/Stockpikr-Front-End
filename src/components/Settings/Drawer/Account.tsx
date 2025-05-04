import EditIcon from '@mui/icons-material/Edit';
import { Avatar, Box, Button, Divider, IconButton, Paper, TextField, Typography } from '@mui/material';
import { updateProfile } from 'firebase/auth';
import React, { useState } from 'react';
import '../../../index.css';
import { IAccountValues } from '../../../interfaces/IAccountValues';
import { auth } from '../../../services/FirebaseConfig';
import { UserApiService } from '../../../services/UserApiService';

export interface IAccountField {
  label: string;
  name: string;
  type: string;
}

export const accountFields: IAccountField[] = [
  { label: 'First Name', name: 'firstName', type: 'text' },
  { label: 'Last Name', name: 'lastName', type: 'text' },
  { label: 'Email ID', name: 'email', type: 'text' },
  { label: 'Phone Number', name: 'phoneNumber', type: 'tel' }
];

export const Account: React.FC = () => {
  const [accountValues, setAccountValues] = useState<IAccountValues>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    profilePic: ''
  });
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedFirstName, setEditedFirstName] = useState('');
  const [editedLastName, setEditedLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    const queryUserInfo = async () => {
      const user = await UserApiService.fetchUserDetails();
      if (user) {
        setAccountValues({
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email,
          phoneNumber: user.phoneNumber || "",
          profilePic: user.profilePic || ""
        });
        setEditedFirstName(user.displayName?.split(' ')[0] || '');
        setEditedLastName(user.displayName?.split(' ')[1] || '');
      }
    };
    queryUserInfo();
  }, []);

  const handleEditName = () => {
    setIsEditingName(true);
  };

  const handleSaveName = async () => {
    setIsLoading(true);
    try {
      // Use Firebase auth directly
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No user is currently logged in');
      }

      // Update the display name in Firebase Auth
      await updateProfile(currentUser, {
        displayName: `${editedFirstName} ${editedLastName}`
      });

      // Update local state
      setAccountValues({
        ...accountValues,
        firstName: editedFirstName,
        lastName: editedLastName
      });
      setIsEditingName(false);
    } catch (error) {
      console.error('Failed to update name:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedFirstName(accountValues.firstName);
    setEditedLastName(accountValues.lastName);
    setIsEditingName(false);
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
        <Avatar
          sx={{
            width: 120,
            height: 120,
            border: `4px solid var(--main-bg-color)`,
            boxShadow: `0 4px 12px var(--border-color)`
          }}
          src={accountValues.profilePic}
        />

        {!isEditingName ? (
          <Box display="flex" alignItems="center" mt={3}>
            <Typography
              variant="h4"
              sx={{
                color: 'var(--primary-blue)',
                fontFamily: 'var(--font-family)',
                fontWeight: 700
              }}
            >
              {accountValues.firstName} {accountValues.lastName}
            </Typography>
            <IconButton
              onClick={handleEditName}
              sx={{
                ml: 1,
                color: 'var(--primary-blue)'
              }}
            >
              <EditIcon />
            </IconButton>
          </Box>
        ) : (
          <Box display="flex" flexDirection="column" alignItems="center" mt={3} width="100%">
            <Box display="flex" gap={1} width="100%" maxWidth="400px">
              <TextField
                value={editedFirstName}
                onChange={(e) => setEditedFirstName(e.target.value)}
                label="First Name"
                variant="outlined"
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'var(--border-color)'
                    },
                    '&:hover fieldset': {
                      borderColor: 'var(--primary-blue)'
                    }
                  }
                }}
              />
              <TextField
                value={editedLastName}
                onChange={(e) => setEditedLastName(e.target.value)}
                label="Last Name"
                variant="outlined"
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'var(--border-color)'
                    },
                    '&:hover fieldset': {
                      borderColor: 'var(--primary-blue)'
                    }
                  }
                }}
              />
            </Box>
            <Box display="flex" gap={2} mt={2}>
              <Button
                variant="contained"
                onClick={handleSaveName}
                disabled={isLoading}
                sx={{
                  bgcolor: 'var(--primary-blue)',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'var(--secondary-blue)'
                  },
                  fontFamily: 'var(--font-family)'
                }}
              >
                {isLoading ? 'Saving...' : 'Save'}
              </Button>
              <Button
                variant="outlined"
                onClick={handleCancelEdit}
                disabled={isLoading}
                sx={{
                  borderColor: 'var(--primary-blue)',
                  color: 'var(--primary-blue)',
                  '&:hover': {
                    borderColor: 'var(--secondary-blue)',
                    bgcolor: 'transparent'
                  },
                  fontFamily: 'var(--font-family)'
                }}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        )}
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
        {accountFields.map(({ label, name, type }: IAccountField) => (
          <Box
            key={name}
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
                minWidth: 120
              }}
            >
              {label}:
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: 'var(--primary-blue)',
                flex: 1
              }}
            >
              {accountValues[name]}
            </Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
};
