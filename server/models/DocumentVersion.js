const mongoose = require('mongoose');

const DocumentVersionSchema = new mongoose.Schema({
  roomId: { type: String, required: true },
  code: { type: String, required: true },
  savedBy: { type: String }, // optional: store username
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.DocumentVersion || mongoose.model('DocumentVersion', DocumentVersionSchema);
