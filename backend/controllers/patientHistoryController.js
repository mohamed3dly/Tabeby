const History = require('../models/patientHistory');

exports.createMedicalHistory = async (req, res) => {
  try {
    const history = await History.create({
      patientId: req.user.id,

      chronicDiseases: [
        req.body.chronicDisease1,
        req.body.chronicDisease2
      ].filter(Boolean),

      surgeries: [
        {
          name: req.body.surgeryName,
          date: req.body.surgeryDate,
          notes: req.body.surgeryNotes
        }
      ].filter(s => s.name && s.date && s.notes),

      medications: [
        req.body.medication1
      ].filter(Boolean),

      allergy: req.body.allergy,

      visits: [
        {
          doctorName: req.body.visitDoctorName,
          date: req.body.visitDate,
          diagnosis: req.body.visitDiagnosis
        }
      ].filter(v => v.doctorName && v.date && v.diagnosis),

      testFileUrl: req.file?.path || req.body.testFileUrl
    });

    res.status(201).json({
      message: 'تم إنشاء التاريخ الطبي',
      history
    });
  } catch (error) {
    res.status(500).json({
      message: 'فشل في إنشاء التاريخ الطبي',
      error: error.message
    });
  }
};
