import { Box, Grid } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { MarketData, TickerTape, Timeline } from 'react-ts-tradingview-widgets';
import { IStockPriceChange } from '../../interfaces/IStockPriceChange';
import { IStockQuote } from '../../interfaces/IStockQuote';
import { StockApiService } from '../../services/StockApiService';
import { useAsyncError } from '../GlobalErrorBoundary';
import StockPriceChangeDataTable from './StockChangeDataTable';

const Dashboard: React.FC = () => {
  const [stockQuote, setStockData] = useState<IStockQuote[]>([]);
  const [gainers, setGainers] = useState<IStockPriceChange[]>([]);
  const [actives, setActives] = useState<IStockPriceChange[]>([]);
  const [losers, setLosers] = useState<IStockPriceChange[]>([]);
  const throwError = useAsyncError();

  useEffect(() => {
    const fetchDataTable = async (): Promise<void> => {
      const blueChipSymbols: string[] = ['AAPL', 'MSFT', 'AMZN', 'GOOGL', 'JNJ', 'PG', 'KO', 'JPM', 'DIS', 'INTC']; // Place holder symbols
      StockApiService.fetchLatestStockQuote(blueChipSymbols).then((response) => {
        if (response.length === 0) {
          return;
        }
        setStockData(response);
      });
    };

    fetchDataTable().catch((error) => {
      throwError(error);
    });

    const fetchGainers = async (): Promise<void> => {
      StockApiService.fetchMarketGainers().then((response) => {
        if (response.length === 0) {
          return;
        }
        setGainers(response);
      });
    };
    fetchGainers().catch((error) => {
      throwError(error);
    });
    const fetchLosers = async (): Promise<void> => {
      StockApiService.fetchMarketLosers().then((response) => {
        if (response.length === 0) {
          return;
        }
        setLosers(response);
      });
    };
    fetchLosers().catch((error) => {
      throwError(error);
    });
    const fetchActives = async (): Promise<void> => {
      StockApiService.fetchMarketActives().then((response) => {
        if (response.length === 0) {
          return;
        }
        setActives(response);
      });
    };
    fetchActives().catch((error) => {
      throwError(error);
    });
  }, []);

  return (
    <Box sx={{ margin: '20px' }}>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <TickerTape></TickerTape>
        </Grid>
        <Grid item xs={6}>
          <MarketData colorTheme="light" width="100%" height="900"></MarketData>
        </Grid>
        <Grid item xs={6}>
          <Timeline feedMode="market" market="stock" height="900" width="100%"></Timeline>
        </Grid>
        <Grid item xs={4}>
          <StockPriceChangeDataTable data={gainers} title="Top Gainers"></StockPriceChangeDataTable>
        </Grid>
        <Grid item xs={4}>
          <StockPriceChangeDataTable data={losers} title="Top Losers"></StockPriceChangeDataTable>
        </Grid>
        <Grid item xs={4}>
          <StockPriceChangeDataTable data={actives} title="Most Active"></StockPriceChangeDataTable>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
