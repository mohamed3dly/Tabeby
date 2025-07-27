const History = require('../models/patientHistory');

exports.createMedicalHistory = async (req, res) => {
  try {
    const history = await History.create({
      patientId: req.body.patientId, // أو من الـ JWT
      chronicDisease1: req.body.chronicDisease1,
      chronicDisease2: req.body.chronicDisease2,
      surgeryName: req.body.surgeryName,
      surgeryDate: req.body.surgeryDate,
      surgeryNotes: req.body.surgeryNotes,
      medication1: req.body.medication1,
      allergy: req.body.allergy,
      visitDoctorName: req.body.visitDoctorName,
      visitDate: req.body.visitDate,
      visitDiagnosis: req.body.visitDiagnosis,
      testFileUrl: req.file?.path || req.body.testFileUrl,
    });

    res.status(201).json({ message: 'تم إنشاء التاريخ الطبي', history });
  } catch (error) {
    res.status(500).json({ message: 'فشل في إنشاء التاريخ الطبي', error: error.message });
  }
};
