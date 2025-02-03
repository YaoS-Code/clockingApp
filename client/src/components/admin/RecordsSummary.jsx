// src/components/admin/RecordsSummary.jsx
import React, { useState, useEffect, useCallback } from 'react';
import moment from 'moment';
import {
  Container,
  Paper,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Snackbar,
  Alert
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { format } from 'date-fns';
import api from '../../services/api';

function RecordsSummary() {
  const [summaryData, setSummaryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingRecord, setEditingRecord] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [filters, setFilters] = useState({
    location: 'all',
    start_date: '2024-01-01',
    end_date: format(new Date(), 'yyyy-MM-dd'),
  });

  const locations = [
    { value: 'all', label: 'All Locations' },
    { value: 'MMC', label: 'MMC' },
    { value: 'Skinart', label: 'Skinart' },
    { value: 'RAAC', label: 'RAAC' },
    { value: 'Remote', label: 'Remote' },
    { value: 'Unspecified', label: 'Unspecified' }
  ];

  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {
        start_date: filters.start_date,
        end_date: filters.end_date,
        ...(filters.location !== 'all' && { location: filters.location })
      };

      const response = await api.get('/admin/records/summary', { params });
      
      const groupedData = response.data.reduce((users, record) => {
        if (!users[record.user_id]) {
          users[record.user_id] = {
            user_id: record.user_id,
            username: record.username,
            full_name: record.full_name,
            total_hours: 0,
            total_records: 0,
            locations: {},
            first_clock_in: record.first_clock_in,
            last_clock_out: record.last_clock_out,
          };
        }

        const location = record.location || 'Unspecified';
        if (!users[record.user_id].locations[location]) {
          users[record.user_id].locations[location] = {
            total_hours: 0,
            records: [],
          };
        }

        users[record.user_id].locations[location].records.push({
          id: record.record_id,
          clock_in: record.clock_in,
          clock_out: record.clock_out,
          individual_hours: parseFloat(record.individual_hours || 0),
          location: location
        });

        users[record.user_id].locations[location].total_hours += 
          parseFloat(record.individual_hours || 0);

        users[record.user_id].total_hours += parseFloat(record.individual_hours || 0);
        users[record.user_id].total_records += 1;

        return users;
      }, {});

      setSummaryData(Object.values(groupedData));
    } catch (error) {
      console.error('Failed to fetch summary:', error);
      setError(error.response?.data?.message || 'Failed to fetch summary data');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const handleEditClick = (clockRecord, userId, location) => {
    console.log('Editing record:', { clockRecord, userId, location });
    
    if (!clockRecord.id) {
      setSnackbar({
        open: true,
        message: 'Record ID not found',
        severity: 'error'
      });
      return;
    }

    const formattedClockIn = clockRecord.clock_in ? 
      moment(clockRecord.clock_in).format('YYYY-MM-DDTHH:mm') : '';
    const formattedClockOut = clockRecord.clock_out ? 
      moment(clockRecord.clock_out).format('YYYY-MM-DDTHH:mm') : '';

    setEditingRecord({
      ...clockRecord,
      clock_in: formattedClockIn,
      clock_out: formattedClockOut,
      user_id: userId,
      location: location
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      await api.put(`/admin/records/${editingRecord.id}`, {
        clock_in: editingRecord.clock_in,
        clock_out: editingRecord.clock_out,
        location: editingRecord.location,
        notes: 'Modified by admin'
      });

      setSnackbar({
        open: true,
        message: 'Record updated successfully',
        severity: 'success'
      });
      
      setEditDialogOpen(false);
      fetchSummary();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Failed to update record',
        severity: 'error'
      });
    }
  };
  const EditRecordDialog = () => (
    <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
      <DialogTitle>Edit Clock Record</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              label="Clock In"
              type="datetime-local"
              value={editingRecord?.clock_in?.slice(0, 16) || ''}
              onChange={(e) => setEditingRecord({
                ...editingRecord,
                clock_in: e.target.value
              })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Clock Out"
              type="datetime-local"
              value={editingRecord?.clock_out?.slice(0, 16) || ''}
              onChange={(e) => setEditingRecord({
                ...editingRecord,
                clock_out: e.target.value
              })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Location</InputLabel>
              <Select
                value={editingRecord?.location || ''}
                onChange={(e) => setEditingRecord({
                  ...editingRecord,
                  location: e.target.value
                })}
                label="Location"
              >
                {locations
                  .filter(loc => loc.value !== 'all')
                  .map((loc) => (
                    <MenuItem key={loc.value} value={loc.value}>
                      {loc.label}
                    </MenuItem>
                  ))
                }
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setEditDialogOpen(false)} startIcon={<CancelIcon />}>
          Cancel
        </Button>
        <Button onClick={handleSaveEdit} color="primary" startIcon={<SaveIcon />}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );

  const grandTotal = summaryData.reduce((total, user) => {
    return total + user.total_hours;
  }, 0);

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Staff Working Hours Summary
        </Typography>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

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
              value={filters.start_date}
              onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={filters.end_date}
              onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>

        {/* Grand Total */}
        <Box sx={{ mb: 3 }}>
          <Chip
            label={`Grand Total Hours: ${formatDuration(grandTotal)}`}
            color="primary"
            sx={{ fontSize: '1.1rem', padding: '20px' }}
          />
        </Box>
                {/* User Summaries */}
                {summaryData.map((user) => (
          <Accordion key={user.user_id} sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle1">
                    {user.full_name} ({user.username})
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={8}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip
                      label={`Total Hours: ${formatDuration(user.total_hours)}`}
                      color="primary"
                    />
                    <Chip
                      label={`Records: ${user.total_records}`}
                      color="secondary"
                    />
                  </Box>
                </Grid>
              </Grid>
            </AccordionSummary>
            
            <AccordionDetails>
              {/* Period Summary */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Period Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2">
                      First Clock In: {formatDateTime(user.first_clock_in)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2">
                      Last Clock Out: {formatDateTime(user.last_clock_out)}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              {/* Location Groups */}
              {Object.entries(user.locations).map(([location, locationData]) => (
                <Box key={location} sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    {location}
                  </Typography>
                  <Chip
                    label={`Location Total: ${formatDuration(locationData.total_hours)}`}
                    color="primary"
                    sx={{ mb: 2 }}
                  />
                  
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Clock In</TableCell>
                          <TableCell>Clock Out</TableCell>
                          <TableCell align="right">Hours</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {locationData.records.map((clockRecord, recordIndex) => (
                          <TableRow key={`${location}-${recordIndex}`}>
                            <TableCell>{formatDateTime(clockRecord.clock_in)}</TableCell>
                            <TableCell>{formatDateTime(clockRecord.clock_out)}</TableCell>
                            <TableCell align="right">
                              {formatDuration(clockRecord.individual_hours)}
                            </TableCell>
                            <TableCell align="right">
                              <IconButton
                                size="small"
                                onClick={() => handleEditClick(clockRecord, user.user_id, location)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                        {/* Location Total Row */}
                        <TableRow sx={{ backgroundColor: 'rgba(0, 0, 0, 0.04)' }}>
                          <TableCell colSpan={2} sx={{ fontWeight: 'bold' }}>
                            Location Total
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                            {formatDuration(locationData.total_hours)}
                          </TableCell>
                          <TableCell />
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              ))}

              {/* User Total Summary */}
              <Divider sx={{ my: 2 }} />
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  User Total Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Location</TableCell>
                            <TableCell align="right">Hours</TableCell>
                            <TableCell align="right">Records</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {Object.entries(user.locations).map(([location, data]) => (
                            <TableRow key={location}>
                              <TableCell>{location}</TableCell>
                              <TableCell align="right">
                                {formatDuration(data.total_hours)}
                              </TableCell>
                              <TableCell align="right">
                                {data.records.length}
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow sx={{ 
                            backgroundColor: 'rgba(0, 0, 0, 0.08)',
                            fontWeight: 'bold'
                          }}>
                            <TableCell sx={{ fontWeight: 'bold' }}>
                              Total All Locations
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                              {formatDuration(user.total_hours)}
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                              {user.total_records}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                </Grid>
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}

        {summaryData.length === 0 && (
          <Typography variant="body1" sx={{ textAlign: 'center', mt: 3 }}>
            No records found for the selected period
          </Typography>
        )}
      </Paper>

      {/* Edit Dialog */}
      {editingRecord && <EditRecordDialog />}

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

// Helper function for formatting duration
const formatDuration = (hours) => {
  const numHours = parseFloat(hours);
  if (isNaN(numHours)) return '0h 0m';
  const wholeHours = Math.floor(numHours);
  const minutes = Math.round((numHours - wholeHours) * 60);
  return `${wholeHours}h ${minutes}m`;
};

// Helper function for formatting datetime
const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return format(new Date(dateString), 'yyyy-MM-dd HH:mm:ss');
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid Date';
  }
};

export default RecordsSummary;