// __tests__/PositionsPage.test.tsx

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Positions from './Positions';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    }
  };
})();
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('Positions Page Behavior', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows signed out message when user is not logged in', () => {
    localStorage.setItem('isLoggedIn', 'false');

    render(
      <Router>
        <Positions />
      </Router>
    );

    expect(screen.getByText(/sign in required/i)).toBeInTheDocument();
    expect(screen.getByText(/please sign in to access your positions/i)).toBeInTheDocument();
  });

  it('shows positions table when user is logged in', async () => {
    localStorage.setItem('isLoggedIn', 'true');

    render(
      <Router>
        <Positions />
      </Router>
    );

    expect(await screen.findByText(/symbol/i)).toBeInTheDocument();
  });

  it('adds a new stock to the positions table', async () => {
    localStorage.setItem('isLoggedIn', 'true');

    render(
      <Router>
        <Positions />
      </Router>
    );

    // stock data
    fireEvent.change(screen.getByLabelText(/stock symbol/i), { target: { value: 'AAPL' } });
    fireEvent.change(screen.getByLabelText(/purchase date/i), { target: { value: '2024-05-01' } });
    fireEvent.change(screen.getByLabelText(/quantity/i), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/purchase price/i), { target: { value: '150' } });

    fireEvent.click(screen.getByRole('button', { name: /add stock/i }));

    await waitFor(() => {
      expect(screen.getByText(/AAPL/i)).toBeInTheDocument();
    });
  });

  it('removes a stock from the positions table', async () => {
    localStorage.setItem('isLoggedIn', 'true');

    render(
      <Router>
        <Positions />
      </Router>
    );

    // Add stock
    fireEvent.change(screen.getByLabelText(/Purchase Date/i), { target: { value: '2024-04-15' } });
    fireEvent.change(screen.getByLabelText(/Symbol/i), { target: { value: 'GOOG' } });
    fireEvent.change(screen.getByLabelText(/Quantity/i), { target: { value: '5' } });
    fireEvent.change(screen.getByLabelText(/Purchase Price/i), { target: { value: '2000' } });

    fireEvent.click(screen.getByRole('button', { name: /add stock/i }));

    await waitFor(() => {
      expect(screen.getByText(/GOOG/i)).toBeInTheDocument();
    });

    const checkbox = screen.getByRole('checkbox', { name: /select all/i });
    fireEvent.click(checkbox);

    fireEvent.click(screen.getByLabelText(/Delete/i));
    fireEvent.click(screen.getByRole('button', { name: /confirm/i }));

    await waitFor(() => {
      expect(screen.queryByText(/GOOG/i)).not.toBeInTheDocument();
    });
  });
});
