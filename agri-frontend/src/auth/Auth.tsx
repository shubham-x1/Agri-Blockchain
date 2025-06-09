import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button } from "@mui/material";

const Auth = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 6 }}>
      <Box sx={{ textAlign: "center", maxWidth: "2xl" }}>
        <Typography variant="h3" component="h1" sx={{ mb: 4, fontWeight: "bold" }}>
          Authentication
        </Typography>
        <Typography variant="h5" sx={{ mb: 8, color: "text.secondary" }}>
          Please authenticate to continue
        </Typography>
        <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2, justifyContent: "center" }}>
          <Button variant="contained" color="primary" size="large" onClick={() => navigate("/")}>
            Back to Home
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Auth; 