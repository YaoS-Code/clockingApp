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
import { format, isValid, parse } from 'date-fns';
import api from '../../services/api';
import { getInitialDateRange } from '../../utils/dateUtils'; // Add this import

function RecordsList() {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [totalHours, setTotalHours] = useState(0);
  const [filters, setFilters] = useState(() => ({
    location: 'all',
    ...getInitialDateRange() // This will set startDate and endDate correctly
  }));

  const locations = [
    { value: 'all', label: 'All Locations' },
    { value: 'MMC', label: 'MMC' },
    { value: 'SkinartMD', label: 'SkinartMD' },
    { value: 'RAAC', label: 'RAAC' },
    { value: 'Remote', label: 'Remote' },
    { value: 'Other', label: 'Other' }
  ];

  const fetchRecords = useCallback(async () => {
    try {
      // 调整结束日期以包含整天
      const endDate = new Date(filters.end_date);
      endDate.setHours(23, 59, 59, 999);
      const adjustedEndDate = format(endDate, 'yyyy-MM-dd HH:mm:ss');

      const params = {
        start_date: filters.start_date,
        end_date: adjustedEndDate,
        ...(filters.location !== 'all' && { location: filters.location })
      };

      const response = await api.get('/clock/records', { params });
      setRecords(response.data);
    } catch (err) {
      console.error('Failed to fetch records', err);
    }
  }, [filters]);

  const filterRecords = useCallback(() => {
    let filtered = [...records];

    // Filter by location only since date filtering is now handled by the API
    if (filters.location !== 'all') {
      filtered = filtered.filter(record => record.location === filters.location);
    }

    // Calculate total hours
    const total = filtered.reduce((acc, record) => {
      const hours = parseFloat(record.hours_worked);
      return acc + (isNaN(hours) ? 0 : hours);
    }, 0);

    setTotalHours(total);
    setFilteredRecords(filtered);
  }, [records, filters]);

  const handleDateChange = (field, value) => {
    // 允许空值，重置为初始日期
    if (!value) {
      setFilters(prev => ({
        ...prev,
        [field]: getInitialDateRange()[field]
      }));
      return;
    }

    // 尝试解析日期
    const parsedDate = parse(value, 'yyyy-MM-dd', new Date());

    // 如果是有效日期，更新状态
    if (isValid(parsedDate)) {
      setFilters(prev => ({
        ...prev,
        [field]: format(parsedDate, 'yyyy-MM-dd')
      }));
    }
  };

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
    if (typeof hours !== 'number') {
      hours = parseFloat(hours);
    }
    if (isNaN(hours)) {
      return '0h 0m';
    }
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
              type="text"
              value={filters.start_date}
              onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
              onBlur={(e) => handleDateChange('start_date', e.target.value)}
              InputLabelProps={{ shrink: true }}
              placeholder="YYYY-MM-DD"
              inputProps={{
                maxLength: 10
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="End Date"
              type="text"
              value={filters.end_date}
              onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
              onBlur={(e) => handleDateChange('end_date', e.target.value)}
              InputLabelProps={{ shrink: true }}
              placeholder="YYYY-MM-DD"
              inputProps={{
                maxLength: 10
              }}
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
                <TableCell sx={{ fontWeight: 'bold' }}>Break</TableCell>
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
                  <TableCell>
                    {record.hours_worked ? formatDuration(parseFloat(record.hours_worked)) : '-'}
                  </TableCell>
                  <TableCell>{record.break_minutes || '0'} min</TableCell>
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
              {/* Total Row */}
              {filteredRecords.length > 0 && (
                <TableRow
                  sx={{
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    '& .MuiTableCell-root': {
                      color: 'white',
                      fontWeight: 'bold',
                    },
                  }}
                >
                  <TableCell>Total</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>{formatDuration(totalHours)}</TableCell>
                  <TableCell>
                    {filteredRecords.reduce((total, record) => total + (record.break_minutes || 0), 0)} min
                  </TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                </TableRow>
              )}
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