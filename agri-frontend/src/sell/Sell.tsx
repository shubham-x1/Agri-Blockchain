import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWeb3 } from "../hooks/use-web3";
import { useAuth } from "../hooks/use-auth";
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Container,
  Paper,
  Stepper,
  Step,
  StepLabel,
  MenuItem,
  Divider,
  IconButton,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";

// Define types for form data
interface CropData {
  name: string;
  price: string;
  quantity: string;
  type: string;
  harvestDate: string;
  soilType: string;
  weatherDuringHarvest: string;
  pesticideUsed: string;
  fertilizerUsed: string;
  location: string;
  qualityGrade: string;
  moistureContent: string;
  description: string;
}

interface FarmerData {
  name: string;
  walletAddress: string | null;
}

interface FormErrors {
  name: boolean;
  price: boolean;
  quantity: boolean;
  type: boolean;
  [key: string]: boolean; // Index signature to allow dynamic access
}

export default function SellPage() {
  const navigate = useNavigate();
  const { isConnected, signer, address } = useWeb3();
  const { isAuthenticated, token } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(0);

  // Quality grade options
  const qualityGrades = ["A+", "A", "B+", "B", "C+", "C"];
  const soilTypes = ["Clay", "Sandy", "Silty", "Loamy", "Peaty", "Chalky", "Other"];
  const weatherOptions = ["Sunny", "Rainy", "Cloudy", "Windy", "Stormy", "Mixed"];

  const [cropData, setCropData] = useState<CropData>({
    name: "",
    price: "",
    quantity: "",
    type: "",
    harvestDate: "",
    soilType: "",
    weatherDuringHarvest: "",
    pesticideUsed: "",
    fertilizerUsed: "",
    location: "",
    qualityGrade: "",
    moistureContent: "",
    description: "",
  });

  const [farmerData, setFarmerData] = useState<FarmerData>({
    name: "",
    walletAddress: address,
  });

  const [cropPhotos, setCropPhotos] = useState<File[]>([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);
  const [farmerId, setFarmerId] = useState<string | null>(null);
  const [farmerRegistered, setFarmerRegistered] = useState<boolean>(false);

  // Form validation states
  const [formErrors, setFormErrors] = useState<FormErrors>({
    name: false,
    price: false,
    quantity: false,
    type: false,
  });

  const steps = ['Register as Farmer', 'Basic Crop Details', 'Additional Information', 'Upload Photos'];

  // API base URL - make this configurable
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

  const handleRegisterFarmer = async () => {
    if (!farmerData.name) {
      setError("Please enter your name to register as a farmer");
      return;
    }

    if (!address) {
      setError("Please connect your wallet first");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Update farmer data with current wallet address before sending
      const farmerPayload = {
        name: farmerData.name,
        walletAddress: address
      };

      console.log("Registering farmer with payload:", farmerPayload);

      const registerResponse = await fetch(`${API_BASE_URL}/farmer/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(farmerPayload),
      });

      if (!registerResponse.ok) {
        const errorData = await registerResponse.text();
        let errorMessage: string;
        try {
          const errorJson = JSON.parse(errorData);
          errorMessage = errorJson.error || errorJson.message || "Farmer registration failed";
        } catch (e) {
          errorMessage = errorData || "Farmer registration failed";
        }
        throw new Error(errorMessage);
      }

      const registerData = await registerResponse.json();
      console.log("Registration response:", registerData);
      
      // Make sure to extract farmerId correctly based on your API response
      const newFarmerId = registerData.farmer?._id || registerData.farmer?.id || registerData._id || registerData.id;
      
      if (!newFarmerId) {
        throw new Error("Failed to retrieve farmer ID from the response");
      }
      
      console.log("Farmer registered successfully with ID:", newFarmerId);
      setFarmerId(newFarmerId);
      setFarmerRegistered(true);
      setSuccess(true);
      setActiveStep(1);
    } catch (err) {
      console.error("Registration error:", err);
      setError(err instanceof Error ? err.message : "Farmer registration failed. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // Limit the number of photos
      const maxPhotos = 5;
      const currentCount = cropPhotos.length;
      const filesArray = Array.from(e.target.files).slice(0, maxPhotos - currentCount);
      
      if (filesArray.length === 0) {
        return;
      }
      
      // Preview URLs for the uploaded photos
      const newPreviewUrls = filesArray.map(file => URL.createObjectURL(file));
      
      setCropPhotos(prevPhotos => [...prevPhotos, ...filesArray]);
      setPhotoPreviewUrls(prevUrls => [...prevUrls, ...newPreviewUrls]);
    }
  };

  const handleRemovePhoto = (index: number) => {
    // Release the object URL to avoid memory leaks
    URL.revokeObjectURL(photoPreviewUrls[index]);
    
    setCropPhotos(cropPhotos.filter((_, i) => i !== index));
    setPhotoPreviewUrls(photoPreviewUrls.filter((_, i) => i !== index));
  };

  const handleSubmitCrop = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!isConnected || !signer) {
      setError("Please connect your wallet first");
      return;
    }

    if (!farmerId) {
      setError("Farmer ID not found. Please register first.");
      return;
    }

    // Validate required fields
    const errors: FormErrors = {
      name: !cropData.name,
      price: !cropData.price,
      quantity: !cropData.quantity,
      type: !cropData.type,
    };

    setFormErrors(errors);

    if (errors.name || errors.price || errors.quantity || errors.type) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // IMPORTANT CHANGE: For debugging, try sending JSON first instead of FormData
      // This will help determine if the issue is with FormData processing
      // Create a JSON object with all crop data
      const cropPayload = {
        ...cropData,
        // Make sure numeric fields are properly formatted
        price: parseFloat(cropData.price),
        quantity: parseInt(cropData.quantity, 10),
        moistureContent: cropData.moistureContent ? parseFloat(cropData.moistureContent) : undefined,
      };

      console.log("Submitting crop with JSON payload:", cropPayload);

      // First, submit the crop data as JSON
      const cropJsonResponse = await fetch(`${API_BASE_URL}/farmer/${farmerId}/add-crop`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(cropPayload),
      });

      if (!cropJsonResponse.ok) {
        const errorData = await cropJsonResponse.text();
        let errorMessage: string;
        try {
          const errorJson = JSON.parse(errorData);
          errorMessage = errorJson.error || errorJson.message || "Failed to list crop";
        } catch (e) {
          errorMessage = errorData || "Failed to list crop";
        }
        throw new Error(errorMessage);
      }

      const cropDataRes = await cropJsonResponse.json();
      console.log("Crop added successfully:", cropDataRes);
      
      // If there are photos, upload them in a separate request
      if (cropPhotos.length > 0 && cropDataRes._id) {
        const cropId = cropDataRes._id;
        const photoFormData = new FormData();
        
        // Add photos to FormData
        cropPhotos.forEach((photo, index) => {
          photoFormData.append('cropPhotos', photo, photo.name);
        });

        console.log(`Uploading photos for crop ID: ${cropId}`);

        const photoResponse = await fetch(`${API_BASE_URL}/farmer/${farmerId}/crop/${cropId}/photos`, {
          method: "POST",
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: photoFormData,
        });

        if (!photoResponse.ok) {
          console.warn("Photo upload failed, but crop was created successfully");
        } else {
          const photoData = await photoResponse.json();
          console.log("Photos uploaded successfully:", photoData);
        }
      }

      setSuccess(true);
      
      // Reset form data
      setCropData({
        name: "",
        price: "",
        quantity: "",
        type: "",
        harvestDate: "",
        soilType: "",
        weatherDuringHarvest: "",
        pesticideUsed: "",
        fertilizerUsed: "",
        location: "",
        qualityGrade: "",
        moistureContent: "",
        description: "",
      });
      
      // Clean up photo URLs to prevent memory leaks
      photoPreviewUrls.forEach(url => URL.revokeObjectURL(url));
      setCropPhotos([]);
      setPhotoPreviewUrls([]);

      // Redirect after successful submission with a delay so user can see success message
      setTimeout(() => {
        navigate("/");
      }, 2000);

    } catch (err) {
      console.error("Submit error:", err);
      setError(err instanceof Error ? err.message : "Failed to add crop. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    // Validation for each step before proceeding
    if (activeStep === 0 && !farmerRegistered) {
      setError("Please register as a farmer first");
      return;
    }

    if (activeStep === 1) {
      const errors: FormErrors = {
        name: !cropData.name,
        price: !cropData.price,
        quantity: !cropData.quantity,
        type: !cropData.type,
      };

      setFormErrors(errors);

      if (errors.name || errors.price || errors.quantity || errors.type) {
        setError("Please fill in all required fields before proceeding.");
        return;
      }
      setError(null);
    }

    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError(null);
  };

  const handleInputChange = (field: string, value: string) => {
    setCropData({ ...cropData, [field]: value });
    
    // Clear error for field when user types
    if (formErrors[field]) {
      setFormErrors({ ...formErrors, [field]: false });
      setError(null);
    }
  };

  // Custom placeholder image component that uses a reliable service
  const PlaceholderImage = ({ index }: { index: number }) => {
    // Use a more reliable placeholder service or local placeholders
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#f0f0f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#666",
          fontSize: "12px",
          textAlign: "center",
        }}
      >
        {`Photo ${index + 1}`}
      </div>
    );
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ marginBottom: 2 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              First, you need to register as a farmer to sell your crops on our platform.
            </Typography>
            <TextField
              label="Farmer Name"
              variant="outlined"
              fullWidth
              required
              value={farmerData.name}
              onChange={(e) => setFarmerData({ ...farmerData, name: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Wallet Address"
              variant="outlined"
              fullWidth
              disabled
              value={address || "Please connect your wallet"}
              sx={{ mb: 2 }}
            />
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleRegisterFarmer}
              disabled={loading || !address}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? "Registering..." : "Register as Farmer"}
            </Button>
          </Box>
        );
      case 1:
        return (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Please fill in the basic details about your crop. Fields marked with * are required.
            </Typography>
            <TextField
              label="Crop Name *"
              variant="outlined"
              fullWidth
              required
              value={cropData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              error={formErrors.name}
              helperText={formErrors.name ? "Crop name is required" : ""}
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              <TextField
                label="Price (ETH) *"
                type="number"
                fullWidth
                required
                value={cropData.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                inputProps={{ step: "0.001", min: "0" }}
                error={formErrors.price}
                helperText={formErrors.price ? "Price is required" : ""}
              />
              <TextField
                label="Quantity (kg) *"
                type="number"
                fullWidth
                required
                value={cropData.quantity}
                onChange={(e) => handleInputChange("quantity", e.target.value)}
                inputProps={{ step: "1", min: "1" }}
                error={formErrors.quantity}
                helperText={formErrors.quantity ? "Quantity is required" : ""}
              />
            </Box>
            <TextField
              label="Crop Type *"
              variant="outlined"
              fullWidth
              required
              value={cropData.type}
              onChange={(e) => handleInputChange("type", e.target.value)}
              placeholder="e.g., Wheat, Rice, Corn"
              error={formErrors.type}
              helperText={formErrors.type ? "Crop type is required" : ""}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Description"
              variant="outlined"
              fullWidth
              multiline
              rows={3}
              value={cropData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe your crop's quality and features"
              sx={{ mb: 2 }}
            />
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Additional information helps buyers make informed decisions about your produce.
            </Typography>
            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              <TextField
                label="Harvest Date"
                type="date"
                fullWidth
                value={cropData.harvestDate}
                onChange={(e) => handleInputChange("harvestDate", e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <FormControl fullWidth>
                <InputLabel id="soil-type-label">Soil Type</InputLabel>
                <Select
                  labelId="soil-type-label"
                  value={cropData.soilType}
                  label="Soil Type"
                  onChange={(e) => handleInputChange("soilType", e.target.value as string)}
                >
                  {soilTypes.map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              <FormControl fullWidth>
                <InputLabel id="weather-label">Weather During Harvest</InputLabel>
                <Select
                  labelId="weather-label"
                  value={cropData.weatherDuringHarvest}
                  label="Weather During Harvest"
                  onChange={(e) => handleInputChange("weatherDuringHarvest", e.target.value as string)}
                >
                  {weatherOptions.map((option) => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Location"
                variant="outlined"
                fullWidth
                value={cropData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="e.g., Region, State"
              />
            </Box>
            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              <FormControl fullWidth>
                <InputLabel id="quality-grade-label">Quality Grade</InputLabel>
                <Select
                  labelId="quality-grade-label"
                  value={cropData.qualityGrade}
                  label="Quality Grade"
                  onChange={(e) => handleInputChange("qualityGrade", e.target.value as string)}
                >
                  {qualityGrades.map((grade) => (
                    <MenuItem key={grade} value={grade}>{grade}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Moisture Content (%)"
                type="number"
                fullWidth
                value={cropData.moistureContent}
                onChange={(e) => handleInputChange("moistureContent", e.target.value)}
                inputProps={{ step: "0.1", min: "0", max: "100" }}
              />
            </Box>
            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              <TextField
                label="Pesticide Used"
                variant="outlined"
                fullWidth
                value={cropData.pesticideUsed}
                onChange={(e) => handleInputChange("pesticideUsed", e.target.value)}
                placeholder="e.g., Organic, None, etc."
              />
              <TextField
                label="Fertilizer Used"
                variant="outlined"
                fullWidth
                value={cropData.fertilizerUsed}
                onChange={(e) => handleInputChange("fertilizerUsed", e.target.value)}
                placeholder="e.g., Organic compost, NPK, etc."
              />
            </Box>
          </Box>
        );
      case 3:
        return (
          <Box>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Upload photos of your crop to help buyers see the quality of your produce.
            </Typography>
            
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 2, p: 3, border: "2px dashed #ccc", borderRadius: 2 }}>
              <input
                id="crop-photo-upload"
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoUpload}
                style={{ display: 'none' }}
              />
              <label htmlFor="crop-photo-upload">
                <Button 
                  variant="outlined" 
                  component="span"
                  startIcon={<AddPhotoAlternateIcon />}
                >
                  Add Photos
                </Button>
              </label>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Select up to 5 high-quality images (JPG, PNG)
              </Typography>
            </Box>
            
            {photoPreviewUrls.length > 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Uploaded Photos ({photoPreviewUrls.length})
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {photoPreviewUrls.map((url, index) => (
                    <Box 
                      key={index} 
                      sx={{ 
                        position: "relative",
                        width: 100,
                        height: 100,
                        border: "1px solid #eee",
                        borderRadius: 1,
                        overflow: "hidden"
                      }}
                    >
                      {/* Use error handling for images */}
                      <img 
                        src={url} 
                        alt={`Crop photo ${index + 1}`} 
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e) => {
                          // Fallback if image fails to load
                          const imgElement = e.target as HTMLImageElement;
                          imgElement.style.display = 'none';
                          const parent = imgElement.parentElement;
                          if (parent) {
                            parent.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;background:#f0f0f0;color:#888;font-size:12px;text-align:center;">Photo ${index + 1}</div>`;
                          }
                        }}
                      />
                      <IconButton
                        size="small"
                        sx={{ 
                          position: "absolute", 
                          top: 0, 
                          right: 0, 
                          bgcolor: "rgba(255,255,255,0.7)",
                          "&:hover": { bgcolor: "rgba(255,255,255,0.9)" }
                        }}
                        onClick={() => handleRemovePhoto(index)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        );
      default:
        return "Unknown step";
    }
  };

  return (
    <Container maxWidth="sm" sx={{ marginTop: 4, marginBottom: 4 }}>
      <Paper elevation={3} sx={{ padding: 3 }}>
        <Typography variant="h5" align="center" gutterBottom>
          Sell Your Crop
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ mb: 4, mt: 2 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {/* Important fix: No form element to prevent premature submission */}
        <Box>
          {getStepContent(activeStep)}
          
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          {success && activeStep === 0 && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Registration successful! Please continue to add your crop details.
            </Alert>
          )}
          {success && activeStep === 3 && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Crop added successfully! Redirecting to homepage...
            </Alert>
          )}
          
          <Divider sx={{ my: 3 }} />
          
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              variant="outlined"
            >
              Back
            </Button>
            
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmitCrop}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? "Submitting..." : "Submit Crop"}
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}