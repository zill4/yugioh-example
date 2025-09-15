import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CardShop, CardDetail } from './components';

function App() {
  return (
    <Router basename={process.env.XR_ENV === 'avp' ? '/webspatial/avp' : '/'}>
      <div className="App min-h-screen">
        <Routes>
          <Route path="/" element={<CardShop />} />
          <Route path="/card/:id" element={<CardDetail />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
