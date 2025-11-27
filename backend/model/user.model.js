import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const emailRegExpPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "Please enter your first name"],
    },
    middleName: {
      type: String,
    },
    lastName: {
      type: String,
      required: [true, "Please enter your last name"],
    },
    phoneNumber: {
      type: String,
    },
    mobilePhone: {
      type: String,
    },
    homePhone: {
      type: String,
    },
    workPhone: {
      type: String,
    },
    otherPhone: {
      type: String,
    },
    address: {
      type: String,
    },
    address1: {
      type: String,
    },
    address2: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    cityState: {
      type: String,
    },
    timeZone: {
      type: String,
    },
    zipCode: {
      type: String,
    },
    email: {
      type: String,
      required: [true, "Please enter your email"],
      validate: {
        validator: function (value) {
          return emailRegExpPattern.test(value);
        },
        message: "Please enter a valid email",
      },
      unique: true,
    },
    approvedByAdmin: {
      type: Boolean,
      default: false,
    },
    emailVerifiedStatus: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      minlength: [8, "Password must be atleast 8 characters"],
    },
    avatar: {
      public_id: String,
      url: String,
    },
    userRole: {
      type: String,
      required: true,
      trim: true,
      enum: ["Patient", "Provider", "Admin"],
      default: "Patient",
    },
    npiNumber: {
      type: String,
      required: false,
      unique: [true, "License number already exists"],
    },
    invitationStatus: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    patientComment: {
      type: String,
    },
    preferredName: {
      type: String,
    },
    pronouns: {
      type: String,
    },
    dateOfBirth: {
      type: Date,
    },
    mobilePhone: {
      type: String,
    },
    homePhone: {
      type: String,
    },
    workPhone: {
      type: String,
    },
    otherPhone: {
      type: String,
    },
    administrativeSex: {
      type: String,
    },
    genderIdentity: {
      type: String,
    },
    sexualOrientation: {
      type: String,
    },
    race: {
      type: String,
    },
    ethnicity: {
      type: String,
    },
    languages: {
      type: String,
    },
    maritalStatus: {
      type: String,
    },
    employmentStatus: {
      type: String,
    },
    religiousAffiliation: {
      type: String,
    },
    signedHipaaNpp: {
      type: String,
    },
    pcpRelease: {
      type: String,
    },
    smokingStatus: {
      type: String,
    },
    initialJourneyCount: {
      type: Number,
      max: 12,
      min: 0,
      default: 0,
    },
    // New fields for tracking user activity
    lastLogin: { type: Date }, // Track the last login time
    lastActivity: { type: Date }, // Track the last activity time
    isActive: { type: Boolean, default: false }, // Indicate whether the user is currently active
    ipAddress: {
      type: String,
      default: "",
    },
    region: {
      type: String,
      default: "",
    },
    country: {
      type: String,
      default: "",
    },
    customerId: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true }
);

// Hash password before saving
// userSchema.methods.encryptPassword = async function (enteredPassword) {
//   // if (!this.isModified === "password") {
//   //   next();
//   // }
//   const pswrd = await bcrypt.hash(enteredPassword, 10);
//   return pswrd;
// };

// Pre-save middleware to generate unique customer ID
userSchema.pre("save", async function (next) {
  if (!this.isNew) {
    return next();
  }

  // Generate a unique 6-digit customer ID
  let customerId;
  let isUnique = false;

  while (!isUnique) {
    customerId = Math.floor(100000 + Math.random() * 900000).toString();
    const existingUser = await mongoose.models.User.findOne({ customerId });
    if (!existingUser) {
      isUnique = true;
    }
  }
  const encodedId = btoa(customerId + process.env.ENCODE_KEY);
  this.customerId = encodedId;
  next();
});

// Sign access token
userSchema.methods.SignAccessToken = function () {
  return jwt.sign({ id: this._id }, process.env.ACCESS_TOKEN || "");
};

// sign refresh token
userSchema.methods.SignRefreshToken = function () {
  return jwt.sign({ id: this._id }, process.env.REFRESH_TOKEN || "");
};

// Compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);
