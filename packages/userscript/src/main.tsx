import React from 'react';
import ReactDOM from 'react-dom/client';

function App() {
  return (
    <div>
      <h1>Mikoto MOOCs # - Userscript</h1>
      <p>UserScript version powered by vite-plugin-monkey</p>
    </div>
  );
}

// Create a container for the React app
const container = document.createElement('div');
container.id = 'mikoto-moocs-userscript-root';
document.body.appendChild(container);

// Mount React app
ReactDOM.createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
