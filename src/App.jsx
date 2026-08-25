import React from 'react';
import { HelmetProvider } from 'react-helmet-async';
import ComingSoon from './pages/ComingSoon';

function App() {
  return (
    <HelmetProvider>
      <ComingSoon />
    </HelmetProvider>
  );
}

export default App;

