import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import HomePage from './pages/HomePage';
import PlatformPage from './pages/PlatformPage';
import ArticlePage from './pages/ArticlePage';

function App() {
    return (
        <Router>
            <ScrollToTop />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/platform/:platform" element={<PlatformPage />} />
                <Route path="/article/:slug" element={<ArticlePage />} />
            </Routes>
        </Router>
    );
}

export default App;
