require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const SchedulerService = require('./services/schedulerService');

const authRoutes = require('./routes/authRoutes');
const clockRoutes = require('./routes/clockRoutes');
const adminRoutes = require('./routes/adminRoutes');
const reminderRoutes = require('./routes/reminderRoutes');

const app = express();

// Define allowed origins
const allowedOrigins = [
    'http://216.232.48.211:3001',
    'http://localhost:3001',
    'http://localhost:3000',
    'https://clock.mmcwellness.ca',
    'http://client',  // Docker client service
    'http://client:80'  // Docker client service with port
];

// Middleware
app.use(helmet());
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) === -1) {
            console.log('CORS blocked origin:', origin);
        }

        // Allow all origins in development
        if (process.env.NODE_ENV === 'development') {
            return callback(null, true);
        }

        if (allowedOrigins.indexOf(origin) !== -1) {
            return callback(null, true);
        }

        return callback(null, false);
    },
    credentials: true
}));
app.use(express.json()); // Make sure this is here
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/clock', clockRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reminders', reminderRoutes);

// Debug middleware to log requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`, {
        body: req.body,
        query: req.query,
        params: req.params
    });
    next();
});

// Initialize scheduler
// SchedulerService.initializeScheduledTasks();

// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 13000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`ClockingApp server is running on port ${PORT}`);
});
