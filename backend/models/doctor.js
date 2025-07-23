const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  title: {
    type: String,
    enum: ['دكتور', 'استشاري', 'أستاذ دكتور'],
    required: true
  },
  specialty: {
    type: String,
    enum: [
      'جلدية',
      'اسنان',
      'نفسي',
      'اطفال وحديثي الولادة',
      'مخ واعصاب',
      'عظام',
      'نساء وتوليد',
      'انف واذن وحنجرة',
      'قلب واوعية دموية',
      'الآشعة التداخلية',
      'امراض دم',
      'اورام',
      'باطنة',
      'تخسيس وتغذية',
      'جراحة اطفال',
      'جراحة أورام',
      'جراحة اوعية دموية',
      'جراحة تجميل'
    ],
    required: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
   phone: {
    type: String,
    required: true,
    unique: true
  },
  price: {
    type: Number,
    required: true
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
      slots: [String] // e.g. ['10:00', '11:00', '12:00']
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
  google: {
    accessToken: String,
    refreshToken: String,
    calendarId: {
     type: String,
     default: 'primary'
    }
 },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Doctor', doctorSchema);
