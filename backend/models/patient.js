const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true
  },
  medicalHistory: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'History'
    }
  ]
}, {
  timestamps: true
});

patientSchema.pre('save', function (next) {
  if (this.medicalHistory && this.medicalHistory.length > 0) {
    const uniqueIds = new Set(this.medicalHistory.map(id => id.toString()));
    if (uniqueIds.size !== this.medicalHistory.length) {
      return next(new Error('Duplicate history records are not allowed.'));
    }
  }
  next();
});

module.exports = mongoose.model('Patient', patientSchema);
