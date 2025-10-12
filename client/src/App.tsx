import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CardDetail } from "./components";
// import { AuthProvider } from "./contexts/UserContext";
// import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import CardshopPage from "./pages/CardshopPage";
import GamePage from "./pages/GamePage";
import DeckbuilderPage from "./pages/DeckbuilderPage";
import CardCreatorPage from "./pages/CardCreatorPage";
import { isXR, shouldUseWebSpatialBasename } from "./utils/xr";

function App() {
  const basename = shouldUseWebSpatialBasename() ? "/webspatial/avp" : "/";
  console.log("isXR", isXR, "basename", basename);
  console.log("VITE_XR_ENV:", import.meta.env.VITE_XR_ENV);

  if (isXR) {
    return (
      <Router basename={basename}>
        <div className="App min-h-screen">
          <Routes>
            <Route path="/" element={<GamePage />} />
            {/* <Route path="/webspatial/avp" element={<GamePage />} /> */}
          </Routes>
        </div>
      </Router>
    );
  }
  return (
    <Router basename={basename}>
      <div className="App min-h-screen">
        <Routes>
          <Route path="/" element={<GamePage />} />
          <Route path="/webspatial/avp" element={<GamePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/cardshop" element={<CardshopPage />} />
          <Route path="/card/:id" element={<CardDetail />} />
          <Route path="/game" element={<GamePage />} />
          <Route path="/deckbuilder" element={<DeckbuilderPage />} />
          <Route path="/cardcreator" element={<CardCreatorPage />} />
        </Routes>
      </div>
    </Router>
  );
}
export default App;
