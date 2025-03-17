const db = require('../config/database');
const moment = require('moment');

// Get records grouped by user for a given period
exports.getRecordsSummaryByPeriod = async (req, res) => {
    try {
        const { start_date, end_date } = req.query;

        if (!start_date || !end_date) {
            return res.status(400).json({
                error: 'Start date and end date are required'
            });
        }

        const query = `
        WITH user_location_summary AS (
            SELECT 
                u.id as user_id,
                u.username,
                u.full_name,
                cr.id as record_id,
                cr.location,
                cr.break_minutes,
                COUNT(cr.id) OVER (PARTITION BY u.id) as total_records,
                COUNT(cr.id) OVER (PARTITION BY u.id, cr.location) as location_records,
                SUM(
                    CASE 
                        WHEN cr.clock_out IS NOT NULL 
                        THEN (TIMESTAMPDIFF(SECOND, cr.clock_in, cr.clock_out) - (cr.break_minutes * 60))
                        ELSE (TIMESTAMPDIFF(SECOND, cr.clock_in, NOW()) - (cr.break_minutes * 60))
                    END
                ) OVER (PARTITION BY u.id) / 3600 as total_hours,
                SUM(
                    CASE 
                        WHEN cr.clock_out IS NOT NULL 
                        THEN (TIMESTAMPDIFF(SECOND, cr.clock_in, cr.clock_out) - (cr.break_minutes * 60))
                        ELSE (TIMESTAMPDIFF(SECOND, cr.clock_in, NOW()) - (cr.break_minutes * 60))
                    END
                ) OVER (PARTITION BY u.id, cr.location) / 3600 as location_hours,
                MIN(cr.clock_in) OVER (PARTITION BY u.id) as first_clock_in,
                MAX(cr.clock_out) OVER (PARTITION BY u.id) as last_clock_out,
                MIN(cr.clock_in) OVER (PARTITION BY u.id, cr.location) as location_first_clock_in,
                MAX(cr.clock_out) OVER (PARTITION BY u.id, cr.location) as location_last_clock_out,
                cr.clock_in,
                cr.clock_out,
                CASE 
                    WHEN cr.clock_out IS NOT NULL 
                    THEN (TIMESTAMPDIFF(SECOND, cr.clock_in, cr.clock_out) - (cr.break_minutes * 60))
                    ELSE (TIMESTAMPDIFF(SECOND, cr.clock_in, NOW()) - (cr.break_minutes * 60))
                END / 3600 as individual_hours
            FROM users u
            LEFT JOIN clock_records cr ON u.id = cr.user_id
            WHERE cr.clock_in >= ? 
            AND DATE(cr.clock_in) <= DATE(?)
        )
        SELECT * FROM user_location_summary
        ORDER BY user_id, clock_in DESC
        `;

        const [summary] = await db.query(query, [start_date, end_date]);

        // Format the results
        const formattedSummary = summary.map(record => ({
            ...record,
            total_hours: Number(record.total_hours).toFixed(2),
            location_hours: Number(record.location_hours).toFixed(2),
            individual_hours: Number(record.individual_hours).toFixed(2),
            first_clock_in: moment(record.first_clock_in).format('YYYY-MM-DD HH:mm:ss'),
            last_clock_out: record.last_clock_out ?
                moment(record.last_clock_out).format('YYYY-MM-DD HH:mm:ss') :
                'Still clocked in',
            location_first_clock_in: moment(record.location_first_clock_in).format('YYYY-MM-DD HH:mm:ss'),
            location_last_clock_out: record.location_last_clock_out ?
                moment(record.location_last_clock_out).format('YYYY-MM-DD HH:mm:ss') :
                'Still clocked in',
            clock_in: moment(record.clock_in).format('YYYY-MM-DD HH:mm:ss'),
            clock_out: record.clock_out ?
                moment(record.clock_out).format('YYYY-MM-DD HH:mm:ss') :
                null
        }));

        res.json(formattedSummary);
    } catch (error) {
        console.error('Get records summary error:', error);
        res.status(500).json({ error: error.message });
    }
};
// Get detailed records for a specific user
exports.getUserRecords = async (req, res) => {
    try {
        const { user_id } = req.params;
        const { start_date, end_date } = req.query;

        // Verify user exists
        const [user] = await db.query(
            'SELECT id, username, full_name FROM users WHERE id = ?',
            [user_id]
        );

        if (user.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        let query = `
            SELECT 
                cr.id,
                cr.clock_in,
                cr.clock_out,
                cr.status,
                cr.notes,
                CASE 
                    WHEN cr.clock_out IS NOT NULL 
                    THEN TIMESTAMPDIFF(SECOND, cr.clock_in, cr.clock_out) / 3600
                    ELSE TIMESTAMPDIFF(SECOND, cr.clock_in, NOW()) / 3600
                END as hours_worked,
                cr.location,
                cr.ip_address,
                cr.created_at,
                cr.updated_at,
                CASE 
                    WHEN cr.modified_by IS NOT NULL THEN JSON_OBJECT(
                        'modifier', m.username,
                        'modified_at', cr.updated_at
                    )
                    ELSE NULL
                END as modification_info
            FROM clock_records cr
            LEFT JOIN users m ON cr.modified_by = m.id
            WHERE cr.user_id = ?
        `;

        const params = [user_id];

        if (start_date && end_date) {
            query += ` AND cr.clock_in BETWEEN ? AND ?`;
            params.push(start_date, end_date);
        }

        query += ` ORDER BY cr.clock_in DESC`;

        const [records] = await db.query(query, params);

        // Format the results
        const formattedRecords = records.map(record => ({
            ...record,
            clock_in: moment(record.clock_in).format('YYYY-MM-DD HH:mm:ss'),
            clock_out: record.clock_out ?
                moment(record.clock_out).format('YYYY-MM-DD HH:mm:ss') :
                null,
            hours_worked: Number(record.hours_worked).toFixed(2),
            created_at: moment(record.created_at).format('YYYY-MM-DD HH:mm:ss'),
            updated_at: moment(record.updated_at).format('YYYY-MM-DD HH:mm:ss')
        }));

        res.json({
            user: user[0],
            records: formattedRecords,
            total_records: formattedRecords.length,
            total_hours: formattedRecords.reduce(
                (sum, record) => sum + parseFloat(record.hours_worked),
                0
            ).toFixed(2)
        });
    } catch (error) {
        console.error('Get user records error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Modify a clock record

exports.modifyRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const { clock_in, clock_out, notes, location, break_minutes } = req.body;

        // Validate required fields
        if (!clock_in) {
            return res.status(400).json({
                error: 'clock_in is required'
            });
        }

        // Validate dates
        if (!moment(clock_in).isValid()) {
            return res.status(400).json({
                error: 'Invalid clock_in date format'
            });
        }

        if (clock_out && !moment(clock_out).isValid()) {
            return res.status(400).json({
                error: 'Invalid clock_out date format'
            });
        }

        // Validate break_minutes
        const validatedBreakMinutes = break_minutes !== undefined ?
            Math.max(0, parseInt(break_minutes) || 0) : 30;

        // Get existing record
        const [existingRecord] = await db.query(
            'SELECT cr.*, u.username as user_name FROM clock_records cr JOIN users u ON cr.user_id = u.id WHERE cr.id = ?',
            [id]
        );

        if (existingRecord.length === 0) {
            return res.status(404).json({
                error: 'Record not found'
            });
        }

        // Calculate hours if clock_out is provided
        let hours = null;
        if (clock_out) {
            hours = moment(clock_out).diff(moment(clock_in), 'hours', true);
            if (hours < 0 || hours > 24) {
                return res.status(400).json({
                    error: 'Invalid time range. Hours must be between 0 and 24'
                });
            }
        }

        // Prepare modification note
        const modificationNote = `
            Modified by admin (${req.user.username}) on ${moment().format('YYYY-MM-DD HH:mm:ss')}
            Previous: In: ${moment(existingRecord[0].clock_in).format('YYYY-MM-DD HH:mm:ss')} 
            ${existingRecord[0].clock_out ? 'Out: ' + moment(existingRecord[0].clock_out).format('YYYY-MM-DD HH:mm:ss') : ''}
            Break: ${existingRecord[0].break_minutes} minutes
            ${existingRecord[0].notes ? '\nOriginal Notes: ' + existingRecord[0].notes : ''}
            \nNew Notes: ${notes || 'No notes provided'}
        `.trim();

        // Update record
        const updateQuery = `
            UPDATE clock_records 
            SET clock_in = ?,
                clock_out = ?,
                notes = ?,
                status = ?,
                location = ?,
                break_minutes = ?,
                modified_by = ?,
                updated_at = NOW()
            WHERE id = ?
        `;

        await db.query(updateQuery, [
            clock_in,
            clock_out,
            modificationNote,
            clock_out ? 'out' : 'in',
            location,
            validatedBreakMinutes,
            req.user.id,
            id
        ]);

        // Log the modification
        await db.query(
            `INSERT INTO audit_logs (
                user_id, action, table_name, record_id, 
                old_values, new_values, ip_address
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                req.user.id,
                'UPDATE',
                'clock_records',
                id,
                JSON.stringify({
                    clock_in: existingRecord[0].clock_in,
                    clock_out: existingRecord[0].clock_out,
                    notes: existingRecord[0].notes,
                    location: existingRecord[0].location,
                    break_minutes: existingRecord[0].break_minutes
                }),
                JSON.stringify({
                    clock_in,
                    clock_out,
                    notes,
                    location,
                    break_minutes: validatedBreakMinutes
                }),
                req.ip
            ]
        );

        res.json({
            message: 'Record updated successfully',
            break_minutes: validatedBreakMinutes
        });
    } catch (error) {
        console.error('Modify record error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const [users] = await db.query(
            `SELECT 
                id,
                username,
                email,
                full_name,
                role,
                status,
                created_at,
                last_login,
                (SELECT COUNT(*) 
                 FROM clock_records 
                 WHERE user_id = users.id AND 
                       status = 'in' AND 
                       clock_out IS NULL
                ) as is_clocked_in
            FROM users
            ORDER BY created_at DESC`
        );

        // Format dates
        const formattedUsers = users.map(user => ({
            ...user,
            created_at: moment(user.created_at).format('YYYY-MM-DD HH:mm:ss'),
            last_login: user.last_login ?
                moment(user.last_login).format('YYYY-MM-DD HH:mm:ss') :
                null,
            is_clocked_in: Boolean(user.is_clocked_in)
        }));

        res.json(formattedUsers);
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Optional: Add user status update
exports.updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['active', 'inactive'].includes(status)) {
            return res.status(400).json({
                error: 'Invalid status. Must be either active or inactive'
            });
        }

        await db.query(
            'UPDATE users SET status = ? WHERE id = ?',
            [status, id]
        );

        res.json({
            message: 'User status updated successfully'
        });
    } catch (error) {
        console.error('Update user status error:', error);
        res.status(500).json({ error: error.message });
    }
};