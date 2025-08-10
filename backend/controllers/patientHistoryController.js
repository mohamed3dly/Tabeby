const History = require("../models/History");

// تحديث التاريخ الطبي عن طريق patientId
const updateHistoryByPatient = async (req, res) => {
  try {
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
  }
};

module.exports = {
  updateHistoryByPatient
};
