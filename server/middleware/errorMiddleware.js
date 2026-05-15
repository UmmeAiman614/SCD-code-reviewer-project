const logger = require('../utils/logger')

const notFound = (req, res, next) => {
  const err = new Error(`Route not found: ${req.method} ${req.originalUrl}`)
  err.statusCode = 404
  next(err)
}

const errorHandler = (err, req, res, next) => {
  const status  = err.statusCode || err.status || 500
  const message = err.message    || 'Internal Server Error'
  const isDev   = process.env.NODE_ENV === 'development'

  // Log server errors only
  if (status >= 500) {
    logger.error({ message, stack: err.stack, path: req.originalUrl, method: req.method })
  } else {
    logger.warn({ message, status, path: req.originalUrl })
  }

  res.status(status).json({
    success: false,
    message,
    ...(err.details && { details: err.details }),
    ...(isDev && status >= 500 && { stack: err.stack }),
  })
}

module.exports = { notFound, errorHandler }
