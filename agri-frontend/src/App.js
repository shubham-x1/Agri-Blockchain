import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import { AuthProvider } from "./hooks/use-auth"
import { Web3Provider } from "./hooks/use-web3"
import Dashboard from "./dashboard/dashboardpage"
import Layout from "./components/layout"
import HomePage from "./Home"
import AuthPage from "./auth/Authpage"
import SellPage from "./sell/Sell"
import HistoryPage from "./history/Historypage"
import AboutPage from "./about/Aboutpage"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { ErrorBoundary } from "./components/ErrorBoundary"

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: "#2e7d32",
    },
    secondary: {
      main: "#f5f5f5",
    },
  },
})

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
          <Web3Provider>
            <Router>
              <Layout>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  
                  {/* Protected Routes */}
                  <Route 
                    path="/dashboard" 
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/sell" 
                    element={
                      <ProtectedRoute allowedRoles={['farmer']}>
                        <SellPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/history" 
                    element={
                      <ProtectedRoute>
                        <HistoryPage />
                      </ProtectedRoute>
                    } 
                  />
                </Routes>
              </Layout>
            </Router>
          </Web3Provider>
        
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
