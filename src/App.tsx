import { HashRouter as Router } from 'react-router-dom';
import './App.css';
import ErrorBoundary from './components/GlobalErrorBoundary';
import NavigationHeader from './components/NavigationBar/NavigationBar';
import { NotificationProvider } from "./components/Notifications/NotificationsContext";
import routes from './routes';

function App() {
  return (
    <ErrorBoundary>
      <NotificationProvider> {/* Wrap the whole app to provide notification context */}
        <Router basename="/">
          <div className="App">
            <NavigationHeader />
            {routes()}
          </div>
        </Router>
      </NotificationProvider>
    </ErrorBoundary>
  );
}

export default App;
