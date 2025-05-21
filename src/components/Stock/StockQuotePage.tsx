import { CheckCircle } from '@mui/icons-material';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import { Button, Container, ToggleButton, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FundamentalData, MiniChart, SymbolInfo, TechnicalAnalysis, Timeline } from 'react-ts-tradingview-widgets';
import { getErrorResponse } from '../../helper/errorResponse';
import { getUserID } from '../../helper/userID';
import { ICompanyProfile } from '../../interfaces/ICompanyProfile';
import { IStockQuote } from '../../interfaces/IStockQuote';
import { Watchlists } from '../../interfaces/IWatchlistModel';
import { WatchlistApiService } from '../../services/WatchlistApiService';
import AddStockDialog from '../Watchlist/AddStockDialog';
import TradingViewChart from './Components/TradingViewChart';

interface StockQuotePageStates {
  isInWatchList: boolean;
  watchlists: Watchlists;
  symbolParam: string | null;
}

var initialState: StockQuotePageStates = {
  isInWatchList: false,
  watchlists: {},
  symbolParam: null
};

export const StockQuotePage: React.FC = () => {
  const [colorTheme, setColorTheme] = useState<'light' | 'dark'>('light');
  const [quote, setQuote] = useState<IStockQuote | null>(null);
  const [companyProfile, setCompanyProfile] = useState<ICompanyProfile | null>(null);
  const [isAddStockDialog, setAddStockDialog] = useState(false);
  const [stockQuotePageState, setStockQuotePageState] = useState<StockQuotePageStates>(initialState);
  const location = useLocation();

  useEffect(() => {
    const url = window.location.href;
    const hashIndex = url.indexOf('#');
    const hash = hashIndex !== -1 ? url.slice(hashIndex + 1) : '';
    const searchParams = new URLSearchParams(hash);
    const symbolParam = searchParams.get('/quote?symbol');

    try {
      queryWatchLists(symbolParam);
    } catch (error) {
      setStockQuotePageState({ ...stockQuotePageState, symbolParam });
    }

    if (!stockQuotePageState.symbolParam) {
      return;
    }
    //might need later
    // const fetchQuoteData = async () => { ... };
    // const fetchCompanyProfile = async () => { ... };
  }, [location]);

  const queryWatchLists = async (symbolParam: string | null) => {
    const userID: string = await getUserID();
    const wls = await WatchlistApiService.fetchWatchlistsByUserId(userID);
    var inWatchList = false;
    if (Array.isArray(wls)) {
      let tempWls: Watchlists = {};
      wls.forEach((wl) => {
        if (!tempWls[wl.watchlistName]) {
          tempWls[wl.watchlistName] = [];
        }
        tempWls[wl.watchlistName] = wl.tickers;
        if (wl.tickers.some((ticker) => ticker.symbol.toUpperCase() === symbolParam?.toUpperCase())) {
          inWatchList = true;
        }
      });
      setStockQuotePageState({ isInWatchList: inWatchList, watchlists: tempWls, symbolParam: symbolParam });
    }
  };

  const handleAddToWatchlist = () => {
    setAddStockDialog(true);
  };

  const toggleTheme = () => {
    setColorTheme(colorTheme === 'light' ? 'dark' : 'light');
  };

  const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: colorTheme === 'dark' ? '#333' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary
  }));

  const errorResponse = getErrorResponse(quote || null) || getErrorResponse(companyProfile || null);
  if (errorResponse) {
    return (
      <Typography variant="h6" sx={{ margin: '300px', color: 'black' }}>
        Error: {errorResponse}
      </Typography>
    );
  }

  if (!stockQuotePageState.symbolParam) {
    return <div></div>;
  }

  return (
    <div style={{ backgroundColor: colorTheme === 'dark' ? '#333' : 'white' }}>
      <Container maxWidth="xl">
        <Box sx={{ flexGrow: 1, paddingY: '20px', paddingX: { xs: '6px', sm: '12px', md: '24px' } }}>
          <AddStockDialog
            addStockSymbol={stockQuotePageState.symbolParam}
            watchlists={stockQuotePageState.watchlists}
            setWatchlists={(wl) => {
              var keys = Object.keys(wl);
              setStockQuotePageState({
                ...stockQuotePageState,
                watchlists: wl,
                isInWatchList: keys.some((key) =>
                  wl[key].some((ti) => ti.symbol.toUpperCase() === stockQuotePageState.symbolParam?.toUpperCase())
                )
              });
            }}
            isAddStockDialog={isAddStockDialog}
            setAddStockDialog={setAddStockDialog}
          />
          <Grid container spacing={2}>
            <Grid xs={6} display="flex" justifyContent="left" alignItems="left">
              <Item elevation={0}>
                <ToggleButton
                  value="check"
                  selected={colorTheme === 'dark'}
                  onChange={toggleTheme}
                  color={colorTheme === 'dark' ? 'primary' : 'secondary'}
                >
                  Toggle Theme
                </ToggleButton>
              </Item>
            </Grid>
            <Grid xs={6} display="flex" justifyContent="right" alignItems="right">
              {Object.keys(stockQuotePageState.watchlists).length > 0 && (
                <Item elevation={0}>
                  <Button
                    sx={{
                      backgroundColor: stockQuotePageState.isInWatchList
                        ? 'var(--secondary-button-bg-color)'
                        : 'var(--navbar-bg-color)'
                    }}
                    component="label"
                    variant="contained"
                    onClick={handleAddToWatchlist}
                    size="large"
                    startIcon={stockQuotePageState.isInWatchList ? <CheckCircle /> : <AddCircleOutlineOutlinedIcon />}
                  >
                    {stockQuotePageState.isInWatchList ? 'Added' : 'Add To Watchlist'}
                  </Button>
                </Item>
              )}
            </Grid>
            <Grid xs={7}>
              <Item elevation={0}>
                <SymbolInfo symbol={stockQuotePageState.symbolParam} colorTheme={colorTheme} autosize></SymbolInfo>
                <MiniChart
                  colorTheme={colorTheme}
                  width="100%"
                  symbol={stockQuotePageState.symbolParam}
                  autosize
                ></MiniChart>
              </Item>
            </Grid>
            <Grid xs={5}>
              <Item elevation={0}>
                <TechnicalAnalysis
                  colorTheme={colorTheme}
                  symbol={stockQuotePageState.symbolParam || ''}
                  width="100%"
                ></TechnicalAnalysis>
              </Item>
            </Grid>
            <Grid xs={12}>
              <Item elevation={0}>
                <TradingViewChart theme={colorTheme} symbol={stockQuotePageState.symbolParam || ''} />
              </Item>
            </Grid>
            <Grid xs={6}>
              <Item elevation={0}>
                <FundamentalData
                  colorTheme={colorTheme}
                  symbol={stockQuotePageState.symbolParam}
                  height={760}
                  width="100%"
                ></FundamentalData>
              </Item>
            </Grid>
            <Grid xs={6}>
              <Timeline
                colorTheme={colorTheme}
                feedMode="symbol"
                symbol={stockQuotePageState.symbolParam}
                height={760}
                width="100%"
              ></Timeline>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </div>
  );
};
