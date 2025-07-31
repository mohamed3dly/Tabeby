const mongoose = require('mongoose');

const nurseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  specialty: {
    type: String,
    enum: [
      'تمريض المسنين',
      'تمريض النساء والتوليد',
      'تمريض الحالات الحرجة',
      'تمريض الأطفال',
      'تمريض الصحة العامة',
      'تمريض الباطني والجراحي'
    ],
    required: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000,
    trim: true
  },
  certificate: {
    fileUrl: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^https?:\/\/.+/.test(v);
        },
        message: 'Invalid file URL'
      }
    },
    fileType: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    rejectionReason: {
      type: String,
      trim: true
    }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: [/^\+?[0-9\s\-()]{8,20}$/, 'Invalid phone number']
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price must be a positive number']
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  schedule: [
    {
      day: {
        type: String,
        enum: ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
      },
      slots: {
        type: [String],
        default: []
      }
    }
  ],
  rating: {
    type: Number,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Nurse', nurseSchema);
