import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
      contrastText: '#fff',
    },
    secondary: {
      main: '#dc004e',
      light: '#ff5983',
      dark: '#9a0036',
      contrastText: '#fff',
    },
    text: {
      primary: '#444444',
      secondary: '#444444',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    success: {
      main: '#4caf50',
    },
    error: {
      main: '#f44336',
    },
    warning: {
      main: '#ff9800',
    },
    info: {
      main: '#2196f3',
    },
  },
  typography: {
    // Font per testi normali
    fontFamily: [
      'Helvetica',
      'Helvetica Neue',
      'Arial',
      '-apple-system',
      'BlinkMacSystemFont',
      'sans-serif',
    ].join(','),
    // Font per titoli (h1-h6)
    h1: {
      fontFamily: "'Harabara Mais', 'Montserrat', 'Arial Black', sans-serif",
      fontSize: '2.5rem',
      fontWeight: 700,
      color: '#444444',
    },
    h2: {
      fontFamily: "'Harabara Mais', 'Montserrat', 'Arial Black', sans-serif",
      fontSize: '2rem',
      fontWeight: 700,
      color: '#444444',
    },
    h3: {
      fontFamily: "'Harabara Mais', 'Montserrat', 'Arial Black', sans-serif",
      fontSize: '1.75rem',
      fontWeight: 700,
      color: '#444444',
    },
    h4: {
      fontFamily: "'Harabara Mais', 'Montserrat', 'Arial Black', sans-serif",
      fontSize: '1.5rem',
      fontWeight: 700,
      color: '#444444',
    },
    h5: {
      fontFamily: "'Harabara Mais', 'Montserrat', 'Arial Black', sans-serif",
      fontSize: '1.25rem',
      fontWeight: 700,
      color: '#444444',
    },
    h6: {
      fontFamily: "'Harabara Mais', 'Montserrat', 'Arial Black', sans-serif",
      fontSize: '1rem',
      fontWeight: 700,
      color: '#444444',
    },
    body1: {
      color: '#444444',
    },
    body2: {
      color: '#444444',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          transition: 'box-shadow 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          },
        },
      },
    },
  },
});
