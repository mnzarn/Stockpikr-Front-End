import { ICompanyProfile } from '../interfaces/ICompanyProfile';
import IStockData from '../interfaces/IStockData';
import { IStockPriceChange } from '../interfaces/IStockPriceChange';
import { IStockQuote } from '../interfaces/IStockQuote';
import { BaseApiService } from './ApiService';

export class StockApiService extends BaseApiService {
  protected static endpoint = `${this.baseEndpoint}/stockdata/`;

  //----------------------------------------------------------------//
  //                           Public
  //----------------------------------------------------------------//

  public static async fetchStockSearch(input: string): Promise<IStockData[]> {
    if (input.trim().length === 0) {
      return [];
    }
    // TODO: add pagination
    const searchQueryLimit = 10;
    const url = `${this.endpoint}${input.toUpperCase()}?limit=${searchQueryLimit}`;
    const response = await StockApiService.fetchData<IStockData[]>(url);
    if (response) {
      return response;
    }
    return [];
  }

  public static async fetchDetailedStockSearch(input: string): Promise<IStockQuote[]> {
    if (input.trim().length === 0) {
      return [];
    }
    // TODO: add pagination
    const searchQueryLimit = 10;
    const url = `/api/lateststockinfo/search/${input.toUpperCase()}?limit=${searchQueryLimit}`;
    const response = await StockApiService.fetchData<IStockQuote[]>(url);
    if (response) {
      return response;
    }
    return [];
  }

  public static async fetchDetailedStock(symbol: string): Promise<IStockQuote | null> {
    if (symbol.trim().length === 0) {
      return null;
    }
    const url = `/api/lateststockinfo/quote/${symbol}`;
    return StockApiService.fetchData<IStockQuote>(url);
  }

  public static async fetchCompanyProfile(input: string): Promise<ICompanyProfile[]> {
    if (input.trim().length === 0) {
      return [];
    }
    const url = `${this.endpoint}profile/${input}`;
    const response = await StockApiService.fetchData<ICompanyProfile[]>(url);
    if (response) {
      return response;
    }
    return [];
  }
  public static async fetchLatestStockQuote(input: string[]): Promise<IStockQuote[]> {
    if (input.length === 0) {
      return [];
    }
    const url = `/api/lateststockinfo/quotes/${input}`;
    const response = await StockApiService.fetchData<IStockQuote[]>(url);
    if (response) {
      return response;
    }
    return [];
  }
  public static async fetchMarketGainers(): Promise<IStockPriceChange[]> {
    const url = `${this.endpoint}market/gainers`;
    const response = await StockApiService.fetchData<IStockPriceChange[]>(url);
    if (response) {
      return response;
    }
    return [];
  }
  public static async fetchMarketLosers(): Promise<IStockPriceChange[]> {
    const url = `${this.endpoint}market/losers`;
    const response = await StockApiService.fetchData<IStockPriceChange[]>(url);
    if (response) {
      return response;
    }
    return [];
  }
  public static async fetchMarketActives(): Promise<IStockPriceChange[]> {
    const url = `${this.endpoint}market/actives`;
    const response = await StockApiService.fetchData<IStockPriceChange[]>(url);
    if (response) {
      return response;
    }
    return [];
  }
}
