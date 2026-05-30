'use client';

import { createTheme } from '@mui/material/styles';

export const pawmateTheme = createTheme({
  cssVariables: true,
  shape: { borderRadius: 12 },
  palette: {
    mode: 'light',
    primary: { main: '#2E7D6B', light: '#5BA697', dark: '#1F5A4D', contrastText: '#FFFFFF' },
    secondary: { main: '#C2654A', light: '#E08A6E', dark: '#8E4632', contrastText: '#FFFFFF' },
    success: { main: '#3F8F5A' },
    warning: { main: '#D4842A' },
    error: { main: '#B3261E' },
    background: { default: '#F8F6F1', paper: '#FFFFFF' },
    text: { primary: '#1F2A2E', secondary: '#5A6A6F' },
    divider: 'rgba(31,42,46,0.08)',
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif',
    h1: { fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, letterSpacing: '-0.015em' },
    h3: { fontWeight: 700, letterSpacing: '-0.01em' },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { borderRadius: 10, paddingInline: 18, paddingBlock: 8 } },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { border: '1px solid rgba(31,42,46,0.08)', borderRadius: 16 },
      },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0, color: 'inherit' },
      styleOverrides: { root: { borderBottom: '1px solid rgba(31,42,46,0.08)' } },
    },
    MuiTextField: { defaultProps: { size: 'small', fullWidth: true } },
  },
});
