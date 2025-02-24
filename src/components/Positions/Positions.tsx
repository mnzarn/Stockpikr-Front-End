import AddIcon from '@mui/icons-material/Add';
import {
  Box,
  Button,
  ButtonGroup,
  Checkbox,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow
} from '@mui/material';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { getErrorResponse } from '../../helper/errorResponse';
import { getUserID } from '../../helper/userID';
import { PositionTickers } from '../../interfaces/IPositionsModel';
import { IStockQuote } from '../../interfaces/IStockQuote';
import { PositionsApiService } from '../../services/PositionsApiService';
import { StockApiService } from '../../services/StockApiService';
import { useAsyncError } from '../GlobalErrorBoundary';
import WatchlistTickersSearchBar from '../Watchlist/WatchlistTickersSearchBar';
import AddPositionDialog from './AddPositionDialog';
import { EnhancedTableToolbar, PositionsTHead } from './PositionsTHead';

type Order = 'asc' | 'desc';

export default function MyPositions() {
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof PositionTickers>('symbol');
  const [selected, setSelected] = useState<string[]>([]);
  const [positions, setPositions] = useState<{ [key: string]: PositionTickers[] }>({});
  const [isAddStockDialog, setAddStockDialog] = useState(false);
  const [addStockSymbol, setAddStockSymbol] = useState('');
  const [stockInfo, setStockInfo] = useState<IStockQuote>();
  const isSelected = (symbol: string) => selected.indexOf(symbol) !== -1;
  const throwError = useAsyncError();

  const fetchStockData = async (symbol: string): Promise<void> => {
    const response = await StockApiService.fetchDetailedStock(symbol);
    if (!response || getErrorResponse(response)) {
      return;
    }
    setStockInfo(response);
  };

  React.useEffect(() => {
    fetchStockData(addStockSymbol);
  }, [addStockSymbol]);

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked || !positions) {
      if (positions == null) {
        setSelected([]);
        return;
      }
      const newSelected = Object.values(positions).flatMap((positionsArray) => positionsArray).map((position) => position.symbol);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleDeleteStocks = async () => {
    const patchResult = await PositionsApiService.deleteStocksInWatchlist(selected);
    if (patchResult && patchResult.matchedCount > 0 && patchResult.modifiedCount > 0) {
      const updatedPositions: { [key: string]: PositionTickers[] } = {};
      for (const key in positions) {
        updatedPositions[key] = positions[key].filter((position) => !selected.includes(position.symbol));
      }
      setPositions(updatedPositions);
      setSelected([]);
    } else {
      throw 'Cannot delete stocks';
    }
  };

  const handleRequestSort = (event: React.MouseEvent<unknown>, property: keyof PositionTickers) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };
  
  const handleClickAddStock = () => {
    setAddStockDialog(true);
  };

  const queryPurchasedStocks = async () => {
    const wls = await PositionsApiService.fetchPurchasedStocksByUserId();
    const updatedPositions: { [key: string]: PositionTickers[] } = {};
    const userID: string = await getUserID();
    updatedPositions[userID] = wls.flatMap((positions) => positions.tickers);
    setPositions(updatedPositions);
  };

  useEffect(() => {
    queryPurchasedStocks().catch((error) => {
      throwError(error);
    });
  }, []);

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

  return (
    <TableContainer
      component={Paper}
      sx={{ width: '95%', backgroundColor: 'white', borderRadius: '10px', margin: '20px' }}
    >
      <Box display="flex" flexDirection="row">
        <ButtonGroup variant="text" aria-label="text button group">
        <WatchlistTickersSearchBar setAddStockSymbol={setAddStockSymbol} />
          <Button>
            <AddIcon onClick={handleClickAddStock} fontSize="medium" />
          </Button>
        </ButtonGroup>
      </Box>
      <EnhancedTableToolbar numSelected={selected.length} handleDeleteStocks={handleDeleteStocks} />
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <PositionsTHead
          numSelected={selected.length}
          order={order}
          orderBy={orderBy}
          onSelectAllClick={handleSelectAllClick}
          onRequestSort={handleRequestSort}
          rowCount={Object.values(positions).flatMap((positionsArray) => positionsArray).length}
        />
        <TableBody>
          {Object.values(positions).flatMap((positionsArray) => positionsArray).map((row, index) => (
            <TableRow
              key={row.symbol}
              onClick={(event) => handleSelectStock(event, row.symbol)}
              role="checkbox"
              aria-checked={isSelected(row.symbol)}
              tabIndex={-1}
              selected={isSelected(row.symbol)}
              sx={{ cursor: 'pointer', '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell padding="checkbox">
                <Checkbox
                  color="primary"
                  checked={isSelected(row.symbol)}
                  inputProps={{
                    'aria-labelledby': `enhanced-table-checkbox-${index}`
                  }}
                />
              </TableCell>
              <TableCell align="right">
                {row.purchaseDate ? new Date(row.purchaseDate).toLocaleDateString() : 'N/A'}
              </TableCell>
              <TableCell>{row.symbol}</TableCell>
              <TableCell align="right">{row.quantity}</TableCell>
              <TableCell align="right">{row.price}</TableCell>
              <TableCell align="right">{row.purchasePrice}</TableCell>
              <TableCell align="right" style={{ color: row.priceChange < 0 ? 'red' : 'green' }}>{row.priceChange}</TableCell>
              <TableCell align="right" style={{ color: row.gainOrLoss < 0 ? 'red' : 'green' }}>{row.gainOrLoss}</TableCell>
              <TableCell align="right" style={{ color: row.marketValue < 0 ? 'red' : 'green' }}>{row.marketValue}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <AddPositionDialog
        positions={positions}
        setPositions={setPositions}
        addStockSymbol={addStockSymbol}
        isAddStockDialog={isAddStockDialog}
        setAddStockDialog={setAddStockDialog}
      />
    </TableContainer>
  );
}

