// src/components/admin/AdminNavbar.jsx
import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';

function AdminNavbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          component={Link}
          to="/admin/summary"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit'
          }}
        >
          Admin Dashboard
        </Typography>

        <Button
          color="inherit"
          component={Link}
          to="/admin/summary"
          sx={{
            backgroundColor: location.pathname === '/admin/summary' ? 'rgba(255, 255, 255, 0.1)' : 'transparent'
          }}
        >
          Summary
        </Button>

        <Button
          color="inherit"
          component={Link}
          to="/admin/users"
          sx={{
            backgroundColor: location.pathname === '/admin/users' ? 'rgba(255, 255, 255, 0.1)' : 'transparent'
          }}
        >
          Users
        </Button>

        <Button
          color="inherit"
          component={Link}
          to="/admin/correction-requests"
          sx={{
            backgroundColor: location.pathname === '/admin/correction-requests' ? 'rgba(255, 255, 255, 0.1)' : 'transparent'
          }}
        >
          Corrections
        </Button>

        <Button
          color="inherit"
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
}

export default AdminNavbar;