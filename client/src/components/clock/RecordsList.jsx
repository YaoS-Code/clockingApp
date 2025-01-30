// src/components/clock/RecordsList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  TextField,
  Box,
  Chip,
} from '@mui/material';
import { format } from 'date-fns';
import api from '../../services/api';

function RecordsList() {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [totalHours, setTotalHours] = useState(0);
  const [filters, setFilters] = useState({
    location: 'all',
    startDate: format(new Date().setDate(1), 'yyyy-MM-dd'), // First day of current month
    endDate: format(new Date(), 'yyyy-MM-dd'), // Today
  });

  const locations = [
    { value: 'all', label: 'All Locations' },
    { value: 'MMC', label: 'MMC' },
    { value: 'Skinart', label: 'Skinart' },
    { value: 'RAAC', label: 'RAAC' },
  ];

  const fetchRecords = useCallback(async () => {
    try {
      const response = await api.get('/clock/records');
      setRecords(response.data);
    } catch (err) {
      console.error('Failed to fetch records', err);
    }
  }, []);

  const filterRecords = useCallback(() => {
    let filtered = [...records];

    // Filter by date range
    filtered = filtered.filter(record => {
      const recordDate = new Date(record.clock_in).toISOString().split('T')[0];
      return recordDate >= filters.startDate && recordDate <= filters.endDate;
    });

    // Filter by location
    if (filters.location !== 'all') {
      filtered = filtered.filter(record => record.location === filters.location);
    }

    // Calculate total hours
    const total = filtered.reduce((acc, record) => {
      return acc + (record.hours_worked || 0);
    }, 0);

    setTotalHours(total);
    setFilteredRecords(filtered);
  }, [records, filters]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  useEffect(() => {
    filterRecords();
  }, [filterRecords]);

  const formatDateTime = (dateString) => {
    return format(new Date(dateString), 'yyyy-MM-dd HH:mm:ss');
  };

  const formatDuration = (hours) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}h ${minutes}m`;
  };

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Clock Records
        </Typography>

        {/* Filters */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Location</InputLabel>
              <Select
                value={filters.location}
                label="Location"
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              >
                {locations.map((loc) => (
                  <MenuItem key={loc.value} value={loc.value}>
                    {loc.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>

        {/* Summary */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Summary
          </Typography>
          <Grid container spacing={2}>
            <Grid item>
              <Chip
                label={`Total Hours: ${formatDuration(totalHours)}`}
                color="primary"
                sx={{ fontSize: '1.1rem', padding: '20px' }}
              />
            </Grid>
            <Grid item>
              <Chip
                label={`Total Records: ${filteredRecords.length}`}
                color="secondary"
                sx={{ fontSize: '1.1rem', padding: '20px' }}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Records Table */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Clock In</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Clock Out</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Location</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Hours</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Notes</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow
                  key={record.id}
                  sx={{
                    '&:nth-of-type(odd)': { backgroundColor: 'action.hover' },
                  }}
                >
                  <TableCell>
                    {format(new Date(record.clock_in), 'yyyy-MM-dd')}
                  </TableCell>
                  <TableCell>{formatDateTime(record.clock_in)}</TableCell>
                  <TableCell>
                    {record.clock_out ? formatDateTime(record.clock_out) : '-'}
                  </TableCell>
                  <TableCell>{record.location}</TableCell>
                  <TableCell>{record.hours_worked ? formatDuration(record.hours_worked) : '-'}</TableCell>
                  <TableCell>{record.notes || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={record.status}
                      color={record.status === 'in' ? 'warning' : 'success'}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {filteredRecords.length === 0 && (
          <Typography variant="body1" sx={{ textAlign: 'center', mt: 3 }}>
            No records found for the selected criteria
          </Typography>
        )}
      </Paper>
    </Container>
  );
}

export default RecordsList;