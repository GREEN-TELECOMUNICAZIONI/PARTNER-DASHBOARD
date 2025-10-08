import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
} from '@mui/material';

interface DashboardCardProps {
  title: string;
  description: string;
  icon: React.ReactElement;
  buttonText: string;
  onButtonClick: () => void;
  disabled?: boolean;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  description,
  icon,
  buttonText,
  onButtonClick,
  disabled = false,
}) => {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
      }}
      onClick={disabled ? undefined : onButtonClick}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 2,
            color: 'primary.main',
          }}
        >
          <Box sx={{ fontSize: 40, mr: 2, display: 'flex', alignItems: 'center' }}>
            {icon}
          </Box>
          <Typography variant="h5" component="h2">
            {title}
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
      <CardActions>
        <Button
          size="large"
          variant="contained"
          fullWidth
          onClick={(e) => {
            e.stopPropagation();
            onButtonClick();
          }}
          disabled={disabled}
        >
          {buttonText}
        </Button>
      </CardActions>
    </Card>
  );
};
