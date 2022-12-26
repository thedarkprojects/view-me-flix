import React from 'react';
import App from './components/App';
import ReactDOM from 'react-dom/client';
import './assets/css/index.css';
import { Database } from './utils';

Database.setCacheImpl(localStorage);
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
