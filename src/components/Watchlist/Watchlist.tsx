import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import FilterListIcon from '@mui/icons-material/FilterList';
import InfoIcon from '@mui/icons-material/Info';
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
  Divider,
  IconButton,
  Menu,
  MenuItem,
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

type Order = 'asc' | 'desc';
type ViewMode = 'full' | 'high' | 'low';
// New filter mode type
type FilterMode = 'all' | 'gainers' | 'losers';

// Enhanced toolbar with edit mode support
interface EnhancedTableToolbarProps {
  numSelected: number;
  handleDeleteStocks: () => void;
  handleEditStocks: () => void;
  editMode: boolean;
  filterMode: FilterMode;
  handleFilterChange: (mode: FilterMode) => void;
}

const EnhancedTableToolbar: React.FC<EnhancedTableToolbarProps> = (props) => {
  const { numSelected, editMode, filterMode, handleFilterChange } = props;
  const [isDeleteWatchlistTickers, setDeleteWatchlistTickers] = useState(false);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  
  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

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
        <Box display="flex" alignItems="center">
          <Typography sx={{ fontWeight: 600 }} variant="h6" mr={2}>
            Tickers
          </Typography>
          
          {/* Filter Button and Menu */}
          <Tooltip title="Filter">
            <Button 
              startIcon={<FilterListIcon />}
              onClick={handleFilterClick}
              size="small"
              sx={{
                textTransform: 'none',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                ml: 1,
                color: 'var(--primary-blue)',
                '&:hover': {
                  backgroundColor: 'var(--background-light)'
                }
              }}
            >
              {filterMode === 'all' ? 'All Stocks' : 
               filterMode === 'gainers' ? 'Gainers Only' :
               'Losers Only'}
            </Button>
          </Tooltip>
          
          <Menu
            anchorEl={filterAnchorEl}
            open={Boolean(filterAnchorEl)}
            onClose={handleFilterClose}
          >
            <MenuItem 
              selected={filterMode === 'all'} 
              onClick={() => {
                handleFilterChange('all');
                handleFilterClose();
              }}
            >
              <FilterListIcon fontSize="small" sx={{ mr: 1 }} />
              All Stocks
            </MenuItem>
            <MenuItem 
              selected={filterMode === 'gainers'} 
              onClick={() => {
                handleFilterChange('gainers');
                handleFilterClose();
              }}
            >
              <TrendingUpIcon fontSize="small" sx={{ mr: 1, color: 'green' }} />
              Gainers Only
            </MenuItem>
            <MenuItem 
              selected={filterMode === 'losers'} 
              onClick={() => {
                handleFilterChange('losers');
                handleFilterClose();
              }}
            >
              <TrendingDownIcon fontSize="small" sx={{ mr: 1, color: 'red' }} />
              Losers Only
            </MenuItem>
          </Menu>
        </Box>
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

// Stock details tooltip component to display when hovering over stock symbol
const StockDetailsTooltip: React.FC<{ row: WatchlistTicker }> = ({ row }) => {
  return (
    <Paper sx={{ 
      p: 0, 
      width: 280,
      overflow: 'hidden',
      borderRadius: '8px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
    }}>
      <Box sx={{ 
        backgroundColor: 'var(--primary-blue)', 
        color: 'white', 
        p: 2, 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {row.symbol}
        </Typography>
        <Chip 
          label={row.exchange}
          size="small"
          sx={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            color: 'white',
            fontWeight: 500,
            fontSize: '0.75rem'
          }}
        />
      </Box>
      
      <Box sx={{ p: 2 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: 1.5
        }}>
          {/* Previous Close */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1, borderBottom: '1px solid #eee' }}>
            <Typography variant="body2" color="text.secondary">
              Previous Close
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              ${row.previousClose != null ? row.previousClose.toFixed(2) : '0.00'}
            </Typography>
          </Box>
          
          {/* Change % */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1, borderBottom: '1px solid #eee' }}>
            <Typography variant="body2" color="text.secondary">
              Change %
            </Typography>
            <Box 
              sx={{
                display: 'flex',
                alignItems: 'center',
                color: (row.changesPercentage || 0) >= 0 ? 'green' : 'red',
                fontWeight: 600,
              }}
            >
              {(row.changesPercentage || 0) >= 0 ? 
                <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} /> : 
                <TrendingDownIcon fontSize="small" sx={{ mr: 0.5 }} />
              }
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {Math.abs(row.changesPercentage || 0).toFixed(2)}%
              </Typography>
            </Box>
          </Box>
          
          {/* Day High */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1, borderBottom: '1px solid #eee' }}>
            <Typography variant="body2" color="text.secondary">
              Day High
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              ${row.dayHigh != null ? row.dayHigh.toFixed(2) : '0.00'}
            </Typography>
          </Box>
          
          {/* Day Low */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Day Low
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              ${row.dayLow != null ? row.dayLow.toFixed(2) : '0.00'}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

// New Component: Top & Worst Performers Summary
const WatchlistPerformersSummary: React.FC<{ 
  topPerformer: WatchlistTicker | null, 
  worstPerformer: WatchlistTicker | null 
}> = ({ topPerformer, worstPerformer }) => {
  if (!topPerformer && !worstPerformer) return null;
  
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 4,
        my: 2,
        backgroundColor: 'var(--background-light)',
        py: 1.5,
        px: 2,
        borderRadius: '8px'
      }}
    >
      {topPerformer && (
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: 1.5
          }}
        >
          <Box sx={{ 
            backgroundColor: 'rgba(46, 204, 113, 0.15)', 
            borderRadius: '50%',
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <TrendingUpIcon sx={{ color: 'green' }} />
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Top Performer</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle2" fontWeight={600} color="var(--primary-blue)">
                {topPerformer.symbol}
              </Typography>
              <Typography variant="body2" sx={{ color: 'green', fontWeight: 500 }}>
                +{(topPerformer.changesPercentage || 0).toFixed(2)}%
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
      
      {topPerformer && worstPerformer && (
        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
      )}
      
      {worstPerformer && (
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: 1.5
          }}
        >
          <Box sx={{ 
            backgroundColor: 'rgba(231, 76, 60, 0.15)', 
            borderRadius: '50%',
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <TrendingDownIcon sx={{ color: 'red' }} />
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Worst Performer</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle2" fontWeight={600} color="var(--primary-blue)">
                {worstPerformer.symbol}
              </Typography>
              <Typography variant="body2" sx={{ color: 'red', fontWeight: 500 }}>
                {(worstPerformer.changesPercentage || 0).toFixed(2)}%
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
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
  const [filterMode, setFilterMode] = useState<FilterMode>('all'); // New filter mode state
  
  // Performers state
  const [topPerformer, setTopPerformer] = useState<WatchlistTicker | null>(null);
  const [worstPerformer, setWorstPerformer] = useState<WatchlistTicker | null>(null);
  
  // Get visible tickers based on current view mode
  const [visibleTickers, setVisibleTickers] = useState<WatchlistTicker[]>([]);

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
    setFilterMode('all'); // Reset filter when changing watchlists
  }, [wlKey]);

  // Apply sorting to visible tickers (also runs when view mode or filter mode changes)
  useEffect(() => {
    if (watchLists[wlKey]) {
      let tickers = [...watchLists[wlKey]]; // Create a copy to avoid modifying original

      // First apply the user's selected sort
      tickers = tickers.sort(getComparator(order, orderBy));

      // Then apply filter-specific filtering
      if (filterMode === 'gainers') {
        tickers = tickers.filter(ticker => (ticker.changesPercentage || 0) > 0);
      } else if (filterMode === 'losers') {
        tickers = tickers.filter(ticker => (ticker.changesPercentage || 0) < 0);
      }

      // Then apply view-specific filtering/sorting
      if (viewMode === 'high') {
        // For high view, keep the primary sort but prioritize high values
        tickers = [...tickers]; // Keep the current sort
      } else if (viewMode === 'low') {
        // For low view, keep the primary sort but prioritize low values
        tickers = [...tickers]; // Keep the current sort
      }

      setVisibleTickers(tickers);
      
      // Update top and worst performers across the entire watchlist
      // This should be independent of the current filter
      if (watchLists[wlKey].length > 0) {
        const allTickers = [...watchLists[wlKey]];
        // Sort by changes percentage
        const sortedByChange = [...allTickers].sort((a, b) => 
          (b.changesPercentage || 0) - (a.changesPercentage || 0)
        );
        
        setTopPerformer(sortedByChange[0] || null);
        setWorstPerformer(sortedByChange[sortedByChange.length - 1] || null);
      } else {
        setTopPerformer(null);
        setWorstPerformer(null);
      }
    } else {
      setVisibleTickers([]);
      setTopPerformer(null);
      setWorstPerformer(null);
    }
  }, [order, orderBy, watchLists[wlKey], viewMode, filterMode, wlKey]);

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

  // Handle filter change
  const handleFilterChange = (mode: FilterMode) => {
    setFilterMode(mode);
    // Reset selection when filter changes
    setSelected([]);
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
      
      // Apply current filter
      if (filterMode === 'gainers') {
        tickers = tickers.filter(ticker => (ticker.changesPercentage || 0) > 0);
      } else if (filterMode === 'losers') {
        tickers = tickers.filter(ticker => (ticker.changesPercentage || 0) < 0);
      }
      
      setVisibleTickers(tickers);
    }
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked && visibleTickers.length > 0) {
      const newSelected = visibleTickers.map((n) => n.symbol);
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
    
      // Define columns based on view mode
      const getColumnsForView = (mode: ViewMode) => {
        // Core columns that appear in all views
        const coreColumns = [
          { id: 'symbol', label: 'Symbol', align: 'left' },
          { id: 'alertPrice', label: 'Alert Price', align: 'right' },
          { id: 'price', label: 'Current Price', align: 'right' },
          { 
            id: 'currentVsAlertPricePercentage', 
            label: 'Alert Deviation %', 
            align: 'right',
            tooltip: 'Percentage difference between current price and alert price: ((Current Price - Alert Price) / Alert Price) * 100%'
          }
        ];
    
        if (mode === 'full') {
          return [
            ...coreColumns,
            { 
              id: 'yearHigh', 
              label: 'Year High', 
              align: 'right'
            },
            { 
              id: 'yearHighVsCurrentPercentage', 
              label: 'Off 1Y High %', 
              align: 'right',
              tooltip: 'Percentage difference between current price and year high: ((Year High - Current Price) / Year High) * 100%'
            },
            { 
              id: 'fiveYearHigh', 
              label: '5 Year High', 
              align: 'right'
            },
            { 
              id: 'fiveYearHighVsCurrentPercentage', 
              label: 'Off 5Y High %', 
              align: 'right',
              tooltip: 'Percentage difference between current price and 5-year high: ((5Y High - Current Price) / 5Y High) * 100%'
            },
            { 
              id: 'yearLow', 
              label: 'Year Low', 
              align: 'right'
            },
            { 
              id: 'yearLowVsCurrentPercentage', 
              label: 'Off 1Y Low %', 
              align: 'right',
              tooltip: 'Percentage difference between current price and year low: ((Current Price - Year Low) / Year Low) * 100%'
            },
            { 
              id: 'fiveYearLow', 
              label: '5 Year Low', 
              align: 'right'
            },
            { 
              id: 'fiveYearLowVsCurrentPercentage', 
              label: 'Off 5Y Low %', 
              align: 'right',
              tooltip: 'Percentage difference between current price and 5-year low: ((Current Price - 5Y Low) / 5Y Low) * 100%'
            }
          ];
        } else if (mode === 'high') {
          return [
            ...coreColumns,
            { 
              id: 'yearHigh', 
              label: 'Year High', 
              align: 'right'
            },
            { 
              id: 'yearHighVsCurrentPercentage', 
              label: 'Off 1Y High %', 
              align: 'right',
              tooltip: 'Percentage difference between current price and year high: ((Year High - Current Price) / Year High) * 100%'
            },
            { 
              id: 'fiveYearHigh', 
              label: '5 Year High', 
              align: 'right'
            },
            { 
              id: 'fiveYearHighVsCurrentPercentage', 
              label: 'Off 5Y High %', 
              align: 'right',
              tooltip: 'Percentage difference between current price and 5-year high: ((5Y High - Current Price) / 5Y High) * 100%'
            }
          ];
        } else {
          // low mode
          return [
            ...coreColumns,
            { 
              id: 'yearLow', 
              label: 'Year Low', 
              align: 'right'
            },
            { 
              id: 'yearLowVsCurrentPercentage', 
              label: 'Off 1Y Low %', 
              align: 'right',
              tooltip: 'Percentage difference between current price and year low: ((Current Price - Year Low) / Year Low) * 100%'
            },
            { 
              id: 'fiveYearLow', 
              label: '5 Year Low', 
              align: 'right'
            },
            { 
              id: 'fiveYearLowVsCurrentPercentage', 
              label: 'Off 5Y Low %', 
              align: 'right',
              tooltip: 'Percentage difference between current price and 5-year low: ((Current Price - 5Y Low) / 5Y Low) * 100%'
            }
          ];
        }
      };
    
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
          // Show different messages based on filter mode
          let message = "No stocks in this watchlist. Use the search bar above to add stocks.";
          
          if (filterMode === 'gainers' && watchLists[wlKey]?.length > 0) {
            message = "No gaining stocks found. Try changing the filter to see all stocks.";
          } else if (filterMode === 'losers' && watchLists[wlKey]?.length > 0) {
            message = "No losing stocks found. Try changing the filter to see all stocks.";
          }
          
          return (
            <TableRow>
              <TableCell colSpan={12} align="center">
                <Typography sx={{ py: 3, color: 'var(--secondary-blue)' }}>
                  {message}
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
                // Removed the conditional background colors for gainers and losers:
                // backgroundColor: (row.changesPercentage || 0) > 0 
                //   ? 'rgba(46, 204, 113, 0.05)' 
                //   : (row.changesPercentage || 0) < 0 
                //     ? 'rgba(231, 76, 60, 0.05)' 
                //     : 'inherit'
              }}
            >
              <TableCell padding="checkbox">
                <Checkbox color="primary" checked={isItemSelected} inputProps={{ 'aria-labelledby': labelId }} />
              </TableCell>
    
              {/* Symbol with hover details - always visible */}
              <TableCell>
                <Tooltip
                  title={<StockDetailsTooltip row={row} />}
                  arrow
                  placement="right-start"
                  PopperProps={{
                    sx: {
                      '& .MuiTooltip-tooltip': {
                        backgroundColor: 'white',
                        color: 'inherit',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                        p: 0
                      }
                    }
                  }}
                >
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
                </Tooltip>
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
    
              {/* View-specific columns */}
              {viewMode === 'full' && (
                <>
                  {/* High metrics section with background shading and borders */}
                  <TableCell 
                    align="right" 
                    sx={{ 
                      backgroundColor: 'rgba(232, 244, 253, 0.6)',
                      borderRight: '1px solid rgba(0, 0, 0, 0.1)',
                      borderLeft: '1px solid black', // Left border of high section
                    }}
                  >
                    ${row.yearHigh != null ? row.yearHigh.toFixed(2) : '0.00'}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      color: (row.yearHighVsCurrentPercentage || 0) >= 0 ? 'green' : 'red',
                      fontWeight: 500,
                      backgroundColor: 'rgba(232, 244, 253, 0.6)',
                      borderRight: '1px solid rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    {renderPercentage(row.yearHighVsCurrentPercentage)}
                  </TableCell>
                  <TableCell 
                    align="right" 
                    sx={{ 
                      backgroundColor: 'rgba(232, 244, 253, 0.6)',
                      borderRight: '1px solid rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    ${row.fiveYearHigh != null ? row.fiveYearHigh.toFixed(2) : '0.00'}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      color: (row.fiveYearHighVsCurrentPercentage || 0) >= 0 ? 'green' : 'red',
                      fontWeight: 500,
                      backgroundColor: 'rgba(232, 244, 253, 0.6)',
                      borderRight: '1px solid black' // Right border of high section
                    }}
                  >
                    {renderPercentage(row.fiveYearHighVsCurrentPercentage)}
                  </TableCell>
                  
                  {/* Low metrics section with different background shading and borders */}
                  <TableCell 
                    align="right" 
                    sx={{ 
                      backgroundColor: 'rgba(253, 237, 232, 0.6)',
                      borderRight: '1px solid rgba(0, 0, 0, 0.1)',
                      borderLeft: '1px solid black', // Left border of low section
                    }}
                  >
                    ${row.yearLow != null ? row.yearLow.toFixed(2) : '0.00'}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      color: (row.yearLowVsCurrentPercentage || 0) >= 0 ? 'green' : 'red',
                      fontWeight: 500,
                      backgroundColor: 'rgba(253, 237, 232, 0.6)',
                      borderRight: '1px solid rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    {renderPercentage(row.yearLowVsCurrentPercentage)}
                  </TableCell>
                  <TableCell 
                    align="right" 
                    sx={{ 
                      backgroundColor: 'rgba(253, 237, 232, 0.6)',
                      borderRight: '1px solid rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    ${row.fiveYearLow != null ? row.fiveYearLow.toFixed(2) : '0.00'}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      color: (row.fiveYearLowVsCurrentPercentage || 0) >= 0 ? 'green' : 'red',
                      fontWeight: 500,
                      backgroundColor: 'rgba(253, 237, 232, 0.6)',
                      borderRight: '1px solid black' // Right border of low section
                    }}
                  >
                    {renderPercentage(row.fiveYearLowVsCurrentPercentage)}
                  </TableCell>
                </>
              )}
    
              {viewMode === 'high' && (
                <>
                  <TableCell 
                    align="right" 
                    sx={{ 
                      backgroundColor: 'rgba(232, 244, 253, 0.6)',
                      borderRight: '1px solid rgba(0, 0, 0, 0.1)',
                      borderLeft: '1px solid black', // Left border of high section
                    }}
                  >
                    ${row.yearHigh != null ? row.yearHigh.toFixed(2) : '0.00'}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      color: (row.yearHighVsCurrentPercentage || 0) >= 0 ? 'green' : 'red',
                      fontWeight: 500,
                      backgroundColor: 'rgba(232, 244, 253, 0.6)',
                      borderRight: '1px solid rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    {renderPercentage(row.yearHighVsCurrentPercentage)}
                  </TableCell>
                  <TableCell 
                    align="right" 
                    sx={{ 
                      backgroundColor: 'rgba(232, 244, 253, 0.6)',
                      borderRight: '1px solid rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    ${row.fiveYearHigh != null ? row.fiveYearHigh.toFixed(2) : '0.00'}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      color: (row.fiveYearHighVsCurrentPercentage || 0) >= 0 ? 'green' : 'red',
                      fontWeight: 500,
                      backgroundColor: 'rgba(232, 244, 253, 0.6)',
                      borderRight: '1px solid black' // Right border of high section
                    }}
                  >
                    {renderPercentage(row.fiveYearHighVsCurrentPercentage)}
                  </TableCell>
                </>
              )}
    
              {viewMode === 'low' && (
                <>
                  <TableCell 
                    align="right" 
                    sx={{ 
                      backgroundColor: 'rgba(253, 237, 232, 0.6)',
                      borderRight: '1px solid rgba(0, 0, 0, 0.1)',
                      borderLeft: '1px solid black', // Left border of low section
                    }}
                  >
                    ${row.yearLow != null ? row.yearLow.toFixed(2) : '0.00'}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      color: (row.yearLowVsCurrentPercentage || 0) >= 0 ? 'green' : 'red',
                      fontWeight: 500,
                      backgroundColor: 'rgba(253, 237, 232, 0.6)',
                      borderRight: '1px solid rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    {renderPercentage(row.yearLowVsCurrentPercentage)}
                  </TableCell>
                  <TableCell 
                    align="right" 
                    sx={{ 
                      backgroundColor: 'rgba(253, 237, 232, 0.6)',
                      borderRight: '1px solid rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    ${row.fiveYearLow != null ? row.fiveYearLow.toFixed(2) : '0.00'}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      color: (row.fiveYearLowVsCurrentPercentage || 0) >= 0 ? 'green' : 'red',
                      fontWeight: 500,
                      backgroundColor: 'rgba(253, 237, 232, 0.6)',
                      borderRight: '1px solid black' // Right border of low section
                    }}
                  >
                    {renderPercentage(row.fiveYearLowVsCurrentPercentage)}
                  </TableCell>
                </>
              )}
            </TableRow>
          );
        });
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
            
            {/* Performers Summary */}
            {wlKey && (
              <WatchlistPerformersSummary 
                topPerformer={topPerformer} 
                worstPerformer={worstPerformer} 
              />
            )}
    
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
                filterMode={filterMode}
                handleFilterChange={handleFilterChange}
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
                            fontFamily: 'var(--font-family)',
                            backgroundColor: column.id.includes('High') ? 'rgba(232, 244, 253, 0.3)' : 
                                             column.id.includes('Low') ? 'rgba(253, 237, 232, 0.3)' : 'inherit',
                            borderLeft: (column.id === 'yearHigh' || column.id === 'yearLow') ? '1px solid black' : 'inherit',
                            borderRight: ((column.id === 'fiveYearHighVsCurrentPercentage' || 
                                           column.id === 'fiveYearLowVsCurrentPercentage' || 
                                           column.id === 'currentVsAlertPricePercentage') ? '1px solid black' : 
                                          (column.id.includes('High') || column.id.includes('Low')) ? '1px solid rgba(0, 0, 0, 0.1)' : 
                                          'inherit')
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
                            {column.tooltip && (
                              <Tooltip title={column.tooltip} arrow placement="top">
                                <Box component="span" sx={{ ml: 0.5, cursor: 'help' }}>
                                  <InfoIcon fontSize="small" sx={{ fontSize: '16px', opacity: 0.7 }} />
                                </Box>
                              </Tooltip>
                            )}
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
