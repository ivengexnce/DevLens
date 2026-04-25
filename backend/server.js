require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/database');

const githubRoutes = require('./routes/github');
const aiRoutes = require('./routes/ai');
const analyticsRoutes = require('./routes/analytics');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());

// CORS — allow any localhost port in development
const allowedOrigins = process.env.CORS_ORIGIN ?
    process.env.CORS_ORIGIN.split(',').map(o => o.trim()) : [];

app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (curl, Postman, mobile apps)
        if (!origin) return callback(null, true);

        // Allow any localhost / 127.0.0.1 origin in development
        if (
            process.env.NODE_ENV !== 'production' &&
            (/^http:\/\/localhost(:\d+)?$/.test(origin) ||
                /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin))
        ) {
            return callback(null, true);
        }

        // Allow explicitly listed origins
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        callback(new Error(`CORS: Origin "${origin}" not allowed`));
    },
    credentials: true,
}));

// Logging
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Global rate limiter — 200 requests per 15 min
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: { error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

// Routes
app.use('/api/github', githubRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV,
        version: '1.0.0',
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('[ERROR]', err.stack);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
});

app.listen(PORT, () => {
    console.log(`\n🔭 DevLens Pro API running on http://localhost:${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV}`);
    console.log(`   GitHub API:  ${process.env.GITHUB_TOKEN ? '✅ Token set' : '⚠️  No token (rate limited)'}`);
    console.log(`   Anthropic:   ${process.env.ANTHROPIC_API_KEY ? '✅ Key set' : '⚠️  No key'}`);
    console.log(`   MongoDB:     ${process.env.MONGODB_URI ? '✅ URI set' : '⚠️  No URI'}\n`);
});

module.exports = app;