const Doctor = require("../models/doctor");
const Nurse = require("../models/nurse");

async function getSortedData(type, sortBy) {
  // type: 'doctor' أو 'nurse'
  // sortBy: 'name' أو 'rating'

let model = type === "doctor" ? Doctor : Nurse;
let query = model.find().populate("userId", "name");

    if (sortBy === "name") {
    query = query.sort({ "userId.name": 1 }); // ترتيب أبجدي A→Z
    } else if (sortBy === "rating") {
    query = query.sort({ rating: -1 }); // أعلى تقييم أول
}

const results = await query;
return results;
}
module.exports = getSortedData;
