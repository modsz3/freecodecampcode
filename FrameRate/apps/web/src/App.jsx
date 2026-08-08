import React from 'react';
import { Route, Routes, BrowserRouter as Router, Navigate } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import HomePage from './pages/HomePage';
import PlatformPage from './pages/PlatformPage';
import ArticlePage from './pages/ArticlePage';
import ArchivePage from './pages/ArchivePage';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import ArticleEditor from './pages/admin/ArticleEditor';
import pb from '@/lib/pocketbaseClient';

function RequireAuth({ children }) {
  if (!pb.authStore.isValid) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/platform/:platform" element={<PlatformPage />} />
        <Route path="/article/:slug" element={<ArticlePage />} />
        <Route path="/archive" element={<ArchivePage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<RequireAuth><AdminDashboard /></RequireAuth>} />
        <Route path="/admin/new" element={<RequireAuth><ArticleEditor /></RequireAuth>} />
        <Route path="/admin/edit/:id" element={<RequireAuth><ArticleEditor /></RequireAuth>} />
      </Routes>
    </Router>
  );
}

export default App;
