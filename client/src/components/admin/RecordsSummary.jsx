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
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { format, addDays, endOfMonth, isValid, parse, parseISO } from 'date-fns';
import api from '../../services/api';
import { getInitialDateRange, toVancouverTime, formatVancouverDate } from '../../utils/dateUtils';

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
  const [filters, setFilters] = useState(() => ({
    location: 'all',
    ...getInitialDateRange()
  }));

  useEffect(() => {
    // Update date range when component mounts
    setFilters(prev => ({
      ...prev,
      ...getInitialDateRange()
    }));
  }, []);

  const locations = [
    { value: 'all', label: 'All Locations' },
    { value: 'MMC', label: 'MMC' },
    { value: 'SkinartMD', label: 'SkinartMD' },
    { value: 'RAAC', label: 'RAAC' },
    { value: 'Remote', label: 'Remote' },
    { value: 'Other', label: 'Other' }
  ];

  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      // 打印过滤器，便于调试
      console.log('Fetching with filters:', filters);

      // Use the selected dates directly without timezone conversion
      if (!filters.start_date || !filters.end_date) {
        throw new Error('Start date and end date are required');
      }

      // Ensure end date includes the full day (23:59:59)
      const formattedStartDate = `${filters.start_date} 00:00:00`;
      const formattedEndDate = `${filters.end_date} 23:59:59`;

      console.log('Formatted dates:', { start: formattedStartDate, end: formattedEndDate });

      const params = {
        start_date: formattedStartDate,
        end_date: formattedEndDate,
        ...(filters.location !== 'all' && { location: filters.location })
      };

      console.log('Sending API request with params:', params);

      const response = await api.get('/admin/records/summary', { params });
      console.log('API response:', response.data);

      if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
        console.warn('Empty or invalid response data:', response.data);
        setSummaryData([]);
        setLoading(false);
        return;
      }

      const groupedData = response.data.reduce((users, record) => {
        // 验证记录字段
        if (!record || !record.user_id) {
          console.warn('Invalid record found:', record);
          return users;
        }

        if (!users[record.user_id]) {
          users[record.user_id] = {
            user_id: record.user_id,
            username: record.username || 'Unknown',
            full_name: record.full_name || 'Unknown User',
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

        // 计算工作时间
        let individualHours = 0;
        try {
          individualHours = parseFloat(record.individual_hours || 0);
          if (isNaN(individualHours)) {
            individualHours = 0;
          }
        } catch (e) {
          console.error('Error parsing individual hours:', e, record);
          individualHours = 0;
        }

        users[record.user_id].locations[location].records.push({
          id: record.record_id,
          clock_in: record.clock_in,
          clock_out: record.clock_out,
          break_minutes: record.break_minutes || 30,
          individual_hours: individualHours,
          location: location
        });

        users[record.user_id].locations[location].total_hours += individualHours;
        users[record.user_id].total_hours += individualHours;
        users[record.user_id].total_records += 1;

        return users;
      }, {});

      const summaryArray = Object.values(groupedData);
      console.log('Processed data:', summaryArray);

      setSummaryData(summaryArray);
    } catch (error) {
      console.error('Failed to fetch summary:', error);
      setError(error.response?.data?.message || error.message || 'Failed to fetch summary data');
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

    // 格式化日期时间为HTML datetime-local输入所需的格式
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
      // 确保日期时间格式正确
      const formattedClockIn = moment(editingRecord.clock_in).format('YYYY-MM-DD HH:mm:ss');
      const formattedClockOut = moment(editingRecord.clock_out).format('YYYY-MM-DD HH:mm:ss');

      await api.put(`/admin/records/${editingRecord.id}`, {
        clock_in: formattedClockIn,
        clock_out: formattedClockOut,
        location: editingRecord.location,
        break_minutes: editingRecord.break_minutes,
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

  const handleEditDateTimeChange = (field, value) => {
    if (!value) {
      setEditingRecord(prev => ({
        ...prev,
        [field]: null
      }));
      return;
    }

    try {
      // Format the date directly without timezone conversion
      const formattedDate = format(new Date(value), "yyyy-MM-dd'T'HH:mm");

      setEditingRecord(prev => ({
        ...prev,
        [field]: formattedDate
      }));
    } catch (error) {
      console.error(`Error formatting ${field} date:`, error);
    }
  };

  const EditRecordDialog = () => (
    <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Clock Record</DialogTitle>
      <DialogContent>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Box sx={{ mt: 2 }}>
            <DateTimePicker
              label="Clock In"
              value={editingRecord?.clock_in ? new Date(editingRecord.clock_in) : null}
              onChange={(newValue) => handleEditDateTimeChange('clock_in', newValue)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  margin: "normal"
                }
              }}
            />
            <DateTimePicker
              label="Clock Out"
              value={editingRecord?.clock_out ? new Date(editingRecord.clock_out) : null}
              onChange={(newValue) => handleEditDateTimeChange('clock_out', newValue)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  margin: "normal"
                }
              }}
            />
            <TextField
              label="Break Minutes"
              type="number"
              value={editingRecord?.break_minutes || 30}
              onChange={(e) => setEditingRecord({
                ...editingRecord,
                break_minutes: parseInt(e.target.value) || 30
              })}
              fullWidth
              margin="normal"
              InputProps={{ inputProps: { min: 0, max: 120 } }}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Location</InputLabel>
              <Select
                value={editingRecord?.location || ''}
                onChange={(e) => setEditingRecord({
                  ...editingRecord,
                  location: e.target.value
                })}
                label="Location"
              >
                {locations.filter(loc => loc.value !== 'all').map((loc) => (
                  <MenuItem key={loc.value} value={loc.value}>
                    {loc.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </LocalizationProvider>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => setEditDialogOpen(false)}
          startIcon={<CancelIcon />}
          color="inherit"
        >
          CANCEL
        </Button>
        <Button
          onClick={handleSaveEdit}
          startIcon={<SaveIcon />}
          color="primary"
          variant="contained"
        >
          SAVE
        </Button>
      </DialogActions>
    </Dialog>
  );

  const formatDuration = (hours) => {
    if (!hours) return '0h';
    return `${Number(hours).toFixed(1)}h`;
  };

  const formatDateTime = (datetime) => {
    if (!datetime) return 'N/A';
    try {
      const date = new Date(datetime);
      if (isNaN(date.getTime())) {
        console.warn('Invalid date in RecordsSummary:', datetime);
        return 'Invalid Date';
      }

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');

      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    } catch (error) {
      console.error('Error formatting date in RecordsSummary:', error, datetime);
      return 'Invalid Date';
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h5" gutterBottom>
          Staff Working Hours Summary
        </Typography>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Location</InputLabel>
              <Select
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                label="Location"
              >
                {locations.map((loc) => (
                  <MenuItem key={loc.value} value={loc.value}>
                    {loc.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Start Date"
              type="date"
              value={filters.start_date ? filters.start_date : ''}
              onChange={(e) => {
                const date = e.target.value;
                setFilters(prev => ({
                  ...prev,
                  start_date: date
                }));
              }}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="End Date"
              type="date"
              value={filters.end_date ? filters.end_date : ''}
              onChange={(e) => {
                const date = e.target.value;
                setFilters(prev => ({
                  ...prev,
                  end_date: date
                }));
              }}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : summaryData.length === 0 ? (
          <Alert severity="info">No records found for the selected period</Alert>
        ) : (
          <>
            <Box sx={{ mb: 2 }}>
              <Chip
                label={`Grand Total Hours: ${formatDuration(
                  summaryData.reduce((total, user) => total + user.total_hours, 0)
                )}`}
                color="primary"
              />
            </Box>
            {summaryData.map((user) => (
              <Accordion key={user.user_id}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>{user.full_name} ({user.username})</Typography>
                  <Box sx={{ ml: 2 }}>
                    <Chip
                      label={`Total Hours: ${formatDuration(user.total_hours)}`}
                      color="primary"
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <Chip
                      label={`Records: ${user.total_records}`}
                      color="secondary"
                      size="small"
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  {Object.entries(user.locations).map(([location, locationData]) => (
                    <Box key={location} sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        {location}
                        <Chip
                          label={`Location Total: ${formatDuration(locationData.total_hours)}`}
                          color="primary"
                          size="small"
                          sx={{ ml: 2 }}
                        />
                      </Typography>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Clock In</TableCell>
                              <TableCell>Clock Out</TableCell>
                              <TableCell>Break</TableCell>
                              <TableCell>Hours</TableCell>
                              <TableCell>Location</TableCell>
                              <TableCell>Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {locationData.records.map((record) => (
                              <TableRow key={record.id}>
                                <TableCell>{formatDateTime(record.clock_in)}</TableCell>
                                <TableCell>
                                  {record.clock_out ? formatDateTime(record.clock_out) : 'Still clocked in'}
                                </TableCell>
                                <TableCell>{record.break_minutes} min</TableCell>
                                <TableCell>{Number(record.individual_hours).toFixed(2)}</TableCell>
                                <TableCell>{record.location || 'Unspecified'}</TableCell>
                                <TableCell>
                                  <IconButton
                                    onClick={() => handleEditClick(record, user.user_id, record.location)}
                                    size="small"
                                  >
                                    <EditIcon />
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
                              <TableCell />
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
          </>
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

export default RecordsSummary;