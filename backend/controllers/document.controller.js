import { catchAsyncError } from "../middleware/catchAsyncErrors.js";
import Document from "../model/document.model.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { logActivity } from "../utils/logger.js";

// create Document
export const createDocument = catchAsyncError(async (req, res, next) => {
  try {
    const doctorId = req.user?._id;

    const {
      patientId,
      title,
      date,
      time,
      diagnosis,
      problem,
      discharge,
      AdditionalInfo,
      goals,
      frequency,
      isDeclared,
      isSigned,
      justification,
    } = req.body;

    // Check if a document already exists for the user
    const existingDocument = await Document.findOne({ patientId });

    if (existingDocument) {
      // You can choose to return an error or update the existing document here
      return next(
        new ErrorHandler("A document already exists for this user", 400)
      );
    }

    const newDocument = new Document({
      patientId,
      doctorId,
      title,
      date,
      time,
      diagnosis,
      problem,
      discharge,
      AdditionalInfo,
      goals,
      frequency,
      isDeclared,
      isSigned,
      justification,
    });

    await newDocument.save();

    // Log user activity
    await logActivity({
      userId: req?.user?._id,
      action: "Document Created",
      description: `User ${req?.user?.customerId} created a new Document.`,
      metadata: {
        id: newDocument._id,
        title: newDocument.title,
      },
    });

    res.status(201).json({
      success: true,
      document: newDocument,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

// Get a single document by ID
export const getDocumentById = catchAsyncError(async (req, res, next) => {
  try {
    const documentId = req.params.documentId;
    const doctorId = req.user?._id;
    // Find the document by ID and doctor ID
    const document = await Document.findOne({ _id: documentId, doctorId });

    // Check if the document exists
    if (!document) {
      return next(
        new ErrorHandler(
          "Document not found or you don't have permission to access it",
          404
        )
      );
    }
    res.status(200).json({
      success: true,
      document: document,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

// Find documents by doctorId and patientId
export const findDocumentsByDoctorAndPatient = catchAsyncError(
  async (req, res, next) => {
    try {
      const doctorId = req.user?._id;
      const patientId = req.params.patientId;

      const documents = await Document.find({ doctorId, patientId });

      res.status(200).json({
        success: true,
        documents: documents,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// Edit Document
export const editDocument = catchAsyncError(async (req, res, next) => {
  try {
    const documentId = req.params.documentId;
    const doctorId = req.user?._id;

    // Check if the document exists and belongs to the logged-in doctor
    const document = await Document.findOne({ _id: documentId, doctorId });

    if (!document) {
      return next(
        new ErrorHandler(
          "Document not found or you don't have permission to edit it",
          404
        )
      );
    }

    // Update document fields with new data
    const {
      title,
      date,
      time,
      diagnosis,
      problem,
      discharge,
      AdditionalInfo,
      goals,
      frequency,
      isDeclared,
      isSigned,
      justification,
    } = req.body;

    document.title = title;
    document.date = date;
    document.time = time;
    document.diagnosis = diagnosis;
    document.problem = problem;
    document.discharge = discharge;
    document.AdditionalInfo = AdditionalInfo;
    document.goals = goals;
    document.frequency = frequency;
    document.isDeclared = isDeclared;
    document.isSigned = isSigned;
    document.justification = justification;

    await document.save();

    // Log user activity
    await logActivity({
      userId: req?.user?._id,
      action: "Document Edited",
      description: `User ${req?.user?.customerId} Edited a Document.`,
      metadata: {
        id: document._id,
        title: document.title,
      },
    });

    res.status(200).json({
      success: true,
      document: document,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

// Delete Document
export const deleteDocument = catchAsyncError(async (req, res, next) => {
  try {
    const documentId = req.params.documentId;
    const doctorId = req.user?._id;

    // Find the document by ID and doctor ID
    const document = await Document.findOne({ _id: documentId, doctorId });

    // Check if the document exists
    if (!document) {
      return next(
        new ErrorHandler(
          "Document not found or you don't have permission to delete it",
          404
        )
      );
    }

    // Delete the document
    await Document.deleteOne({ _id: documentId });

    // Log user activity
    await logActivity({
      userId: req?.user?._id,
      action: "Document Deleted",
      description: `User ${req?.user?.customerId} Deleted a Document.`,
      metadata: {
        id: document._id,
        title: document.title,
      },
    });

    res.status(200).json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});
