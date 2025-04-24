import { IStockQuote } from './IStockQuote';

export interface IWatchlistModel {
  watchlistName: string; // if we want to fix this, we need to change the field in the backend as well
  userID: string;
  tickers: WatchlistTicker[];
}

export type MinimalWatchlistTicker = {
  symbol: string;
  alertPrice: number; // Changed to allow null values
};

export type CustomTickerData = {
  currentVsAlertPricePercentage: number;
  nearHighVsCurrentPercentage: number;
  yearHighVsCurrentPercentage: number;
  nearLowVsCurrentPercentage: number;
  yearLowVsCurrentPercentage: number;
  // Add the five year percentage properties
  fiveYearHighVsCurrentPercentage: number;
  fiveYearLowVsCurrentPercentage: number;
};

// Add timeframe related properties
export interface TimeframeData {
  // 90-day timeframe
  ninetyDayHigh: number;
  ninetyDayLow: number;

  // 180-day timeframe
  oneEightyDayHigh: number;
  oneEightyDayLow: number;

  // 3-year timeframe
  threeYearHigh: number;
  threeYearLow: number;

  // 5-year timeframe (fiveYearHigh and fiveYearLow should be in IStockQuote)
  fiveYearHigh: number;
  fiveYearLow: number;
}

export type AlertData = { [symbol: string]: number }; // Changed to allow null values

// Update to include the TimeframeData interface
export type WatchlistTicker = MinimalWatchlistTicker & IStockQuote & CustomTickerData & TimeframeData;

export type Watchlists = { [key: string]: WatchlistTicker[] };
