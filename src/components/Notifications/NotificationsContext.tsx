import { createContext, useContext, useEffect, useState } from "react";
import { getUserID } from "../../helper/userID";
import { WatchlistTicker } from "../../interfaces/IWatchlistModel";
import { WatchlistApiService } from "../../services/WatchlistApiService";

interface StockData {
  name: string;
  symbol: string;
  alertPrice: number;
  price: number;
  currentVsAlertPricePercentage: number;
}

interface Notification {
  watchlistName: string;
  stock: StockData;
}

interface NotificationContextType {
  exactNotifications: Notification[];
  nearNotifications: Notification[];
  setExactNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  setNearNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  refreshNotifications: () => void;
  notificationCount: number;
  setNotificationCount: React.Dispatch<React.SetStateAction<number>>;
  loading: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [exactNotifications, setExactNotifications] = useState<Notification[]>([]);
  const [nearNotifications, setNearNotifications] = useState<Notification[]>([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const queryWatchLists = async () => {
    try {
      setLoading(true);
      const userID: string = await getUserID();
      const watchlists = await WatchlistApiService.fetchWatchlistsByUserId(userID);

      let exactMatches: Notification[] = [];
      let nearMatches: Notification[] = [];

      if (Array.isArray(watchlists)) {
        watchlists.forEach((wl) => {
          wl.tickers.forEach((stock: WatchlistTicker) => {
            if (stock.alertPrice === undefined) return;
          
            const absPercentage = Math.abs(stock.currentVsAlertPricePercentage);
            const notification: Notification = {
              watchlistName: wl.watchlistName,
              stock: {
                name: stock.name,
                symbol: stock.symbol,
                alertPrice: stock.alertPrice,
                price: stock.price,
                currentVsAlertPricePercentage: stock.currentVsAlertPricePercentage
              }
            };
          
            if (absPercentage < 1) {
              exactMatches.push(notification);
            } else if (absPercentage <= 5) {
              nearMatches.push(notification);
            }
          });          
        });
      }

      setExactNotifications(exactMatches);
      setNearNotifications(nearMatches);
      setNotificationCount(exactMatches.length + nearMatches.length);
    } catch (error) {
      console.error("Error fetching watchlist notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    queryWatchLists();
    const intervalId = setInterval(queryWatchLists, 60000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        exactNotifications,
        nearNotifications,
        setExactNotifications,
        setNearNotifications,
        refreshNotifications: queryWatchLists,
        notificationCount,
        setNotificationCount,
        loading
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};


export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotificationContext must be used within a NotificationProvider");
  }
  return context;
};