"use client"
import React, { useState } from "react"
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Box,
} from "@mui/material"
import { ethers } from "ethers"
import { useWeb3 } from "../hooks/use-web3"
import { useAuth } from "../hooks/use-auth"
import { tradeContractABI } from "../library/contract-abi"

interface Crop {
  id: number
  name: string
  price: string
  seller: string
}

interface CropCardProps {
  crop: Crop
}

const CropCard: React.FC<CropCardProps> = ({ crop }) => {
  const { isConnected, signer } = useWeb3()
  const { isAuthenticated, token } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleBuy = async () => {
    if (!isConnected || !signer) {
      setError("Please connect your wallet first")
      return
    }

    if (!isAuthenticated) {
      setError("Please login first")
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Convert price to wei
      const priceInWei = ethers.utils.parseEther(crop.price)

      // Create contract instance
      const contract = new ethers.Contract("0xa513E6E4b8f2a923D98304ec87F64353C4D5C853", tradeContractABI, signer)

      // Call the buyCrop function on the smart contract
      const tx = await contract.buyCrop(crop.id, { value: priceInWei })
      await tx.wait()

      // Now also register the purchase in the backend
      const response = await fetch("http://localhost:3000/api/crops/buy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cropId: crop.id,
          txHash: tx.hash,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to register purchase with backend")
      }

      setSuccess(true)
    } catch (err: any) {
      console.error(err)
      setError(err.message || "Failed to purchase crop. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardMedia
        component="img"
        height="200"
        image={`/placeholder.svg?text=${encodeURIComponent(crop.name)}`}
        alt={crop.name}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          {crop.name}
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6" fontWeight="bold">
            {crop.price} ETH
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Seller: {crop.seller.slice(0, 6)}...{crop.seller.slice(-4)}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            <Typography fontWeight="bold">Success!</Typography>
            <Typography>You have successfully purchased this crop.</Typography>
          </Alert>
        )}
      </CardContent>
      <CardActions>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleBuy}
          disabled={loading || success}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {loading ? "Processing..." : success ? "Purchased" : "Buy Now"}
        </Button>
      </CardActions>
    </Card>
  )
}

export default CropCard

