import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import {MathJaxContext} from 'better-react-mathjax'

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
      <MathJaxContext>
      <App />
      </MathJaxContext>
  </React.StrictMode>
);

