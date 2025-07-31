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
      'تمريض الباطنة والجراحي'
    ],
    required: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  certificate: {
  fileUrl: {
    type: String, // رابط الشهادة (صورة أو PDF من Cloudinary أو AWS S3)
    required: true
  },
  fileType: {
    type: String, // 'image/jpeg', 'application/pdf', إلخ
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  rejectionReason: {
    type: String // اختياري – لو اترفض يقدر الأدمن يكتب السبب
  }
 },
 isVerified: {
   type: Boolean,
   default: false
 }
 ,
 phone: {
    type: String,
    required: true,
    unique: true
  },
  price: {
    type: Number,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  schedule: [
    {
      day: {
        type: String,
        enum: ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
      },
      slots: [String] 
    }
  ],
  rating: {
    type: Number,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Nurse', nurseSchema);
