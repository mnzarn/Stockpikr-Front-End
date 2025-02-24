import { Avatar, Box, Divider, Paper, Typography } from '@mui/material';
import React, { useState } from 'react';
import '../../../index.css';
import { IAccountValues } from '../../../interfaces/IAccountValues';
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

  React.useEffect(() => {
    const queryUserInfo = async () => {
      const user = await UserApiService.fetchUserDetails();
      if (user) {
        setAccountValues({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          profilePic: user.profilePic
        });
      }
    };
    queryUserInfo();
  }, []);

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
        <Typography
          variant="h4"
          mt={3}
          sx={{
            color: 'var(--primary-blue)',
            fontFamily: 'var(--font-family)',
            fontWeight: 700
          }}
        >
          {accountValues.firstName} {accountValues.lastName}
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
