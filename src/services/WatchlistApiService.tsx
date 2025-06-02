import { getUserID } from '../helper/userID';
import { DeleteResult, PatchResult } from '../interfaces/IMongo';
import { IWatchlistModel, MinimalWatchlistTicker } from '../interfaces/IWatchlistModel';
import { BaseApiService } from './ApiService';

export class WatchlistApiService extends BaseApiService {
  protected static endpoint = `${this.baseEndpoint}/watchlists`;
  //----------------------------------------------------------------//
  //                           Public
  //----------------------------------------------------------------//

  public static async fetchWatchlists(): Promise<IWatchlistModel[]> {
    // TODO: add pagination
    // const searchQueryLimit = 10;
    const response = await super.fetchData<IWatchlistModel[]>(this.baseEndpoint);
    if (response) {
      window.location.reload();
      return response;
    }
    return [];
  }

  private static async addUserIdToEndpoint(endpoint: string): Promise<string> {
    try {
      const userID = await getUserID(); // Get the current user ID
      return `${endpoint}?userId=${userID}`;
    } catch (error) {
      console.error("Error retrieving user ID:", error);
      throw new Error("User ID could not be retrieved.");
    }
  }

  public static async fetchWatchlistsByUserId(userId: string): Promise<IWatchlistModel[]> {
    try {
      // Directly using the userId passed as a parameter
      const endpoint = `${this.endpoint}/user/${userId}`;
      const response = await super.fetchData<IWatchlistModel[]>(endpoint);
      return response || [];
    } catch (error) {
      console.error("Error fetching watchlists by user ID:", error);
      return [];
    }
}

  public static async fetchWatchlist(watchlistName: string): Promise<IWatchlistModel | null> {
    try {
      const endpoint = await this.addUserIdToEndpoint(`${this.endpoint}/${watchlistName}`);
      return await super.fetchData<IWatchlistModel>(endpoint);
    } catch (error) {
      console.error("Error fetching watchlist:", error);
      return null;
    }
  }

  public static async createWatchlist(wl: IWatchlistModel): Promise<string | null> {
    try {
      const endpoint = await this.addUserIdToEndpoint(this.endpoint);
      return await super.postData<string>(endpoint, wl);
    } catch (error) {
      console.error("Error creating watchlist:", error);
      return null;
    }
  }

  public static async addStockToWatchlist(
    ticker: MinimalWatchlistTicker,
    watchlistID: string
  ): Promise<string | null> {
    try {
      const endpoint = await this.addUserIdToEndpoint(`${this.endpoint}/watchlist/${watchlistID}`);
      return await super.putData<string>(endpoint, ticker);
    } catch (error) {
      console.error("Error adding stock to watchlist:", error);
      return null;
    }
  }

  public static async editStockAlertPrices(
    tickers: MinimalWatchlistTicker[],
    watchlistID: string
  ): Promise<string | null> {
    try {
      const endpoint = await this.addUserIdToEndpoint(`${this.endpoint}/${watchlistID}`);
      return await super.putData<string>(endpoint, tickers);
    } catch (error) {
      console.error("Error editing stock alert prices:", error);
      return null;
    }
  }

  public static async deleteWatchlist(watchlistName: string): Promise<DeleteResult | null> {
    try {
      const endpoint = await this.addUserIdToEndpoint(`${this.endpoint}/${watchlistName}`);
      return await super.deleteData<DeleteResult>(endpoint);
    } catch (error) {
      console.error("Error deleting watchlist:", error);
      return null;
    }
  }

  public static async deleteStocksInWatchlist(
    watchlistName: string,
    tickerSymbols: string[]
  ): Promise<PatchResult | null> {
    try {
      const endpoint = await this.addUserIdToEndpoint(`${this.endpoint}/tickers/${watchlistName}`);
      return await super.patchData<PatchResult>(endpoint, tickerSymbols);
    } catch (error) {
      console.error("Error deleting stocks in watchlist:", error);
      return null;
    }
  }
}
