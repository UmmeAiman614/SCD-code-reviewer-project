require('dotenv').config()

const express    = require('express')
const helmet     = require('helmet')
const cors       = require('cors')
const morgan     = require('morgan')
const rateLimit  = require('express-rate-limit')

const authRoutes   = require('./routes/authRoutes')
const repoRoutes   = require('./routes/repoRoutes')
const reviewRoutes = require('./routes/reviewRoutes')
const { notFound, errorHandler } = require('./middleware/errorMiddleware')
const logger = require('./utils/logger')

const app = express()

// ── Security headers ─────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}))

// ── CORS ─────────────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:4173',  // Vite preview
]
app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (curl, Postman, server-side)
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true)
    cb(new Error(`CORS blocked: ${origin}`))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// ── Body parsing ─────────────────────────────────────────
app.use(express.json({ limit: '5mb' }))
app.use(express.urlencoded({ extended: true, limit: '5mb' }))

// ── HTTP logging ─────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev', { stream: { write: msg => logger.http(msg.trim()) } }))
}

// ── Global rate limiter ──────────────────────────────────
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please slow down.' },
}))

// ── Stricter limiter for auth routes ─────────────────────
app.use('/api/auth/', rateLimit({
  windowMs: 10 * 60 * 1000,  // 10 minutes
  max: 20,
  message: { success: false, message: 'Too many auth attempts. Please wait.' },
}))

// ── Stricter limiter for analysis (heavy operation) ──────
app.use('/api/reviews/analyze', rateLimit({
  windowMs: 5 * 60 * 1000,   // 5 minutes
  max: 10,
  message: { success: false, message: 'Analysis rate limit reached. Please wait 5 minutes.' },
}))

// ── API Routes ───────────────────────────────────────────
app.use('/api/auth',    authRoutes)
app.use('/api/repos',   repoRoutes)
app.use('/api/reviews', reviewRoutes)

// ── Health check ─────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  })
})

// ── 404 + Error handling ─────────────────────────────────
app.use(notFound)
app.use(errorHandler)

module.exports = app
