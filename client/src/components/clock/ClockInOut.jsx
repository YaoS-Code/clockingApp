import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

function ClockInOut() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState('');
  const [otherLocation, setOtherLocation] = useState('');
  const [message, setMessage] = useState('');
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentRecord, setCurrentRecord] = useState(null);

  const locations = [
    { value: 'MMC', label: 'MMC' },
    { value: 'SkinartMD', label: 'SkinartMD' },
    { value: 'RAAC', label: 'RAAC' },
    { value: 'Remote', label: 'Remote' },
    { value: 'Other', label: 'Other' }
  ];

  useEffect(() => {
    checkClockStatus();
  }, []);

  const checkClockStatus = async () => {
    try {
      setLoading(true);
      const response = await api.get('/clock/records');
      const lastRecord = response.data[0]; // Assuming the most recent record is first
      
      if (lastRecord && lastRecord.status === 'in') {
        setIsClockedIn(true);
        setCurrentRecord(lastRecord);
        setLocation(lastRecord.location || '');
        setNotes(lastRecord.notes || '');
      } else {
        setIsClockedIn(false);
        setCurrentRecord(null);
        setLocation('');
        setNotes('');
      }
    } catch (err) {
      console.error('Failed to fetch clock status', err);
      setMessage('Failed to fetch clock status');
    } finally {
      setLoading(false);
    }
  };

  const handleClockIn = async () => {
    try {
      const finalLocation = location === 'Other' ? otherLocation : location;
      if (!finalLocation) {
        setMessage('Please select a location');
        return;
      }
      
      setLoading(true);
      const response = await api.post('/clock/in', { 
        notes, 
        location: finalLocation 
      });
      
      setMessage(response.data.message);
      setIsClockedIn(true);
      setCurrentRecord(response.data);
      setOpenDialog(false);
      
      // Optional: Redirect to records page
      // navigate('/records');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Clock in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    try {
      setLoading(true);
      const finalLocation = location === 'Other' ? otherLocation : location;
      const response = await api.post('/clock/out', { 
        notes, 
        location: finalLocation 
      });
      
      setMessage(response.data.message);
      setIsClockedIn(false);
      setCurrentRecord(null);
      setLocation('');
      setOtherLocation('');
      setNotes('');
      
      // Redirect to records page after successful clock out
      navigate('/records');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Clock out failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLocationChange = (event) => {
    const value = event.target.value;
    setLocation(value);
    if (value === 'Other') {
      setOpenDialog(true);
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
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography variant="h4" align="center" gutterBottom>
          {isClockedIn ? 'Currently Clocked In' : 'Clock In'}
        </Typography>
        
        {message && (
          <Typography 
            color={message.includes('failed') ? 'error' : 'primary'} 
            align="center" 
            gutterBottom
          >
            {message}
          </Typography>
        )}

        {isClockedIn && currentRecord && (
          <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="subtitle1" gutterBottom>
              Clocked in since: {new Date(currentRecord.clock_in).toLocaleString()}
            </Typography>
            <Typography variant="subtitle1">
              Location: {currentRecord.location}
            </Typography>
          </Box>
        )}

        <Box sx={{ mt: 2 }}>
          {!isClockedIn && (
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Location</InputLabel>
              <Select
                value={location}
                label="Location"
                onChange={handleLocationChange}
                required
              >
                {locations.map((loc) => (
                  <MenuItem key={loc.value} value={loc.value}>
                    {loc.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <TextField
            fullWidth
            label="Notes"
            multiline
            rows={4}
            margin="normal"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          {isClockedIn ? (
            <Button
              fullWidth
              variant="contained"
              color="secondary"
              sx={{ mt: 3, mb: 2 }}
              onClick={handleClockOut}
              disabled={loading}
            >
              Clock Out
            </Button>
          ) : (
            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              onClick={handleClockIn}
              disabled={loading || !location}
            >
              Clock In
            </Button>
          )}

          {isClockedIn && (
            <Button
              fullWidth
              variant="outlined"
              sx={{ mt: 1 }}
              onClick={() => navigate('/records')}
            >
              View Records
            </Button>
          )}
        </Box>
      </Paper>

      {/* Dialog for Other Location */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Enter Other Location</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Location Name"
            fullWidth
            variant="outlined"
            value={otherLocation}
            onChange={(e) => setOtherLocation(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setLocation('');
            setOpenDialog(false);
          }}>
            Cancel
          </Button>
          <Button onClick={() => {
            if (otherLocation.trim()) {
              setOpenDialog(false);
            }
          }}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default ClockInOut;