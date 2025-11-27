import { catchAsyncError } from "../middleware/catchAsyncErrors.js";
import Notes from "../model/notes.model.js";
import notesSum from "../model/notesSum.model.js";
import extractSections from "../utils/AIHelpers.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { logActivity } from "../utils/logger.js";

export const createNote = catchAsyncError(async (req, res, next) => {
  const doctorId = req.user?._id;
  try {
    // Extract data from req.body
    const {
      title,
      date,
      time,
      duration,
      service,
      notes,
      additionalNotes,
      recommendation,
      frequency,
      isSigned,
      patientId,
      documentId,
    } = req.body;

    // Create a new note object using the Note model
    const newNote = new Notes({
      title,
      date,
      time,
      duration,
      service,
      notes,
      additionalNotes,
      recommendation,
      frequency,
      isSigned,
      doctorId,
      patientId,
      documentId,
    });

    await newNote.save();

    // Log user activity
    await logActivity({
      userId: doctorId,
      action: "Note Created",
      description: `User ${req?.user?.customerId} created a new Note.`,
      metadata: {
        id: newNote._id,
        title: title,
      },
    });

    res.status(201).json({ success: true, note: newNote });

    // Background processing
    setImmediate(async () => {
      try {
        const query = async (data) => {
          const response = await fetch(
            "http://54.218.176.251/api/v1/prediction/55ff65c6-dc33-4266-8347-e9f5a20a9a64",
            {
              headers: {
                Authorization:
                  "Bearer dg0OzH4CP9QjBvhnNwnAP14_AUvzNBpn_AD4YU6vLdA",
                "Content-Type": "application/json",
              },
              method: "POST",
              body: JSON.stringify(data),
            }
          );

          if (!response.ok) {
            const errorDetail = await response.json();
            throw new Error(
              `API Error: ${response.status} ${response.statusText} - ${errorDetail.message}`
            );
          }

          const responseBody = await response.text();

          if (responseBody.startsWith("<!DOCTYPE html>")) {
            throw new Error("Received HTML response instead of JSON");
          }

          const result = JSON.parse(responseBody);
          return result;
        };

        if (newNote.notes && newNote.isSigned) {
          const response = await query({ question: newNote });

          if (response.text) {
            const headings = [
              "## **PROGRESS NOTE (CLINICAL NOTE)**",
              "## **PSYCHOTHERAPY NOTE (PROCESS NOTE)**",
            ];

            const extractedData = extractSections(response.text, headings);

            const newNotesSum = new notesSum({
              patientId: newNote.patientId,
              summary: extractedData,
            });
            await newNotesSum.save();
            console.log("notes saved succseefully");
          } else {
            console.log("Response does not contain 'text' field");
          }
        } else {
          console.log("No notes or isSigned not found");
        }
      } catch (error) {
        console.error("Background processing failed:", error);
      }
    });
    // Respond with success message
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

export const generateAISummary = catchAsyncError(async (req, res, next) => {
  const doctorId = req.user?._id;
  try {
    // Extract data from req.body
    const {
      patientId,
      notes,
      addtionalNotes,
    } = req.body;

    // Background processing
    try {
      const query = async (data) => {
        const response = await fetch(
          "http://54.218.176.251/api/v1/prediction/55ff65c6-dc33-4266-8347-e9f5a20a9a64",
          {
            headers: {
              Authorization:
                "Bearer dg0OzH4CP9QjBvhnNwnAP14_AUvzNBpn_AD4YU6vLdA",
              "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify(data),
          }
        );

        if (!response.ok) {
          const errorDetail = await response.json();
          throw new Error(
            `API Error: ${response.status} ${response.statusText} - ${errorDetail.message}`
          );
        }

        const responseBody = await response.text();

        if (responseBody.startsWith("<!DOCTYPE html>")) {
          throw new Error("Received HTML response instead of JSON");
        }

        const result = JSON.parse(responseBody);
        return result;
      };

      const response = await query({ question: { notes, addtionalNotes } });

      if (response.text) {
        const headings = [
          "## **PROGRESS NOTE (CLINICAL NOTE)**",
          "## **PSYCHOTHERAPY NOTE (PROCESS NOTE)**",
        ];

        const extractedData = extractSections(response.text, headings);
        res.status(200).json({
          success: true,
          AIsummary: response.text,
        });

        const newNotesSum = new notesSum({
          patientId: patientId,
          summary: extractedData,
        });
        await newNotesSum.save();
      } else {
        console.log("Response does not contain 'text' field");
      }
    } catch (error) {
      console.error("Background processing failed:", error);
    }
    // Respond with success message
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

// Find notes by doctorId and patientId
export const findNotesByDoctorAndPatient = catchAsyncError(
  async (req, res, next) => {
    try {
      const doctorId = req.user?._id;
      const patientId = req.params.patientId;

      const notes = await Notes.find({ doctorId, patientId });

      res.status(200).json({
        success: true,
        notes: notes,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// Get a single note by ID
export const getNoteById = catchAsyncError(async (req, res, next) => {
  try {
    const noteId = req.params.noteId;
    const doctorId = req.user?._id;

    // Find the note by ID and doctor ID
    const note = await Notes.findOne({ _id: noteId, doctorId });

    // Check if the note exists
    if (!note) {
      return next(
        new ErrorHandler(
          "Note not found or you don't have permission to access it",
          404
        )
      );
    }

    res.status(200).json({
      success: true,
      note: note,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

// Edit Note
export const editNote = catchAsyncError(async (req, res, next) => {
  try {
    const noteId = req.params.noteId;
    const doctorId = req.user?._id;

    // Check if the note exists and belongs to the logged-in doctor
    const note = await Notes.findOne({ _id: noteId, doctorId });

    if (!note) {
      return next(
        new ErrorHandler(
          "Note not found or you don't have permission to edit it",
          404
        )
      );
    }

    // Update note fields with new data
    const {
      title,
      date,
      time,
      duration,
      service,
      notes,
      additionalNotes,
      recommendation,
      frequency,
      isSigned,
    } = req.body;

    note.title = title;
    note.date = date;
    note.duration = duration;
    note.service = service;
    note.notes = notes;
    note.additionalNotes = additionalNotes;
    note.recommendation = recommendation;
    note.frequency = frequency;
    note.isSigned = isSigned;

    await note.save();

    // Log user activity
    await logActivity({
      userId: doctorId,
      action: "Note Edited",
      description: `User ${req?.user?.customerId} Edited a Note.`,
      metadata: {
        id: noteId,
        title: title,
      },
    });

    res.status(200).json({
      success: true,
      note: note,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

// Find notes by providerId
export const findNotesByProvider = catchAsyncError(async (req, res, next) => {
  try {
    const doctorId = req.user?._id; // LoggedIn ProviderId from session
    const notes = await Notes.find({ doctorId }); // In DB we save providerId as doctorId

    res.status(200).json({
      success: true,
      notes: notes,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});
