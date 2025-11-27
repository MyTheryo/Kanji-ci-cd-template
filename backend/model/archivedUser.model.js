import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const archivedUserSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    middleName: { type: String },
    lastName: { type: String, required: true },
    phoneNumber: { type: String },
    mobilePhone: { type: String },
    homePhone: { type: String },
    workPhone: { type: String },
    otherPhone: { type: String },
    address: { type: String },
    address1: { type: String },
    address2: { type: String },
    city: { type: String },
    state: { type: String },
    cityState: { type: String },
    timeZone: { type: String },
    zipCode: { type: String },
    email: { type: String, required: true, unique: false },
    approvedByAdmin: { type: Boolean, default: false },
    emailVerifiedStatus: { type: Boolean, default: false },
    password: { type: String, minlength: 8 },
    avatar: { public_id: String, url: String },
    userRole: { type: String, required: true, enum: ["Patient", "Provider", "Admin"], default: "Patient" },
    npiNumber: { type: String },
    invitationStatus: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
    patientComment: { type: String },
    preferredName: { type: String },
    pronouns: { type: String },
    dateOfBirth: { type: Date },
    administrativeSex: { type: String },
    genderIdentity: { type: String },
    sexualOrientation: { type: String },
    race: { type: String },
    ethnicity: { type: String },
    languages: { type: String },
    maritalStatus: { type: String },
    employmentStatus: { type: String },
    religiousAffiliation: { type: String },
    signedHipaaNpp: { type: String },
    pcpRelease: { type: String },
    smokingStatus: { type: String },
    initialJourneyCount: { type: Number, max: 12, min: 0, default: 0 },
    lastLogin: { type: Date },
    lastActivity: { type: Date },
    isActive: { type: Boolean, default: false },
    archivedAt: { type: Date, default: Date.now }, // Add a timestamp for when the user was archived
  },
  { timestamps: true }
);

export default mongoose.model("ArchivedUser", archivedUserSchema);
