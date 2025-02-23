import React from 'react';
import ReactDOM from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react'; // Import the Auth0 provider
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Your Auth0 credentials
const domain = 'dev-pj8wtdty73f47whd.us.auth0.com'; // Replace with your Auth0 domain
const clientId = 'gV9DvsW08RsL8dbzTYWEX3YMK867ehMV'; // Replace with your Auth0 client ID

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{ redirect_uri: window.location.origin }} // Redirect URI after login
    >
      <App />
    </Auth0Provider>
  </React.StrictMode>
);

// Report web vitals (you can leave this if you want to track performance)
reportWebVitals();
