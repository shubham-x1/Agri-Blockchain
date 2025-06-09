import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useWeb3 } from "../hooks/use-web3"
import { useAuth } from "../hooks/use-auth"
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material"
import { ethers, utils } from "ethers"
import ConnectWallet from "../components/connect-wallet"
import { tradeContractABI } from "../library/contract-abi"

export default function SellPage() {
  const navigate = useNavigate()
  const { isConnected, address, provider, signer } = useWeb3()
  const { isAuthenticated, token } = useAuth()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [cropData, setCropData] = useState({
    name: "",
    price: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isConnected || !signer) {
      setError("Please connect your wallet first")
      return
    }

    /*if (!isAuthenticated) {
      setError("Please login first")
      return
    }*/

    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const priceInWei = utils.parseEther(cropData.price)

      const contract = new ethers.Contract(
        "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853",
        tradeContractABI,
        signer
      )

      const tx = await contract.listCrop(cropData.name, priceInWei)
      await tx.wait()

      const response = await fetch("http://localhost:3000/api/crops/list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: cropData.name,
          price: cropData.price,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to register crop with backend")
      }

      setSuccess(true)
      setCropData({ name: "", price: "" })

      setTimeout(() => {
        navigate("/")
      }, 2000)
    } catch (err: any) {
      console.error(err)
      setError(err.message || "Failed to list crop. Please try again.")
    } finally {
      setLoading(false)
    }
  }

 /* if (!isAuthenticated) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          gap: 3,
        }}
      >
        <Alert severity="error">
          <Typography variant="subtitle1" fontWeight="bold">
            Authentication Required
          </Typography>
          <Typography>
            You need to be logged in to list crops for sale.
          </Typography>
        </Alert>
        <Button variant="contained" color="primary" component="a" href="/auth">
          Login to Continue
        </Button>
      </Box>
    )
  } */

  return (
    <Box sx={{ maxWidth: 500, mx: "auto" }}>
      <Card>
        <CardContent>
          <Typography variant="h5" component="h1" sx={{ mb: 1 }}>
            List a Crop for Sale
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Enter the details of your crop to list it on the marketplace
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              <Typography fontWeight="bold">Success!</Typography>
              <Typography>
                Your crop has been listed successfully. Redirecting to the
                marketplace...
              </Typography>
            </Alert>
          )}

          {!isConnected ? (
            <Box sx={{ py: 4, textAlign: "center" }}>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                You need to connect your wallet to list a crop
              </Typography>
              <ConnectWallet />
            </Box>
          ) : (
            <form onSubmit={handleSubmit}>
              <TextField
                label="Crop Name"
                placeholder="e.g., Organic Tomatoes"
                fullWidth
                margin="normal"
                required
                value={cropData.name}
                onChange={(e) =>
                  setCropData({ ...cropData, name: e.target.value })
                }
              />

              <TextField
                label="Price (ETH)"
                type="number"
                inputProps={{ step: "0.001", min: "0.001" }}
                placeholder="0.05"
                fullWidth
                margin="normal"
                required
                value={cropData.price}
                onChange={(e) =>
                  setCropData({ ...cropData, price: e.target.value })
                }
              />

              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading}
                sx={{ mt: 3 }}
              >
                {loading ? (
                  <>
                    <CircularProgress size={24} sx={{ mr: 1 }} />
                    Listing crop...
                  </>
                ) : (
                  "List Crop for Sale"
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}
