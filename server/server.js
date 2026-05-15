require('dotenv').config()

const app       = require('./app')
const connectDB = require('./config/db')
const logger    = require('./utils/logger')

const PORT = process.env.PORT || 5000

async function start() {
  try {
    await connectDB()

    const server = app.listen(PORT, () => {
      logger.info(`🚀 Server running → http://localhost:${PORT}`)
      logger.info(`📦 Environment: ${process.env.NODE_ENV || 'development'}`)
    })

    // ── Graceful shutdown ─────────────────────────────
    const shutdown = (signal) => {
      logger.info(`${signal} received — shutting down gracefully`)
      server.close(() => {
        logger.info('Server closed')
        process.exit(0)
      })
      // Force exit after 10 seconds
      setTimeout(() => process.exit(1), 10_000)
    }

    process.on('SIGTERM', () => shutdown('SIGTERM'))
    process.on('SIGINT',  () => shutdown('SIGINT'))

    // ── Unhandled rejections & exceptions ─────────────
    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled rejection:', reason)
    })
    process.on('uncaughtException', (err) => {
      logger.error('Uncaught exception:', err)
      process.exit(1)
    })

  } catch (error) {
  console.error('Failed to start server:', error)
}
}

start()
