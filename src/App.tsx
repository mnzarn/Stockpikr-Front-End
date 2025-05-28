import { HashRouter as Router } from 'react-router-dom';
import './App.css';
import { ApiLimitProvider } from './components/ApiLimitContext';
import ErrorBoundary from './components/GlobalErrorBoundary';
import NavigationHeader from './components/NavigationBar/NavigationBar';
import DailyPopup from "./components/Notifications/DailyPopup";
import { NotificationProvider } from "./components/Notifications/NotificationsContext";
import routes from './routes';

function App() {
  return (
    <ErrorBoundary>
      <NotificationProvider>
        <ApiLimitProvider>
          <Router basename="/">
            <div className="App">
              <NavigationHeader />
              <DailyPopup />
              {routes()}
            </div>
          </Router>
        </ApiLimitProvider>
      </NotificationProvider>
    </ErrorBoundary>
  );
}

export default App;
