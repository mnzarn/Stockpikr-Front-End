import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Box,
  Button,
  ButtonGroup,
  Checkbox,
  DialogContentText,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField
} from '@mui/material';
import { useEffect, useState } from 'react';
import { serializeError } from 'serialize-error';
import { getUserID } from '../../helper/userID';
import { AlertData, MinimalWatchlistTicker, WatchlistTicker, Watchlists } from '../../interfaces/IWatchlistModel';
import { WatchlistApiService } from '../../services/WatchlistApiService';
import { useAsyncError } from '../GlobalErrorBoundary';
import AddStockDialog from './AddStockDialog';
import AutocompleteComponent from './Autocomplete';
import DeleteWatchListDialog from './DeleteWatchlistDialog';
import { EnhancedTableToolbar, WatchlistTableHeadWithCheckbox } from './THeadCheckBoxAndSort';
import WatchlistTickersSearchBar from './WatchlistTickersSearchBar';

type Order = 'asc' | 'desc';

export interface WatchListData {
  symbol: string;
  currentPrice: number;
  alertPrice: number;
  nearHigh: number;
  highest: number;
}

export default function Watchlist() {
  // watchLists state props
  const [wlKey, setWlKey] = useState('');
  const [wlKeys, setWlKeys] = useState<string[]>([]);
  const [watchLists, setWatchLists] = useState<Watchlists>({});
  const [isAddStockDialog, setAddStockDialog] = useState(false);
  const [isDeleteWatchlistDialog, setDeleteWatchlistDialog] = useState(false);

  // add watchlist tickers
  const [addStockSymbol, setAddStockSymbol] = useState('');
  const [alertData, setAlertData] = useState<AlertData>({});

  const isAlertPriceValid = (alertPrice: number) => {
    return alertPrice < 0 || !alertPrice;
  };

  // table props
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof WatchlistTicker>('symbol');
  const [selected, setSelected] = useState<string[]>([]);
  // const [page, setPage] = useState(0);
  // const [dense, setDense] = useState(false);
  // const [rowsPerPage, setRowsPerPage] = useState(5);
  const isSelected = (symbol: string) => selected.indexOf(symbol) !== -1;

  const refreshWatchlist = (watchlists: Watchlists) => {
    setWatchLists(watchlists);
    setWlKeys(Object.keys(watchlists));
  };

  const handleRequestSort = (event: React.MouseEvent<unknown>, property: keyof WatchlistTicker) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked || !watchLists) {
      if (watchLists[wlKey] == null) {
        setSelected([]);
        return;
      }
      const newSelected = watchLists[wlKey].map((n) => n.symbol);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
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

  // Avoid a layout jump when reaching the last page with empty rows.
  // const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - wlKeys.length) : 0;

  const [visibleTickers, setVisibleTickers] = useState<WatchlistTicker[]>([]);
  useEffect(() => {
    if (watchLists[wlKey]) {
      setVisibleTickers(watchLists[wlKey].sort(getComparator(order, orderBy)));
    } else {
      setVisibleTickers([]);
    }
  }, [order, orderBy, watchLists[wlKey]]);

  useEffect(() => {
    if (watchLists[wlKey]) {
      let newAlertData: AlertData = alertData;
      watchLists[wlKey].forEach((ticker) => {
        newAlertData[ticker.symbol] = ticker.alertPrice;
      });
      setAlertData(newAlertData);
    }
  }, [watchLists[wlKey]]);

  const throwError = useAsyncError();

  const queryWatchLists = async () => {
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
  };

  useEffect(() => {
    queryWatchLists().catch((error) => {
      // throwError(error);
    });
  }, []);

  const handleCreateNewWatchlist = async (value: string) => {
    if (value && watchLists) {
      try {
        const userID: string = await getUserID();
        const name = await WatchlistApiService.createWatchlist({
          watchlistName: value,
          tickers: [],
          userID
        });
        if (!name) {
          throw Error('Watchlist Id is empty after creating');
        }
        watchLists[value] = [];
        refreshWatchlist(watchLists);
        setWlKey(value);
      } catch (error) {
        throw JSON.stringify(serializeError(error));
      }
    }
  };

  const handleCloseDeleteWatchlistDialog = (name?: string) => {
    if (name && watchLists) {
      // re-render with deleted watchlist removed from our state so that we dont need to query watchlists again
      delete watchLists[name];
      refreshWatchlist(watchLists);
      setWlKey('');
    }
    setDeleteWatchlistDialog(false);
  };

  const handleClickAddStock = () => {
    setAddStockDialog(true);
  };

  const handleDeleteStocks = async () => {
    const patchResult = await WatchlistApiService.deleteStocksInWatchlist(wlKey, selected);
    console.log('patch result: ', patchResult);
    if (patchResult && patchResult.matchedCount > 0 && patchResult.modifiedCount > 0) {
      const tickers = watchLists[wlKey].filter((ticker) => !selected.includes(ticker.symbol));
      watchLists[wlKey] = tickers;
      refreshWatchlist(watchLists);
      let newAlertData = alertData;
      for (const ticker of tickers) {
        delete newAlertData[ticker.symbol];
      }
      setAlertData(newAlertData);
      setSelected([]);
    } else {
      // TODO: handle delete stocks error here
      throw 'Cannot delete stocks';
    }
  };

  const handleEditStocks = async () => {
    const tickers: MinimalWatchlistTicker[] = Object.entries(alertData).map((data) => ({
      symbol: data[0],
      alertPrice: data[1]
    }));
    await WatchlistApiService.editStockAlertPrices(tickers, wlKey);
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

  return (
    <TableContainer
      component={Paper}
      sx={{ width: '95%', backgroundColor: 'white', borderRadius: '10px', margin: '20px' }}
    >
      <Box display="flex" flexDirection="column" paddingLeft="10px" paddingTop="10px">
        <Box display="flex" flexDirection="row">
          <AutocompleteComponent
            watchListKeys={wlKeys}
            watchListKey={wlKey}
            handleAppendNewKey={handleCreateNewWatchlist}
            setWlKey={setWlKey}
          />
          <ButtonGroup variant="text" aria-label="text button group">
            <Button disabled={wlKeys.length === 0}>
              {' '}
              <DeleteIcon onClick={() => setDeleteWatchlistDialog(true)} fontSize="medium" />
            </Button>
          </ButtonGroup>
        </Box>
        <Box display="flex" flexDirection="column" alignItems="flex-start" paddingTop="50px">
          <DialogContentText paddingRight="50px">Search and add your favorite stocks</DialogContentText>
          <Box display="flex" flexDirection="row" paddingTop="10px">
            <WatchlistTickersSearchBar setAddStockSymbol={setAddStockSymbol} />
            <ButtonGroup variant="text" aria-label="text button group">
              <Button disabled={wlKeys.length === 0 || !addStockSymbol}>
                <AddIcon onClick={handleClickAddStock} fontSize="medium" />
              </Button>
            </ButtonGroup>
          </Box>
        </Box>
      </Box>
      <EnhancedTableToolbar
        numSelected={selected.length}
        handleDeleteStocks={handleDeleteStocks}
        handleEditStocks={handleEditStocks}
      />
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <WatchlistTableHeadWithCheckbox
          numSelected={selected.length}
          order={order}
          orderBy={orderBy}
          onSelectAllClick={handleSelectAllClick}
          onRequestSort={handleRequestSort}
          rowCount={watchLists && watchLists[wlKey] ? watchLists[wlKey].length : 0}
        />
        <TableBody>
          {watchLists &&
            Object.keys(watchLists).length > 0 &&
            wlKey &&
            visibleTickers.map((row, index) => {
              const isItemSelected = isSelected(row.symbol);
              const labelId = `enhanced-table-checkbox-${index}`;
              return (
                <TableRow
                  key={index}
                  onClick={(event) => handleSelectStock(event, row.symbol)}
                  role="checkbox"
                  aria-checked={isItemSelected}
                  tabIndex={-1}
                  selected={isItemSelected}
                  sx={{ cursor: 'pointer', '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      checked={isItemSelected}
                      inputProps={{
                        'aria-labelledby': labelId
                      }}
                    />
                  </TableCell>
                  <a style={{ color: 'black' }} href={`#/quote?symbol=${row.symbol}`}>
                    <TableCell component="th" scope="row">
                      {row.symbol}
                    </TableCell>
                  </a>
                  <TableCell align="right">{row.exchange}</TableCell>
                  <TableCell align="right">
                    <TextField
                      value={alertData[row.symbol]}
                      error={isAlertPriceValid(alertData[row.symbol])}
                      autoFocus
                      required
                      margin="dense"
                      id={row.symbol}
                      inputProps={{ min: 0, style: { textAlign: 'inherit' } }} // the change is here
                      type="number"
                      fullWidth
                      variant="standard"
                      helperText={
                        isAlertPriceValid(alertData[row.symbol])
                          ? 'Stock alert price cannot be empty, 0, or negative'
                          : ''
                      }
                      onChange={(e) => {
                        alertData[row.symbol] = +e.target.value;
                        setAlertData(alertData);
                        // workaround to trigger re-render when changing the alert price
                        setSelected([]);
                      }}
                    />
                  </TableCell>
                  {/* <TableCell align="right">{row.alertPrice}</TableCell> */}
                  <TableCell align="right">{row.price}</TableCell>
                  <TableCell align="right">{`${row.currentVsAlertPricePercentage}%`}</TableCell>
                  <TableCell align="right">{row.previousClose}</TableCell>
                  <TableCell align="right">{`${row.changesPercentage}%`}</TableCell>
                  <TableCell align="right">{row.dayHigh}</TableCell>
                  <TableCell align="right">{`${row.nearHighVsCurrentPercentage}%`}</TableCell>
                  <TableCell align="right">{row.yearHigh}</TableCell>
                  <TableCell align="right">{`${row.yearHighVsCurrentPercentage}%`}</TableCell>
                  <TableCell align="right">{row.dayLow}</TableCell>
                  <TableCell align="right">{`${row.nearLowVsCurrentPercentage}%`}</TableCell>
                  <TableCell align="right">{row.yearLow}</TableCell>
                  <TableCell align="right">{`${row.yearLowVsCurrentPercentage}%`}</TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
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
