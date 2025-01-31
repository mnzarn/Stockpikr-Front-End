import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  ThemeProvider,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery
} from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { visuallyHidden } from '@mui/utils';
import { useState } from 'react';
import { WatchlistTicker } from '../../interfaces/IWatchlistModel';

type Order = 'asc' | 'desc';

interface EnhancedTableToolbarProps {
  numSelected: number;
  handleDeleteStocks: () => void;
  handleEditStocks: () => void;
}

interface HeadCell {
  disablePadding: boolean;
  id: keyof WatchlistTicker;
  label: string;
  numeric: boolean;
}

const headCells: readonly HeadCell[] = [
  {
    id: 'symbol',
    numeric: false,
    disablePadding: false,
    label: 'Symbol'
  },
  {
    id: 'exchange',
    numeric: true,
    disablePadding: false,
    label: 'Exchange'
  },
  {
    id: 'alertPrice',
    numeric: true,
    disablePadding: false,
    label: 'Alert Price'
  },
  {
    id: 'price',
    numeric: true,
    disablePadding: false,
    label: 'Current Price'
  },
  { id: 'currentVsAlertPricePercentage', numeric: true, disablePadding: false, label: 'Current - Alert (%)' },
  {
    id: 'previousClose',
    numeric: true,
    disablePadding: false,
    label: 'Previous Close Price'
  },
  {
    id: 'changesPercentage',
    numeric: true,
    disablePadding: false,
    label: 'Change Percentage'
  },
  {
    id: 'dayHigh',
    numeric: true,
    disablePadding: false,
    label: 'Day High'
  },
  {
    id: 'nearHighVsCurrentPercentage',
    numeric: false,
    disablePadding: false,
    label: 'Near High - Current Price (%)'
  },
  {
    id: 'yearHigh',
    numeric: true,
    disablePadding: false,
    label: 'Year High'
  },
  {
    id: 'yearHighVsCurrentPercentage',
    numeric: true,
    disablePadding: false,
    label: 'Year High - Current Price (%)'
  },
  {
    id: 'dayLow',
    numeric: true,
    disablePadding: false,
    label: 'Day Low'
  },
  {
    id: 'nearLowVsCurrentPercentage',
    numeric: true,
    disablePadding: false,
    label: 'Near Low - Current Price (%)'
  },
  {
    id: 'yearLow',
    numeric: true,
    disablePadding: false,
    label: 'Year Low'
  },
  {
    id: 'yearLowVsCurrentPercentage',
    numeric: true,
    disablePadding: false,
    label: 'Year Low - Current Price (%)'
  }
];

interface EnhancedTableProps {
  numSelected: number;
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof WatchlistTicker) => void;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  order: Order;
  orderBy: string;
  rowCount: number;
}

export function WatchlistTableHeadWithCheckbox(props: EnhancedTableProps) {
  const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } = props;
  const createSortHandler = (property: keyof WatchlistTicker) => (event: React.MouseEvent<unknown>) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{
              'aria-label': 'select all desserts'
            }}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

export function EnhancedTableToolbar(props: EnhancedTableToolbarProps) {
  const { numSelected } = props;
  const [isDeleteWatchlistTickers, setDeleteWatchlistTickers] = useState(false);
  const [isEditWatchlistTickers, setEditWatchlistTickers] = useState(false);

  const onCancelDeleteTickers = () => {
    setDeleteWatchlistTickers(false);
  };

  const onConfirmDeleteTickers = () => {
    props.handleDeleteStocks();
    setDeleteWatchlistTickers(false);
  };

  const onCancelEditTickers = () => {
    setEditWatchlistTickers(false);
  };

  const onConfirmEditTickers = () => {
    props.handleEditStocks();
    setEditWatchlistTickers(false);
  };

  const theme = createTheme({
    components: {
      // Name of the component
      MuiToolbar: {
        styleOverrides: {
          // Name of the slot
          root: {
            // Some CSS
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between'
          }
        }
      }
    }
  });
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <ThemeProvider theme={theme}>
      <Toolbar
        sx={{
          pl: { sm: 2 },
          pr: { xs: 1, sm: 1 },
          display: 'flex',
          justifyItems: 'space-between',
          flexDirection: 'row'
        }}
      >
        {numSelected > 0 ? (
          <Typography sx={{}} color="inherit" variant="subtitle1" component="div">
            {numSelected} selected
          </Typography>
        ) : (
          <Typography sx={{}} variant="h6" id="tableTitle" component="div">
            Tickers
          </Typography>
        )}
        {numSelected > 0 ? (
          <Box>
            <Tooltip title="Edit">
              <IconButton onClick={() => setEditWatchlistTickers(true)}>
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
          <></>
          // <Tooltip title="Filter list">
          //   <IconButton>
          //     <FilterListIcon />
          //   </IconButton>
          // </Tooltip>
        )}
      </Toolbar>
      <Dialog open={isDeleteWatchlistTickers} onClose={onCancelDeleteTickers} fullScreen={fullScreen}>
        <DialogTitle>{`Delete selected tickers`}</DialogTitle>
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
      <Dialog open={isEditWatchlistTickers} onClose={onCancelEditTickers} fullScreen={fullScreen}>
        <DialogTitle>{`Edit selected tickers`}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to edit these selected watchlist ticker alert prices?.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancelEditTickers}>Cancel</Button>
          <Button onClick={onConfirmEditTickers}>Confirm</Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}
