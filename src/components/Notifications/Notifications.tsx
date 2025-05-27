import CloseIcon from "@mui/icons-material/Close";
import { Alert, Box, IconButton, Paper, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { useNotificationContext } from "./NotificationsContext";

const Notifications = () => {
  const {
    exactNotifications,
    nearNotifications,
    urgentNotifications,
    setExactNotifications,
    setNearNotifications,
    setUrgentNotifications,
    setNotificationCount,
    loading,
    toggle,
  } = useNotificationContext();
  
  const handleClose = (
    type: "exact" | "near" | "urgent",
    index: number
  ) => {
    if (type === "exact") {
      const updated = exactNotifications.filter((_, i) => i !== index);
      setExactNotifications(updated);
      setNotificationCount(updated.length + nearNotifications.length + urgentNotifications.length);
    } else if (type === "near") {
      const updated = nearNotifications.filter((_, i) => i !== index);
      setNearNotifications(updated);
      setNotificationCount(updated.length + exactNotifications.length + urgentNotifications.length);
    } else {
      const updated = urgentNotifications.filter((_, i) => i !== index);
      setUrgentNotifications(updated);
      setNotificationCount(updated.length + exactNotifications.length + nearNotifications.length);
    }
  };  

  const renderNotification = (
    type: "exact" | "near" | "urgent",
    notifications: typeof exactNotifications
  ) =>
    notifications.map(({ watchlistName, stock }, index) => (
      <Link
        to={`/watchlist?wl=${encodeURIComponent(watchlistName)}&highlight=${stock.symbol}`}
        style={{ textDecoration: "none", color: "inherit" }}
        key={`${type}-${index}`}
      >
        <Paper
          sx={{
            mb: 2,
            p: 1.5,
            borderRadius: "8px",
            backgroundColor: "var(--background-light)",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "fit-content", 
            padding: "20px", 
            paddingLeft: "25px", 
            cursor: "pointer",
            mx: "auto", 
          }}
        >
          <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}>
            <Alert
              severity={type === "exact" ? "success" : "info"}
              icon={false}
              sx={{
                flexGrow: 1,
                fontWeight: 500,
                color: "var(--primary-blue)",
                backgroundColor: "transparent",
                padding: "0",
                "& .MuiAlert-message": { width: "100%" },
              }}
            >
              <strong>
                <Link 
                  to={`/quote?symbol=${stock.symbol}`} 
                  style={{ textDecoration: "underline", color: "inherit" }}
                >
                  {stock.symbol}
                </Link>
              </strong> in <strong>{watchlistName} </strong>
              {type === "exact" ? "hit" : "is near"} its alert price of 
              <br />
              <strong>${stock.alertPrice.toFixed(2)} </strong>  
              Current Price: <strong>${stock.price.toFixed(2)}</strong>
            </Alert>
          </Box>
          <IconButton
            size="small"
            onClick={(e) => {
            e.preventDefault(); // Prevent navigation when the close button is clicked
            handleClose(type, index);
          }}
            sx={{ ml: 2, color: "var(--secondary-blue)", marginLeft: "10px" }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Paper>
      </Link>
    ));

  return (
    <Box sx={{ maxWidth: "1200px", mx: "auto", mt: 3 }}>
      <Typography
        variant="h5"
        sx={{ fontWeight: 600, color: "var(--primary-blue)", mb: 2, textAlign: "center" }}
      >
        Stock Alerts
      </Typography>
  
      {loading ? (
        <Typography sx={{ textAlign: "center", color: "gray" }}>
          Loading notifications...
        </Typography>
      ) :
      toggle ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 4,
          }}
        >
          {/* Exact Matches Column */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ mb: 1, color: "green" }}>
              🔔 Exact Matches
            </Typography>
            {exactNotifications.length > 0 ? (
              renderNotification("exact", exactNotifications)
            ) : (
              <Typography sx={{ color: "gray" }}>
                No exact matches.
              </Typography>
            )}
          </Box>
  
          {/* Near Matches Column */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ mb: 1, color: "orange" }}>
              ⚠️ Near Matches (within 5%)
            </Typography>
            {nearNotifications.length > 0 ? (
              renderNotification("near", nearNotifications)
            ) : (
              <Typography sx={{ color: "gray" }}>
                No near matches.
              </Typography>
            )}
          </Box>

          {/* Urgent Matches Column */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ mb: 1, color: "red" }}>
              🚨 Urgent Matches (more than 5% away)
            </Typography>
            {urgentNotifications.length > 0 ? (
              renderNotification("urgent", urgentNotifications)
            ) : (
              <Typography sx={{ color: "gray" }}>
                No urgent matches.
              </Typography>
            )}
          </Box>
        </Box>        
      ) : (
        <Typography sx={{ textAlign: "center", color: "gray" }}>
          Notifications are disabled. Please enable them in settings.
        </Typography>
      )}
    </Box>
  );    
};

export default Notifications;
