const { Schema, model } = require('mongoose')

const userSchema = new Schema({
  githubId:       { type: String, required: true, unique: true, index: true },
  githubUsername: { type: String, required: true },
  name:           { type: String, required: true },
  email:          { type: String },
  avatarUrl:      { type: String },
  bio:            { type: String },
  githubToken:    { type: String, select: false },
}, { timestamps: true })

module.exports = model('User', userSchema)
