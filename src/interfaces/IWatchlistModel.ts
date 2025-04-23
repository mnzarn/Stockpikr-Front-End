import { IStockQuote } from './IStockQuote';

export interface IWatchlistModel {
  watchlistName: string; // if we want to fix this, we need to change the field in the backend as well
  userID: string;
  tickers: WatchlistTicker[];
}

export type MinimalWatchlistTicker = {
  symbol: string;
  alertPrice: number | null;
};

export type CustomTickerData = {
  // Existing percentage fields
  currentVsAlertPricePercentage: number | null;
  nearHighVsCurrentPercentage: number | null;
  yearHighVsCurrentPercentage: number | null;
  nearLowVsCurrentPercentage: number | null;
  yearLowVsCurrentPercentage: number | null;
  fiveYearLowVsCurrentPercentage: number | null;
  fiveYearHighVsCurrentPercentage: number | null;

  // Existing high/low fields
  fiveYearLow: number | null;
  fiveYearHigh: number | null;

  // New timeframe fields
  ninetyDayHigh: number | null;
  ninetyDayLow: number | null;
  oneEightyDayHigh: number | null;
  oneEightyDayLow: number | null;
  threeYearHigh: number | null;
  threeYearLow: number | null;

  // New timeframe percentage fields
  ninetyDayHighVsCurrentPercentage: number | null;
  ninetyDayLowVsCurrentPercentage: number | null;
  oneEightyDayHighVsCurrentPercentage: number | null;
  oneEightyDayLowVsCurrentPercentage: number | null;
  threeYearHighVsCurrentPercentage: number | null;
  threeYearLowVsCurrentPercentage: number | null;
};

export type AlertData = { [symbol: string]: number | null };

export type WatchlistTicker = MinimalWatchlistTicker & IStockQuote & CustomTickerData;

export type Watchlists = { [key: string]: WatchlistTicker[] };
