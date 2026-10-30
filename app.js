const express = require('express');
const path = require('path');
const connectDB = require('./config/db');
const leaveRoutes = require('./routes/leaveRoutes');

const app = express();
const PORT = process.env.PORT || 5050;

// Middleware
app.use(express.json());

// Serve frontend files
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api', leaveRoutes);

// Start server after MongoDB connects
async function startServer() {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
}

startServer();
