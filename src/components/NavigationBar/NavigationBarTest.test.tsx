import { fireEvent, render, screen } from '@testing-library/react';
import { expect } from 'chai';
import { BrowserRouter as Router } from 'react-router-dom';
import NavigationHeader from './NavigationBar';

describe('NavigationHeader', () => {
  it('renders navigation buttons', () => {
    render(
      <Router>
        <NavigationHeader />
      </Router>
    );

    // Check if buttons for Dashboard, Watchlist, and Positions are in the document
    expect(screen.getByText(/Dashboard/i)).to.exist;
    expect(screen.getByText(/Watchlist/i)).to.exist;
    expect(screen.getByText(/Positions/i)).to.exist;
  });

  it('navigates to the correct route when clicked', () => {
    render(
      <Router>
        <NavigationHeader />
      </Router>
    );

    // Find the button and simulate a click
    fireEvent.click(screen.getByText(/Dashboard/i));
    expect(window.location.pathname).to.equal('/dashboard');

    fireEvent.click(screen.getByText(/Watchlist/i));
    expect(window.location.pathname).to.equal('/watchlist');

    fireEvent.click(screen.getByText(/Positions/i));
    expect(window.location.pathname).to.equal('/positions');
  });
});
