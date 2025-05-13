import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { format, parseISO } from 'date-fns';
import api from '../../services/api';

const RequestCorrectionForm = ({ open, onClose, record, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    requestedClockIn: record?.clock_in ? parseISO(record.clock_in) : new Date(),
    requestedClockOut: record?.clock_out ? parseISO(record.clock_out) : new Date(),
    requestedBreakMinutes: record?.break_minutes || 30,
    requestedLocation: record?.location || '',
    reason: ''
  });

  const locations = [
    { value: 'MMC', label: 'MMC' },
    { value: 'SkinartMD', label: 'SkinartMD' },
    { value: 'RAAC', label: 'RAAC' },
    { value: 'Remote', label: 'Remote' },
    { value: 'Other', label: 'Other' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.reason.trim()) {
      setError('Please provide a reason for the correction request');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        requested_clock_in: format(formData.requestedClockIn, 'yyyy-MM-dd HH:mm:ss'),
        requested_clock_out: format(formData.requestedClockOut, 'yyyy-MM-dd HH:mm:ss'),
        requested_break_minutes: formData.requestedBreakMinutes,
        requested_location: formData.requestedLocation,
        reason: formData.reason
      };

      await api.post(`/clock/records/${record.id}/correction`, payload);
      
      setLoading(false);
      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.error || 'Failed to submit correction request');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Request Time Correction</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Original Record Details:
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2">
                  <strong>Clock In:</strong> {record?.clock_in ? format(parseISO(record.clock_in), 'yyyy-MM-dd HH:mm:ss') : 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2">
                  <strong>Clock Out:</strong> {record?.clock_out ? format(parseISO(record.clock_out), 'yyyy-MM-dd HH:mm:ss') : 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2">
                  <strong>Break Minutes:</strong> {record?.break_minutes || 0}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2">
                  <strong>Location:</strong> {record?.location || 'N/A'}
                </Typography>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Requested Changes:
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="Requested Clock In"
                value={formData.requestedClockIn}
                onChange={(newValue) => handleDateChange('requestedClockIn', newValue)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="Requested Clock Out"
                value={formData.requestedClockOut}
                onChange={(newValue) => handleDateChange('requestedClockOut', newValue)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Break Minutes"
              type="number"
              name="requestedBreakMinutes"
              value={formData.requestedBreakMinutes}
              onChange={handleChange}
              inputProps={{ min: 0 }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Location</InputLabel>
              <Select
                name="requestedLocation"
                value={formData.requestedLocation}
                label="Location"
                onChange={handleChange}
              >
                {locations.map((loc) => (
                  <MenuItem key={loc.value} value={loc.value}>
                    {loc.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Reason for Correction"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              multiline
              rows={4}
              required
              placeholder="Please explain why you need this time correction"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Submit Request'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RequestCorrectionForm;
