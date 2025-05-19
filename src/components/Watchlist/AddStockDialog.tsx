import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  TextField,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { getErrorResponse } from '../../helper/errorResponse';
import { IStockQuote } from '../../interfaces/IStockQuote';
import { MinimalWatchlistTicker, Watchlists } from '../../interfaces/IWatchlistModel';
import { StockApiService } from '../../services/StockApiService';
import { WatchlistApiService } from '../../services/WatchlistApiService';
import { useAsyncError } from '../GlobalErrorBoundary';
import { WatchlistTabSelector } from './WatchlistTabSelector';

// Define the prop types for the component
interface AddStockDialogProps {
  addStockSymbol: string;
  watchlistName?: string;
  isAddStockDialog: boolean;
  setAddStockDialog: (value: boolean) => void;
  watchlists: Watchlists | undefined;
  setWatchlists: (watchlists: Watchlists) => void;
  onClose?: () => void; // Add optional onClose prop
}

const AddStockDialog: React.FC<AddStockDialogProps> = ({
  addStockSymbol,
  watchlists,
  setWatchlists,
  watchlistName,
  isAddStockDialog,
  setAddStockDialog,
  onClose
}) => {
  const [sellPrice, setSellPrice] = useState('');
  const [stockInfo, setStockInfo] = useState<IStockQuote>();
  const [wlKey, setWlKey] = useState('');
  const [sellPriceError, setSellPriceError] = useState('');
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const throwError = useAsyncError();

  // Reset sellPrice when dialog opens with a new stock
  useEffect(() => {
    if (isAddStockDialog) {
      setSellPrice('');
      setSellPriceError('');
    }
  }, [isAddStockDialog, addStockSymbol]);

  // Fetch stock data when symbol changes
  useEffect(() => {
    if (addStockSymbol) {
      fetchStockData(addStockSymbol);
    }
  }, [addStockSymbol]);

  const fetchStockData = async (symbol: string): Promise<void> => {
    try {
      const response = await StockApiService.fetchDetailedStock(symbol);
      if (!response || getErrorResponse(response)) {
        return;
      }
      setStockInfo(response);
    } catch (error) {
      console.error('Error fetching stock data:', error);
    }
  };

  const validateSellPrice = (price: string): boolean => {
    // First clean up the string (allow trailing decimal point for UX)
    const cleanedPrice = price.trim().endsWith('.') ? price.trim() + '0' : price.trim();

    if (!cleanedPrice) {
      setSellPriceError('Sell price cannot be empty');
      return false;
    }

    // More permissive pattern for validation on blur/submit
    // This allows valid currency formats like 1, 1.5, 10.99
    if (!/^[0-9]+(\.[0-9]{0,2})?$/.test(cleanedPrice)) {
      setSellPriceError('Enter a valid price (e.g., 10.99)');
      return false;
    }

    const numValue = parseFloat(cleanedPrice);
    if (numValue <= 0) {
      setSellPriceError('Price must be greater than 0');
      return false;
    }

    setSellPriceError('');
    return true;
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPrice = e.target.value;
    // Allow typing decimals more freely
    // This regex allows input like "10." during typing
    if (newPrice === '' || /^[0-9]*\.?[0-9]*$/.test(newPrice)) {
      setSellPrice(newPrice);
      // Don't validate during typing - wait for blur or submit
    }
  };

  const onCancelAddStockDialog = () => {
    setSellPrice('');
    setSellPriceError('');
    setAddStockDialog(false);
    // Call onClose if provided
    if (onClose) {
      onClose();
    }
  };

  const onConfirmAddStockDialog = async () => {
    try {
      // Validate all inputs
      if (!validateSellPrice(sellPrice)) {
        return;
      }

      if (!addStockSymbol) {
        throw 'Stock symbol cannot be empty';
      }
      if (!watchlists) {
        throw 'Watchlists are empty';
      }
      if (!watchlistName && !wlKey) {
        throw 'Select a watchlist';
      }

      const targetWatchlist = watchlistName ?? wlKey;
      const ticker: MinimalWatchlistTicker = {
        symbol: addStockSymbol,
        alertPrice: parseFloat(sellPrice)
      };

      const searchResult = await StockApiService.fetchDetailedStock(ticker.symbol);
      if (!searchResult) {
        throw `Could not find stock with symbol ${ticker.symbol} in the database!`;
      }

      // Add stock to watchlist
      await WatchlistApiService.addStockToWatchlist(ticker, targetWatchlist);

      // Refresh watchlist data
      const watchlist = await WatchlistApiService.fetchWatchlist(targetWatchlist);
      if (!watchlist) {
        throw `Cannot find the watchlist ${targetWatchlist} data after adding new stocks`;
      }

      // Update state
      watchlists[targetWatchlist] = watchlist.tickers;
      setWatchlists({ ...watchlists });

      // Close dialog
      setAddStockDialog(false);
      // Call onClose if provided
      if (onClose) {
        onClose();
      }
    } catch (error) {
      throwError(error);
    }
  };

  return (
    <Dialog
      open={isAddStockDialog}
      onClose={onCancelAddStockDialog}
      fullScreen={fullScreen}
      PaperProps={{
        sx: {
          borderRadius: '12px',
          maxWidth: '500px',
          width: '100%'
        }
      }}
    >
      <DialogTitle
        sx={{
          fontFamily: 'var(--font-family)',
          color: 'var(--primary-blue)',
          fontWeight: 600,
          pb: 1
        }}
      >
        Add {addStockSymbol} to watchlist
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 3 }}>
        {/* Stock Info Section */}
        <Box sx={{ mb: 3 }}>
          {stockInfo && (
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: 'var(--primary-blue)',
                    fontFamily: 'var(--font-family)'
                  }}
                >
                  {stockInfo.name}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                  <Chip
                    label={stockInfo.exchange}
                    size="small"
                    sx={{
                      mr: 1,
                      backgroundColor: 'var(--background-light)',
                      color: 'var(--secondary-blue)',
                      fontWeight: 500,
                      fontSize: '0.75rem'
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'var(--secondary-blue)',
                      fontFamily: 'var(--font-family)'
                    }}
                  >
                    Current price:{' '}
                    <Box component="span" sx={{ fontWeight: 600 }}>
                      ${stockInfo.price}
                    </Box>
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </Box>

        {/* Watchlist Selection */}
        {!watchlistName && (
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="body1"
              sx={{
                mb: 1,
                fontWeight: 500,
                color: 'var(--primary-blue)',
                fontFamily: 'var(--font-family)'
              }}
            >
              Select watchlist
            </Typography>

            <WatchlistTabSelector
              addStockSymbol={addStockSymbol}
              showDeleteIcon={false}
              watchLists={watchlists!}
              setWatchLists={setWatchlists}
              selectedWatchList={wlKey}
              setSelectedWatchList={setWlKey}
            />
          </Box>
        )}

        {/* Sell Price */}
        <Box>
          <Typography
            variant="body1"
            sx={{
              mb: 1,
              fontWeight: 500,
              color: 'var(--primary-blue)',
              fontFamily: 'var(--font-family)'
            }}
          >
            At what price would you like to sell {addStockSymbol}?
          </Typography>

          <TextField
            error={!!sellPriceError}
            helperText={sellPriceError}
            required
            fullWidth
            id="stock-price"
            label="Sell price"
            type="text"
            variant="outlined"
            value={sellPrice}
            onChange={handlePriceChange}
            onBlur={() => validateSellPrice(sellPrice)}
            InputProps={{
              startAdornment: (
                <Box component="span" sx={{ mr: 0.5 }}>
                  $
                </Box>
              )
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                  borderColor: 'var(--primary-blue)'
                }
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: 'var(--primary-blue)'
              }
            }}
          />
        </Box>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={onCancelAddStockDialog}
          sx={{
            color: 'var(--secondary-blue)',
            textTransform: 'none',
            fontFamily: 'var(--font-family)',
            fontWeight: 500
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={onConfirmAddStockDialog}
          disabled={!addStockSymbol || !sellPrice || (!watchlistName && !wlKey) || !!sellPriceError}
          sx={{
            bgcolor: 'var(--primary-blue)',
            textTransform: 'none',
            fontFamily: 'var(--font-family)',
            fontWeight: 500,
            '&:hover': {
              bgcolor: 'var(--secondary-blue)'
            },
            '&.Mui-disabled': {
              bgcolor: 'rgba(0, 0, 0, 0.12)'
            }
          }}
        >
          Add to Watchlist
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddStockDialog;
