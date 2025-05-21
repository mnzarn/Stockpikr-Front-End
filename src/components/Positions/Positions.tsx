export const validatePositionName = (name: string): { valid: boolean; message: string } => {
  const validPattern = /^[a-zA-Z0-9\-_\s]+$/;

  if (!validPattern.test(name)) {
    const invalidChars = name.split('').filter((char) => !validPattern.test(char));
    const uniqueInvalidChars = [...new Set(invalidChars)];

    return {
      valid: false,
      message: `Position name can only contain letters, numbers, hyphens, underscores, and spaces. Invalid characters: ${uniqueInvalidChars.join(' ')}`
    };
  }

  return { valid: true, message: '' };
};
import AddIcon from '@mui/icons-material/Add';

import DeleteIcon from '@mui/icons-material/Delete';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
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
  Paper, Tab, Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow, Tabs,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { getErrorResponse } from '../../helper/errorResponse';
import { Positions, Ticker } from '../../interfaces/IPurchasedStockModel';
import { IStockQuote } from '../../interfaces/IStockQuote';
import { PositionsApiService } from '../../services/PositionsApiService';
import { StockApiService } from '../../services/StockApiService';
import { useAsyncError } from '../GlobalErrorBoundary';
import WatchlistTickersSearchBar from '../Watchlist/WatchlistTickersSearchBar';
import AddPositionDialog from './AddPositionDialog';


type Order = 'asc' | 'desc';

// Enhanced toolbar with improved styling
interface EnhancedTableToolbarProps {
  numSelected: number;
  handleDeleteStocks: () => void;
}

const EnhancedTableToolbar: React.FC<EnhancedTableToolbarProps> = (props) => {
  const { numSelected } = props;
  const [isDeleteTicker, setDeleteTicker] = useState(false);

  const onCancelDeleteTickers = () => {
    setDeleteTicker(false);
  };

  const onConfirmDeleteTickers = () => {
    props.handleDeleteStocks();
    setDeleteTicker(false);
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
          Positions
        </Typography>
      )}
      {numSelected > 0 ? (
        <Box>
          <Tooltip title="Delete">
            <IconButton onClick={() => setDeleteTicker(true)}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ) : (
        <Box />
      )}

      <Dialog open={isDeleteTicker} onClose={onCancelDeleteTickers}>
        <DialogTitle>Delete selected positions</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete these selected positions? Once deleted, they won't be recoverable.
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

