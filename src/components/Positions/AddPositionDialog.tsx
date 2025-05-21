import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputAdornment,
  TextField,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { getErrorResponse } from '../../helper/errorResponse';
import { PositionMap } from '../../interfaces/IPurchasedStockModel';
import { IStockQuote } from '../../interfaces/IStockQuote';
import { PositionsApiService } from '../../services/PositionsApiService';
import { StockApiService } from '../../services/StockApiService';
import { useAsyncError } from '../GlobalErrorBoundary';

interface AddPositionDialogProps {
  addStockSymbol: string;
  isAddStockDialog: boolean;
  setAddStockDialog: (value: boolean) => void;
  positions: Positions;
  setPositions: (positions: Positions) => void;
  // Add a callback to notify parent when stock info is loaded
  onStockInfoLoaded?: (stockInfo: IStockQuote) => void;
}


const AddPositionDialog: React.FC<AddPositionDialogProps> = ({
  addStockSymbol,
  positions,
  setPositions,
  isAddStockDialog,
  setAddStockDialog,
  onStockInfoLoaded
}) => {

  const [addStockPrice, setAddStockPrice] = useState('');
  const [addStockQuantity, setAddStockQuantity] = useState('');
  const [addStockDate, setAddStockDate] = useState<Date | null>(null);
  const [stockInfo, setStockInfo] = useState<IStockQuote>();
  const [priceError, setPriceError] = useState('');
  const [quantityError, setQuantityError] = useState('');
  const [dateError, setDateError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const throwError = useAsyncError();

  const fetchStockData = async (symbol: string): Promise<void> => {
    if (!symbol) return;

    try {
      setIsLoading(true);
      const response = await StockApiService.fetchDetailedStock(symbol);
      setIsLoading(false);

      if (!response || getErrorResponse(response)) {
        return;
      }

      setStockInfo(response);

      // Call the callback to notify parent component that stock info is loaded
      if (onStockInfoLoaded) {
        onStockInfoLoaded(response);
      }

      // Auto-populate current price if available
      if (response.price && !addStockPrice) {
        setAddStockPrice(response.price.toString());
      }
    } catch (error) {
      setIsLoading(false);
      console.error('Error fetching stock data:', error);
    }
  };

  useEffect(() => {
    if (addStockSymbol && isAddStockDialog) {
      fetchStockData(addStockSymbol);
    }
  }, [addStockSymbol, isAddStockDialog]);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!isAddStockDialog) {
      // Reset form when dialog closes
      setAddStockPrice('');
      setAddStockQuantity('');
      setAddStockDate(null);
      setPriceError('');
      setQuantityError('');
      setDateError('');
      setStockInfo(undefined);
    }
  }, [isAddStockDialog]);

  const validatePrice = (price: string): boolean => {
    // First clean up the string (allow trailing decimal point for UX)
    const cleanedPrice = price.trim().endsWith('.') ? price.trim() + '0' : price.trim();

    if (!cleanedPrice) {
      setPriceError('Purchase price cannot be empty');
      return false;
    }

    // More permissive pattern for validation on blur/submit
    // This allows valid currency formats like 1, 1.5, 10.99
    if (!/^[0-9]+(\.[0-9]{0,2})?$/.test(cleanedPrice)) {
      setPriceError('Enter a valid price (e.g., 10.99)');
      return false;
    }

    const numValue = parseFloat(cleanedPrice);
    if (numValue <= 0) {
      setPriceError('Price must be greater than 0');
      return false;
    }

    setPriceError('');
    return true;
  };

  const validateQuantity = (quantity: string): boolean => {
    const cleanedQuantity = quantity.trim();

    if (!cleanedQuantity) {
      setQuantityError('Quantity cannot be empty');
      return false;
    }

    // Only allow whole numbers for quantity
    if (!/^[1-9][0-9]*$/.test(cleanedQuantity)) {
      setQuantityError('Enter a valid whole number greater than 0');
      return false;
    }

    setQuantityError('');
    return true;
  };

  const validateDate = (date: Date | null): boolean => {
    if (!date) {
      setDateError('Purchase date is required');
      return false;
    }

    setDateError('');
    return true;
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPrice = e.target.value;
    // Allow typing decimals more freely
    if (newPrice === '' || /^[0-9]*\.?[0-9]*$/.test(newPrice)) {
      setAddStockPrice(newPrice);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = e.target.value;
    // Only allow numbers
    if (newQuantity === '' || /^[0-9]*$/.test(newQuantity)) {
      setAddStockQuantity(newQuantity);
    }
  };

  const setToday = () => {
    const today = new Date();
    setAddStockDate(today);
    setDateError('');
  };

  const onCancelAddStockDialog = () => {
    setAddStockDialog(false);
  };

  const onConfirmAddStockDialog = async () => {
    try {
      // Validate all inputs
      const isPriceValid = validatePrice(addStockPrice);
      const isQuantityValid = validateQuantity(addStockQuantity);
      const isDateValid = validateDate(addStockDate);

      if (!isPriceValid || !isQuantityValid || !isDateValid) {
        return; // Don't proceed if validation fails
      }

      if (!addStockSymbol) {
        throw new Error('Stock symbol cannot be empty');
      }

      // Store date as standard Date object
      const purchaseDate = addStockDate ? new Date(addStockDate) : null;

      const tickers = {
        symbol: addStockSymbol,
        purchasePrice: Number(addStockPrice),
        quantity: Number(addStockQuantity),
        price: stockInfo?.price || 0,
        purchaseDate: purchaseDate,
        priceChange: 0,
        gainOrLoss: 0,
        marketValue: 0,
        exchange: stockInfo?.exchange || ''
      };

      // No need to fetch stock data again since we already have it
      if (!stockInfo) {
        throw new Error(`Could not find stock with symbol ${tickers.symbol} in the database!`);
      }

      await onAddTicker(tickers);

      const updatedPurchasedStocks = await PositionsApiService.fetchPurchasedStocksByUserId();
      if (!updatedPurchasedStocks) {
        throw new Error(`Cannot find the purchased stocks data after adding new stocks`);
      }

      const updatedPositions: PositionMap = {};
      for (const key in positions) {
        updatedPositions[key] = positions[key];
      }

      // Add the updated positions
      const userKey = Object.keys(positions)[0] || '';
      updatedPositions[userKey] = updatedPurchasedStocks.flatMap((p) => p.tickers);

      setPositions(updatedPositions);

      // Close dialog
      setAddStockDialog(false);
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
        Add {addStockSymbol} Position
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 3 }}>
        {/* Stock Info Section */}
        <Box sx={{ mb: 3 }}>
          {isLoading ? (
            <Typography>Loading stock information...</Typography>
          ) : stockInfo ? (
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
          ) : addStockSymbol ? (
            <Typography sx={{ color: 'var(--secondary-blue)' }}>No information found for {addStockSymbol}</Typography>
          ) : null}
        </Box>

        {/* Purchase Price */}
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
            Purchase price
          </Typography>

          <TextField
            error={!!priceError}
            helperText={priceError}
            required
            fullWidth
            id="purchase-price"
            label="Purchase price"
            type="text"
            variant="outlined"
            value={addStockPrice}
            onChange={handlePriceChange}
            onBlur={() => validatePrice(addStockPrice)}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>
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

        {/* Quantity */}
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
            Quantity
          </Typography>

          <TextField
            error={!!quantityError}
            helperText={quantityError}
            required
            fullWidth
            id="stock-quantity"
            label="Number of shares"
            type="text"
            variant="outlined"
            value={addStockQuantity}
            onChange={handleQuantityChange}
            onBlur={() => validateQuantity(addStockQuantity)}
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

        {/* Purchase Date */}
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
            Purchase date
          </Typography>

          <FormControl fullWidth error={!!dateError}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Purchase date"
                  value={addStockDate ? dayjs(addStockDate) : null}
                  onChange={(newValue: any) => {
                    setAddStockDate(newValue ? newValue.toDate() : null);
                    if (newValue) setDateError('');
                  }}
                  slotProps={{
                    textField: {
                      required: true,
                      fullWidth: true,
                      variant: 'outlined',
                      error: !!dateError,
                      helperText: dateError,
                      sx: {
                        '& .MuiOutlinedInput-root': {
                          '&.Mui-focused fieldset': {
                            borderColor: 'var(--primary-blue)'
                          }
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: 'var(--primary-blue)'
                        }
                      }
                    }
                  }}
                />
              </LocalizationProvider>

              <Button
                variant="outlined"
                onClick={setToday}
                sx={{
                  height: '56px',
                  minWidth: '100px',
                  marginTop: 0,
                  color: 'var(--primary-blue)',
                  borderColor: 'var(--border-color)',
                  textTransform: 'none',
                  fontFamily: 'var(--font-family)',
                  fontWeight: 500,
                  '&:hover': {
                    borderColor: 'var(--primary-blue)',
                    backgroundColor: 'rgba(0, 119, 255, 0.04)'
                  }
                }}
              >
                Today
              </Button>
            </Box>
          </FormControl>
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
          disabled={
            !addStockSymbol ||
            !addStockPrice ||
            !addStockQuantity ||
            !addStockDate ||
            !!priceError ||
            !!quantityError ||
            !!dateError ||
            isLoading ||
            !stockInfo // Disable if no stock info is loaded
          }
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
          Add Position
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddPositionDialog;
