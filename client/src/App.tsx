import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CardDetail } from './components';
import { AuthProvider } from './contexts/UserContext';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import CardshopPage from './pages/CardshopPage';
import GamePage from './pages/GamePage';
import DeckbuilderPage from './pages/DeckbuilderPage';
import CardCreatorPage from './pages/CardCreatorPage';

function App() {
  return (
    <AuthProvider>
      <Router basename={process.env.XR_ENV === 'avp' ? '/webspatial/avp' : '/'}>
        <div className="App min-h-screen">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/cardshop" element={<CardshopPage />} />
            <Route path="/card/:id" element={<CardDetail />} />
            <Route path="/game" element={<GamePage />} />
            <Route path="/deckbuilder" element={<DeckbuilderPage />} />
            <Route path="/cardcreator" element={<CardCreatorPage />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
