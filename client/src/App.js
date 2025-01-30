import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'; // Add Navigate
import { CssBaseline, Container } from '@mui/material';
import { useSelector } from 'react-redux';
import Navbar from './components/layout/Navbar';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ClockInOut from './components/clock/ClockInOut';
import RecordsList from './components/clock/RecordsList';
import UserManagement from './components/admin/UserManagement';
import PrivateRoute from './components/layout/PrivateRoute';
import AdminNavbar from './components/admin/AdminNavbar';
import RecordsSummary from './components/admin/RecordsSummary';

function App() {
  const { user } = useSelector((state) => state.auth);

  return (
    <>
      <CssBaseline />
      {user?.role === 'admin' ? <AdminNavbar /> : <Navbar />}
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Regular User Routes */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                {user?.role === 'admin' ? 
                  <Navigate to="/admin/summary" replace /> : 
                  <ClockInOut />
                }
              </PrivateRoute>
            }
          />
          <Route
            path="/records"
            element={
              <PrivateRoute>
                <RecordsList />
              </PrivateRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <PrivateRoute adminOnly>
                <Navigate to="/admin/summary" replace />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/summary"
            element={
              <PrivateRoute adminOnly>
                <RecordsSummary />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <PrivateRoute adminOnly>
                <UserManagement />
              </PrivateRoute>
            }
          />
        </Routes>
      </Container>
    </>
  );
}

export default App;