import { IStockQuote } from './IStockQuote';

export interface IWatchlistModel {
  watchlistName: string; // if we want to fix this, we need to change the field in the backend as well
  userID: string;
  tickers: WatchlistTicker[];
}

export type MinimalWatchlistTicker = {
  symbol: string;
  alertPrice: number | null; // Changed to allow null values
};

export type CustomTickerData = {
  currentVsAlertPricePercentage: number | null;
  nearHighVsCurrentPercentage: number | null;
  yearHighVsCurrentPercentage: number | null;
  nearLowVsCurrentPercentage: number | null;
  yearLowVsCurrentPercentage: number | null;
  // Add the five year percentage properties
  fiveYearHighVsCurrentPercentage: number | null;
  fiveYearLowVsCurrentPercentage: number | null;
};

// Add timeframe related properties
export interface TimeframeData {
  // 90-day timeframe
  ninetyDayHigh: number | null;
  ninetyDayLow: number | null;

  // 180-day timeframe
  oneEightyDayHigh: number | null;
  oneEightyDayLow: number | null;

  // 3-year timeframe
  threeYearHigh: number | null;
  threeYearLow: number | null;

  // 5-year timeframe (fiveYearHigh and fiveYearLow should be in IStockQuote)
}

export type AlertData = { [symbol: string]: number | null }; // Changed to allow null values

// Update to include the TimeframeData interface
export type WatchlistTicker = MinimalWatchlistTicker & IStockQuote & CustomTickerData & TimeframeData;

export type Watchlists = { [key: string]: WatchlistTicker[] };
