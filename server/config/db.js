const mongoose = require('mongoose')
const logger   = require('../utils/logger')

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/codesense'
  const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 })
  logger.info(`MongoDB connected: ${conn.connection.host}`)
}

module.exports = connectDB
