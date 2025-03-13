import CloseIcon from "@mui/icons-material/Close";
import { Alert, Box, IconButton, Paper, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { getUserID } from "../../helper/userID";
import { WatchlistApiService } from "../../services/WatchlistApiService";

interface StockData {
  name: string;
  symbol: string;
  alertPrice: number;
  price: number;
  currentVsAlertPricePercentage: number;
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<{ watchlistName: string; stock: StockData }[]>([]);

  const queryWatchLists = async (threshold: number = 20) => {
    try {
      const userID: string = await getUserID();
      const wls = await WatchlistApiService.fetchWatchlistsByUserId(userID);

      let tempNotifications: { watchlistName: string; stock: StockData }[] = [];

      if (Array.isArray(wls)) {
        wls.forEach((wl) => {
          wl.tickers.forEach((stock: StockData) => {
            if (Math.abs(stock.currentVsAlertPricePercentage) <= threshold) {
              tempNotifications.push({ watchlistName: wl.watchlistName, stock });
            }
          });
        });
      }

      setNotifications(tempNotifications);
    } catch (error) {
      console.error("Error fetching watchlist notifications:", error);
    }
  };

  useEffect(() => {
    queryWatchLists();
  }, []);

  const handleClose = (index: number) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Box sx={{ maxWidth: "600px", mx: "auto", mt: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 600, color: "var(--primary-blue)", mb: 2 }}>
        Stock Alerts
      </Typography>

      {notifications.length > 0 ? (
        notifications.map(({ watchlistName, stock }, index) => (
          <Paper 
            key={index}
            sx={{
              mb: 2,
              p: 1.5,
              borderRadius: "8px",
              backgroundColor: "var(--background-light)",
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%"
            }}
          >
            <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}>
              <Alert
                severity="info"
                icon={false}
                sx={{
                  flexGrow: 1,
                  fontWeight: 500,
                  color: "var(--primary-blue)",
                  backgroundColor: "transparent",
                  padding: "0",
                  "& .MuiAlert-message": { width: "100%" }
                }}
              >
                <strong>{stock.symbol}</strong> in <strong>{watchlistName} </strong>  
                is near its alert price of <strong>${stock.alertPrice} </strong>   
                Current Price: <strong>${stock.price}</strong>
              </Alert>
            </Box>

            <IconButton size="small" onClick={() => handleClose(index)} sx={{ ml: 2, color: "var(--secondary-blue)" }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Paper>
        ))
      ) : (
        <Typography sx={{ textAlign: "center", color: "var(--secondary-blue)" }}>
          No stocks near alert prices.
        </Typography>
      )}
    </Box>
  );
};

export default Notifications;
