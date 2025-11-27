import mongoose from "mongoose";

const patientMedicalInfoSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: true,
  },
  providerId: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  patientComment: String,
  firstName: String,
  middleName: String,
  preferredName: String,
  pronouns: String,
  dateOfBirth: Date,
  address1: String,
  address2: String,
  zipCode: String,
  cityState: String,
  timeZone: String,
  mobilePhone: String,
  homePhone: String,
  workPhone: String,
  otherPhone: String,
  email: String,
  administrativeSex: String,
  genderIdentity: String,
  sexualOrientation: String,
  race: String,
  ethnicity: String,
  languages: String,
  maritalStatus: String,
  employmentStatus: String,
  religiousAffiliation: String,
  signedHipaaNpp: String,
  pcpRelease: String,
  smokingStatus: String,
});

const PatientMedicalInfo = mongoose.model(
  "PatientMedicalInfo",
  patientMedicalInfoSchema
);

export default PatientMedicalInfo;
