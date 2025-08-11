const History = require("../models/History");

// تحديث التاريخ الطبي عن طريق patientId
const updateHistoryByPatient = async (req, res) => {
  try {
<<<<<<< HEAD
    const { patientId } = req.params;

    const updatedHistory = await History.findOneAndUpdate(
      { patientId }, // البحث بالتاريخ الخاص بالمريض
      {
        $set: {
          chronicDiseases: req.body.chronicDiseases,
          surgeries: req.body.surgeries,
          medications: req.body.medications,
          allergy: req.body.allergy,
          visits: req.body.visits,
          testFileUrl: req.body.testFileUrl
        }
      },
      { new: true, runValidators: true }
    );

    if (!updatedHistory) {
      return res.status(404).json({ message: "لم يتم العثور على التاريخ الطبي لهذا المريض" });
    }

    res.status(200).json({
      message: "تم تحديث التاريخ الطبي بنجاح",
      data: updatedHistory
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
=======
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
>>>>>>> f2a521d65dc8475fea0fc8df1383b22a17fc4075
  }
};

module.exports = {
  updateHistoryByPatient
};
