// Validate watchlist name (allow only letters, numbers, hyphens, underscores, and spaces)
const validateWatchlistName = (name: string): { valid: boolean; message: string } => {
  const validPattern = /^[a-zA-Z0-9\-_\s]+$/;

  if (!validPattern.test(name)) {
    // Find invalid characters to inform the user
    const invalidChars = name.split('').filter((char) => !validPattern.test(char));
    // Remove duplicates
    const uniqueInvalidChars = [...new Set(invalidChars)];

    return {
      valid: false,
      message: `Watchlist name can only contain letters, numbers, hyphens, underscores, and spaces. Invalid characters found: ${uniqueInvalidChars.join(
        ' '
      )}`
    };
  }

  return { valid: true, message: '' };
};
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ViewListIcon from '@mui/icons-material/ViewList';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import React, { useEffect, useState } from 'react';

import { getUserID } from '../../helper/userID';
import { AlertData, MinimalWatchlistTicker, WatchlistTicker, Watchlists } from '../../interfaces/IWatchlistModel';
import { WatchlistApiService } from '../../services/WatchlistApiService';
import { useAsyncError } from '../GlobalErrorBoundary';
import AddStockDialog from './AddStockDialog';
import DeleteWatchListDialog from './DeleteWatchlistDialog';
import WatchlistTickersSearchBar from './WatchlistTickersSearchBar';

type Order = 'asc' | 'desc';
type ViewMode = 'full' | 'high' | 'low';

// Enhanced toolbar with edit mode support
interface EnhancedTableToolbarProps {
  numSelected: number;
  handleDeleteStocks: () => void;
  handleEditStocks: () => void;
  editMode: boolean;
}

