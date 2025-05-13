import React, { useEffect, useState } from 'react';
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Typography,
    CircularProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Chip,
    TextField
} from '@mui/material';
import { format } from 'date-fns';
import api from '../../services/api';

const CorrectionRequests = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [requests, setRequests] = useState({ pending: [], approved: [], rejected: [] });
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [action, setAction] = useState(null);
    const [adminNotes, setAdminNotes] = useState('');

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/correction-requests');
            setRequests(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching correction requests:', err);
            setError('Failed to load correction requests. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleAction = async () => {
        if (!selectedRequest || !action) return;

        try {
            setLoading(true);
            if (action === 'approve') {
                await api.put(`/admin/correction-requests/${selectedRequest.id}/approve`, { admin_notes: adminNotes });
            } else if (action === 'reject') {
                await api.put(`/admin/correction-requests/${selectedRequest.id}/reject`, { admin_notes: adminNotes });
            }
            setDialogOpen(false);
            setSelectedRequest(null);
            setAction(null);
            setAdminNotes('');
            await fetchRequests();
        } catch (error) {
            console.error('Error processing request:', error);
            setError('Failed to process request. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const openDialog = (request, actionType) => {
        setSelectedRequest(request);
        setAction(actionType);
        setAdminNotes('');
        setDialogOpen(true);
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return format(new Date(dateString), 'MMM d, yyyy HH:mm');
        } catch (error) {
            return 'Invalid Date';
        }
    };

    if (loading && !requests.pending.length && !requests.approved.length && !requests.rejected.length) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box m={2}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    return (
        <Box p={3}>
            <Typography variant="h5" gutterBottom>
                Correction Requests
            </Typography>

            {(!requests.pending?.length && !requests.approved?.length && !requests.rejected?.length) ? (
                <Alert severity="info">No correction requests found.</Alert>
            ) : (
                <>
                    {requests.pending?.length > 0 && (
                        <Box mb={4}>
                            <Typography variant="h6" gutterBottom sx={{ color: 'warning.main' }}>
                                Pending Requests ({requests.pending.length})
                            </Typography>
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Employee</TableCell>
                                            <TableCell>Date</TableCell>
                                            <TableCell>Original Clock In</TableCell>
                                            <TableCell>Requested Clock In</TableCell>
                                            <TableCell>Original Clock Out</TableCell>
                                            <TableCell>Requested Clock Out</TableCell>
                                            <TableCell>Reason</TableCell>
                                            <TableCell>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {requests.pending.map((request) => (
                                            <TableRow key={request.id}>
                                                <TableCell>{request.user?.full_name || request.username}</TableCell>
                                                <TableCell>{formatDateTime(request.created_at)}</TableCell>
                                                <TableCell>{formatDateTime(request.original_clock_in)}</TableCell>
                                                <TableCell>{formatDateTime(request.requested_clock_in)}</TableCell>
                                                <TableCell>{formatDateTime(request.original_clock_out)}</TableCell>
                                                <TableCell>{formatDateTime(request.requested_clock_out)}</TableCell>
                                                <TableCell>{request.reason}</TableCell>
                                                <TableCell>
                                                    <Button
                                                        color="primary"
                                                        onClick={() => openDialog(request, 'approve')}
                                                        size="small"
                                                        variant="contained"
                                                        sx={{ mr: 1 }}
                                                    >
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        color="error"
                                                        onClick={() => openDialog(request, 'reject')}
                                                        size="small"
                                                        variant="contained"
                                                    >
                                                        Reject
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    )}

                    {requests.approved?.length > 0 && (
                        <Box mb={4}>
                            <Typography variant="h6" gutterBottom sx={{ color: 'success.main' }}>
                                Approved Requests ({requests.approved.length})
                            </Typography>
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Employee</TableCell>
                                            <TableCell>Date</TableCell>
                                            <TableCell>Original Clock In</TableCell>
                                            <TableCell>Requested Clock In</TableCell>
                                            <TableCell>Original Clock Out</TableCell>
                                            <TableCell>Requested Clock Out</TableCell>
                                            <TableCell>Reason</TableCell>
                                            <TableCell>Admin Notes</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {requests.approved.map((request) => (
                                            <TableRow key={request.id}>
                                                <TableCell>{request.user?.full_name || request.username}</TableCell>
                                                <TableCell>{formatDateTime(request.created_at)}</TableCell>
                                                <TableCell>{formatDateTime(request.original_clock_in)}</TableCell>
                                                <TableCell>{formatDateTime(request.requested_clock_in)}</TableCell>
                                                <TableCell>{formatDateTime(request.original_clock_out)}</TableCell>
                                                <TableCell>{formatDateTime(request.requested_clock_out)}</TableCell>
                                                <TableCell>{request.reason}</TableCell>
                                                <TableCell>{request.admin_notes || 'N/A'}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    )}

                    {requests.rejected?.length > 0 && (
                        <Box mb={4}>
                            <Typography variant="h6" gutterBottom sx={{ color: 'error.main' }}>
                                Rejected Requests ({requests.rejected.length})
                            </Typography>
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Employee</TableCell>
                                            <TableCell>Date</TableCell>
                                            <TableCell>Original Clock In</TableCell>
                                            <TableCell>Requested Clock In</TableCell>
                                            <TableCell>Original Clock Out</TableCell>
                                            <TableCell>Requested Clock Out</TableCell>
                                            <TableCell>Reason</TableCell>
                                            <TableCell>Admin Notes</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {requests.rejected.map((request) => (
                                            <TableRow key={request.id}>
                                                <TableCell>{request.user?.full_name || request.username}</TableCell>
                                                <TableCell>{formatDateTime(request.created_at)}</TableCell>
                                                <TableCell>{formatDateTime(request.original_clock_in)}</TableCell>
                                                <TableCell>{formatDateTime(request.requested_clock_in)}</TableCell>
                                                <TableCell>{formatDateTime(request.original_clock_out)}</TableCell>
                                                <TableCell>{formatDateTime(request.requested_clock_out)}</TableCell>
                                                <TableCell>{request.reason}</TableCell>
                                                <TableCell>{request.admin_notes || 'N/A'}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    )}
                </>
            )}

            <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                aria-labelledby="correction-dialog-title"
            >
                <DialogTitle id="correction-dialog-title">
                    {action === 'approve' ? 'Approve Request' : 'Reject Request'}
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1" gutterBottom>
                        Are you sure you want to {action} this correction request?
                    </Typography>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="admin-notes"
                        label="Admin Notes (Optional)"
                        type="text"
                        fullWidth
                        multiline
                        rows={3}
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button
                        onClick={handleAction}
                        color={action === 'approve' ? 'primary' : 'error'}
                        variant="contained"
                    >
                        {action === 'approve' ? 'Approve' : 'Reject'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CorrectionRequests;
