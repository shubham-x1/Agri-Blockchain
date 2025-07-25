import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Button,
  Stack,
  Divider,
  Paper,
  Avatar,
  Tooltip
} from "@mui/material";
import {
  Grass as GrassIcon,
  AttachMoney as AttachMoneyIcon,
  Inventory as InventoryIcon,
  CalendarToday as CalendarTodayIcon,
  LocationOn as LocationIcon,
  WbSunny as WeatherIcon,
  BugReport as PesticideIcon,
  Spa as FertilizerIcon,
  Star as QualityIcon,
  Opacity as MoistureIcon,
  Verified as BlockchainIcon,
  Person as FarmerIcon
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";


// Types
interface Crop {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  type: string;
  harvestDate: string;
  soilType: string;
  listedOnBlockchain: boolean;
  photos: string[];
  farmer: {
    name: string;
    location: string;
  };
  weatherDuringHarvest: string;
  pesticideUsed: string;
  fertilizerUsed: string;
  qualityGrade: string;
  moistureContent: number;
  blockchainId?: number; 
}

const FarmerDashboard: React.FC = () => {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);

  const dummyCrops: Crop[] = [
    {
      _id: "dummy1",
      name: "Wheat",
      price: 20,
      quantity: 100,
      type: "Cereal",
      harvestDate: "2025-05-10",
      soilType: "Loamy",
      listedOnBlockchain: true,
      photos: ["https://via.placeholder.com/150"],
      farmer: { name: "John Doe", location: "Location A" },
      weatherDuringHarvest: "Sunny",
      pesticideUsed: "None",
      fertilizerUsed: "Organic",
      qualityGrade: "A",
      moistureContent: 12,
    },
    {
      _id: "dummy2",
      name: "Rice",
      price: 25,
      quantity: 80,
      type: "Cereal",
      harvestDate: "2025-06-15",
      soilType: "Clay",
      listedOnBlockchain: false,
      photos: ["https://via.placeholder.com/150"],
      farmer: { name: "Jane Smith", location: "Location B" },
      weatherDuringHarvest: "Rainy",
      pesticideUsed: "Pesticide A",
      fertilizerUsed: "Chemical",
      qualityGrade: "B",
      moistureContent: 15,
    },
  ];

  useEffect(() => {
  
        const fetchCrops = async () => {
          try {
            const response = await fetch('http://localhost:5000/api/crop/');
            const data = await response.json();
        
            const mappedCrops = data.map((cropFromMongo: any) => ({
              ...cropFromMongo,
              id: cropFromMongo.blockchainId,   // 🔥 IMPORTANT
            }));
        
            setCrops(mappedCrops);  // assuming you have setCrops
          } catch (error) {
            console.error('Error fetching crops:', error);
          }
        };
        
    
    fetchCrops();
  }, []);

  const navigate = useNavigate();

  const handleBuyCrop = (crop: Crop) => {
    const mappedCrop = {
      ...crop,
      id: crop.blockchainId,
    };
    navigate("/history", { state: { crop } });
  };
  

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Box p={3}>
      <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: "#f7f9fc" }}>
        <Typography variant="h4" fontWeight="bold" color="primary">
          Farmer Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Browse and purchase available crops directly from farmers
        </Typography>
      </Paper>

      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 3,
        justifyContent: { xs: 'center', sm: 'flex-start' }
      }}>
        {crops.map((crop) => (
          <Card key={crop._id} sx={{ 
            width: { xs: '100%', sm: 'calc(50% - 16px)', md: 'calc(33.33% - 16px)' },
            maxWidth: '450px',
            display: 'flex', 
            flexDirection: 'column',
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            transition: 'transform 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 6px 16px rgba(0,0,0,0.15)'
            }
          }}>
            <Box sx={{ position: 'relative', pt: '56.25%' }}>
              {crop.photos.length > 0 ? (
                <img
                  src={crop.photos[0]}
                  alt={crop.name}
                  style={{ 
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <Box 
                  sx={{ 
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'grey.200'
                  }}
                >
                  <Typography variant="subtitle1" color="text.secondary">No Image</Typography>
                </Box>
              )}
              <Box sx={{ 
                position: 'absolute', 
                top: 10, 
                right: 10,
                bgcolor: crop.listedOnBlockchain ? 'success.main' : 'error.main',
                color: 'white',
                borderRadius: '16px',
                px: 1.5,
                py: 0.5,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5
              }}>
                <BlockchainIcon fontSize="small" />
                <Typography variant="caption" fontWeight="bold">
                  {crop.listedOnBlockchain ? "Blockchain Verified" : "Not Verified"}
                </Typography>
              </Box>
            </Box>
            
            <CardContent sx={{ flex: 1, p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="h5" fontWeight="bold">{crop.name}</Typography>
                <Typography variant="h6" color="primary" fontWeight="bold">₹{crop.price}/kg</Typography>
              </Box>
              
              <Stack direction="row" spacing={1} flexWrap="wrap" gap={1} mb={2}>
                <Chip 
                  icon={<GrassIcon fontSize="small" />} 
                  label={crop.type}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
                <Chip 
                  icon={<InventoryIcon fontSize="small" />} 
                  label={`${crop.quantity} kg`}
                  size="small"
                  color="secondary"
                  variant="outlined"
                />
                <Chip 
                  icon={<QualityIcon fontSize="small" />} 
                  label={`Grade ${crop.qualityGrade}`}
                  size="small"
                  color={crop.qualityGrade === 'A' ? 'success' : 'warning'}
                  variant="outlined"
                />
              </Stack>

              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.light', mr: 1.5 }}>
                  <FarmerIcon />
                </Avatar>
                <Box>
                  <Typography variant="subtitle2">{crop.farmer.name}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocationIcon fontSize="inherit" sx={{ mr: 0.5 }} />
                    {crop.farmer.location}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                <Box sx={{ width: '50%', mb: 1 }}>
                  <Tooltip title="Harvest Date" arrow>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarTodayIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      {formatDate(crop.harvestDate)}
                    </Typography>
                  </Tooltip>
                </Box>
                <Box sx={{ width: '50%', mb: 1 }}>
                  <Tooltip title="Weather During Harvest" arrow>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                      <WeatherIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      {crop.weatherDuringHarvest}
                    </Typography>
                  </Tooltip>
                </Box>
                <Box sx={{ width: '50%', mb: 1 }}>
                  <Tooltip title="Soil Type" arrow>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                      <GrassIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      {crop.soilType}
                    </Typography>
                  </Tooltip>
                </Box>
                <Box sx={{ width: '50%', mb: 1 }}>
                  <Tooltip title="Moisture Content" arrow>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                      <MoistureIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      {crop.moistureContent}%
                    </Typography>
                  </Tooltip>
                </Box>
                <Box sx={{ width: '50%', mb: 1 }}>
                  <Tooltip title="Pesticide Used" arrow>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                      <PesticideIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      {crop.pesticideUsed}
                    </Typography>
                  </Tooltip>
                </Box>
                <Box sx={{ width: '50%', mb: 1 }}>
                  <Tooltip title="Fertilizer Used" arrow>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                      <FertilizerIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      {crop.fertilizerUsed}
                    </Typography>
                  </Tooltip>
                </Box>
              </Box>
            </CardContent>
            
            <Box sx={{ p: 2, pt: 0 }}>
              <Button 
                onClick={() => handleBuyCrop(crop)} 
                variant="contained" 
                fullWidth
                size="large"
                sx={{ 
                  borderRadius: 2,
                  py: 1.2,
                  textTransform: 'none',
                  fontWeight: 'bold',
                }}
              >
                Buy This Crop
              </Button>
            </Box>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default FarmerDashboard;