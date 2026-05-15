/**
 * Wraps async route handlers — forwards errors to Express error middleware.
 */
const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next)

/**
 * Custom API error class with HTTP status codes.
 */
class ApiError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message)
    this.statusCode = statusCode
    this.details    = details
    this.isOperational = true
  }

  static badRequest(msg, details)  { return new ApiError(msg, 400, details) }
  static unauthorized(msg = 'Unauthorized') { return new ApiError(msg, 401) }
  static forbidden(msg = 'Forbidden')       { return new ApiError(msg, 403) }
  static notFound(msg = 'Not found')        { return new ApiError(msg, 404) }
  static tooMany(msg = 'Too many requests') { return new ApiError(msg, 429) }
  static internal(msg = 'Internal server error') { return new ApiError(msg, 500) }
}

/**
 * Standard success response helper.
 */
const sendSuccess = (res, data, statusCode = 200) =>
  res.status(statusCode).json({ success: true, ...data })

module.exports = { asyncHandler, ApiError, sendSuccess }
