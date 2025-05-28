export interface IPurchasedStockModel {
  purchasedstocksName: string,
  userID: string;
  tickers: Ticker[];
}

export interface Ticker {
  symbol: string;
  purchasePrice: number;
  quantity: number;
  purchaseDate: Date | null;
  price: number;
  priceChange: number;
  gainOrLoss: number;
  marketValue: number;
  targetSellPrice: number | null;
}
export type PositionMap = { [key: string]: Ticker[] };

export type Positions = { [key: string]: Ticker[] };