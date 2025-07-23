const mongoose = require('mongoose');

const adminProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  accessLevel: { type: String, enum: ['super', 'normal'], default: 'normal' }
});

module.exports = mongoose.model('AdminProfile', adminProfileSchema);
