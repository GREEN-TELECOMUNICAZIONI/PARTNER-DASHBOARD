import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { VerificaCopertura } from './pages/VerificaCopertura';
import { VerificaCoperturaWidget } from './pages/VerificaCoperturaWidget';
import { WidgetVerificaCopertura } from './pages/WidgetVerificaCopertura';
import { NuovoContratto } from './pages/NuovoContratto';
import { theme } from './theme/theme';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Routes>
            {/* Routes with Layout */}
            <Route element={<Layout><Outlet /></Layout>}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/verifica-copertura" element={<VerificaCopertura />} />
              <Route path="/verifica-copertura/widget" element={<VerificaCoperturaWidget />} />
              <Route path="/nuovo-contratto" element={<NuovoContratto />} />
            </Route>

            {/* Routes without Layout (for iframe embedding) */}
            <Route path="/widget-verifica-copertura" element={<WidgetVerificaCopertura />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App
