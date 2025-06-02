import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Watchlist from './Watchlist';
import * as FirebaseConfig from '../../services/FirebaseConfig';

// Mock stock API
jest.mock('../services/StockApiService', () => ({
  StockApiService: {
    fetchStockSearch: jest.fn((query) =>
      Promise.resolve(
        query === 'GOOGL'
          ? [{ symbol: 'GOOGL', name: 'Alphabet Inc.', stockExchange: 'NASDAQ' }]
          : query === 'AAPL'
          ? [{ symbol: 'AAPL', name: 'Apple Inc.', stockExchange: 'NASDAQ' }]
          : []
      )
    ),
  },
}));

jest.mock('../services/FirebaseConfig');

const mockOnAuthStateChanged = FirebaseConfig.auth.onAuthStateChanged as jest.Mock;

const renderWithAuth = (loggedIn: boolean) => {
  mockOnAuthStateChanged.mockImplementation((callback) => {
    callback(loggedIn ? { uid: '123' } : null);
    return () => {};
  });

  return render(<Watchlist />);
};

describe('Watchlist Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('User can create a watchlist called "my watchlist"', async () => {
    renderWithAuth(true);

    fireEvent.click(screen.getByText(/create new watchlist/i));

    const input = screen.getByLabelText(/watchlist name/i);
    userEvent.type(input, 'my watchlist');

    fireEvent.click(screen.getByText(/^create$/i));

    await waitFor(() => expect(screen.getByText('my watchlist')).toBeInTheDocument());
  });

  test('User can add stock "GOOGL" to "my watchlist"', async () => {
    renderWithAuth(true);

    userEvent.click(screen.getByText('my watchlist'));

    const searchInput = screen.getByPlaceholderText(/search stock.../i);
    userEvent.type(searchInput, 'GOOGL');

    await waitFor(() => screen.getByText('GOOGL'));

    userEvent.click(screen.getByText('GOOGL'));

    fireEvent.change(screen.getByLabelText(/sell price/i), { target: { value: '130' } });

    fireEvent.click(screen.getByText(/^add$/i));

    await waitFor(() => expect(screen.getByText('GOOGL')).toBeInTheDocument());
  });

  test('User can create a watchlist called "your watchlist"', async () => {
    renderWithAuth(true);

    fireEvent.click(screen.getByText(/create new watchlist/i));

    const input = screen.getByLabelText(/watchlist name/i);
    userEvent.type(input, 'your watchlist');

    fireEvent.click(screen.getByText(/^create$/i));

    await waitFor(() => expect(screen.getByText('your watchlist')).toBeInTheDocument());
  });

  test('User can add stock "AAPL" to "your watchlist"', async () => {
    renderWithAuth(true);

    userEvent.click(screen.getByText('your watchlist'));

    const searchInput = screen.getByPlaceholderText(/search stock.../i);
    userEvent.type(searchInput, 'AAPL');

    await waitFor(() => screen.getByText('AAPL'));

    userEvent.click(screen.getByText('AAPL'));

    fireEvent.change(screen.getByLabelText(/sell price/i), { target: { value: '210' } });

    fireEvent.click(screen.getByText(/^add$/i));

    await waitFor(() => expect(screen.getByText('AAPL')).toBeInTheDocument());
  });

  test('User can remove "GOOGL" from "my watchlist"', async () => {
    renderWithAuth(true);

    userEvent.click(screen.getByText('my watchlist'));

    const googlCheckbox = screen.getByRole('checkbox', { name: /GOOGL/i });
    userEvent.click(googlCheckbox);

    fireEvent.click(screen.getByText(/delete/i));

    await waitFor(() => expect(screen.queryByText('GOOGL')).not.toBeInTheDocument());
  });

  test('User can reorder watchlists with toggle', async () => {
    renderWithAuth(true);

  const toggleButton = screen.getByTestId('toggle-reorder-mode');
  fireEvent.click(toggleButton);
  expect(toggleButton).toHaveTextContent('Done'); 

  const yourTab = screen.getByTestId('watchlist-tab-your watchlist');
  const myTab = screen.getByTestId('watchlist-tab-my watchlist');

  // Faking drag event with a mock DataTransfer object
  const dataTransfer = {
    data: {} as Record<string, string>,
    setData(key: string, value: string) {
      this.data[key] = value;
    },
    getData(key: string) {
      return this.data[key];
    },
    dropEffect: '',
    effectAllowed: '',
  };

  fireEvent.dragStart(yourTab, { dataTransfer });
  fireEvent.dragOver(myTab, { dataTransfer });
  fireEvent.drop(myTab, { dataTransfer });
  fireEvent.dragEnd(yourTab, { dataTransfer });

  // Check order
  const reorderedTabs = screen.getAllByTestId(/^watchlist-tab-/);
  expect(reorderedTabs[0]).toHaveTextContent('your watchlist');
  expect(reorderedTabs[1]).toHaveTextContent('my watchlist');
});

  });

  test('User sees watchlist when logged in', () => {
    renderWithAuth(true);

    expect(screen.getByText(/my watchlist|your watchlist/i)).toBeInTheDocument();
  });

  test('User does NOT have access to watchlist page if not logged in', () => {
    renderWithAuth(false);

    expect(screen.queryByText(/my watchlist|your watchlist/i)).not.toBeInTheDocument();

    expect(screen.getByText(/sign in/i)).toBeInTheDocument();
  });
