import mongoose from "mongoose";

const todoSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId, // Assuming it references the User model
    ref: 'User', // Reference to the User model
    required: true,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId, // Assuming it references the User model
    ref: 'User', // Reference to the User model
    required: true,
  },
  notes: {
    type: String,
    required: true,
  },
  prescription: {
    type: String,
    default: null,
  },
  materials: {
    type: String,
    default: null,
  },
  research: {
    type: String,
    default: null,
  },
  dueDate: {
    type: Date, // Assuming dueDate is a Date type
    required: true,
  },
  status: {
    type: String,
    enum: ['done', 'in-progress'], // Status can be either 'done' or 'in-progress'
    required: true,
  },
  archive: {
    type: String,
    enum: [1, 0], // archive can be either 'done' or 'in-progress'
    default: 1,
  },
  emailSend: {
    type: Boolean,
    default: false, // Assuming emailSend defaults to false if not provided
  },
  lastEmailSentDate: {
    type: Date,
    default: null  // Null indicates no email has been sent yet
  },
  name: {
    type: String,
    default: null,
  },
  hipaa: {
    type: Boolean,
    default: false, // Assuming hipaa defaults to false if not provided
  },
  pcp: {
    type: String,
    enum: ['not-set','patient-consented-to-release-information','patient-declined-to-release-information','not-applicable' ], // Assuming pcp defaults to false if not provided
  }
}, { timestamps: true });

const Todo = mongoose.model("Todo", todoSchema);

export default Todo;
