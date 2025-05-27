import CloseIcon from "@mui/icons-material/Close";
import { Alert, Box, IconButton, Slide } from "@mui/material";
import { useEffect, useState } from "react";
import { useNotificationContext } from "./NotificationsContext";

const getDismissedToday = (): string[] => {
  const today = new Date().toDateString();
  const stored = JSON.parse(localStorage.getItem("dismissedExactAlerts") || "{}");
  return stored[today] || [];
};

const dismissForToday = (symbol: string) => {
  const today = new Date().toDateString();
  const stored = JSON.parse(localStorage.getItem("dismissedExactAlerts") || "{}");

  if (!stored[today]) stored[today] = [];
  if (!stored[today].includes(symbol)) stored[today].push(symbol);

  localStorage.setItem("dismissedExactAlerts", JSON.stringify(stored));
};

const DailyPopup = () => {
  const { exactNotifications } = useNotificationContext();
  const [dismissedSymbols, setDismissedSymbols] = useState<string[]>([]);

  useEffect(() => {
    setDismissedSymbols(getDismissedToday());
  }, []);

  const handleDismiss = (symbol: string) => {
    dismissForToday(symbol);
    setDismissedSymbols((prev) => [...prev, symbol]);
  };

  const remainingNotifications = exactNotifications.filter(
    (n) => !dismissedSymbols.includes(n.stock.symbol)
  ).slice(0, 3); // show max 3 notifications

  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];

    remainingNotifications.forEach((notif, index) => {
      const timeout = setTimeout(() => {
        handleDismiss(notif.stock.symbol);
      }, 6000 + index * 300);
      timeouts.push(timeout);
    });

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [remainingNotifications]);

  if (remainingNotifications.length === 0) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        top: 80,
        right: 20,
        zIndex: 1400,
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      {remainingNotifications.map((notif) => (
        <Slide
          key={notif.stock.symbol}
          direction="left"
          in={true}
          mountOnEnter
          unmountOnExit
        >
          <Box sx={{ width: 300 }}>
            <Alert
              severity="success"
              variant="filled"
              action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={() => handleDismiss(notif.stock.symbol)}
                >
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              }
            >
              <strong>{notif.stock.symbol}</strong> in{" "}
              <strong>{notif.watchlistName}</strong> hit its alert at $
              {notif.stock.alertPrice.toFixed(2)}!
            </Alert>
          </Box>
        </Slide>
      ))}
    </Box>
  );
};

export default DailyPopup;
