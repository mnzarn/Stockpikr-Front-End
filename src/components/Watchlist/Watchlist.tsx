import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import FilterListIcon from '@mui/icons-material/FilterList';
import InfoIcon from '@mui/icons-material/Info';
import { default as NotificationsIcon, default as NotificationsNoneIcon } from '@mui/icons-material/NotificationsNone';
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
  SelectChangeEvent,
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
import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from "react-router-dom";

import { getUserID } from '../../helper/userID';
import { AlertData, MinimalWatchlistTicker, WatchlistTicker, Watchlists } from '../../interfaces/IWatchlistModel';
import { WatchlistApiService } from '../../services/WatchlistApiService';
import { useAsyncError } from '../GlobalErrorBoundary';
import AddStockDialog from './AddStockDialog';
import DeleteWatchListDialog from './DeleteWatchlistDialog';
import WatchlistTickersSearchBar from './WatchlistTickersSearchBar';

// Validate watchlist name (allow letters, numbers, hyphens, underscores, spaces, and apostrophes)
const validateWatchlistName = (name: string): { valid: boolean; message: string } => {
  const validPattern = /^[a-zA-Z0-9\-_\s']+$/;

  if (!validPattern.test(name)) {
    // Find invalid characters to inform the user
    const invalidChars = name.split('').filter((char) => !validPattern.test(char));
    // Remove duplicates
    const uniqueInvalidChars = [...new Set(invalidChars)];

    return {
      valid: false,
      message: `Watchlist name can only contain letters, numbers, hyphens, underscores, spaces, and apostrophes. Invalid characters found: ${uniqueInvalidChars.join(
        ' '
      )}`
    };
  }

  return { valid: true, message: '' };
};

// Calculate percentage deviation between current price and alert price
const getAlertPriceDeviationPercent = (ticker: WatchlistTicker): number | null => {
  if (ticker.price === null || ticker.alertPrice === null || ticker.alertPrice === 0) return null;
  // Calculate percentage difference: (Current Price - Alert Price) / Alert Price * 100
  return ((ticker.price - ticker.alertPrice) / ticker.alertPrice) * 100;
};

type Order = 'asc' | 'desc';
// Enhanced ViewMode to include timeframe options
type ViewMode = 'full' | 'high' | 'low' | '90d' | '180d' | '1y' | '3y' | '5y';
// New filter mode type
type FilterMode = 'all' | 'gainers' | 'losers';
// Timeframe type for analysis period
type TimeframeMode = '90d' | '180d' | '1y' | '3y' | '5y';

// Enhanced toolbar with filter support
interface EnhancedTableToolbarProps {
  numSelected: number;
  handleDeleteStocks: () => void;
  filterMode: FilterMode;
  handleFilterChange: (mode: FilterMode) => void;
}

const EnhancedTableToolbar: React.FC<EnhancedTableToolbarProps> = (props) => {
  const { numSelected, filterMode, handleFilterChange } = props;
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
              {filterMode === 'all' ? 'All Stocks' : filterMode === 'gainers' ? 'Gainers Only' : 'Losers Only'}
            </Button>
          </Tooltip>

          <Menu anchorEl={filterAnchorEl} open={Boolean(filterAnchorEl)} onClose={handleFilterClose}>
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
    <Paper
      sx={{
        p: 0,
        width: 280,
        overflow: 'hidden',
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
      }}
    >
      <Box
        sx={{
          backgroundColor: 'var(--primary-blue)',
          color: 'white',
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
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
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5
          }}
        >
          {/* Previous Close */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              pb: 1,
              borderBottom: '1px solid #eee'
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Previous Close
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              ${row.previousClose != null ? row.previousClose.toFixed(2) : '0.00'}
            </Typography>
          </Box>

          {/* Change % */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              pb: 1,
              borderBottom: '1px solid #eee'
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Change %
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                color: (row.changesPercentage || 0) >= 0 ? 'green' : 'red',
                fontWeight: 600
              }}
            >
              {(row.changesPercentage || 0) >= 0 ? (
                <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} />
              ) : (
                <TrendingDownIcon fontSize="small" sx={{ mr: 0.5 }} />
              )}
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {Math.abs(row.changesPercentage || 0).toFixed(2)}%
              </Typography>
            </Box>
          </Box>

          {/* Day High */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              pb: 1,
              borderBottom: '1px solid #eee'
            }}
          >
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
  topPerformer: WatchlistTicker | null;
  worstPerformer: WatchlistTicker | null;
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
          <Box
            sx={{
              backgroundColor: 'rgba(46, 204, 113, 0.15)',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <TrendingUpIcon sx={{ color: 'green' }} />
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Top Performer
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                component="a"
                href={`#/quote?symbol=${topPerformer.symbol}`}
                sx={{
                  color: 'var(--primary-blue)',
                  fontWeight: 600,
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                {topPerformer.symbol}
              </Box>
              <Typography variant="body2" sx={{ color: 'green', fontWeight: 500 }}>
                +{(topPerformer.changesPercentage || 0).toFixed(2)}%
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      {topPerformer && worstPerformer && <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />}

      {worstPerformer && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5
          }}
        >
          <Box
            sx={{
              backgroundColor: 'rgba(231, 76, 60, 0.15)',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <TrendingDownIcon sx={{ color: 'red' }} />
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Worst Performer
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                component="a"
                href={`#/quote?symbol=${worstPerformer.symbol}`}
                sx={{
                  color: 'var(--primary-blue)',
                  fontWeight: 600,
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                {worstPerformer.symbol}
              </Box>
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

// Draggable Tab Component
interface DraggableTabProps {
  label: string;
  value: string;
  index: number;
  isSelected: boolean;
  isReorderMode: boolean;
  onDragStart: (index: number) => void;
  onDragOver: (index: number) => void;
  onDragEnd: () => void;
}

const DraggableTab: React.FC<DraggableTabProps> = ({
  label,
  value,
  index,
  isSelected,
  isReorderMode,
  onDragStart,
  onDragOver,
  onDragEnd
}) => {
  return (
    <Box
      draggable={isReorderMode}
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver(index);
      }}
      onDragEnd={onDragEnd}
      sx={{
        padding: '10px 16px',
        margin: '0 4px',
        cursor: isReorderMode ? 'grab' : 'pointer',
        color: isSelected ? 'var(--primary-blue)' : 'var(--secondary-blue)',
        fontWeight: isSelected ? 600 : 400,
        backgroundColor: isReorderMode ? 'white' : 'transparent',
        borderRadius: isReorderMode ? '8px' : '0',
        border: isReorderMode ? '1px solid var(--border-color)' : 'none',
        display: 'flex',
        alignItems: 'center',
        transition: 'all 0.2s ease',
        boxShadow: isReorderMode ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
        '&:active': {
          cursor: isReorderMode ? 'grabbing' : 'pointer',
          boxShadow: isReorderMode ? '0 0 2px rgba(0,0,0,0.2)' : 'none',
        }
      }}
    >
      {isReorderMode && (
        <DragIndicatorIcon 
          fontSize="small" 
          sx={{ 
            mr: 1,
            color: 'var(--secondary-blue)',
          }} 
        />
      )}
      {label}
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
  
  // Reordering state
  const [isReorderMode, setIsReorderMode] = useState(false);
  const dragStartIndex = useRef<number | null>(null);
  const currentOrder = useRef<string[]>([]);
  
  // Dialogs state
  const [isAddStockDialog, setAddStockDialog] = useState(false);
  const [isDeleteWatchlistDialog, setDeleteWatchlistDialog] = useState(false);

  // Stock data state
  const [addStockSymbol, setAddStockSymbol] = useState('');
  const [alertData, setAlertData] = useState<AlertData>({});

  // Individual stock editing state
  const [editingSymbol, setEditingSymbol] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');
  const [alertError, setAlertError] = useState<string>('');

  // Table state
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof WatchlistTicker>('symbol');
  const [selected, setSelected] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('full');
  const [filterMode, setFilterMode] = useState<FilterMode>('all'); // New filter mode state

  // New timeframe selector state
  const [timeframeMode, setTimeframeMode] = useState<TimeframeMode>('1y');

  // Performers state
  const [topPerformer, setTopPerformer] = useState<WatchlistTicker | null>(null);
  const [worstPerformer, setWorstPerformer] = useState<WatchlistTicker | null>(null);

  // Get visible tickers based on current view mode
  const [visibleTickers, setVisibleTickers] = useState<WatchlistTicker[]>([]);

  // Add a state to track search readiness
  const [searchReady, setSearchReady] = useState(false);

  const [highlightedSymbol, setHighlightedSymbol] = useState<string | null>(null);
  const tabRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const throwError = useAsyncError();
  const isSelected = (symbol: string) => selected.indexOf(symbol) !== -1;

  const query = new URLSearchParams(useLocation().search);
  const highlightFromQuery = query.get("highlight");
  const wlFromQuery = query.get("wl");

  // Drag and drop handlers for reordering watchlists
  const toggleReorderMode = () => {
    const newMode = !isReorderMode;
    setIsReorderMode(newMode);
    
    // Save to localStorage when exiting reorder mode
    if (!newMode) {
      try {
        localStorage.setItem('watchlistOrder', JSON.stringify(wlKeys));
        console.log('Watchlist order saved to localStorage');
      } catch (error) {
        console.error('Error saving watchlist order to localStorage:', error);
      }
    }
  };

  const handleWatchlistDragStart = (index: number) => {
    dragStartIndex.current = index;
    // Store the current order when drag starts
    currentOrder.current = [...wlKeys];
  };

  const handleWatchlistDragOver = (index: number) => {
    if (dragStartIndex.current === null || dragStartIndex.current === index) return;
    
    const newOrder = [...currentOrder.current];
    const draggedItem = newOrder[dragStartIndex.current];
    
    // Remove from original position
    newOrder.splice(dragStartIndex.current, 1);
    
    // Insert at new position
    newOrder.splice(index, 0, draggedItem);
    
    // Update the working copy
    currentOrder.current = newOrder;
    
    // Update state for visual feedback
    setWlKeys(newOrder);
    
    // Update drag index to new position
    dragStartIndex.current = index;
  };

  const handleWatchlistDragEnd = () => {
    // Finalize the order
    setWlKeys([...currentOrder.current]);
    
    // Save to localStorage
    try {
      localStorage.setItem('watchlistOrder', JSON.stringify(currentOrder.current));
      console.log('Watchlist order saved during drag end');
    } catch (error) {
      console.error('Error saving watchlist order during drag end:', error);
    }
    
    dragStartIndex.current = null;
  };

  // Clear editing when selection changes
  useEffect(() => {
    if (selected.length === 0) {
      setEditingSymbol(null);
      setEditingValue('');
    }
  }, [selected]);

  // Clear editing when changing watchlists
  useEffect(() => {
    setEditingSymbol(null);
    setEditingValue('');
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
        tickers = tickers.filter((ticker) => (ticker.changesPercentage || 0) > 0);
      } else if (filterMode === 'losers') {
        tickers = tickers.filter((ticker) => (ticker.changesPercentage || 0) < 0);
      }

      setVisibleTickers(tickers);

      // Update top and worst performers across the entire watchlist
      if (watchLists[wlKey].length > 0) {
        const allTickers = [...watchLists[wlKey]];
        // Sort by changes percentage
        const sortedByChange = [...allTickers].sort((a, b) => (b.changesPercentage || 0) - (a.changesPercentage || 0));

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
    }
  }, [watchLists[wlKey]]);

  // Add this effect to handle opening the dialog when a stock is selected
  useEffect(() => {
    if (addStockSymbol && wlKey && searchReady) {
      setAddStockDialog(true);
    }
  }, [addStockSymbol, wlKey, searchReady]);

  // Initial data load
  const queryWatchLists = async () => {
    try {
      const userID: string = await getUserID();
      const wls = await WatchlistApiService.fetchWatchlistsByUserId(userID);
      if (Array.isArray(wls)) {
        let tempWls: Watchlists = {};
        wls.forEach((wl, i) => {
          if (i === 0 && !wlFromQuery) setWlKey(wl.watchlistName);
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

  // Load watchlist order from localStorage
  useEffect(() => {
    // Only try to restore order if we have watchlists loaded
    if (wlKeys.length > 0) {
      try {
        const savedOrder = localStorage.getItem('watchlistOrder');
        if (savedOrder) {
          const parsedOrder = JSON.parse(savedOrder);
          
          // Validate the saved order against current watchlists
          const validOrder = parsedOrder.filter((key: string) => wlKeys.includes(key));
          
          // Add any new watchlists that aren't in the saved order
          wlKeys.forEach(key => {
            if (!validOrder.includes(key)) {
              validOrder.push(key);
            }
          });
          
          if (validOrder.length > 0) {
            // Update state with the restored order
            setWlKeys(validOrder);
            
            // Recreate watchlists object with the correct order
            const orderedWatchlists: Watchlists = {};
            validOrder.forEach((key: string) => {
              if (watchLists[key]) {
                orderedWatchlists[key] = watchLists[key];
              }
            });
            
            if (Object.keys(orderedWatchlists).length > 0) {
              setWatchLists(orderedWatchlists);
            }
          }
        }
      } catch (error) {
        console.error('Error loading watchlist order from localStorage:', error);
      }
    }
  }, [wlKeys.length, watchLists]);

  useEffect(() => {
    if (wlFromQuery && highlightFromQuery && watchLists[wlFromQuery]) {
      // Ensure we're viewing the correct watchlist
      setWlKey(wlFromQuery);
  
      // Wait for the tickers to be rendered before highlighting
      const timeout = setTimeout(() => {
        setHighlightedSymbol(highlightFromQuery);
  
        // Remove highlight after 3s
        setTimeout(() => setHighlightedSymbol(null), 3000);
      }, 500);
  
      return () => clearTimeout(timeout);
    }
  }, [wlFromQuery, highlightFromQuery, watchLists]);
  
  useEffect(() => {
    if (wlKey && tabRefs.current[wlKey]) {
      tabRefs.current[wlKey]!.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [wlKey]);  

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

  // Handle timeframe change
  const handleTimeframeChange = (event: SelectChangeEvent) => {
    setTimeframeMode(event.target.value as TimeframeMode);
  };

  // Validate price format: positive number with up to 2 decimal places
  const validateAlertPrice = (price: string, symbol: string): boolean => {
    const priceStr = String(price).trim();
    // First clean up the string (allow trailing decimal point for UX)
    const cleanedPrice = priceStr.endsWith('.') ? priceStr + '0' : priceStr;

    if (!cleanedPrice) {
      setAlertError('Price required');
      return false;
    }

    // More permissive pattern for validation on blur/submit
    // This allows valid currency formats like 1, 1.5, 10.99
    if (!/^[0-9]+(\.[0-9]{0,2})?$/.test(cleanedPrice)) {
      setAlertError('Enter a valid price (e.g., 10.99)');
      return false;
    }

    const numValue = parseFloat(cleanedPrice);
    if (numValue <= 0) {
      setAlertError('Price must be greater than 0');
      return false;
    }

    // Clear error if valid
    setAlertError('');
    return true;
  };

  // Helper functions for sorting
  function getComparator(
    order: Order,
    orderBy: keyof WatchlistTicker
  ): (a: WatchlistTicker, b: WatchlistTicker) => number {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  }

  function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
    const valA = a[orderBy];
    const valB = b[orderBy];

    // Handle undefined safely
    if (valA == null && valB == null) return 0;
    if (valA == null) return 1;
    if (valB == null) return -1;

    if (valB < valA) return -1;
    if (valB > valA) return 1;
    return 0;
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
        tickers = tickers.filter((ticker) => (ticker.changesPercentage || 0) > 0);
      } else if (filterMode === 'losers') {
        tickers = tickers.filter((ticker) => (ticker.changesPercentage || 0) < 0);
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
    setSearchReady(true);
    setAddStockDialog(true);
  };

  // Update the handle close method for the AddStockDialog
  const handleCloseAddStockDialog = () => {
    setAddStockDialog(false);
    // Reset states after dialog closes
    setAddStockSymbol('');
    setSearchReady(false);
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

      const selectedCopy = [...selected]; // Save a copy before clearing
      setSelected([]);

      // Then perform the server request in the background
      await WatchlistApiService.deleteStocksInWatchlist(wlKey, selectedCopy);
    } catch (error) {
      console.error('Error deleting stocks:', error);
      // In a real app, you might want to show an error toast here
    }
  };

  // Handle individual alert price editing
  const handleAlertPriceClick = (symbol: string, currentPrice: number | null) => {
    setEditingSymbol(symbol);
    setEditingValue(currentPrice != null ? currentPrice.toFixed(2) : '');
    setAlertError('');
  };

  const handleAlertPriceSave = async (symbol: string) => {
    if (!validateAlertPrice(editingValue, symbol)) {
      return;
    }

    try {
      const ticker: MinimalWatchlistTicker = {
        symbol,
        alertPrice: parseFloat(editingValue)
      };

      await WatchlistApiService.editStockAlertPrices([ticker], wlKey);

      // Refresh watchlist data
      const updatedWatchlist = await WatchlistApiService.fetchWatchlist(wlKey);
      if (updatedWatchlist) {
        watchLists[wlKey] = updatedWatchlist.tickers;
        refreshWatchlist({ ...watchLists });
      }

      // Exit edit mode
      setEditingSymbol(null);
      setEditingValue('');
      setAlertError('');
    } catch (error) {
      throwError(error);
    }
  };

  const handleAlertPriceCancel = () => {
    setEditingSymbol(null);
    setEditingValue('');
    setAlertError('');
  };

  const handleWatchlistChange = (event: React.SyntheticEvent, newValue: string) => {
    setWlKey(newValue);
  };

  // Handler for view mode changes with new timeframe options
  const handleViewModeChange = (event: React.MouseEvent<HTMLElement>, newMode: ViewMode | null) => {
    if (newMode !== null) {
      setViewMode(newMode);

      // Update timeframe if a timeframe-specific view is selected
      if (['90d', '180d', '1y', '3y', '5y'].includes(newMode)) {
        setTimeframeMode(newMode as TimeframeMode);
      }
    }
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

  // Helper to get the display label for timeframe mode
  const getTimeframeLabel = (mode: TimeframeMode): string => {
    switch (mode) {
      case '90d': return '90-Day';
      case '180d': return '180-Day';
      case '1y': return '1-Year';
      case '3y': return '3-Year';
      case '5y': return '5-Year';
      default: return '1-Year';
    }
  };

  // Helper to get the appropriate high/low values based on timeframe
  const getTimeframeHighValue = (ticker: WatchlistTicker, timeframe: TimeframeMode): number | null => {
    switch (timeframe) {
      case '90d': return ticker.ninetyDayHigh || null;
      case '180d': return ticker.oneEightyDayHigh || null;
      case '1y': return ticker.yearHigh || null;
      case '3y': return ticker.threeYearHigh || null;
      case '5y': return ticker.fiveYearHigh || null;
      default: return ticker.yearHigh || null;
    }
  };

  const getTimeframeLowValue = (ticker: WatchlistTicker, timeframe: TimeframeMode): number | null => {
    switch (timeframe) {
      case '90d': return ticker.ninetyDayLow || null;
      case '180d': return ticker.oneEightyDayLow || null;
      case '1y': return ticker.yearLow || null;
      case '3y': return ticker.threeYearLow || null;
      case '5y': return ticker.fiveYearLow || null;
      default: return ticker.yearLow || null;
    }
  };

  // Calculate percentage off high/low for selected timeframe
  const getTimeframeHighPercentage = (ticker: WatchlistTicker, timeframe: TimeframeMode): number | null => {
    const high = getTimeframeHighValue(ticker, timeframe);
    if (high === null || ticker.price === null) return null;
    return ((high - ticker.price) / high) * 100;
  };

  const getTimeframeLowPercentage = (ticker: WatchlistTicker, timeframe: TimeframeMode): number | null => {
    const low = getTimeframeLowValue(ticker, timeframe);
    if (low === null || ticker.price === null) return null;
    return ((ticker.price - low) / low) * 100;
  };

  // Calculate dollar deviation from alert price
  const getAlertPriceDeviation = (ticker: WatchlistTicker): number | null => {
    if (ticker.price === null || ticker.alertPrice === null) return null;
    return ticker.price - ticker.alertPrice;
  };

  // Define columns based on view mode with enhanced timeframe support
  const getColumnsForView = (mode: ViewMode) => {
    // Core columns that appear in all views
    const coreColumns = [
      { id: 'symbol', label: 'Symbol', align: 'left' },
      { id: 'alertPrice', label: 'Alert Price', align: 'right' },
      { id: 'price', label: 'Current Price', align: 'right' },
      {
        id: 'alertPriceDeviationPercent',
        label: 'Alert Deviation %',
        align: 'right',
        tooltip: 'Percentage difference between current price and alert price: ((Current Price - Alert Price) / Alert Price) * 100%'
      }
    ];

    // Timeframe-specific views (90d, 180d, 1y, 3y, 5y)
    if (['90d', '180d', '1y', '3y', '5y'].includes(mode)) {
      return [
        ...coreColumns,
        {
          id: `${mode}High`,
          label: `${getTimeframeLabel(mode as TimeframeMode)} High`,
          align: 'right',
          timeframe: mode as TimeframeMode
        },
        {
          id: `${mode}HighVsCurrentPercentage`,
          label: `Off ${getTimeframeLabel(mode as TimeframeMode)} High %`,
          align: 'right',
          tooltip: `Percentage difference between current price and ${getTimeframeLabel(mode as TimeframeMode)} high`,
          timeframe: mode as TimeframeMode
        },
        {
          id: `${mode}Low`,
          label: `${getTimeframeLabel(mode as TimeframeMode)} Low`,
          align: 'right',
          timeframe: mode as TimeframeMode
        },
        {
          id: `${mode}LowVsCurrentPercentage`,
          label: `Off ${getTimeframeLabel(mode as TimeframeMode)} Low %`,
          align: 'right',
          tooltip: `Percentage difference between current price and ${getTimeframeLabel(mode as TimeframeMode)} low`,
          timeframe: mode as TimeframeMode
        }
      ];
    }

    // Original view modes (full, high, low)
    if (mode === 'full') {
      return [
        ...coreColumns,
        { id: 'yearHigh', label: '1-Year High', align: 'right' },
        {
          id: 'yearHighVsCurrentPercentage',
          label: 'Off 1-Year High %',
          align: 'right',
          tooltip: 'Percentage difference between current price and year high: ((Year High - Current Price) / Year High) * 100%'
        },
        { id: 'fiveYearHigh', label: '5-Year High', align: 'right' },
        {
          id: 'fiveYearHighVsCurrentPercentage',
          label: 'Off 5-Year High %',
          align: 'right',
          tooltip: 'Percentage difference between current price and 5-year high: ((5Y High - Current Price) / 5Y High) * 100%'
        },
        { id: 'yearLow', label: '1-Year Low', align: 'right' },
        {
          id: 'yearLowVsCurrentPercentage',
          label: 'Off 1-Year Low %',
          align: 'right',
          tooltip: 'Percentage difference between current price and year low: ((Current Price - Year Low) / Year Low) * 100%'
        },
        { id: 'fiveYearLow', label: '5-Year Low', align: 'right' },
        {
          id: 'fiveYearLowVsCurrentPercentage',
          label: 'Off 5-Year Low %',
          align: 'right',
          tooltip: 'Percentage difference between current price and 5-year low: ((Current Price - 5Y Low) / 5Y Low) * 100%'
        }
      ];
    } else if (mode === 'high') {
      return [
        ...coreColumns,
        { id: 'yearHigh', label: '1-Year High', align: 'right' },
        {
          id: 'yearHighVsCurrentPercentage',
          label: 'Off 1-Year High %',
          align: 'right',
          tooltip: 'Percentage difference between current price and year high: ((Year High - Current Price) / Year High) * 100%'
        },
        { id: 'fiveYearHigh', label: '5-Year High', align: 'right' },
        {
          id: 'fiveYearHighVsCurrentPercentage',
          label: 'Off 5-Year High %',
          align: 'right',
          tooltip: 'Percentage difference between current price and 5-year high: ((5Y High - Current Price) / 5Y High) * 100%'
        }
      ];
    } else {
      // low mode
      return [
        ...coreColumns,
        { id: 'yearLow', label: '1-Year Low', align: 'right' },
        {
          id: 'yearLowVsCurrentPercentage',
          label: 'Off 1-Year Low %',
          align: 'right',
          tooltip: 'Percentage difference between current price and year low: ((Current Price - Year Low) / Year Low) * 100%'
        },
        { id: 'fiveYearLow', label: '5-Year Low', align: 'right' },
        {
          id: 'fiveYearLowVsCurrentPercentage',
          label: 'Off 5-Year Low %',
          align: 'right',
          tooltip: 'Percentage difference between current price and 5-year low: ((Current Price - 5Y Low) / 5Y Low) * 100%'
        }
      ];
    }
  };

  // Render table rows with stock data
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
      let message = 'No stocks in this watchlist. Use the search bar above to add stocks.';

      if (filterMode === 'gainers' && watchLists[wlKey]?.length > 0) {
        message = 'No gaining stocks found. Try changing the filter to see all stocks.';
      } else if (filterMode === 'losers' && watchLists[wlKey]?.length > 0) {
        message = 'No losing stocks found. Try changing the filter to see all stocks.';
      }

      return (
        <TableRow>
          <TableCell colSpan={12} align="center">
            <Typography sx={{ py: 3, color: 'var(--secondary-blue)' }}>{message}</Typography>
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
          id={`row-${row.symbol}`}
          selected={isItemSelected}
          sx={{
            cursor: 'pointer',
            backgroundColor: highlightedSymbol === row.symbol ? 'rgba(214, 209, 209, 0.8)' : 'inherit',
            transition: 'background-color 0.5s ease',
            '&:hover': { backgroundColor: 'var(--background-light)' }
          }}
        >
          <TableCell padding="checkbox">
            <Checkbox color="primary" checked={isItemSelected} inputProps={{ 'aria-labelledby': labelId }} />
          </TableCell>

          <TableCell align="center" padding="none">
            {row.alertPrice != null ? (
              <Tooltip title="Alert price set">
                <NotificationsIcon
                  sx={{
                    color: 'white',
                    backgroundColor: 'var(--primary-blue)',
                    borderRadius: '50%',
                    padding: '4px',
                    fontSize: '20px'
                  }}
                />
              </Tooltip>
            ) : (
              <Tooltip title="No alert price">
                <NotificationsNoneIcon
                  sx={{
                    color: 'var(--primary-blue)',
                    fontSize: '20px'
                  }}
                />
              </Tooltip>
            )}
          </TableCell>

          {/* Symbol with hover details */}
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

          {/* Alert Price */}
          <TableCell align="right">
            {editingSymbol === row.symbol ? (
              <TextField
                value={editingValue}
                error={!!alertError}
                helperText={alertError}
                size="small"
                type="text"
                variant="outlined"
                autoFocus
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
                }}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
                    setEditingValue(value);
                  }
                }}
                onBlur={() => {
                  if (editingValue.trim() === '') {
                    handleAlertPriceCancel();
                  } else {
                    handleAlertPriceSave(row.symbol);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAlertPriceSave(row.symbol);
                  } else if (e.key === 'Escape') {
                    handleAlertPriceCancel();
                  }
                }}
              />
            ) : (
              <Box
                sx={{
                  display: 'inline-block',
                  minWidth: '80px',
                  p: '4px 8px',
                  borderRadius: '4px',
                  color: row.alertPrice == null ? 'var(--secondary-blue)' : 'inherit',
                  fontStyle: 'normal',
                  cursor: 'pointer',
                  textAlign: 'center',
                  '&:hover': {
                    backgroundColor: 'var(--background-light)'
                  }
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAlertPriceClick(row.symbol, row.alertPrice);
                }}
              >
                {row.alertPrice != null ? (
                  `${row.alertPrice.toFixed(2)}`
                ) : (
                  <>
                    No price set
                    <br />
                    <span style={{ fontWeight: 500 }}>click to add</span>
                  </>
                )}
              </Box>
            )}
          </TableCell>

          {/* Current Price */}
          <TableCell align="right" sx={{ fontWeight: 600 }}>
            ${row.price != null ? row.price.toFixed(2) : '0.00'}
          </TableCell>

          {/* Alert Price Deviation Percentage */}
          <TableCell
            align="right"
            sx={{
              color: (getAlertPriceDeviationPercent(row) || 0) >= 0 ? 'green' : 'red',
              fontWeight: 500,
              borderRight: '1px solid black'
            }}
          >
            {getAlertPriceDeviationPercent(row) !== null
              ? (getAlertPriceDeviationPercent(row)! >= 0 ? '+' : '') +
                getAlertPriceDeviationPercent(row)!.toFixed(2) +
                '%'
              : '0.00%'}
          </TableCell>

          {/* Timeframe-specific columns */}
          {['90d', '180d', '1y', '3y', '5y'].includes(viewMode) && (
            <>
              {/* High value for selected timeframe */}
              <TableCell
                align="right"
                sx={{
                  backgroundColor: 'rgba(232, 244, 253, 0.6)',
                  borderRight: '1px solid rgba(0, 0, 0, 0.1)',
                  borderLeft: '1px solid black'
                }}
              >
                $
                {getTimeframeHighValue(row, viewMode as TimeframeMode) !== null
                  ? getTimeframeHighValue(row, viewMode as TimeframeMode)!.toFixed(2)
                  : '0.00'}
              </TableCell>

              {/* High percentage for selected timeframe */}
              <TableCell
                align="right"
                sx={{
                  color: (getTimeframeHighPercentage(row, viewMode as TimeframeMode) || 0) >= 0 ? 'green' : 'red',
                  fontWeight: 500,
                  backgroundColor: 'rgba(232, 244, 253, 0.6)',
                  borderRight: '1px solid black'
                }}
              >
                {renderPercentage(getTimeframeHighPercentage(row, viewMode as TimeframeMode))}
              </TableCell>

              {/* Low value for selected timeframe */}
              <TableCell
                align="right"
                sx={{
                  backgroundColor: 'rgba(253, 237, 232, 0.6)',
                  borderRight: '1px solid rgba(0, 0, 0, 0.1)',
                  borderLeft: '1px solid black'
                }}
              >
                $
                {getTimeframeLowValue(row, viewMode as TimeframeMode) !== null
                  ? getTimeframeLowValue(row, viewMode as TimeframeMode)!.toFixed(2)
                  : '0.00'}
              </TableCell>

              {/* Low percentage for selected timeframe */}
              <TableCell
                align="right"
                sx={{
                  color: (getTimeframeLowPercentage(row, viewMode as TimeframeMode) || 0) >= 0 ? 'green' : 'red',
                  fontWeight: 500,
                  backgroundColor: 'rgba(253, 237, 232, 0.6)',
                  borderRight: '1px solid black'
                }}
              >
                {renderPercentage(getTimeframeLowPercentage(row, viewMode as TimeframeMode))}
              </TableCell>
            </>
          )}
          
          {/* View-specific columns */}
          {viewMode === 'full' && (
            <>
              {/* High metrics section */}
              <TableCell
                align="right"
                sx={{
                  backgroundColor: 'rgba(232, 244, 253, 0.6)',
                  borderRight: '1px solid rgba(0, 0, 0, 0.1)',
                  borderLeft: '1px solid black'
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

              {/* Low metrics section */}
              <TableCell
                align="right"
                sx={{
                  backgroundColor: 'rgba(253, 237, 232, 0.6)',
                  borderRight: '1px solid rgba(0, 0, 0, 0.1)',
                  borderLeft: '1px solid black' // Left border of low section
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
                  borderLeft: '1px solid black' // Left border of high section
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
                  borderLeft: '1px solid black' // Left border of low section
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
            {/* Expanded view mode toggle with timeframe options */}
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
                  padding: '5px 10px',
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
              <ToggleButton value="90d" aria-label="90 day view">
                <Tooltip title="90 Day View">
                  <Box sx={{ fontSize: '0.75rem', fontWeight: 600 }}>90d</Box>
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="180d" aria-label="180 day view">
                <Tooltip title="180 Day View">
                  <Box sx={{ fontSize: '0.75rem', fontWeight: 600 }}>180d</Box>
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="1y" aria-label="1 year view">
                <Tooltip title="1 Year View">
                  <Box sx={{ fontSize: '0.75rem', fontWeight: 600 }}>1y</Box>
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="3y" aria-label="3 year view">
                <Tooltip title="3 Year View">
                  <Box sx={{ fontSize: '0.75rem', fontWeight: 600 }}>3y</Box>
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="5y" aria-label="5 year view">
                <Tooltip title="5 Year View">
                  <Box sx={{ fontSize: '0.75rem', fontWeight: 600 }}>5y</Box>
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>

        {/* Performers Summary */}
        {wlKey && <WatchlistPerformersSummary topPerformer={topPerformer} worstPerformer={worstPerformer} />}

        {/* Watchlist tabs with reordering UI */}
        <Box sx={{ mt: 2 }}>
          <Box sx={{ 
            borderBottom: 1, 
            borderColor: 'divider', 
            display: 'flex', 
            alignItems: 'center',
            position: 'relative'
          }}>
            {/* Custom tabs component that supports drag and drop */}
            <Box 
              sx={{
                display: 'flex',
                alignItems: 'center',
                flexGrow: 1,
                overflow: 'auto',
                '&::-webkit-scrollbar': {
                  height: '4px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'transparent'
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: 'var(--border-color)',
                  borderRadius: '4px',
                }
              }}
            >
              {isReorderMode ? (
                /* Reorder mode - draggable tabs */
                <Box 
                  component="div" 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    backgroundColor: 'var(--background-light)',
                    borderRadius: '8px',
                    padding: '4px',
                    border: '1px solid var(--border-color)',
                    width: '100%',
                    overflow: 'auto'
                  }}
                >
                  {wlKeys.map((key, index) => (
                    <DraggableTab
                      key={key}
                      label={key}
                      value={key}
                      index={index}
                      isSelected={wlKey === key}
                      isReorderMode={true}
                      onDragStart={handleWatchlistDragStart}
                      onDragOver={handleWatchlistDragOver}
                      onDragEnd={handleWatchlistDragEnd}
                    />
                  ))}
                </Box>
              ) : (
                /* Normal mode - regular tabs */
                <Tabs
                  value={wlKey}
                  onChange={handleWatchlistChange}
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{
                    flexGrow: 1,
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
                      ref={(el: HTMLDivElement | null) => {
                        tabRefs.current[key] = el;
                      }}
                      sx={{
                        textTransform: 'none',
                        fontWeight: wlKey === key ? 600 : 400
                      }}
                    />
                  ))}
                </Tabs>
              )}
            </Box>

            {/* Only show these buttons when not in reorder mode */}
            {!isReorderMode && (
              <>
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

                {/* Reorder button - moved between create and delete */}
                {wlKeys.length > 1 && (
                  <IconButton
                    onClick={toggleReorderMode}
                    sx={{
                      ml: 1,
                      color: 'var(--primary-blue)',
                      '&:hover': {
                        backgroundColor: 'var(--background-light)'
                      }
                    }}
                  >
                    <DragIndicatorIcon />
                  </IconButton>
                )}

                {wlKey && (
                  <IconButton
                    size="small"
                    onClick={() => setDeleteWatchlistDialog(true)}
                    sx={{ ml: 1, color: 'var(--primary-blue)' }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </>
            )}

            {/* Show done button when in reorder mode */}
            {isReorderMode && (
              <Button
                startIcon={<CheckIcon />}
                color="success"
                variant="contained"
                onClick={toggleReorderMode}
                sx={{
                  ml: 1,
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontFamily: 'var(--font-family)',
                  fontWeight: 600,
                  minWidth: '100px'
                }}
              >
                Done
              </Button>
            )}
          </Box>
        </Box>

        {/* Search and add stock section - show only when not in reorder mode */}
        {!isReorderMode && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              mt: 3,
              mb: 1,
              width: 'fit-content',
              position: 'relative',
              left: 0
            }}
          >
            <Typography
              variant="body1"
              component="span"
              sx={{
                mr: 2,
                whiteSpace: 'nowrap',
                color: 'var(--secondary-blue)',
                fontFamily: 'var(--font-family)'
              }}
            >
              Add to watchlist:
            </Typography>

            <Box display="inline-block">
              <WatchlistTickersSearchBar
                setAddStockSymbol={(symbol) => {
                  setSearchReady(true);
                  setAddStockSymbol(symbol);
                }}
                onSelectStock={() => {
                  if (addStockSymbol && wlKey && searchReady) {
                    setAddStockDialog(true);
                  }
                }}
                isDisabled={!wlKey}
              />
            </Box>
          </Box>
        )}
      </Box>

      {/* Table Section - show only when not in reorder mode */}
      {wlKey && !isReorderMode && (
        <>
          <EnhancedTableToolbar
            numSelected={selected.length}
            handleDeleteStocks={handleDeleteStocks}
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

                  <TableCell sx={{ width: 40 }}></TableCell>

                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      align={column.align === 'right' ? 'right' : 'left'}
                      sx={{
                        fontWeight: 600,
                        color: 'var(--primary-blue)',
                        fontFamily: 'var(--font-family)',
                        backgroundColor: column.id.includes('High')
                          ? 'rgba(232, 244, 253, 0.3)'
                          : column.id.includes('Low')
                          ? 'rgba(253, 237, 232, 0.3)'
                          : 'inherit',
                        borderLeft:
                          column.id === 'yearHigh' ||
                          column.id === 'yearLow' ||
                          column.id === '90dHigh' ||
                          column.id === '90dLow' ||
                          column.id === '180dHigh' ||
                          column.id === '180dLow' ||
                          column.id === '1yHigh' ||
                          column.id === '1yLow' ||
                          column.id === '3yHigh' ||
                          column.id === '3yLow' ||
                          column.id === '5yHigh' ||
                          column.id === '5yLow'
                            ? '1px solid black'
                            : 'inherit',
                        borderRight:
                          column.id === 'fiveYearHighVsCurrentPercentage' ||
                          column.id === 'fiveYearLowVsCurrentPercentage' ||
                          column.id === 'alertPriceDeviationPercent' ||
                          column.id === '90dHighVsCurrentPercentage' ||
                          column.id === '180dHighVsCurrentPercentage' ||
                          column.id === '1yHighVsCurrentPercentage' ||
                          column.id === '3yHighVsCurrentPercentage' ||
                          column.id === '5yHighVsCurrentPercentage' ||
                          column.id === '90dLowVsCurrentPercentage' ||
                          column.id === '180dLowVsCurrentPercentage' ||
                          column.id === '1yLowVsCurrentPercentage' ||
                          column.id === '3yLowVsCurrentPercentage' ||
                          column.id === '5yLowVsCurrentPercentage'
                            ? '1px solid black'
                            : column.id.includes('High') || column.id.includes('Low')
                            ? '1px solid rgba(0, 0, 0, 0.1)'
                            : 'inherit'
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

      {/* When in reorder mode and no watchlists, show a message */}
      {isReorderMode && wlKeys.length === 0 && (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No watchlists to reorder. Create a watchlist first.
          </Typography>
        </Box>
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
        onClose={handleCloseAddStockDialog}
      />

      <DeleteWatchListDialog
        watchListName={wlKey}
        isDeleteWatchListDialog={isDeleteWatchlistDialog}
        handleCloseDeleteWatchListDialog={handleCloseDeleteWatchlistDialog}
      />
    </TableContainer>
  );
}
