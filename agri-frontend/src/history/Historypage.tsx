import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const BuyCropPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const crop = location.state?.crop;

  const [quantity, setQuantity] = useState<number>(1);
  const [traderWallet, setTraderWallet] = useState<string>("");
  const [privateKey, setPrivateKey] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  if (!crop) {
    return <div>No crop selected. Please go back.</div>;
  }

  const handleBuyCrop = async () => {
    setError("");
    setSuccess("");
  
    // Make sure wallet and private key are filled
    if (!traderWallet || !privateKey) {
      setError("Please fill all fields");
      return;
    }
  
    // Check if the quantity is valid
    if (quantity <= 0) {
      setError("Quantity must be greater than 0");
      return;
    }
  
    setLoading(true);
  
    try {
      // Make the POST request to purchase the crop
      const response = await fetch("http://localhost:5000/api/order/buy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          traderWallet,
          privateKey,
          cropId: crop.id,   // Using crop.id here instead of crop._id
          quantity,
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || "Purchase failed");
      }
  
      setSuccess(`Purchase successful! Order ID: ${data.order}`);
      setTimeout(() => {
        navigate("/dashboard"); // Navigate back to dashboard after success
      }, 3000);
    } catch (err: any) {
      console.error("Buy crop error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  
  

  return (
    <div style={{ padding: "20px" }}>
      <h1>Buy Crop</h1>

      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: "8px",
          padding: "16px",
          marginTop: "20px",
          maxWidth: "500px",
        }}
      >
        <h2>{crop.name}</h2>
        <p><strong>Crop ID:</strong> {crop.id}</p>
 {/* Fixed this to access _id */}
        <p><strong>Farmer:</strong> {crop.farmer.name}</p> {/* Fixed farmer display */}
        <p><strong>Quantity Available:</strong> {crop.quantity}</p>
        <p><strong>Price per Unit:</strong> {crop.price} wei</p>
        <p><strong>Location:</strong> {crop.location}</p>
        <p><strong>Harvest Date:</strong> {formatDate(crop.harvestDate)}</p>
      </div>

      <div style={{ marginTop: "20px" }}>
        <label>Quantity to Buy:</label>
        <br />
        <input
          type="number"
          min="1"
          max={crop.quantity}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          style={{ padding: "8px", width: "100%", marginTop: "8px" }}
        />
      </div>

      <div style={{ marginTop: "20px" }}>
        <label>Trader Wallet Address:</label>
        <br />
        <input
          type="text"
          value={traderWallet}
          onChange={(e) => setTraderWallet(e.target.value)}
          placeholder="0x..."
          style={{ padding: "8px", width: "100%", marginTop: "8px" }}
        />
      </div>

      <div style={{ marginTop: "20px" }}>
        <label>Private Key:</label>
        <br />
        <input
          type="password"
          value={privateKey}
          onChange={(e) => setPrivateKey(e.target.value)}
          placeholder="Private key"
          style={{ padding: "8px", width: "100%", marginTop: "8px" }}
        />
      </div>

      {error && <p style={{ color: "red", marginTop: "16px" }}>{error}</p>}
      {success && <p style={{ color: "green", marginTop: "16px" }}>{success}</p>}

      <button
        onClick={handleBuyCrop}
        disabled={loading}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          fontSize: "16px",
          backgroundColor: loading ? "#999" : "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Processing..." : "Confirm Buy"}
      </button>
    </div>
  );
};

// Helper function to format date
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

export default BuyCropPage;
