import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import Bottleneck from 'bottleneck';
import { getAuth } from "firebase/auth";

export class BaseApiService {
  //----------------------------------------------------------------//
  //                           Properties
  //----------------------------------------------------------------//

  protected static readonly baseEndpoint = '/api';
  private static _apiService: AxiosInstance | null = null;

  public static get apiService(): AxiosInstance {
    if (BaseApiService._apiService == null) {
      BaseApiService._apiService = axios.create({
        baseURL: 'https://40.78.98.127:5000',
        // baseURL: process.env.REACT_APP_BACKEND_URL || '',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        }
      });

      // Add a request interceptor to include the Firebase token
      BaseApiService._apiService.interceptors.request.use(async (config) => {
        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
          const token = await user.getIdToken();
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      }, (error) => {
        return Promise.reject(error);
      });
    }

    return BaseApiService._apiService;
  }
  private static limiter = new Bottleneck({
    maxConcurrent: 1, // Maximum number of requests to make concurrently
    minTime: 1000 // Minimum time to wait between each request (in milliseconds)
  });

  //----------------------------------------------------------------//
  //                           Protected
  //----------------------------------------------------------------//

  protected static async fetchData<T>(url: string): Promise<T | null> {
    try {
      // I think we only need to limiter here for now to limit FMP fetch
      const response: AxiosResponse = await BaseApiService.limiter.schedule(() =>
        BaseApiService.apiService.get<T>(url)
      );
      const data = response.data;
      if (typeof data === 'object' && data != null && 'Error Message' in data) {
        const error = data['Error Message'] as string;
        throw new Error(error);
      }
      return data;
    } catch (error) {
      if (error instanceof AxiosError && error.response != null) {
        throw new Error(BaseApiService.getErrorMessage(error));
      } else {
        throw error;
      }
    }
  }

  protected static async postData<T>(url: string, data: unknown): Promise<T | null> {
    try {
      const response = await BaseApiService.apiService.post<T>(url, data);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response != null) {
        throw new Error(BaseApiService.getErrorMessage(error));
      } else {
        throw error;
      }
    }
  }

  protected static async putData<T>(url: string, data: any): Promise<T | null> {
    try {
      const response = await BaseApiService.apiService.put<T>(url, data);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response != null) {
        throw new Error(BaseApiService.getErrorMessage(error));
      } else {
        throw error;
      }
    }
  }

  protected static async deleteData<T>(url: string): Promise<T | null> {
    try {
      const response = await BaseApiService.apiService.delete<T>(url);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response != null) {
        throw JSON.stringify(error.response.data);
      }
    }
    return null;
  }

  protected static async patchData<T>(url: string, data: any): Promise<T | null> {
    try {
      const response = await BaseApiService.apiService.patch<T>(url, data);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response != null) {
        console.error('Error patching data:', error.response.data);
        throw new Error(BaseApiService.getErrorMessage(error));
      } else throw error;
    }
  }

  //----------------------------------------------------------------//
  //                           Private
  //----------------------------------------------------------------//

  private static getErrorMessage(error: AxiosError): string {
    return error.code + ': ' + error.message;
  }
}
