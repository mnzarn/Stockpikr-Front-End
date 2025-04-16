import { IStockQuote } from './IStockQuote';

export interface IWatchlistModel {
  watchlistName: string; // if we want to fix this, we need to change the field in the backend as well
  userID: string;
  tickers: WatchlistTicker[];
}

export type MinimalWatchlistTicker = {
  symbol: string;
  alertPrice?: number;
};

export type CustomTickerData = {
  currentVsAlertPricePercentage: number;
  nearHighVsCurrentPercentage: number;
  yearHighVsCurrentPercentage: number;
  nearLowVsCurrentPercentage: number;
  yearLowVsCurrentPercentage: number;
  fiveYearLowVsCurrentPercentage: number;
  fiveYearHighVsCurrentPercentage: number;
  fiveYearLow: number;
  fiveYearHigh: number;
};

export type AlertData = { [symbol: string]: number | undefined };

export type WatchlistTicker = MinimalWatchlistTicker & IStockQuote & CustomTickerData;

export type Watchlists = { [key: string]: WatchlistTicker[] };
