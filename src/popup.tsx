import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';

const root: HTMLElement = document.getElementById('app') as HTMLElement;
const rootDiv = ReactDOM.createRoot(root);
rootDiv.render(
  <App/>,
);
