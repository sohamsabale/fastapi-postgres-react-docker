import { createTheme } from '@mui/material/styles';

// Define your custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Background color
    },
    secondary: {
      main: '#f48fb1', // Card color
    },
    text: {
      primary: '#333', // Text color
    },
    background: {
      default: '#fafafa', // Default background color
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#f48fb1', // Ensure cards use the secondary color
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          backgroundColor: '#1976d2', // Ensure container uses the primary color
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          color: '#333', // Ensure text uses the primary text color
        },
      },
    },
  },
});

export default theme;
