import React, { useState, useEffect } from 'react';
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
  Chip,
  Alert,
  CircularProgress,
  Box
} from '@mui/material';
import { format, parseISO, isValid } from 'date-fns';
import api from '../../services/api';

const UserCorrectionRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const response = await api.get('/clock/correction-requests');
        setRequests(response.data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch correction requests:', err);
        setError('Failed to load your correction requests. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = parseISO(dateString);
      return isValid(date) ? format(date, 'yyyy-MM-dd HH:mm:ss') : 'Invalid Date';
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getStatusChip = (status) => {
    let color;
    switch (status) {
      case 'pending':
        color = 'warning';
        break;
      case 'approved':
        color = 'success';
        break;
      case 'rejected':
        color = 'error';
        break;
      default:
        color = 'default';
    }
    return <Chip label={status} color={color} size="small" />;
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
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          My Correction Requests
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {requests.length === 0 ? (
          <Alert severity="info">
            You haven't submitted any correction requests yet.
          </Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Original Clock In</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Original Clock Out</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Requested Clock In</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Requested Clock Out</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Reason</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Submitted</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requests.map((request) => (
                  <TableRow
                    key={request.id}
                    sx={{
                      '&:nth-of-type(odd)': { backgroundColor: 'action.hover' },
                    }}
                  >
                    <TableCell>
                      {request.original_clock_in ? format(parseISO(request.original_clock_in), 'yyyy-MM-dd') : 'N/A'}
                    </TableCell>
                    <TableCell>{formatDateTime(request.original_clock_in)}</TableCell>
                    <TableCell>{formatDateTime(request.original_clock_out)}</TableCell>
                    <TableCell>{formatDateTime(request.requested_clock_in)}</TableCell>
                    <TableCell>{formatDateTime(request.requested_clock_out)}</TableCell>
                    <TableCell>
                      <Box sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {request.reason}
                      </Box>
                    </TableCell>
                    <TableCell>{getStatusChip(request.status)}</TableCell>
                    <TableCell>{formatDateTime(request.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Container>
  );
};

export default UserCorrectionRequests;
