const db = require('../config/database');
const moment = require('moment');
const { ALLOWED_LOCATIONS } = require('../config/constants');

exports.clockIn = async (req, res) => {
    try {
        const userId = req.user.id;
        const { notes, location } = req.body;

        // Validate location
        if (!ALLOWED_LOCATIONS.includes(location)) {
            return res.status(400).json({
                error: 'Invalid location. Please select a valid location.'
            });
        }

        // Check if user already clocked in
        const [activeClocking] = await db.query(
            `SELECT * FROM clock_records 
             WHERE user_id = ? AND status = 'in' 
             AND clock_out IS NULL`,
            [userId]
        );

        if (activeClocking.length > 0) {
            return res.status(400).json({
                error: 'You are already clocked in'
            });
        }

        const [result] = await db.query(
            `INSERT INTO clock_records (user_id, clock_in, status, notes, location) 
             VALUES (?, NOW(), 'in', ?, ?)`,
            [userId, notes, location]
        );

        res.status(201).json({
            message: 'Clocked in successfully',
            recordId: result.insertId,
            location: location
        });
    } catch (error) {
        console.error('Clock in error:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.clockOut = async (req, res) => {
    try {
        const userId = req.user.id;
        const { notes, location, break_minutes } = req.body;

        // Get user info to check no_break status
        const [userInfo] = await db.query(
            'SELECT no_break FROM users WHERE id = ?',
            [userId]
        );

        // If user has no_break set to true, force break_minutes to 0
        const validatedBreakMinutes = userInfo[0]?.no_break ?
            0 :
            (break_minutes !== undefined ? Math.max(0, parseInt(break_minutes) || 0) : 30);

        // Validate location if it's not 'Other'
        if (location !== 'Other' && !ALLOWED_LOCATIONS.includes(location)) {
            return res.status(400).json({
                error: 'Invalid location. Please select a valid location.'
            });
        }

        // Find active clock-in record
        const [activeClocking] = await db.query(
            `SELECT * FROM clock_records 
             WHERE user_id = ? AND status = 'in' 
             AND clock_out IS NULL
             ORDER BY clock_in DESC LIMIT 1`,
            [userId]
        );

        if (activeClocking.length === 0) {
            return res.status(400).json({
                error: 'No active clock-in found'
            });
        }

        // Calculate duration
        const clockInTime = moment(activeClocking[0].clock_in);
        const clockOutTime = moment();
        const duration = clockOutTime.diff(clockInTime, 'hours', true);

        // Update the record
        await db.query(
            `UPDATE clock_records 
             SET clock_out = NOW(), 
                 status = 'out', 
                 notes = CONCAT(IFNULL(notes, ''), '\nOut: ', ?),
                 location = ?,
                 break_minutes = ?
             WHERE id = ?`,
            [notes || '', location, validatedBreakMinutes, activeClocking[0].id]
        );

        // Calculate actual hours worked (including break deduction)
        const actualDuration = duration - (validatedBreakMinutes / 60);

        res.json({
            message: 'Clocked out successfully',
            duration: actualDuration.toFixed(2),
            location: location,
            break_minutes: validatedBreakMinutes
        });
    } catch (error) {
        console.error('Clock out error:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.getRecords = async (req, res) => {
    try {
        const userId = req.user.id;
        const { start_date, end_date } = req.query;

        let query = `
            SELECT 
                cr.*,
                CASE 
                    WHEN cr.clock_out IS NOT NULL THEN 
                        ROUND(
                            (TIMESTAMPDIFF(MINUTE, cr.clock_in, cr.clock_out) - IFNULL(cr.break_minutes, 30)) / 60.0,
                            2
                        )
                    ELSE 
                        ROUND(
                            (TIMESTAMPDIFF(MINUTE, cr.clock_in, NOW()) - IFNULL(cr.break_minutes, 30)) / 60.0,
                            2
                        )
                END as hours_worked,
                u.username,
                u.full_name,
                u.no_break
            FROM clock_records cr
            JOIN users u ON cr.user_id = u.id
            WHERE cr.user_id = ?
        `;
        let params = [userId];

        if (start_date && end_date) {
            query += ` AND cr.clock_in >= ? AND DATE(cr.clock_in) <= DATE(?)`;
            params.push(start_date, end_date);
        }

        query += ` ORDER BY cr.clock_in DESC`;

        const [records] = await db.query(query, params);

        // Format records
        const formattedRecords = records.map(record => ({
            ...record,
            hours_worked: Number(record.hours_worked || 0).toFixed(2),
            clock_in: moment(record.clock_in).format('YYYY-MM-DD HH:mm:ss'),
            clock_out: record.clock_out ?
                moment(record.clock_out).format('YYYY-MM-DD HH:mm:ss') :
                null,
            no_break: record.no_break || false
        }));

        res.json(formattedRecords);
    } catch (error) {
        console.error('Get records error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get summary by location
exports.getLocationSummary = async (req, res) => {
    try {
        const userId = req.user.id;
        const { start_date, end_date } = req.query;

        let query = `
            SELECT 
                location,
                COUNT(*) as total_records,
                SUM(
                    TIMESTAMPDIFF(SECOND, clock_in, 
                        CASE 
                            WHEN clock_out IS NOT NULL THEN clock_out 
                            ELSE NOW() 
                        END
                    )
                ) / 3600 as total_hours
            FROM clock_records
            WHERE user_id = ?
        `;
        let params = [userId];

        if (start_date && end_date) {
            query += ` AND clock_in BETWEEN ? AND ?`;
            params.push(start_date, end_date);
        }

        query += ` GROUP BY location ORDER BY total_hours DESC`;

        const [summary] = await db.query(query, params);

        // Format summary
        const formattedSummary = summary.map(item => ({
            ...item,
            total_hours: Number(item.total_hours).toFixed(2)
        }));

        res.json(formattedSummary);
    } catch (error) {
        console.error('Get location summary error:', error);
        res.status(500).json({ error: error.message });
    }
};