export default function MyPositions() {
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof Ticker>('symbol');
  const [selected, setSelected] = useState<string[]>([]);
  const [positions, setPositions] = useState<{ [key: string]: Ticker[] }>({});
  const [isAddStockDialog, setAddStockDialog] = useState(false);
  const [addStockSymbol, setAddStockSymbol] = useState('');
  const [stockInfo, setStockInfo] = useState<IStockQuote>();
  const [positionKey, setPositionKey] = useState('');
const [positionKeys, setPositionKeys] = useState<string[]>([]);
const [createPositionOpen, setCreatePositionOpen] = useState(false);
const [newPositionName, setNewPositionName] = useState('');
const [positionNameError, setPositionNameError] = useState('');
  const throwError = useAsyncError();

  // Generate a unique ID for each position to use for selection
  const generatePositionId = (position: Ticker): string => {
const datePart = position.purchaseDate ? new Date(position.purchaseDate).getTime() : 'null';
return `${position.symbol}-${datePart}-${position.purchasePrice}-${position.quantity}`;
  };
  const refreshPositions = (positions: Positions) => {
    setPositions(positions);
    setPositionKeys(Object.keys(positions));
  };

  const isSelected = (positionId: string) => selected.indexOf(positionId) !== -1;

  const fetchStockData = async (symbol: string): Promise<void> => {
    if (!symbol) return;

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

  useEffect(() => {
    if (addStockSymbol) {
      fetchStockData(addStockSymbol);
    }
  }, [addStockSymbol]);

  // Get all positions as a flattened array with unique IDs
  // Use useMemo to prevent recreating this array on every render
  const positionsForSelectedPortfolio = useMemo(() => {
  return (positions[positionKey] || []).map(position => ({
    ...position,
    positionId: generatePositionId(position)
  }));
}, [positions, positionKey]);

  // Sort positions using the comparator
 const sortedPositions = useMemo(() => {
  return [...positionsForSelectedPortfolio].sort(getComparator(order, orderBy));
}, [positionsForSelectedPortfolio, order, orderBy]);

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      if (sortedPositions.length === 0) {
        setSelected([]);
        return;
      }
      const newSelected = sortedPositions.map((position) => position.positionId);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleAddStockToPortfolio = async (newTicker: Ticker) => {
  if (!positionKey) return;

  const existing = positions[positionKey] || [];

  const alreadyExists = existing.some(t => t.symbol.toUpperCase() === newTicker.symbol.toUpperCase());
  if (alreadyExists) {
    alert(`Ticker ${newTicker.symbol} already exists in "${positionKey}"`);
    return;
  }

  const updatedTickers = [...existing, newTicker];

  try {
    const updated = await PositionsApiService.updatePurchasedStockTickers(positionKey, updatedTickers);
if (updated) {
  setPositions(prev => ({
    ...prev,
    [positionKey]: updatedTickers // not `updated.tickers`
  }));
  setAddStockDialog(false);
  setAddStockSymbol('');
  // Optional: await queryPurchasedStocks(); only if you suspect backend drift
}

  } catch (error) {
    console.error("Failed to add stock to portfolio:", error);
  }
};




  const handleDeleteStocks = async () => {
    try {
      // Extract symbols from position IDs
      const symbolsToDelete = selected.map(id => id.split('-')[0]);
      
      // Remove duplicates
      const uniqueSymbolsToDelete = [...new Set(symbolsToDelete)];
      
      const patchResult = await PositionsApiService.deleteTickersFromPortfolio(positionKey, uniqueSymbolsToDelete);
      if (patchResult && patchResult.matchedCount > 0 && patchResult.modifiedCount > 0) {
        // Optimistically update UI
        const updatedPositions: { [key: string]: Ticker[] } = {};
        for (const key in positions) {
          updatedPositions[key] = positions[key].filter((position) => {
            const positionId = generatePositionId(position);
            return !selected.includes(positionId);
          });
        }
        setPositions(updatedPositions);
        setSelected([]);
      } else {
        throw new Error('Could not delete positions');
      }
    } catch (error) {
      throwError(error);
    }
  };
  const handleCreateNewPosition = async () => {
  setPositionNameError('');

  if (!newPositionName.trim()) return;

  const name = newPositionName.trim();
  if (positionKeys.includes(name)) {
    setPositionNameError('A position set with this name already exists.');
    return;
  }

  const validation = validatePositionName(name);
  if (!validation.valid) {
    setPositionNameError(validation.message);
    return;
  }

  try {
    const result = await PositionsApiService.createPurchasedStockPortfolio(name, []);
    if (result) {
      const updated = { ...positions, [name]: [] };
      setPositions(updated);
      setPositionKeys(Object.keys(updated));
      setPositionKey(name);
      setCreatePositionOpen(false);
      setNewPositionName('');
    } else {
      setPositionNameError('Failed to create position.');
    }
  } catch (error) {
    console.error('Error creating position:', error);
    setPositionNameError('Something went wrong.');
  }
};

  

  const handleRequestSort = (event: React.MouseEvent<unknown>, property: keyof Ticker) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

 const queryPurchasedStocks = async () => {
  try {
    const result = await PositionsApiService.fetchPurchasedStocksByUserId();
    console.log('Fetched portfolios:', result);
   const updated: { [key: string]: Ticker[] } = {};
  result.forEach(r => {
  updated[r.purchasedstocksName] = r.tickers; // r.name is the portfolio/position set name
});
const keys = Object.keys(updated);

    setPositions(updated);
    console.log('Updated positions:', updated);
    setPositionKeys(keys);

    if (!positionKey && keys.length > 0) {
      setPositionKey(keys[0]); // ✅ set default selected tab
    }
  } catch (error) {
    throwError(error);
  }
};


  useEffect(() => {
    queryPurchasedStocks();
  }, []);

  const handleSelectStock = (event: React.MouseEvent<unknown>, positionId: string) => {
    const selectedIndex = selected.indexOf(positionId);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, positionId);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
    }
    setSelected(newSelected);
  };

  // Format currency values consistently
  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '$0.00';
    return `$${value.toFixed(2)}`;
  };

  // Format percentage value with trend icon
  const renderPercentage = (value: number | null | undefined) => {
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

  // Custom comparator that handles null values and dates
  function descendingComparator(a: Ticker & { positionId: string }, b: Ticker & { positionId: string }, orderBy: keyof Ticker) {
    // Special handling for purchaseDate which can be Date | null | string
    if (orderBy === 'purchaseDate') {
      // Handle null values
      if (!a.purchaseDate && !b.purchaseDate) return 0;
      if (!a.purchaseDate) return 1; // Null values go last in descending order
      if (!b.purchaseDate) return -1;

      // Convert to Date objects if they're strings
      const dateA = a.purchaseDate instanceof Date ? a.purchaseDate : new Date(a.purchaseDate);
      const dateB = b.purchaseDate instanceof Date ? b.purchaseDate : new Date(b.purchaseDate);

      // Compare dates safely
      const timeA = !isNaN(dateA.getTime()) ? dateA.getTime() : 0;
      const timeB = !isNaN(dateB.getTime()) ? dateB.getTime() : 0;

      return timeB - timeA;
    }

    // For all other properties, handle standard comparisons with null checks
    const aValue = a[orderBy];
    const bValue = b[orderBy];

    // Handle null or undefined values
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return 1; // Null values go last
    if (bValue == null) return -1;

    if (bValue < aValue) return -1;
    if (bValue > aValue) return 1;
    return 0;
  }

  function getComparator(
    order: Order,
    orderBy: keyof Ticker
  ): (a: Ticker & { positionId: string }, b: Ticker & { positionId: string }) => number {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  }

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
            My Positions
          </Typography>
        </Box>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', mt: 2 }}>
  <Tabs
    value={positionKey}
  onChange={(e, val) => {
    setPositionKey(val);
    // Optional: Debug which tab is selected
    console.log('Selected portfolio:', val);
  }}
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
    {positionKeys.map((key) => (
      <Tab
        key={key}
        label={key}
        value={key}
        sx={{
          textTransform: 'none',
          fontWeight: positionKey === key ? 600 : 400
        }}
      />
    ))}
  </Tabs>

  <Button
    startIcon={<AddIcon />}
    onClick={() => {
      setPositionNameError('');
      setCreatePositionOpen(true);
    }}
    sx={{
      ml: 1,
      color: 'var(--primary-blue)',
      borderRadius: '12px',
      textTransform: 'none',
      fontWeight: 600,
      '&:hover': {
        backgroundColor: 'var(--background-light)'
      }
    }}
  >
    Create
  </Button>
</Box>

        {/* Search and add stock section */}
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
            Add position:
          </Typography>

          <Box display="inline-flex" alignItems="center">
            <WatchlistTickersSearchBar
              setAddStockSymbol={setAddStockSymbol}
              onSelectStock={() => {
                if (addStockSymbol && positionKey) {
                  setAddStockDialog(true);
                }
              }}
              isDisabled={!positionKey}
            />
          </Box>
        </Box>
      </Box>

      {/* Table Section */}
      <EnhancedTableToolbar numSelected={selected.length} handleDeleteStocks={handleDeleteStocks} />

      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 650 }} aria-label="positions table">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  color="primary"
                  indeterminate={selected.length > 0 && selected.length < sortedPositions.length}
                  checked={sortedPositions.length > 0 && selected.length === sortedPositions.length}
                  onChange={handleSelectAllClick}
                  inputProps={{ 'aria-label': 'select all positions' }}
                />
              </TableCell>

              {[
                { id: 'purchaseDate', label: 'Purchase Date', align: 'left' },
                { id: 'symbol', label: 'Symbol', align: 'left' },
                { id: 'quantity', label: 'Quantity', align: 'right' },
                { id: 'purchasePrice', label: 'Purchase Price', align: 'right' },
                { id: 'price', label: 'Current Price', align: 'right' },
                { id: 'priceChange', label: 'Price Change', align: 'right' },
                { id: 'gainOrLoss', label: 'Gain/Loss', align: 'right' },
                { id: 'marketValue', label: 'Market Value', align: 'right' }
              ].map((column) => (
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
                    onClick={(e) => handleRequestSort(e, column.id as keyof Ticker)}
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

          <TableBody>
            {sortedPositions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  <Typography sx={{ py: 3, color: 'var(--secondary-blue)' }}>
                    No positions in your portfolio. Use the search bar above to add positions.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              sortedPositions.map((row, index) => {
                const isItemSelected = isSelected(row.positionId);
                const labelId = `enhanced-table-checkbox-${index}`;

                // Calculate percent change
                const percentChange = row.purchasePrice
                  ? ((row.price - row.purchasePrice) / row.purchasePrice) * 100
                  : 0;

                return (
                  <TableRow
                    hover
                    onClick={(event) => handleSelectStock(event, row.positionId)}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={row.positionId}
                    selected={isItemSelected}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: 'var(--background-light)' }
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox color="primary" checked={isItemSelected} inputProps={{ 'aria-labelledby': labelId }} />
                    </TableCell>

                    <TableCell>{row.purchaseDate ? new Date(row.purchaseDate).toLocaleDateString() : 'N/A'}</TableCell>

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
                        onClick={(e) => e.stopPropagation()}
                      >
                        {row.symbol}
                      </Box>
                      {row.priceChange && (
                        <Chip
                          label={row.priceChange}
                          size="small"
                          sx={{
                            ml: 1,
                            backgroundColor: 'var(--background-light)',
                            color: 'var(--secondary-blue)',
                            fontWeight: 500,
                            fontSize: '0.75rem'
                          }}
                        />
                      )}
                    </TableCell>

                    <TableCell align="right" sx={{ fontWeight: 500 }}>
                      {row.quantity}
                    </TableCell>

                    <TableCell align="right">{formatCurrency(row.purchasePrice)}</TableCell>

                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      {formatCurrency(row.price)}
                    </TableCell>

                    <TableCell
                      align="right"
                      sx={{
                        color: row.priceChange >= 0 ? 'green' : 'red',
                        fontWeight: 500
                      }}
                    >
                      {renderPercentage(percentChange)}
                    </TableCell>

                    <TableCell
                      align="right"
                      sx={{
                        color: row.gainOrLoss >= 0 ? 'green' : 'red',
                        fontWeight: 600
                      }}
                    >
                      {formatCurrency(row.gainOrLoss)}
                    </TableCell>

                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      {formatCurrency(row.marketValue)}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Box>

      <AddPositionDialog
  positions={positions}
  setPositions={setPositions}
  addStockSymbol={addStockSymbol}
  isAddStockDialog={isAddStockDialog}
  setAddStockDialog={setAddStockDialog}
  onAddTicker={handleAddStockToPortfolio}
/>

      <Dialog open={createPositionOpen} onClose={() => setCreatePositionOpen(false)}>
  <DialogTitle>Create New Position Set</DialogTitle>
  <DialogContent>
    <DialogContentText sx={{ mb: 2 }}>
      Enter a name for your new position set:
    </DialogContentText>

    {positionNameError && (
      <Alert severity="error" sx={{ mb: 2 }}>
        {positionNameError}
      </Alert>
    )}

    <TextField
      autoFocus
      fullWidth
      label="Position Name"
      value={newPositionName}
      onChange={(e) => setNewPositionName(e.target.value)}
    />
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setCreatePositionOpen(false)}>Cancel</Button>
    <Button onClick={handleCreateNewPosition} disabled={!newPositionName.trim()}>
      Create
    </Button>
  </DialogActions>
</Dialog>

    </TableContainer>
  );
}
