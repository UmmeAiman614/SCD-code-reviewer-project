const { Schema, model } = require('mongoose')

const issueSchema = new Schema({
  rule:       { type: String },
  severity:   { type: String, enum: ['critical','warning','info'], default: 'info' },
  message:    { type: String },
  file:       { type: String },
  line:       { type: Number },
  suggestion: { type: String },
  code:       { type: String },
}, { _id: false })

const reviewSchema = new Schema({
  user:         { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  repoName:     { type: String, required: true },
  owner:        { type: String, required: true },
  repo:         { type: String, required: true },
  score:        { type: Number, min: 0, max: 10, default: 0 },
  summary:      { type: String },
  issues:       { type: [issueSchema], default: [] },
  filesScanned: { type: Number, default: 0 },
  linesScanned: { type: Number, default: 0 },
  status:       { type: String, enum: ['pending','completed','failed'], default: 'completed' },
}, { timestamps: true })

reviewSchema.index({ user: 1, createdAt: -1 })

module.exports = model('Review', reviewSchema)
