import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { CircularProgress, Box } from '@mui/material';
import api from '../../services/api';

function PrivateRoute({ children, adminOnly = false }) {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }

      try {
        await api.get('/auth/profile');
        setIsValid(true);
      } catch (error) {
        setIsValid(false);
      } finally {
        setIsLoading(false);
      }
    };

    validateToken();
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated || !isValid) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && user?.role !== 'admin' && user?.username !== 'manager') {
    return <Navigate to="/" />;
  }

  return children; // Don't wrap with any additional layout components
}

export default PrivateRoute;