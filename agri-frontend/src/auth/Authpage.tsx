import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material"
import { useAuth } from "../hooks/use-auth"

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`auth-tabpanel-${index}`}
      aria-labelledby={`auth-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  )
}

export default function AuthPage() {
  const navigate = useNavigate()
  const { login, register } = useAuth()
  const [tabValue, setTabValue] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [role, setRole] = useState<'farmer' | 'trader' | 'transporter'>('farmer')

  const [loginData, setLoginData] = useState({ email: "", password: "" })
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await login(loginData.email, loginData.password, role)
      navigate("/dashboard")
    } catch (err) {
      setError("Login failed. Please check your credentials.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (registerData.password !== registerData.confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    try {
      await register(registerData.name, registerData.email, registerData.password, role)
      navigate("/dashboard")
    } catch (err) {
      setError("Registration failed. Try a different email.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
      <Card sx={{ width: "100%", maxWidth: 500 }}>
        <CardContent>
          <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
            <Tab label="Login" />
            <Tab label="Register" />
          </Tabs>

          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

          <TabPanel value={tabValue} index={0}>
            <form onSubmit={handleLoginSubmit}>
              <Typography variant="h5" sx={{ mb: 2 }}>Login</Typography>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Role</InputLabel>
                <Select
                  value={role}
                  label="Role"
                  onChange={(e) => setRole(e.target.value as 'farmer' | 'trader' | 'transporter')}
                >
                  <MenuItem value="farmer">Farmer</MenuItem>
                  <MenuItem value="trader">Trader</MenuItem>
                  <MenuItem value="transporter">Transporter</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Email"
                type="email"
                fullWidth
                margin="normal"
                required
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
              />
              <TextField
                label="Password"
                type="password"
                fullWidth
                margin="normal"
                required
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              />
              <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading} sx={{ mt: 3 }}>
                {loading ? <><CircularProgress size={24} sx={{ mr: 1 }} />Logging in...</> : "Login"}
              </Button>
            </form>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <form onSubmit={handleRegisterSubmit}>
              <Typography variant="h5" sx={{ mb: 2 }}>Create an account</Typography>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Role</InputLabel>
                <Select
                  value={role}
                  label="Role"
                  onChange={(e) => setRole(e.target.value as 'farmer' | 'trader' | 'transporter')}
                >
                  <MenuItem value="farmer">Farmer</MenuItem>
                  <MenuItem value="trader">Trader</MenuItem>
                  <MenuItem value="transporter">Transporter</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Full Name"
                fullWidth
                margin="normal"
                required
                value={registerData.name}
                onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
              />
              <TextField
                label="Email"
                type="email"
                fullWidth
                margin="normal"
                required
                value={registerData.email}
                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
              />
              <TextField
                label="Password"
                type="password"
                fullWidth
                margin="normal"
                required
                value={registerData.password}
                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
              />
              <TextField
                label="Confirm Password"
                type="password"
                fullWidth
                margin="normal"
                required
                value={registerData.confirmPassword}
                onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
              />
              <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading} sx={{ mt: 3 }}>
                {loading ? <><CircularProgress size={24} sx={{ mr: 1 }} />Creating account...</> : "Create Account"}
              </Button>
            </form>
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  )
}
