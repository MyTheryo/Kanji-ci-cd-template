import mongoose from 'mongoose'

// Define schema for time
const timeSchema = new mongoose.Schema({
  selectedHour: {
    type: Number,
    required: true,
  },
  selectedMinute: {
    type: Number,
    required: true,
  },
  selectedPeriod: {
    type: String,
    enum: ["AM", "PM"],
    required: true,
  },
});

// Define schema for objectives
const objectiveSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  objectiveValue: String,
  duration: String,
  strategy: [{
    intervention: String,
    modality: String,
    frequency: String,
    completion: String,
    status: String
    // id: Number
  }]
});

// Define schema for treatment goals
const goalSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  objectives: [objectiveSchema]
});

// Define main document schema
const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "Treatment Plan",
    },
    date: {
      type: String,
      default: new Date().toLocaleDateString(),
    },
    time: timeSchema,
    diagnosis: {
      code: String,
      description: String,
    },
    justification: String,
    problem: String,
    discharge: String,
    AdditionalInfo: String,
    goals: [goalSchema],
    frequency: String,
    isDeclared: {
      type: Boolean,
      default: false,
    },
    isSigned: {
      type: Boolean,
      default: false,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true,
    },
    type: {
      type:String,
      default: "document"
    }
  },
  { timestamps: true }
);

// Create a model based on the schema
const Document = mongoose.model('Document', documentSchema);

export default Document