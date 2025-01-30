import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Chip,
  TextField,
  Button,
} from '@mui/material';
import { format } from 'date-fns';
import api from '../../services/api';

function AdminDashboard() {
  const [summary, setSummary] = useState([]);
  const [dateRange, setDateRange] = useState({
    start_date: format(new Date().setDate(1), 'yyyy-MM-dd'),
    end_date: format(new Date(), 'yyyy-MM-dd'),
  });

  const fetchSummary = useCallback(async () => {
    try {
      const response = await api.get('/admin/records/summary', {
        params: dateRange
      });
      console.log('Date Range:', dateRange);
      setSummary(response.data);
      console.log('Summary data:', response.data);
    } catch (error) {
      console.error('Failed to fetch summary:', error);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const formatDuration = (hours) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}h ${minutes}m`;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Date Range Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Date Range Filter
        </Typography>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={dateRange.start_date}
              onChange={(e) => setDateRange({ ...dateRange, start_date: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={dateRange.end_date}
              onChange={(e) => setDateRange({ ...dateRange, end_date: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Button 
              variant="contained" 
              onClick={fetchSummary}
              fullWidth
            >
              Update Summary
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Summary Cards */}
      <Grid container spacing={3}>
        {summary.map((user) => (
          <Grid item xs={12} md={6} lg={4} key={user.user_id}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                {user.full_name}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Chip 
                  label={`Total Hours: ${formatDuration(user.total_hours)}`} 
                  color="primary"
                  sx={{ mb: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  Username: {user.username}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Records: {user.total_records}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  First Clock In: {format(new Date(user.first_clock_in), 'yyyy-MM-dd HH:mm')}
                </Typography>
                {user.last_clock_out && (
                  <Typography variant="body2" color="text.secondary">
                    Last Clock Out: {format(new Date(user.last_clock_out), 'yyyy-MM-dd HH:mm')}
                  </Typography>
                )}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {summary.length === 0 && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" align="center" color="text.secondary">
            No records found for the selected date range
          </Typography>
        </Paper>
      )}
    </Container>
  );
}

export default AdminDashboard;