import { getUserID } from '../helper/userID';
import { PatchResult } from '../interfaces/IMongo';
import { IPositionsModel, MinimalPositionsTicker } from '../interfaces/IPositionsModel';
import { BaseApiService } from './ApiService';

export class PositionsApiService extends BaseApiService {
    private static getEndpoint() {
        return `${this.baseEndpoint}/positions`;
    }

    private static async addUserIdToEndpoint(endpoint: string): Promise<string> {
        try {
            const userID = await getUserID();
            return `${endpoint}?userId=${userID}`;
        } catch (error) {
            console.error("Error retrieving user ID:", error);
            throw new Error("User ID could not be retrieved.");
        }
    }

    public static async fetchPurchasedStocksByUserId(): Promise<IPositionsModel[]> {
        try {
            const endpoint = await this.addUserIdToEndpoint(this.getEndpoint());
            const response = await super.fetchData<IPositionsModel[]>(endpoint);
            console.log(response);
            return response || [];
        } catch (error) {
            console.error("Error fetching purchased stocks:", error);
            return [];
        }
    }

    public static async addStockToPurchasedStocks(ticker: MinimalPositionsTicker): Promise<string | null> {
        try {
            const endpoint = await this.addUserIdToEndpoint(this.getEndpoint());
            const response = await super.postData<string>(endpoint, ticker);
            return response;
        } catch (error) {
            console.error("Error adding stock to purchased stocks:", error);
            return null;
        }
    }

    public static async deleteStocksInWatchlist(tickerSymbols: string[]): Promise<PatchResult | null> {
        try {
            console.log(tickerSymbols);
            const endpoint = await this.addUserIdToEndpoint(this.getEndpoint());
            const response = await super.patchData<PatchResult>(endpoint, tickerSymbols);
            return response;
        } catch (error) {
            console.error("Error deleting stocks in watchlist:", error);
            return null;
        }
    }
}
