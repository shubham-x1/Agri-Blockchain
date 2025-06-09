import React, { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/use-auth"
import { useWeb3 } from "../hooks/use-web3"
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Menu,
  MenuItem,
  Divider,
} from "@mui/material"
import MenuIcon from "@mui/icons-material/Menu"
import HomeIcon from "@mui/icons-material/Home"
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart"
import HistoryIcon from "@mui/icons-material/History"
import InventoryIcon from "@mui/icons-material/Inventory"
import LogoutIcon from "@mui/icons-material/Logout"
import ConnectWallet from "./connect-wallet"

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, logout } = useAuth()
  const { isConnected, address, chainId } = useWeb3()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [walletMenuAnchor, setWalletMenuAnchor] = useState<null | HTMLElement>(null)

  const isActive = (path: string) => location.pathname === path

  const navItems = [
    { name: "Home", href: "/", icon: <HomeIcon /> },
    { name: "Dashboard", href: "/dashboard", icon: <HistoryIcon /> },
    { name: "Sell Crop", href: "/sell", icon: <InventoryIcon /> },
    { name: "Transaction History", href: "/history", icon: <HistoryIcon /> },
  ]

  const handleWalletMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setWalletMenuAnchor(event.currentTarget)
  }

  const handleWalletMenuClose = () => {
    setWalletMenuAnchor(null)
  }

  const handleLogout = () => {
    logout()
    navigate("/") // Optional redirect after logout
    setDrawerOpen(false)
  }

  return (
    <AppBar position="sticky" color="default" elevation={1}>
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2, display: { lg: "none" } }}
          onClick={() => setDrawerOpen(true)}
        >
          <MenuIcon />
        </IconButton>

        <Box sx={{ display: "flex", alignItems: "center" }}>
          <ShoppingCartIcon sx={{ color: "primary.main", mr: 1 }} />
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              textDecoration: "none",
              color: "inherit",
              display: { xs: "none", sm: "block" },
            }}
          >
            AgriChain
          </Typography>
        </Box>

        <Box sx={{ display: { xs: "none", lg: "flex" }, ml: 4 }}>
          {navItems.map((item) => (
            <Button
              key={item.href}
              component={Link}
              to={item.href}
              color="inherit"
              sx={{
                mx: 1,
                color: isActive(item.href) ? "primary.main" : "text.secondary",
                "&:hover": { color: "text.primary" },
              }}
            >
              {item.name}
            </Button>
          ))}
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {isConnected ? (
            <>
              <Button
                variant="outlined"
                onClick={handleWalletMenuOpen}
                sx={{ maxWidth: 160, textOverflow: "ellipsis", overflow: "hidden" }}
              >
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </Button>
              <Menu anchorEl={walletMenuAnchor} open={Boolean(walletMenuAnchor)} onClose={handleWalletMenuClose}>
                <MenuItem disabled sx={{ fontSize: "0.75rem", wordBreak: "break-all" }}>
                  {address}
                </MenuItem>
                <MenuItem disabled sx={{ fontSize: "0.75rem" }}>
                  Network: {chainId === 11155111 ? "Sepolia Testnet" : "Unknown"}
                </MenuItem>
                <Divider />
                <MenuItem component={Link} to="/history" onClick={handleWalletMenuClose}>
                  View Transactions
                </MenuItem>
              </Menu>
            </>
          ) : (
            <ConnectWallet />
          )}

          {isAuthenticated ? (
            <Button
              variant="text"
              color="inherit"
              onClick={handleLogout}
              sx={{ display: { xs: "none", sm: "flex" } }}
              startIcon={<LogoutIcon />}
            >
              Logout
            </Button>
          ) : (
            <Button variant="contained" color="primary" component={Link} to="/auth" size="small">
              Login
            </Button>
          )}
        </Box>
      </Toolbar>

      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 250 }} role="presentation">
          <List>
            <ListItem>
              <Typography variant="h6">AgriChain</Typography>
            </ListItem>
            <Divider />
            {navItems.map((item) => (
              <ListItem
                key={item.href}
                component={Link}
                to={item.href}
                onClick={() => setDrawerOpen(false)}
                sx={{
                  backgroundColor: isActive(item.href) ? "action.selected" : "inherit",
                  "&:hover": { backgroundColor: "action.hover" },
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.name} />
              </ListItem>
            ))}
            {isAuthenticated && (
              <ListItem onClick={handleLogout} sx={{ cursor: "pointer" }}>
                <ListItemIcon>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </ListItem>
            )}
          </List>
        </Box>
      </Drawer>
    </AppBar>
  )
}
