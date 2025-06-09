import { Link } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Container,
  Divider,
  IconButton,
  Typography,
} from "@mui/material";
import {
  ArrowForward,
  BarChart,
  Cloud,
  LocalShipping,
  Agriculture,
  VerifiedUser,
  ThumbUp,
  Facebook,
  Twitter,
  Instagram,
} from "@mui/icons-material";

export default function Home() {
  return (
    <Box display="flex" flexDirection="column" minHeight="100vh">
      {/* Main Content */}
      <Box component="main" flex="1" py={8} bgcolor="#f5f5f5">
        <Container>
          {/* Hero Section */}
          <Box textAlign="center" mb={10}>
            <Typography variant="h2" fontWeight="bold" gutterBottom>
              Powering Agriculture Through Blockchain
            </Typography>
            <Typography variant="h6" color="text.secondary" mb={4}>
              Ekosfera connects Farmers, Traders, and Transporters in a trustless, transparent system.
            </Typography>
            <Box mt={3}>
              <Button
                variant="contained"
                color="success"
                component={Link}
                to="/dashboard"
                sx={{ mr: 2 }}
              >
                  Go to Dashboard
              </Button>
            
            </Box>
          </Box>

          {/* Features Section */}
          <Box display="flex" flexDirection={{ xs: "column", md: "row" }} gap={4} flexWrap="wrap">
            {[{
              icon: <BarChart color="success" />,
              title: "Real-Time Crop Listings",
              content: "View and trade agricultural produce directly from farmers with real-time updates.",
              link: "/marketplace",
              label: "Visit Marketplace"
            },
            {
              icon: <LocalShipping color="success" />,
              title: "Secure Transport Deals",
              content: "Connect with verified transporters to ensure timely and safe delivery of produce.",
              link: "/contracts",
              label: "Manage Contracts"
            },
            {
              icon: <Cloud color="success" />,
              title: "Decentralized & Transparent",
              content: "Powered by blockchain for unmatched trust, traceability, and data integrity.",
              link: "/wallet",
              label: "View Wallet"
            }].map((item, index) => (
              <Card key={index} sx={{ flex: 1, minWidth: 275 }}>
                <CardHeader avatar={item.icon} title={item.title} />
                <CardContent>
                  <Typography>{item.content}</Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    color="success"
                    component={Link}
                    to={item.link}
                    endIcon={<ArrowForward />}
                  >
                    {item.label}
                  </Button>
                </CardActions>
              </Card>
            ))}
          </Box>

          {/* Quick Stats */}
          <Box my={10} textAlign="center">
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Trusted by the Community
            </Typography>
            <Box display="flex" justifyContent="center" flexWrap="wrap" gap={6} mt={4}>
              <Box textAlign="center">
                <Agriculture fontSize="large" color="success" />
                <Typography variant="h5">1200+ Farmers</Typography>
              </Box>
              <Box textAlign="center">
                <VerifiedUser fontSize="large" color="success" />
                <Typography variant="h5">800+ Verified Trades</Typography>
              </Box>
              <Box textAlign="center">
                <ThumbUp fontSize="large" color="success" />
                <Typography variant="h5">98% Satisfaction</Typography>
              </Box>
            </Box>
          </Box>

          {/* Testimonials */}
          <Box my={10} textAlign="center">
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              What Our Users Say
            </Typography>
            <Box display="flex" flexDirection={{ xs: "column", md: "row" }} gap={4} mt={4}>
              {[
                { quote: "I sold my crops faster and at a better price!", user: "– Ramesh, Farmer" },
                { quote: "Found transporters on time with zero hassle.", user: "– Meena, Trader" },
                { quote: "Smooth, clear, and trustworthy process.", user: "– Arjun, Transporter" }
              ].map((item, i) => (
                <Card key={i} sx={{ flex: 1 }}>
                  <CardContent>
                    <Typography>"{item.quote}"</Typography>
                    <Typography variant="subtitle2" color="text.secondary" mt={2}>
                      {item.user}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box component="footer" bgcolor="success.main" color="white" py={6} mt="auto">
        <Container>
          <Box display="flex" flexDirection={{ xs: "column", md: "row" }} justifyContent="space-between" gap={4}>
            <Box>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                AgriChain
              </Typography>
              <Typography variant="body2">
                Empowering agriculture with blockchain. From sowing to selling, we make it transparent.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Quick Links
              </Typography>
              <Box display="flex" flexDirection="column" gap={1}>
                <Link to="/about" style={{ color: "white", textDecoration: "none" }}>About</Link>
                <Link to="/sell" style={{ color: "white", textDecoration: "none" }}>Marketplace</Link>
                <Link to="/dashboard" style={{ color: "white", textDecoration: "none" }}>Dashboard</Link>
              </Box>
            </Box>

            <Box>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Follow Us
              </Typography>
              <Box display="flex" gap={2} mt={1}>
                <IconButton color="inherit"><Facebook /></IconButton>
                <IconButton color="inherit"><Twitter /></IconButton>
                <IconButton color="inherit"><Instagram /></IconButton>
              </Box>
            </Box>
          </Box>
          <Divider sx={{ my: 4, bgcolor: "white" }} />
          <Typography variant="body2" textAlign="center">
            © 2025 Ekosfera. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
