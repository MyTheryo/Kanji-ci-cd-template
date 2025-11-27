import { catchAsyncError } from "../middleware/catchAsyncErrors.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import Todo from "../model/todo.model.js";
import sendMail from "../utils/sendMail.js";
import { logActivity } from "../utils/logger.js";

export const createTodo = catchAsyncError(async (req, res, next) => {
  try {
    const {
      name,
      patientId,
      notes,
      prescription,
      materials,
      research,
      dueDate,
      status,
      emailSend,
      hipaa,
      pcp,
    } = req.body;
    const doctorId = req.user?._id;
    const providerEmail = req.user?.email;
    var providerName = req.user?.firstName;
    const newTodo = new Todo({
      patientId,
      doctorId,
      notes,
      prescription,
      materials,
      research,
      dueDate,
      status,
      emailSend,
      hipaa,
      pcp,
    });
    const savedTodo = await newTodo.save();
    const data = {
      user: "Abdul Samad",
      dueDate,
      name,
      providerName,
      isNewTodo: true, // For new todo item
      // Pass all other properties
      notes,
      prescription,
      materials,
      research,
      status,
      emailSend,
      hipaa,
      pcp,
    };

    if (String(emailSend).trim() === "true") {
      try {
        await sendMail({
          email: providerEmail,
          subject: "Todo Email",
          template: "todos-mail.ejs",
          data, // Pass data to the EJS template
        });

        res.status(201).json({
          success: true,
          message: `Please check your email for todos Notes`,
        });
      } catch (error) {
        return next(new ErrorHandler(error, 400));
      }
    }

    // Log user activity
    await logActivity({
      userId: req?.user?._id,
      action: "Todo Created",
      description: `User ${req?.user?.customerId} created a new Todo.`,
      metadata: {
        id: savedTodo._id,
      },
    });

    res.status(201).json({
      success: true,
      savedTodo,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

export const getTodoById = catchAsyncError(async (req, res, next) => {
  try {
    const doctorId = req.user?._id;
    const todoId = req.params.todoId;

    // Find the todo by ID
    const todo = await Todo.findOne({ _id: todoId, doctorId });

    // Check if the todo exists
    if (!todo) {
      return next(new ErrorHandler("Todo not found", 404));
    }

    // Return the todo
    res.status(200).json({
      success: true,
      todo,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

export const getAllTodo = catchAsyncError(async (req, res, next) => {
  try {
    const doctorId = req.user?._id;
    const patientId = req.params.patientId;
    const archive = req.query.archive; // Get the value of the 'archive' query parameter

    let query = { doctorId, patientId }; // Default query with 'doctorId' and 'patientId' matching

    // If 'archive' query parameter is provided, add it to the query
    if (archive === "0" || archive === "1") {
      query.archive = archive;
    }
    const todos = await Todo.find(query); // Fetch todos based on the constructed query

    res.status(200).json({
      success: true,
      todos: todos,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

/**
 * @desc   Archive or delete a Todo item based on the action provided
 * @route  POST /api/todos/:todoId
 * @access Private (only accessible by authenticated users)
 *
 * @param {Object} req - The request object, containing:
 *   - `params.todoId`: The ID of the Todo item to archive or delete
 *   - `body.action`: The action to perform, either 'archive' or 'delete'
 * @param {Object} res - The response object
 * @param {Function} next - The next middleware function for error handling
 *
 * @returns {Object} A JSON response indicating the success of the operation
 *   - success: true/false
 *   - message: Success or error message
 *
 * @throws {ErrorHandler} If an error occurs during the operation (e.g., Todo not found, invalid action)
 */
export const deleteTodo = catchAsyncError(async (req, res, next) => {
  try {
    const todoId = req.params.todoId;
    const action = req.body.action; // Expecting an action to either 'archive' or 'delete'

    // Check if the todo exists
    const todo = await Todo.findById(todoId);
    if (!todo) {
      return next(new ErrorHandler("Todo not found", 404));
    }

    if (action === "archive") {
      // Toggle the value of the archive field
      if (todo.archive === "0") {
        todo.archive = "1"; // If archive is "0", set it to "1"
      } else {
        todo.archive = "0"; // If archive is "1", set it to "0"
      }

      await todo.save();

      // Log user activity
      await logActivity({
        userId: req?.user?._id,
        action: "Todo Status",
        description: `User ${req?.user?.customerId} ${
          todo.archive == "0" ? "Archived" : "Restored"
        } a Todo.`,
        metadata: {
          id: todoId,
        },
      });

      return res.status(200).json({
        success: true,
        message:
          todo.archive == "0"
            ? "Todo Moved To Archive Successfully"
            : "Todo Restored Successfully",
      });
    } else if (action === "delete") {
      // Perform delete operation
      await Todo.findByIdAndDelete(todoId);

      // Log user activity
      await logActivity({
        userId: req?.user?._id,
        action: "Todo Deleted",
        description: `User ${req?.user?.customerId} deleted a Todo.`,
        metadata: {
          id: todoId,
        },
      });

      return res.status(200).json({
        success: true,
        message: "Todo deleted successfully",
      });
    } else {
      return next(
        new ErrorHandler("Invalid action. Use 'archive' or 'delete'.", 400)
      );
    }
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

export const editTodo = catchAsyncError(async (req, res, next) => {
  try {
    const todoId = req.params.todoId;
    const doctorId = req.user?._id;
    const providerEmail = req.user?.email;
    const todo = await Todo.findOne({ _id: todoId, doctorId });

    if (!todo) {
      return next(
        new ErrorHandler(
          "todo not found or you don't have permission to edit it",
          404
        )
      );
    }

    const {
      name,
      patientId,
      notes,
      prescription,
      materials,
      research,
      dueDate,
      status,
      emailSend,
      hipaa,
      pcp,
    } = req.body;
    // Assuming todo is fetched from the database
    const previousTodo = await Todo.findById(todoId); // Fetch previous state of todo from the database

    // Update the todo object with the new data
    todo.notes = notes;
    todo.prescription = prescription;
    todo.materials = materials;
    todo.research = research;
    todo.dueDate = dueDate;
    todo.status = status;
    todo.emailSend = emailSend;
    todo.hipaa = hipaa;
    todo.pcp = pcp;

    await todo.save();

    // Compare the updated todo with the previous state to find the changed fields
    const changedFields = {};
    if (todo.notes !== previousTodo.notes) changedFields.notes = todo.notes;
    if (todo.prescription !== previousTodo.prescription)
      changedFields.prescription = todo.prescription;
    if (todo.materials !== previousTodo.materials)
      changedFields.materials = todo.materials;
    if (todo.research !== previousTodo.research)
      changedFields.research = todo.research;
    if (todo.dueDate !== previousTodo.dueDate)
      changedFields.dueDate = todo.dueDate;
    if (todo.status !== previousTodo.status) changedFields.status = todo.status;
    if (todo.emailSend !== previousTodo.emailSend)
      changedFields.emailSend = todo.emailSend;
    if (todo.hipaa !== previousTodo.hipaa) changedFields.hipaa = todo.hipaa;
    if (todo.pcp !== previousTodo.pcp) changedFields.pcp = todo.pcp;

    // Construct data to be sent in the email containing only the changed fields
    var providerName = req.user?.firstName;
    const data = {
      user: "abc",
      changedFields,
      dueDate,
      name,
      providerName,
      isNewTodo: false,
    };

    if (String(emailSend).trim() === "true") {
      await sendMail({
        email: providerEmail,
        subject: "Todo Email",
        template: "todos-mail.ejs",
        data, // Pass data to the EJS template
      });
    }

    res.status(200).json({
      success: true,
      todo: todo,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

export const getAllTodoData = catchAsyncError(async (req, res, next) => {
  const providerId = req.user?._id; // Get providerId which is stored in req.user._id

  try {
    // Fetch todos data where doctorId matches with providerId
    const todos = await Todo.find({ doctorId: providerId })
      .populate({
        path: "patientId",
        model: "User", // assuming 'User' is the model name for users
        select: "firstName", // specify the fields you want to select from the 'User' model
      })
      .exec(); // Execute the query

    res.status(200).json({
      success: true,
      todos: todos,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});
