import { Box, Divider, Paper, Typography } from '@mui/material';
import React from 'react';
import '../../../index.css';

export const Help: React.FC = () => {
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
          Help & Support
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
          If you need assistance or have any questions, feel free to reach out to us through our support channels.
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
              minWidth: 120
            }}
          >
            Email Contact:
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'var(--primary-blue)',
              flex: 1
            }}
          >
            stockpikr@support.com
          </Typography>
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
              minWidth: 120
            }}
          >
            Phone Contact:
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'var(--primary-blue)',
              flex: 1
            }}
          >
            +1 (123) 456-7890
          </Typography>
        </Box>
      </Box>

      <Box mt={4}>
        <Typography
          variant="body2"
          sx={{
            color: 'var(--secondary-blue)',
            fontFamily: 'var(--font-family)',
            textAlign: 'center'
          }}
        >
          For additional information and FAQs, please visit our Contact page.
        </Typography>
      </Box>
    </Paper>
  );
};
