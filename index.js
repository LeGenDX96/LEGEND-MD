/**
 * ═══════════════════════════════════════════════════════════
 * LEGEND MD - Main Entry Point
 * ═══════════════════════════════════════════════════════════
 * 
 * Starts the Express server and WhatsApp bot connection
 */

const express = require('express');
const chalk = require('chalk');
const { connectToWA } = require('./connection.js');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 9090;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Health check endpoint
 */
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'online',
    message: 'LEGEND MD Bot is running',
    timestamp: new Date().toISOString()
  });
});

/**
 * Status endpoint
 */
app.get('/status', (req, res) => {
  res.status(200).json({
    status: 'online',
    bot: 'LEGEND MD',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  });
});

/**
 * Error handling middleware
 */
app.use((err, req, res, next) => {
  console.error(chalk.red(`Server Error: ${err.message}`));
  res.status(500).json({
    status: 'error',
    message: err.message
  });
});

/**
 * 404 handler
 */
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Endpoint not found'
  });
});

/**
 * Start server
 */
const server = app.listen(PORT, () => {
  console.log(chalk.bgGreen.black.bold(`\n 🚀 EXPRESS SERVER RUNNING ON PORT ${PORT} \n`));
  console.log(chalk.cyan(`Visit: http://localhost:${PORT}\n`));
});

/**
 * Start WhatsApp bot connection
 */
connectToWA().catch(error => {
  console.error(chalk.red(`Fatal Error: ${error.message}`));
  process.exit(1);
});

/**
 * Graceful shutdown
 */
process.on('SIGINT', () => {
  console.log(chalk.yellow('\n\n⚠️  Shutting down gracefully...\n'));
  server.close(() => {
    console.log(chalk.green('✅ Server closed'));
    process.exit(0);
  });
});

module.exports = app;
