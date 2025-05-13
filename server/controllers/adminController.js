const db = require('../config/database');
const moment = require('moment');

// Get all correction requests
exports.getAllCorrectionRequests = async (req, res) => {
    try {
        const query = `
            SELECT
                cr.*,
                u.username,
                u.full_name,
                r.id as record_id,
                r.clock_in as original_clock_in,
                r.clock_out as original_clock_out,
                r.break_minutes as original_break_minutes,
                r.location as original_location
            FROM correction_requests cr
            JOIN users u ON cr.user_id = u.id
            JOIN clock_records r ON cr.record_id = r.id
            ORDER BY cr.created_at DESC
        `;

        const [requests] = await db.query(query);

        // Group requests by status
        const groupedRequests = {
            pending: requests.filter(req => req.status === 'pending'),
            approved: requests.filter(req => req.status === 'approved'),
            rejected: requests.filter(req => req.status === 'rejected')
        };

        // Format dates
        Object.keys(groupedRequests).forEach(status => {
            groupedRequests[status] = groupedRequests[status].map(request => ({
                ...request,
                created_at: moment(request.created_at).format('YYYY-MM-DD HH:mm:ss'),
                updated_at: request.updated_at ? moment(request.updated_at).format('YYYY-MM-DD HH:mm:ss') : null,
                original_clock_in: moment(request.original_clock_in).format('YYYY-MM-DD HH:mm:ss'),
                original_clock_out: request.original_clock_out ? moment(request.original_clock_out).format('YYYY-MM-DD HH:mm:ss') : null,
                requested_clock_in: moment(request.requested_clock_in).format('YYYY-MM-DD HH:mm:ss'),
                requested_clock_out: request.requested_clock_out ? moment(request.requested_clock_out).format('YYYY-MM-DD HH:mm:ss') : null,
                user: {
                    id: request.user_id,
                    username: request.username,
                    full_name: request.full_name
                },
                record: {
                    id: request.record_id,
                    break_minutes: request.original_break_minutes,
                    location: request.original_location
                }
            }));
        });

        res.json(groupedRequests);
    } catch (error) {
        console.error('Get correction requests error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get count of pending correction requests
exports.getPendingCorrectionRequestsCount = async (req, res) => {
    try {
        const [result] = await db.query(
            'SELECT COUNT(*) as count FROM correction_requests WHERE status = ?',
            ['pending']
        );

        res.json({ count: result[0].count });
    } catch (error) {
        console.error('Get correction requests count error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Approve a correction request
exports.approveCorrection = async (req, res) => {
    try {
        const { id } = req.params;
        const { admin_notes } = req.body || {};

        // Begin transaction
        await db.query('START TRANSACTION');

        // Get the correction request
        const [request] = await db.query(
            'SELECT * FROM correction_requests WHERE id = ?',
            [id]
        );

        if (request.length === 0) {
            await db.query('ROLLBACK');
            return res.status(404).json({ error: 'Correction request not found' });
        }

        if (request[0].status !== 'pending') {
            await db.query('ROLLBACK');
            return res.status(400).json({ error: 'This request has already been processed' });
        }

        // Update the clock record
        await db.query(
            `UPDATE clock_records
             SET clock_in = ?,
                 clock_out = ?,
                 break_minutes = ?,
                 location = ?,
                 modified_by = ?,
                 updated_at = NOW(),
                 notes = CONCAT(IFNULL(notes, ''), '\nModified by admin based on correction request #', ?)
             WHERE id = ?`,
            [
                request[0].requested_clock_in,
                request[0].requested_clock_out,
                request[0].requested_break_minutes,
                request[0].requested_location,
                req.user.id,
                id,
                request[0].record_id
            ]
        );

        // Update the correction request status
        await db.query(
            `UPDATE correction_requests
             SET status = 'approved',
                 admin_notes = ?,
                 updated_at = NOW()
             WHERE id = ?`,
            [admin_notes || null, id]
        );

        // Commit transaction
        await db.query('COMMIT');

        res.json({
            message: 'Correction request approved successfully'
        });
    } catch (error) {
        await db.query('ROLLBACK');
        console.error('Approve correction request error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Reject a correction request
exports.rejectCorrection = async (req, res) => {
    try {
        const { id } = req.params;
        const { admin_notes } = req.body || {};

        // Get the correction request
        const [request] = await db.query(
            'SELECT * FROM correction_requests WHERE id = ?',
            [id]
        );

        if (request.length === 0) {
            return res.status(404).json({ error: 'Correction request not found' });
        }

        if (request[0].status !== 'pending') {
            return res.status(400).json({ error: 'This request has already been processed' });
        }

        // Update the correction request status
        await db.query(
            `UPDATE correction_requests
             SET status = 'rejected',
                 admin_notes = ?,
                 updated_at = NOW()
             WHERE id = ?`,
            [admin_notes || null, id]
        );

        res.json({
            message: 'Correction request rejected successfully'
        });
    } catch (error) {
        console.error('Reject correction request error:', error);
        res.status(500).json({ error: error.message });
    }
};
