const History = require("../models/patientHistory");

// تحديث التاريخ الطبي عن طريق patientId
const updateHistoryByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;

    // التحقق من الصلاحيات
    if (req.user.role !== "admin" && req.user.role !== "doctor" && req.user.id !== patientId) {
      return res.status(403).json({ message: "غير مصرح لك بتعديل هذا السجل" });
    }

    const updateData = {};

    if (req.body.chronicDiseases) updateData.chronicDiseases = req.body.chronicDiseases;
    if (req.body.surgeries) updateData.surgeries = req.body.surgeries;
    if (req.body.medications) updateData.medications = req.body.medications;
    if (req.body.visits) updateData.visits = req.body.visits;
    if (req.file?.path || req.body.testFileUrl) {
      updateData.testFileUrl = req.file ? `/uploads/${req.file.filename}` : req.body.testFileUrl;
    }

    const updatedHistory = await History.findOneAndUpdate(
      { patientId },
      { $set: updateData },
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
    console.error("❌ Error updating history:", error);
    res.status(400).json({ message: error.message });
  }
};

// إنشاء التاريخ الطبي
const createHistory = async (req, res) => {
  try {
    const history = await History.create({
      patientId: req.user.id,
      chronicDiseases: req.body.chronicDiseases || [],
      surgeries: req.body.surgeries || [],
      medications: req.body.medications || [],
      visits: req.body.visits || [],
      testFileUrl: req.file ? `/uploads/${req.file.filename}` : req.body.testFileUrl
    });

    res.status(201).json({
      message: "تم إنشاء التاريخ الطبي",
      history
    });
  } catch (error) {
    console.error("❌ Error creating history:", error);
    res.status(500).json({
      message: "فشل في إنشاء التاريخ الطبي",
      error: error.message
    });
  }
};

module.exports = {
  updateHistoryByPatient,
  createHistory
};
