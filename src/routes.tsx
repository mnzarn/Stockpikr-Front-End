import { ComponentType, useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import Dashboard from './components/Dashboard/Dashboard';
import LandingPage from './components/LandingPage';
import Notifications from './components/Notifications/Notifications';
import Positions from './components/Positions/Positions';
import SignedOutPositions from './components/Positions/SignedOutPositions';
import Settings from './components/Settings/Settings';
import SignIn from './components/SignIn';
import { StockQuotePage } from './components/Stock/StockQuotePage';
import SwaggerDocs from './components/Swagger/SwaggerDocs';
import Watchlist from './components/Watchlist/Watchlist';
import { UserApiService } from './services/UserApiService';

interface ProtectedRouteProps {
  signedInComponent: ComponentType;
  signedOutComponent: ComponentType;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ signedInComponent: SignedIn, signedOutComponent: SignedOut }) => {
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUserLoggedIn = async () => {
      const loggedIn = await UserApiService.isUserLoggedIn();
      console.log('isUserLoggedIn: ', loggedIn);
      setIsUserLoggedIn(loggedIn);
      setIsLoading(false);
    };

    checkUserLoggedIn();
  }, []);

  return isUserLoggedIn ? <SignedIn /> : <SignedOut />;
};

const routes = () => (
  <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/watchlist" element={<Watchlist />} />
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/positions" element={<ProtectedRoute signedInComponent={Positions} signedOutComponent={SignedOutPositions} />} />
    <Route path="/settings" element={<Settings />} />
    <Route path="/notifications" element={<Notifications />} />
    <Route path="/signin" element={<SignIn />} />
    <Route path="/swaggerDocs" element={<SwaggerDocs />} />
    <Route path="/quote" element={<StockQuotePage />} />
  </Routes>
);

export default routes;
