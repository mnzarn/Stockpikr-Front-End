import { HashRouter as Router } from 'react-router-dom';
import './App.css';
import ErrorBoundary from './components/GlobalErrorBoundary';
import NavigationHeader from './components/NavigationBar/NavigationBar';
import DailyPopup from "./components/Notifications/DailyPopup";
import { NotificationProvider } from "./components/Notifications/NotificationsContext";
import routes from './routes';

function App() {
  return (
    <ErrorBoundary>
      <NotificationProvider>
        <Router basename="/">
          <div className="App">
            <NavigationHeader />
            <DailyPopup />
            {routes()}
          </div>
        </Router>
      </NotificationProvider>
    </ErrorBoundary>
  );
}

export default App;
