require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const authRoutes = require('./routes/authRoutes');
const clockRoutes = require('./routes/clockRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json()); // Make sure this is here
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/clock', clockRoutes);
app.use('/api/admin', adminRoutes);

// Debug middleware to log requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`, {
        body: req.body,
        query: req.query,
        params: req.params
    });
    next();
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 13000;

app.listen(PORT, () => {
    console.log(`ClockingApp server is running on port ${PORT}`);
});