const EnhancedTableToolbar: React.FC<EnhancedTableToolbarProps> = (props) => {
  const { numSelected, editMode } = props;
  const [isDeleteWatchlistTickers, setDeleteWatchlistTickers] = useState(false);

  const onCancelDeleteTickers = () => {
    setDeleteWatchlistTickers(false);
  };

  const onConfirmDeleteTickers = () => {
    props.handleDeleteStocks();
    setDeleteWatchlistTickers(false);
  };

  return (
    <Box
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 16px',
        borderBottom: '1px solid var(--border-color)'
      }}
    >
      {numSelected > 0 ? (
        <Typography sx={{ fontWeight: 500 }} color="inherit" variant="subtitle1">
          {numSelected} selected
        </Typography>
      ) : (
        <Typography sx={{ fontWeight: 600 }} variant="h6">
          Tickers
        </Typography>
      )}
      {numSelected > 0 ? (
        <Box>
          <Tooltip title={editMode ? 'Save Changes' : 'Edit Alert Prices'}>
            <IconButton onClick={props.handleEditStocks} color={editMode ? 'primary' : 'default'}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton onClick={() => setDeleteWatchlistTickers(true)}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ) : (
        <Box />
      )}

      <Dialog open={isDeleteWatchlistTickers} onClose={onCancelDeleteTickers}>
        <DialogTitle>Delete selected tickers</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete these selected watchlist tickers? Once deleted, they won't be recoverable.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancelDeleteTickers}>Cancel</Button>
          <Button onClick={onConfirmDeleteTickers}>Confirm</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default function Watchlist() {
  // Watchlists state
  const [wlKey, setWlKey] = useState('');
  const [wlKeys, setWlKeys] = useState<string[]>([]);
  const [watchLists, setWatchLists] = useState<Watchlists>({});
  const [createWatchlistOpen, setCreateWatchlistOpen] = useState(false);
  const [newWatchlistName, setNewWatchlistName] = useState('');
  const [watchlistNameError, setWatchlistNameError] = useState('');

  // Dialogs state
  const [isAddStockDialog, setAddStockDialog] = useState(false);
  const [isDeleteWatchlistDialog, setDeleteWatchlistDialog] = useState(false);

  // Stock data state
  const [addStockSymbol, setAddStockSymbol] = useState('');
  const [alertData, setAlertData] = useState<AlertData>({});
  const [editingValues, setEditingValues] = useState<{ [key: string]: string }>({});
  const [alertErrors, setAlertErrors] = useState<{ [key: string]: string }>({});

  // Table state
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof WatchlistTicker>('symbol');
  const [selected, setSelected] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('full');
  const [editMode, setEditMode] = useState(false); // Track if we're in edit mode

  const throwError = useAsyncError();
  const isSelected = (symbol: string) => selected.indexOf(symbol) !== -1;

  // Reset editing when selection changes
  useEffect(() => {
    if (selected.length === 0) {
      setEditMode(false);
      setEditingValues({});
    }
  }, [selected]);

  // Clear editing when changing watchlists
  useEffect(() => {
    setEditMode(false);
    setEditingValues({});
  }, [wlKey]);

  // Apply sorting to visible tickers (also runs when view mode changes)
  useEffect(() => {
    if (watchLists[wlKey]) {
      let tickers = [...watchLists[wlKey]]; // Create a copy to avoid modifying original

      // First apply the user's selected sort
      tickers = tickers.sort(getComparator(order, orderBy));

      // Then apply view-specific filtering/sorting
      if (viewMode === 'high') {
        // For high view, keep the primary sort but prioritize high values
        tickers = [...tickers]; // Keep the current sort
      } else if (viewMode === 'low') {
        // For low view, keep the primary sort but prioritize low values
        tickers = [...tickers]; // Keep the current sort
      }

      setVisibleTickers(tickers);
    } else {
      setVisibleTickers([]);
    }
  }, [order, orderBy, watchLists[wlKey], viewMode, wlKey]);

  // Update alert data when watchlist changes
  useEffect(() => {
    if (watchLists[wlKey]) {
      let newAlertData: AlertData = {};
      watchLists[wlKey].forEach((ticker) => {
        newAlertData[ticker.symbol] = ticker.alertPrice;
      });
      setAlertData(newAlertData);
      setEditingValues({});
      setAlertErrors({});
    }
  }, [watchLists[wlKey]]);

  // Initial data load
  const queryWatchLists = async () => {
    try {
      const userID: string = await getUserID();
      const wls = await WatchlistApiService.fetchWatchlistsByUserId(userID);
      if (Array.isArray(wls)) {
        let tempWls: Watchlists = {};
        wls.forEach((wl, i) => {
          if (i === 0) setWlKey(wl.watchlistName);
          if (!tempWls[wl.watchlistName]) {
            tempWls[wl.watchlistName] = [];
          }
          tempWls[wl.watchlistName] = wl.tickers;
        });
        refreshWatchlist(tempWls);
      }
    } catch (error) {
      console.error('Error loading watchlists:', error);
    }
  };

  useEffect(() => {
    queryWatchLists();
  }, []);

  // Helpers
  const refreshWatchlist = (watchlists: Watchlists) => {
    setWatchLists(watchlists);
    setWlKeys(Object.keys(watchlists));
  };

  // Apply additional view-specific sorting/filtering based on the current view mode
  const filterTickersByViewMode = (tickers: WatchlistTicker[], mode: ViewMode) => {
    // Apply the user's primary sort first (this happens in the main sorting useEffect)

    // No need to modify the tickers array for filtering - just show all columns
    // The column visibility is handled in the rendering
    return tickers;
  };

  // Validate price format: positive number with up to 2 decimal places
  const validateAlertPrice = (price: string | number, symbol: string): boolean => {
    const priceStr = String(price).trim();
    // First clean up the string (allow trailing decimal point for UX)
    const cleanedPrice = priceStr.endsWith('.') ? priceStr + '0' : priceStr;

    if (!cleanedPrice) {
      setAlertErrors({ ...alertErrors, [symbol]: 'Price required' });
      return false;
    }

    // More permissive pattern for validation on blur/submit
    // This allows valid currency formats like 1, 1.5, 10.99
    if (!/^[0-9]+(\.[0-9]{0,2})?$/.test(cleanedPrice)) {
      setAlertErrors({ ...alertErrors, [symbol]: 'Enter a valid price (e.g., 10.99)' });
      return false;
    }

    const numValue = parseFloat(cleanedPrice);
    if (numValue <= 0) {
      setAlertErrors({ ...alertErrors, [symbol]: 'Price must be greater than 0' });
      return false;
    }

    // Clear error if valid
    const newErrors = { ...alertErrors };
    delete newErrors[symbol];
    setAlertErrors(newErrors);
    return true;
  };

  function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  }

  function getComparator<Key extends keyof any>(
    order: Order,
    orderBy: Key
  ): (a: { [key in Key]: number | string }, b: { [key in Key]: number | string }) => number {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  }

  // Handle sort order change
  const handleRequestSort = (event: React.MouseEvent<unknown>, property: keyof WatchlistTicker) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);

    // Force resort with new order
    if (watchLists[wlKey]) {
      let tickers = [...watchLists[wlKey]];
      const newOrder = isAsc ? 'desc' : 'asc';
      tickers.sort(getComparator(newOrder, property));
      setVisibleTickers(tickers);
    }
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked && watchLists[wlKey]) {
      const newSelected = watchLists[wlKey].map((n) => n.symbol);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleSelectStock = (event: React.MouseEvent<unknown>, symbol: string) => {
    const selectedIndex = selected.indexOf(symbol);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, symbol);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
    }
    setSelected(newSelected);
  };

  const handleCreateNewWatchlist = async () => {
    // Reset errors first
    setWatchlistNameError('');

    if (newWatchlistName.trim() && watchLists) {
      // Check if watchlist with this name already exists
      if (wlKeys.includes(newWatchlistName.trim())) {
        setWatchlistNameError('A watchlist with this name already exists. Please try another name.');
        return;
      }

      // Validate watchlist name characters
      const validation = validateWatchlistName(newWatchlistName.trim());
      if (!validation.valid) {
        setWatchlistNameError(validation.message);
        return;
      }

      try {
        const userID: string = await getUserID();
        const name = await WatchlistApiService.createWatchlist({
          watchlistName: newWatchlistName.trim(),
          tickers: [],
          userID
        });

        if (!name) {
          throw Error('Watchlist Id is empty after creating');
        }

        watchLists[newWatchlistName.trim()] = [];
        refreshWatchlist(watchLists);
        setWlKey(newWatchlistName.trim());
        setCreateWatchlistOpen(false);
        setNewWatchlistName('');
      } catch (error) {
        throwError(error);
      }
    }
  };

  const handleCloseDeleteWatchlistDialog = (name?: string) => {
    if (name && watchLists) {
      try {
        // Use the exact name as is - special characters shouldn't be a problem for object keys
        delete watchLists[name];

        // Get remaining keys
        const remainingKeys = Object.keys(watchLists);

        // Update the watchlists state
        refreshWatchlist({ ...watchLists });

        // Select another watchlist if available
        setWlKey(remainingKeys.length > 0 ? remainingKeys[0] : '');

        // Also ensure that the backend is updated
        WatchlistApiService.deleteWatchlist(name).catch((error) => {
          console.error('Error deleting watchlist from server:', error);
        });
      } catch (error) {
        console.error('Error deleting watchlist:', error);
        // Optionally show an error message to the user
      }
    }
    setDeleteWatchlistDialog(false);
  };

  const handleClickAddStock = () => {
    setAddStockDialog(true);
  };

  const handleDeleteStocks = async () => {
    try {
      // Optimistically update UI first
      const tickers = watchLists[wlKey].filter((ticker) => !selected.includes(ticker.symbol));
      watchLists[wlKey] = tickers;
      refreshWatchlist({ ...watchLists });

      let newAlertData = { ...alertData };
      for (const symbol of selected) {
        delete newAlertData[symbol];
      }
      setAlertData(newAlertData);

      let newAlertErrors = { ...alertErrors };
      for (const symbol of selected) {
        delete newAlertErrors[symbol];
      }
      setAlertErrors(newAlertErrors);

      const selectedCopy = [...selected]; // Save a copy before clearing
      setSelected([]);

      // Then perform the server request in the background
      await WatchlistApiService.deleteStocksInWatchlist(wlKey, selectedCopy);
    } catch (error) {
      console.error('Error deleting stocks:', error);
      // In a real app, you might want to show an error toast here
    }
  };

  // Enter edit mode and initialize editing values for all selected stocks
  const handleEnterEditMode = () => {
    setEditMode(true);

    const initialValues: { [key: string]: string } = {};
    selected.forEach((symbol) => {
      const ticker = watchLists[wlKey].find((t) => t.symbol === symbol);
      if (ticker) {
        initialValues[symbol] = String(ticker.alertPrice != null ? ticker.alertPrice.toFixed(2) : '0.00');
      }
    });
    setEditingValues(initialValues);
  };

  const handleEditStocks = async () => {
    if (editMode) {
      // Save changes
      // Validate all selected alert prices before submitting
      let hasError = false;

      for (const symbol of selected) {
        const priceValue = editingValues[symbol] || String(alertData[symbol] || '');
        const isValid = validateAlertPrice(priceValue, symbol);
        if (!isValid) {
          hasError = true;
        }
      }

      if (hasError) {
        return; // Don't proceed if there are validation errors
      }

      try {
        // Convert editing values to numbers for the API call
        const tickers: MinimalWatchlistTicker[] = selected.map((symbol) => {
          const price =
            editingValues[symbol] !== undefined && editingValues[symbol] !== ''
              ? parseFloat(editingValues[symbol])
              : alertData[symbol];

          return {
            symbol,
            alertPrice: price
          };
        });

        await WatchlistApiService.editStockAlertPrices(tickers, wlKey);

        // Refresh watchlist data
        const updatedWatchlist = await WatchlistApiService.fetchWatchlist(wlKey);
        if (updatedWatchlist) {
          watchLists[wlKey] = updatedWatchlist.tickers;
          refreshWatchlist({ ...watchLists });
        }

        // Exit edit mode and clear editing values
        setEditMode(false);
        setEditingValues({});
      } catch (error) {
        throwError(error);
      }
    } else {
      // Enter edit mode
      handleEnterEditMode();
    }
  };

  const handleViewModeChange = (event: React.MouseEvent<HTMLElement>, newMode: ViewMode | null) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  const handleWatchlistChange = (event: React.SyntheticEvent, newValue: string) => {
    setWlKey(newValue);
  };

  // Format percentage value with trend icon
  const renderPercentage = (value: number | null) => {
    // Handle null or undefined values
    if (value === null || value === undefined) {
      return (
        <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
          <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} />
          0.00%
        </Box>
      );
    }

    const isPositive = value >= 0;
    return (
      <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
        {isPositive ? (
          <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} />
        ) : (
          <TrendingDownIcon fontSize="small" sx={{ mr: 0.5 }} />
        )}
        {Math.abs(value).toFixed(2)}%
      </Box>
    );
  };

  // Get visible tickers based on current view mode
  const [visibleTickers, setVisibleTickers] = useState<WatchlistTicker[]>([]);

  // Render table based on current view mode
  const renderTable = () => {
    if (!wlKey) {
      return (
        <TableRow>
          <TableCell colSpan={12} align="center">
            <Typography sx={{ py: 3, color: 'var(--secondary-blue)' }}>
              Select or create a watchlist to get started.
            </Typography>
          </TableCell>
        </TableRow>
      );
    }

    if (visibleTickers.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={12} align="center">
            <Typography sx={{ py: 3, color: 'var(--secondary-blue)' }}>
              No stocks in this watchlist. Use the search bar above to add stocks.
            </Typography>
          </TableCell>
        </TableRow>
      );
    }

    return visibleTickers.map((row, index) => {
      const isItemSelected = isSelected(row.symbol);
      const labelId = `enhanced-table-checkbox-${index}`;

      return (
        <TableRow
          hover
          onClick={(event) => handleSelectStock(event, row.symbol)}
          role="checkbox"
          aria-checked={isItemSelected}
          tabIndex={-1}
          key={row.symbol}
          selected={isItemSelected}
          sx={{
            cursor: 'pointer',
            '&:hover': { backgroundColor: 'var(--background-light)' }
          }}
        >
          <TableCell padding="checkbox">
            <Checkbox color="primary" checked={isItemSelected} inputProps={{ 'aria-labelledby': labelId }} />
          </TableCell>

          {/* Symbol - always visible */}
          <TableCell>
            <Box
              component="a"
              href={`#/quote?symbol=${row.symbol}`}
              sx={{
                color: 'var(--primary-blue)',
                fontWeight: 600,
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline'
                }
              }}
            >
              {row.symbol}
            </Box>
          </TableCell>

          {/* Exchange - always visible */}
          <TableCell align="right">
            <Chip
              label={row.exchange}
              size="small"
              sx={{
                backgroundColor: 'var(--background-light)',
                color: 'var(--secondary-blue)',
                fontWeight: 500,
                fontSize: '0.75rem'
              }}
            />
          </TableCell>

          {/* Alert Price - always visible */}
          <TableCell align="right">
            {editMode && isItemSelected ? (
              <TextField
                value={editingValues[row.symbol] || ''}
                error={!!alertErrors[row.symbol]}
                helperText={alertErrors[row.symbol]}
                size="small"
                type="text"
                variant="outlined"
                autoFocus={selected.length === 1}
                InputProps={{
                  sx: {
                    height: '32px',
                    width: '100px',
                    fontWeight: 500,
                    '& input': { textAlign: 'right' }
                  }
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  // Always clear on first click for easier editing
                  if (
                    editingValues[row.symbol] === String(row.alertPrice != null ? row.alertPrice.toFixed(2) : '0.00') ||
                    editingValues[row.symbol] === undefined
                  ) {
                    setEditingValues({
                      ...editingValues,
                      [row.symbol]: ''
                    });
                  }
                }}
                onChange={(e) => {
                  const value = e.target.value;
                  // Allow typing decimals more freely, including multiple decimals during typing
                  if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
                    setEditingValues({
                      ...editingValues,
                      [row.symbol]: value
                    });
                  }
                }}
                onBlur={(e) => {
                  // If field is empty when clicked away, restore original value
                  if (editingValues[row.symbol] === '') {
                    setEditingValues({
                      ...editingValues,
                      [row.symbol]: String(row.alertPrice != null ? row.alertPrice.toFixed(2) : '0.00')
                    });
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                    handleEditStocks(); // Save all changes and exit edit mode
                  } else if (e.key === 'Escape') {
                    setEditMode(false);
                    setEditingValues({});
                  }
                }}
              />
            ) : (
              <Box
                sx={{
                  display: 'inline-block',
                  minWidth: '80px',
                  p: '4px 8px',
                  borderRadius: '4px'
                }}
              >
                ${row.alertPrice != null ? row.alertPrice.toFixed(2) : '0.00'}
              </Box>
            )}
          </TableCell>

          {/* Current Price - always visible */}
          <TableCell align="right" sx={{ fontWeight: 600 }}>
            ${row.price != null ? row.price.toFixed(2) : '0.00'}
          </TableCell>

          {/* Current vs Alert Price % - always visible */}
          <TableCell
            align="right"
            sx={{
              color: (row.currentVsAlertPricePercentage || 0) >= 0 ? 'green' : 'red',
              fontWeight: 500
            }}
          >
            {renderPercentage(row.currentVsAlertPricePercentage)}
          </TableCell>

          {/* Previous Close - always visible */}
          <TableCell align="right">${row.previousClose != null ? row.previousClose.toFixed(2) : '0.00'}</TableCell>

          {/* Changes Percentage - always visible */}
          <TableCell
            align="right"
            sx={{
              color: (row.changesPercentage || 0) >= 0 ? 'green' : 'red',
              fontWeight: 500
            }}
          >
            {renderPercentage(row.changesPercentage)}
          </TableCell>

          {/* View-specific columns */}
          {viewMode === 'full' && (
            <>
              {/* Full view includes both high and low metrics */}
              <TableCell align="right">${row.dayHigh != null ? row.dayHigh.toFixed(2) : '0.00'}</TableCell>
              <TableCell
                align="right"
                sx={{
                  color: (row.nearHighVsCurrentPercentage || 0) >= 0 ? 'green' : 'red',
                  fontWeight: 500
                }}
              >
                {renderPercentage(row.nearHighVsCurrentPercentage)}
              </TableCell>
              <TableCell align="right">${row.yearHigh != null ? row.yearHigh.toFixed(2) : '0.00'}</TableCell>
              <TableCell
                align="right"
                sx={{
                  color: (row.yearHighVsCurrentPercentage || 0) >= 0 ? 'green' : 'red',
                  fontWeight: 500
                }}
              >
                {renderPercentage(row.yearHighVsCurrentPercentage)}
              </TableCell>
              <TableCell align="right">${row.dayLow != null ? row.dayLow.toFixed(2) : '0.00'}</TableCell>
              <TableCell
                align="right"
                sx={{
                  color: (row.nearLowVsCurrentPercentage || 0) >= 0 ? 'green' : 'red',
                  fontWeight: 500
                }}
              >
                {renderPercentage(row.nearLowVsCurrentPercentage)}
              </TableCell>
              <TableCell align="right">${row.yearLow != null ? row.yearLow.toFixed(2) : '0.00'}</TableCell>
              <TableCell
                align="right"
                sx={{
                  color: (row.yearLowVsCurrentPercentage || 0) >= 0 ? 'green' : 'red',
                  fontWeight: 500
                }}
              >
                {renderPercentage(row.yearLowVsCurrentPercentage)}
              </TableCell>
            </>
          )}

          {viewMode === 'high' && (
            <>
              {/* High view only includes high metrics */}
              <TableCell align="right">${row.dayHigh != null ? row.dayHigh.toFixed(2) : '0.00'}</TableCell>
              <TableCell
                align="right"
                sx={{
                  color: (row.nearHighVsCurrentPercentage || 0) >= 0 ? 'green' : 'red',
                  fontWeight: 500
                }}
              >
                {renderPercentage(row.nearHighVsCurrentPercentage)}
              </TableCell>
              <TableCell align="right">${row.yearHigh != null ? row.yearHigh.toFixed(2) : '0.00'}</TableCell>
              <TableCell
                align="right"
                sx={{
                  color: (row.yearHighVsCurrentPercentage || 0) >= 0 ? 'green' : 'red',
                  fontWeight: 500
                }}
              >
                {renderPercentage(row.yearHighVsCurrentPercentage)}
              </TableCell>
            </>
          )}

          {viewMode === 'low' && (
            <>
              {/* Low view only includes low metrics */}
              <TableCell align="right">${row.dayLow != null ? row.dayLow.toFixed(2) : '0.00'}</TableCell>
              <TableCell
                align="right"
                sx={{
                  color: (row.nearLowVsCurrentPercentage || 0) >= 0 ? 'green' : 'red',
                  fontWeight: 500
                }}
              >
                {renderPercentage(row.nearLowVsCurrentPercentage)}
              </TableCell>
              <TableCell align="right">${row.yearLow != null ? row.yearLow.toFixed(2) : '0.00'}</TableCell>
              <TableCell
                align="right"
                sx={{
                  color: (row.yearLowVsCurrentPercentage || 0) >= 0 ? 'green' : 'red',
                  fontWeight: 500
                }}
              >
                {renderPercentage(row.yearLowVsCurrentPercentage)}
              </TableCell>
            </>
          )}
        </TableRow>
      );
    });
  };

  // Define columns based on view mode
  const getColumnsForView = (mode: ViewMode) => {
    // Core columns that appear in all views
    const coreColumns = [
      { id: 'symbol', label: 'Symbol', align: 'left' },
      { id: 'exchange', label: 'Exchange', align: 'right' },
      { id: 'alertPrice', label: 'Alert Price', align: 'right' },
      { id: 'price', label: 'Current Price', align: 'right' },
      { id: 'currentVsAlertPricePercentage', label: 'Current - Alert (%)', align: 'right' },
      { id: 'previousClose', label: 'Previous Close', align: 'right' },
      { id: 'changesPercentage', label: 'Change %', align: 'right' }
    ];

    if (mode === 'full') {
      return [
        ...coreColumns,
        { id: 'dayHigh', label: 'Day High', align: 'right' },
        { id: 'nearHighVsCurrentPercentage', label: 'Near High - Current (%)', align: 'right' },
        { id: 'yearHigh', label: 'Year High', align: 'right' },
        { id: 'yearHighVsCurrentPercentage', label: 'Year High - Current (%)', align: 'right' },
        { id: 'dayLow', label: 'Day Low', align: 'right' },
        { id: 'nearLowVsCurrentPercentage', label: 'Near Low - Current (%)', align: 'right' },
        { id: 'yearLow', label: 'Year Low', align: 'right' },
        { id: 'yearLowVsCurrentPercentage', label: 'Year Low - Current (%)', align: 'right' }
      ];
    } else if (mode === 'high') {
      return [
        ...coreColumns,
        { id: 'dayHigh', label: 'Day High', align: 'right' },
        { id: 'nearHighVsCurrentPercentage', label: 'Near High - Current (%)', align: 'right' },
        { id: 'yearHigh', label: 'Year High', align: 'right' },
        { id: 'yearHighVsCurrentPercentage', label: 'Year High - Current (%)', align: 'right' }
      ];
    } else {
      // low mode
      return [
        ...coreColumns,
        { id: 'dayLow', label: 'Day Low', align: 'right' },
        { id: 'nearLowVsCurrentPercentage', label: 'Near Low - Current (%)', align: 'right' },
        { id: 'yearLow', label: 'Year Low', align: 'right' },
        { id: 'yearLowVsCurrentPercentage', label: 'Year Low - Current (%)', align: 'right' }
      ];
    }
  };

  const columns = getColumnsForView(viewMode);

  return (
    <TableContainer
      component={Paper}
      sx={{
        width: '95%',
        backgroundColor: 'white',
        borderRadius: '10px',
        margin: '20px',
        boxShadow: '0 4px 12px var(--border-color)',
        overflow: 'hidden'
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          backgroundColor: 'var(--background-light)',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-color)'
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: 'var(--primary-blue)',
              fontFamily: 'var(--font-family)'
            }}
          >
            My Watchlists
          </Typography>

          <Box display="flex" alignItems="center" gap={1}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewModeChange}
              size="small"
              aria-label="view mode"
              sx={{
                '& .MuiToggleButton-root': {
                  border: '1px solid var(--border-color)',
                  color: 'var(--primary-blue)',
                  '&.Mui-selected': {
                    backgroundColor: 'var(--primary-blue)',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'var(--secondary-blue)'
                    }
                  }
                }
              }}
            >
              <ToggleButton value="full" aria-label="full view">
                <Tooltip title="Full View">
                  <ViewListIcon />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="high" aria-label="high view">
                <Tooltip title="High Focus View">
                  <TrendingUpIcon />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="low" aria-label="low view">
                <Tooltip title="Low Focus View">
                  <TrendingDownIcon />
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>

        {/* Watchlist tabs */}
        <Box sx={{ mt: 2 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
            <Tabs
              value={wlKey}
              onChange={handleWatchlistChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  fontFamily: 'var(--font-family)',
                  color: 'var(--secondary-blue)',
                  '&.Mui-selected': {
                    color: 'var(--primary-blue)',
                    fontWeight: 600
                  }
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: 'var(--primary-blue)'
                }
              }}
            >
              {wlKeys.map((key) => (
                <Tab
                  key={key}
                  label={key}
                  value={key}
                  sx={{
                    textTransform: 'none',
                    fontWeight: wlKey === key ? 600 : 400
                  }}
                />
              ))}
            </Tabs>

            <Button
              startIcon={<AddIcon />}
              onClick={() => {
                setWatchlistNameError('');
                setCreateWatchlistOpen(true);
              }}
              sx={{
                ml: 1,
                color: 'var(--primary-blue)',
                borderRadius: '12px',
                textTransform: 'none',
                fontFamily: 'var(--font-family)',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: 'var(--background-light)'
                }
              }}
            >
              Create
            </Button>

            {wlKey && (
              <IconButton
                size="small"
                onClick={() => setDeleteWatchlistDialog(true)}
                sx={{ ml: 1, color: 'var(--primary-blue)' }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        </Box>

        {/* Search and add stock section */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mt: 3,
            mb: 1,
            width: 'fit-content', // Only take as much width as needed
            position: 'relative',
            left: 0
          }}
        >
          <Typography
            variant="body1"
            component="span" // Use span to make it inline with search bar
            sx={{
              mr: 2,
              whiteSpace: 'nowrap', // Prevent text wrapping
              color: 'var(--secondary-blue)',
              fontFamily: 'var(--font-family)'
            }}
          >
            Add to watchlist:
          </Typography>

          <Box display="inline-block">
            <WatchlistTickersSearchBar
              setAddStockSymbol={setAddStockSymbol}
              onSelectStock={() => {
                if (addStockSymbol && wlKey) {
                  setAddStockDialog(true);
                }
              }}
              isDisabled={!wlKey}
            />
          </Box>
        </Box>
      </Box>

      {/* Table Section */}
      {wlKey && (
        <>
          <EnhancedTableToolbar
            numSelected={selected.length}
            handleDeleteStocks={handleDeleteStocks}
            handleEditStocks={handleEditStocks}
            editMode={editMode}
          />

          <Box sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 650 }} aria-label="watchlist table">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      indeterminate={selected.length > 0 && selected.length < visibleTickers.length}
                      checked={visibleTickers.length > 0 && selected.length === visibleTickers.length}
                      onChange={handleSelectAllClick}
                      inputProps={{ 'aria-label': 'select all stocks' }}
                    />
                  </TableCell>

                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      align={column.align === 'right' ? 'right' : 'left'}
                      sx={{
                        fontWeight: 600,
                        color: 'var(--primary-blue)',
                        fontFamily: 'var(--font-family)'
                      }}
                    >
                      <Box
                        component="div"
                        onClick={(e) => handleRequestSort(e, column.id as keyof WatchlistTicker)}
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          cursor: 'pointer',
                          '&:hover': {
                            color: 'var(--secondary-blue)'
                          }
                        }}
                      >
                        {column.label}
                        <Box component="span" sx={{ ml: 0.5 }}>
                          {orderBy === column.id ? (
                            order === 'asc' ? (
                              '↑'
                            ) : (
                              '↓'
                            )
                          ) : (
                            <Box component="span" sx={{ opacity: 0.2 }}>
                              ↕
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>{renderTable()}</TableBody>
            </Table>
          </Box>
        </>
      )}

      {/* Create Watchlist Dialog */}
      <Dialog
        open={createWatchlistOpen}
        onClose={() => setCreateWatchlistOpen(false)}
        sx={{ '& .MuiPaper-root': { borderRadius: '12px' } }}
      >
        <DialogTitle
          sx={{
            color: 'var(--primary-blue)',
            fontFamily: 'var(--font-family)',
            fontWeight: 600
          }}
        >
          Create New Watchlist
        </DialogTitle>

        <DialogContent>
          <DialogContentText sx={{ mb: 2, color: 'var(--secondary-blue)' }}>
            Enter a name for your new watchlist:
          </DialogContentText>

          {watchlistNameError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {watchlistNameError}
            </Alert>
          )}

          <TextField
            autoFocus
            fullWidth
            label="Watchlist Name"
            value={newWatchlistName}
            onChange={(e) => setNewWatchlistName(e.target.value)}
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
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setCreateWatchlistOpen(false)}
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
            onClick={handleCreateNewWatchlist}
            disabled={!newWatchlistName.trim()}
            variant="contained"
            sx={{
              bgcolor: 'var(--primary-blue)',
              textTransform: 'none',
              fontFamily: 'var(--font-family)',
              fontWeight: 500,
              '&:hover': {
                bgcolor: 'var(--secondary-blue)'
              }
            }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Other dialogs */}
      <AddStockDialog
        addStockSymbol={addStockSymbol}
        watchlistName={wlKey}
        watchlists={watchLists}
        setWatchlists={setWatchLists}
        isAddStockDialog={isAddStockDialog}
        setAddStockDialog={setAddStockDialog}
      />

      <DeleteWatchListDialog
        watchListName={wlKey}
        isDeleteWatchListDialog={isDeleteWatchlistDialog}
        handleCloseDeleteWatchListDialog={handleCloseDeleteWatchlistDialog}
      />
    </TableContainer>
  );
}
