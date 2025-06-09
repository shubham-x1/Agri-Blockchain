import React from "react"
import { Box, Typography, Card, CardContent, List, ListItem } from "@mui/material"

export default function AboutPage() {
  return (
    <Box sx={{ maxWidth: "3xl", mx: "auto", py: 4 }}>
      <Typography variant="h3" component="h1" sx={{ mb: 4, fontWeight: "bold" }}>
        About AgriChain
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <Box>
          <Typography variant="h4" component="h2" sx={{ mb: 2, fontWeight: "bold" }}>
            Our Mission
          </Typography>
          <Typography color="text.secondary">
            AgriChain is a blockchain-integrated agricultural supply chain platform that aims to bring transparency,
            efficiency, and trust to agricultural commerce. By leveraging blockchain technology, we create a secure and
            verifiable marketplace for farmers and buyers.
          </Typography>
        </Box>

        <Box>
          <Typography variant="h4" component="h2" sx={{ mb: 2, fontWeight: "bold" }}>
            How It Works
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  1. Connect Your Wallet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Use MetaMask to connect to the Sepolia testnet and interact with our smart contracts.
                </Typography>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  2. Create an Account
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Register on our platform to access all features and track your transactions.
                </Typography>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  3. List or Buy Crops
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Farmers can list their crops for sale, while buyers can purchase them directly through the platform.
                </Typography>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  4. Transparent Transactions
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  All transactions are recorded on the blockchain, ensuring transparency and traceability.
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>

        <Box>
          <Typography variant="h4" component="h2" sx={{ mb: 2, fontWeight: "bold" }}>
            Technology Stack
          </Typography>
          <List sx={{ listStyleType: "disc", pl: 4 }}>
            <ListItem sx={{ display: "list-item", color: "text.secondary" }}>
              Frontend: Next.js with Material UI
            </ListItem>
            <ListItem sx={{ display: "list-item", color: "text.secondary" }}>Backend: Node.js with Express</ListItem>
            <ListItem sx={{ display: "list-item", color: "text.secondary" }}>
              Blockchain: Ethereum (Sepolia Testnet)
            </ListItem>
            <ListItem sx={{ display: "list-item", color: "text.secondary" }}>Smart Contracts: Solidity</ListItem>
            <ListItem sx={{ display: "list-item", color: "text.secondary" }}>Web3 Integration: ethers.js</ListItem>
          </List>
        </Box>
      </Box>
    </Box>
  )
}
