Watchlist
// WatchlistTest.test.tsx
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { getUserID } from '../../helper/userID';
import { StockApiService } from '../../services/StockApiService';
import { WatchlistApiService } from '../../services/WatchlistApiService';
import { WatchlistTabSelector } from './WatchlistTabSelector';
import WatchlistTickersSearchBar from './WatchlistTickersSearchBar';

jest.mock('../../helper/userID');
jest.mock('../../services/WatchlistApiService');
jest.mock('../../services/StockApiService');

describe('WatchlistTabSelector', () => {
  const mockSetWatchLists = jest.fn();
  const mockSetSelectedWatchList = jest.fn();

  const defaultProps = {
    addStockSymbol: undefined,
    showDeleteIcon: true,
    watchLists: {
      'Tech Stocks': [{ symbol: 'AAPL' }, { symbol: 'GOOG' }],
      'Energy Stocks': [{ symbol: 'XOM' }]
    },
    setWatchLists: mockSetWatchLists,
    selectedWatchList: 'Tech Stocks',
    setSelectedWatchList: mockSetSelectedWatchList
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders and initializes selected watchlist', () => {
    render(<WatchlistTabSelector {...defaultProps} />);
    expect(mockSetSelectedWatchList).toHaveBeenCalledWith('Tech Stocks');
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('shows warning if stock symbol already in watchlist', () => {
    render(<WatchlistTabSelector {...defaultProps} addStockSymbol="AAPL" />);
    expect(screen.getByText(/Symbol is already in watchlist!/i)).toBeInTheDocument();
  });

  it('creates a new watchlist and selects it', async () => {
    (getUserID as jest.Mock).mockResolvedValue('user123');
    (WatchlistApiService.createWatchlist as jest.Mock).mockResolvedValue('New List');

    let watchLists = { ...defaultProps.watchLists };
    const setWatchLists = (newLists: typeof watchLists) => {
      watchLists = newLists;
    };

    let selected = '';
    const setSelectedWatchList = (name: string) => {
      selected = name;
    };

    render(
      <WatchlistTabSelector
        {...defaultProps}
        watchLists={watchLists}
        setWatchLists={setWatchLists}
        selectedWatchList={selected}
        setSelectedWatchList={setSelectedWatchList}
      />
    );

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'New List' } });
    fireEvent.blur(input);

    await waitFor(() => expect(WatchlistApiService.createWatchlist).toHaveBeenCalledWith('New List', 'user123'));
  });

  it('opens delete dialog when delete icon clicked and deletes watchlist', async () => {
    (WatchlistApiService.deleteWatchlist as jest.Mock).mockResolvedValue(undefined);

    render(<WatchlistTabSelector {...defaultProps} />);

    const deleteButtons = screen.getAllByRole('button');
    const deleteButton = deleteButtons.find(btn => btn.getAttribute('aria-label')?.includes('delete'));
    expect(deleteButton).toBeDefined();

    if (deleteButton) fireEvent.click(deleteButton);

    expect(screen.getByText(/Delete/i)).toBeInTheDocument();

    const confirmButton = screen.getByRole('button', { name: /^Delete$/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(WatchlistApiService.deleteWatchlist).toHaveBeenCalled();
    });
  });
});

describe('WatchlistTickersSearchBar', () => {
  const mockSetAddStockSymbol = jest.fn();
  const mockOnSelectStock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders input and placeholder', () => {
    render(<WatchlistTickersSearchBar setAddStockSymbol={mockSetAddStockSymbol} />);
    expect(screen.getByPlaceholderText(/Search stock.../i)).toBeInTheDocument();
  });

  it('disables input when isDisabled=true', () => {
    render(<WatchlistTickersSearchBar setAddStockSymbol={mockSetAddStockSymbol} isDisabled />);
    expect(screen.getByPlaceholderText(/Select a watchlist first/i)).toBeDisabled();
  });

  it('fetches and displays search results on typing', async () => {
    const fakeResponse = [
      { symbol: 'AAPL', name: 'Apple Inc', exchange: 'NASDAQ' },
      { symbol: 'GOOG', name: 'Alphabet Inc', exchange: 'NASDAQ' }
    ];
    (StockApiService.fetchDetailedStockSearch as jest.Mock).mockResolvedValue(fakeResponse);

    render(<WatchlistTickersSearchBar setAddStockSymbol={mockSetAddStockSymbol} />);

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'A' } });

    await waitFor(() => {
      expect(StockApiService.fetchDetailedStockSearch).toHaveBeenCalledWith('A');
    });

    await waitFor(() => {
      expect(screen.getByText('AAPL')).toBeInTheDocument();
      expect(screen.getByText('GOOG')).toBeInTheDocument();
    });
  });

  it('calls setAddStockSymbol and onSelectStock on option select', async () => {
    const fakeResponse = [{ symbol: 'AAPL', name: 'Apple Inc', exchange: 'NASDAQ' }];
    (StockApiService.fetchDetailedStockSearch as jest.Mock).mockResolvedValue(fakeResponse);

    render(<WatchlistTickersSearchBar setAddStockSymbol={mockSetAddStockSymbol} onSelectStock={mockOnSelectStock} />);

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'A' } });

    await waitFor(() => screen.getByText('AAPL'));

    fireEvent.click(screen.getByText('AAPL'));

    expect(mockSetAddStockSymbol).toHaveBeenCalledWith('AAPL');

    await waitFor(() => {
      expect(mockOnSelectStock).toHaveBeenCalled();
    });
  });

  it('selects first matching option on Enter press', async () => {
    const fakeResponse = [
      { symbol: 'AAPL', name: 'Apple Inc', exchange: 'NASDAQ' },
      { symbol: 'GOOG', name: 'Alphabet Inc', exchange: 'NASDAQ' }
    ];
    (StockApiService.fetchDetailedStockSearch as jest.Mock).mockResolvedValue(fakeResponse);

    render(<WatchlistTickersSearchBar setAddStockSymbol={mockSetAddStockSymbol} onSelectStock={mockOnSelectStock} />);

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'A' } });

    await waitFor(() => screen.getByText('AAPL'));

    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter', code: 'Enter' });

    expect(mockSetAddStockSymbol).toHaveBeenCalledWith('AAPL');

    await waitFor(() => {
      expect(mockOnSelectStock).toHaveBeenCalled();
    });
  });
});

