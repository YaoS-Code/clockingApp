const db = require('../config/database');
const moment = require('moment-timezone');
const { ALLOWED_LOCATIONS } = require('../config/constants');

// 设置默认时区为温哥华
moment.tz.setDefault('America/Vancouver');

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

        // 使用当前温哥华时间
        const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');

        const [result] = await db.query(
            `INSERT INTO clock_records (user_id, clock_in, status, notes, location)
             VALUES (?, ?, 'in', ?, ?)`,
            [userId, currentTime, notes, location]
        );

        res.status(201).json({
            message: 'Clocked in successfully',
            recordId: result.insertId,
            location: location,
            clockInTime: currentTime
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

        // 使用当前温哥华时间
        const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');

        // Calculate duration
        const clockInTime = moment(activeClocking[0].clock_in);
        const clockOutTime = moment(currentTime);
        const duration = clockOutTime.diff(clockInTime, 'hours', true);

        // Update the record
        await db.query(
            `UPDATE clock_records
             SET clock_out = ?,
                 status = 'out',
                 notes = CONCAT(IFNULL(notes, ''), '\nOut: ', ?),
                 location = ?,
                 break_minutes = ?
             WHERE id = ?`,
            [currentTime, notes || '', location, validatedBreakMinutes, activeClocking[0].id]
        );

        // Calculate actual hours worked (including break deduction)
        const actualDuration = duration - (validatedBreakMinutes / 60);

        res.json({
            message: 'Clocked out successfully',
            duration: actualDuration.toFixed(2),
            location: location,
            break_minutes: validatedBreakMinutes,
            clockOutTime: currentTime
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
            // Ensure correct date format for start and end dates
            let startDate, endDate;

            try {
                // Handle dates in YYYY-MM-DD format
                if (start_date.length === 10) {
                    startDate = moment.tz(`${start_date} 00:00:00`, 'YYYY-MM-DD HH:mm:ss', 'America/Vancouver');
                } else {
                    startDate = moment.tz(start_date, 'America/Vancouver');
                }

                if (end_date.length === 10) {
                    endDate = moment.tz(`${end_date} 23:59:59`, 'YYYY-MM-DD HH:mm:ss', 'America/Vancouver');
                } else {
                    endDate = moment.tz(end_date, 'America/Vancouver');
                }

                // Verify dates are valid
                if (!startDate.isValid() || !endDate.isValid()) {
                    throw new Error('Invalid date format');
                }

                const formattedStartDate = startDate.format('YYYY-MM-DD HH:mm:ss');
                const formattedEndDate = endDate.format('YYYY-MM-DD HH:mm:ss');

                query += ` AND cr.clock_in >= ? AND cr.clock_in <= ?`;
                params.push(formattedStartDate, formattedEndDate);
            } catch (error) {
                console.error('Date parsing error:', error, { start_date, end_date });
                return res.status(400).json({ error: 'Invalid date format. Please use YYYY-MM-DD format.' });
            }
        }

        query += ` ORDER BY cr.clock_in DESC`;

        const [records] = await db.query(query, params);

        // 格式化记录，确保日期使用温哥华时区
        const formattedRecords = records.map(record => ({
            ...record,
            hours_worked: Number(record.hours_worked || 0).toFixed(2),
            clock_in: moment.tz(record.clock_in, 'America/Vancouver').format('YYYY-MM-DD HH:mm:ss'),
            clock_out: record.clock_out ?
                moment.tz(record.clock_out, 'America/Vancouver').format('YYYY-MM-DD HH:mm:ss') :
                null,
            no_break: record.no_break || false
        }));

        res.json(formattedRecords);
    } catch (error) {
        console.error('Get records error:', error);
        res.status(500).json({ error: error.message });
    }
};

// 获取按位置分组的摘要
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
            // 转换为温哥华时区的日期范围
            const startDate = moment.tz(start_date, 'America/Vancouver').startOf('day').format('YYYY-MM-DD HH:mm:ss');
            const endDate = moment.tz(end_date, 'America/Vancouver').endOf('day').format('YYYY-MM-DD HH:mm:ss');

            query += ` AND clock_in BETWEEN ? AND ?`;
            params.push(startDate, endDate);
        }

        query += ` GROUP BY location ORDER BY total_hours DESC`;

        const [summary] = await db.query(query, params);

        res.json(summary);
    } catch (error) {
        console.error('Get location summary error:', error);
        res.status(500).json({ error: error.message });
    }
};

