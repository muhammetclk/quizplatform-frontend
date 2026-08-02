import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import TopicPage from './pages/TopicPage';
import AttemptPage from './pages/AttemptPage';
import ResultPage from './pages/ResultPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes */}
          <Route path="/" element={<PrivateRoute><HomePage /></PrivateRoute>} />
          <Route path="/category/:categoryId" element={<PrivateRoute><CategoryPage /></PrivateRoute>} />
          <Route path="/topic/:topicId" element={<PrivateRoute><TopicPage /></PrivateRoute>} />
          <Route path="/quiz/:quizId/attempt" element={<PrivateRoute><AttemptPage /></PrivateRoute>} />
          <Route path="/attempt/:attemptId/result" element={<PrivateRoute><ResultPage /></PrivateRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
