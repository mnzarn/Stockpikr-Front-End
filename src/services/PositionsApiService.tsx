import { getUserID } from '../helper/userID';
import { DeleteResult, PatchResult } from '../interfaces/IMongo';
import { IPurchasedStockModel, Ticker } from '../interfaces/IPurchasedStockModel';
import { BaseApiService } from './ApiService';

export class PositionsApiService extends BaseApiService {
  private static async addUserIdToEndpoint(endpoint: string): Promise<string> {
    try {
      const userID = await getUserID();
      return `${endpoint}?userId=${userID}`;
    } catch (error) {
      console.error("Error retrieving user ID:", error);
      throw new Error("User ID could not be retrieved.");
    }
  }

  private static basePath = '/api/purchasedstocks';

  static async fetchPurchasedStocksByUserId(): Promise<IPurchasedStockModel[]> {
    try {
      const endpoint = await this.addUserIdToEndpoint(`${this.basePath}/user/${await getUserID()}`);
      return await this.fetchData<IPurchasedStockModel[]>(endpoint) || [];
    } catch (error) {
      console.error("Error fetching purchased stocks:", error);
      return [];
    }
  }

  static async fetchPurchasedStock(name: string): Promise<IPurchasedStockModel | null> {
    try {
      const endpoint = await this.addUserIdToEndpoint(`${this.basePath}/${name}`);
      return await this.fetchData<IPurchasedStockModel>(endpoint);
    } catch (error) {
      console.error("Error fetching purchased stock portfolio:", error);
      return null;
    }
  }

  static async createPurchasedStockPortfolio(name: string, tickers: Ticker[]): Promise<string | null> {
    try {
      const userID = await getUserID();
      const body = {
        purchasedstocksName: name,
        userID,
        tickers
      };
      return await this.postData<string>(this.basePath, body);
    } catch (error) {
      console.error("Error creating purchased stock portfolio:", error);
      return null;
    }
  }

  static async deletePurchasedStock(name: string): Promise<DeleteResult | null> {
    try {
      const endpoint = await this.addUserIdToEndpoint(`${this.basePath}/${name}`);
      return await this.deleteData<DeleteResult>(endpoint);
    } catch (error) {
      console.error("Error deleting purchased stock portfolio:", error);
      return null;
    }
  }

  static async deleteTickersFromPortfolio(name: string, tickerSymbols: string[]): Promise<PatchResult | null> {
    try {
      const endpoint = await this.addUserIdToEndpoint(`${this.basePath}/tickers/${name}`);
      return await this.patchData<PatchResult>(endpoint, tickerSymbols);
    } catch (error) {
      console.error("Error deleting tickers from purchased stock portfolio:", error);
      return null;
    }
  }

  static async updatePurchasedStockTickers(name: string, tickers: Ticker[]): Promise<IPurchasedStockModel | null> {
    try {
      const endpoint = await this.addUserIdToEndpoint(`${this.basePath}/${name}`);
      return await this.putData<IPurchasedStockModel>(endpoint, tickers);
    } catch (error) {
      console.error("Error updating tickers in purchased stock portfolio:", error);
      return null;
    }
  }

  static async addStockToPortfolio(ticker: Ticker): Promise<string | null> {
    try {
      const endpoint = await this.addUserIdToEndpoint(this.basePath);
      return await this.postData<string>(endpoint, ticker);
    } catch (error) {
      console.error("Error adding stock to purchased stocks:", error);
      return null;
    }
  }
}