// 请求修改打卡记录
exports.requestCorrection = async (req, res) => {
    try {
        const userId = req.user.id;
        const recordId = req.params.id;
        const {
            requested_clock_in,
            requested_clock_out,
            requested_break_minutes,
            requested_location,
            reason
        } = req.body;

        // 验证必填字段
        if (!requested_clock_in || !requested_clock_out || !reason) {
            return res.status(400).json({
                error: 'Missing required fields: requested_clock_in, requested_clock_out, and reason are required'
            });
        }

        // 验证日期格式
        if (!moment(requested_clock_in).isValid() || !moment(requested_clock_out).isValid()) {
            return res.status(400).json({
                error: 'Invalid date format for requested times'
            });
        }

        // 检查记录是否存在且属于当前用户
        const [record] = await db.query(
            `SELECT * FROM clock_records WHERE id = ? AND user_id = ?`,
            [recordId, userId]
        );

        if (record.length === 0) {
            return res.status(404).json({
                error: 'Record not found or does not belong to you'
            });
        }

        // 检查是否已经有未处理的修改请求
        const [existingRequest] = await db.query(
            `SELECT * FROM correction_requests
             WHERE record_id = ? AND user_id = ? AND status = 'pending'`,
            [recordId, userId]
        );

        if (existingRequest.length > 0) {
            return res.status(400).json({
                error: 'You already have a pending correction request for this record'
            });
        }

        // 创建修改请求
        await db.query(
            `INSERT INTO correction_requests
             (user_id, record_id, original_clock_in, original_clock_out,
              requested_clock_in, requested_clock_out, requested_break_minutes,
              requested_location, reason, status, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
            [
                userId,
                recordId,
                record[0].clock_in,
                record[0].clock_out,
                requested_clock_in,
                requested_clock_out,
                requested_break_minutes || record[0].break_minutes,
                requested_location || record[0].location,
                reason
            ]
        );

        res.status(201).json({
            message: 'Correction request submitted successfully'
        });
    } catch (error) {
        console.error('Request correction error:', error);
        res.status(500).json({ error: error.message });
    }
};

// 获取用户的修改请求
exports.getUserCorrectionRequests = async (req, res) => {
    try {
        const userId = req.user.id;

        const [requests] = await db.query(
            `SELECT cr.*, u.username, u.full_name
             FROM correction_requests cr
             JOIN users u ON cr.user_id = u.id
             WHERE cr.user_id = ?
             ORDER BY cr.created_at DESC`,
            [userId]
        );

        // 格式化日期
        const formattedRequests = requests.map(request => ({
            ...request,
            original_clock_in: moment.tz(request.original_clock_in, 'America/Vancouver').format('YYYY-MM-DD HH:mm:ss'),
            original_clock_out: request.original_clock_out ?
                moment.tz(request.original_clock_out, 'America/Vancouver').format('YYYY-MM-DD HH:mm:ss') : null,
            requested_clock_in: moment.tz(request.requested_clock_in, 'America/Vancouver').format('YYYY-MM-DD HH:mm:ss'),
            requested_clock_out: request.requested_clock_out ?
                moment.tz(request.requested_clock_out, 'America/Vancouver').format('YYYY-MM-DD HH:mm:ss') : null,
            created_at: moment.tz(request.created_at, 'America/Vancouver').format('YYYY-MM-DD HH:mm:ss'),
            updated_at: request.updated_at ?
                moment.tz(request.updated_at, 'America/Vancouver').format('YYYY-MM-DD HH:mm:ss') : null
        }));

        res.json(formattedRequests);
    } catch (error) {
        console.error('Get user correction requests error:', error);
        res.status(500).json({ error: error.message });
    }
};