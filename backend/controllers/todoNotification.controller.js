import { catchAsyncError } from "../middleware/catchAsyncErrors.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import TodoNotification from '../model/todoNotification.model.js'; // Import the TodoNotification model here

// Controller function to create a todo notification
export const createTodoNotification = catchAsyncError(async (req, res, next) => {
    const {notificationFrequency } = req.body;
    const doctorId = req.user._id;
    try {
        // Check if a TodoNotification with the given doctorId already exists
        let todoNotification = await TodoNotification.findOne({ doctorId });

        if (todoNotification) {
            // If it exists, update the existing document
            todoNotification.notificationFrequency = notificationFrequency;
            todoNotification.date = new Date(); // Update to the current date and time
        } else {
            // If it doesn't exist, create a new TodoNotification document
            todoNotification = new TodoNotification({
                doctorId,
                notificationFrequency,
                date: new Date() // Set the date to the current date and time
            });
        }

        // Save the updated or new document
        const savedTodoNotification = await todoNotification.save();

        res.status(201).json({
            success: true,
            message: "Todo notification handled successfully",
            savedTodoNotification
        });
    } catch (error) {
        // Pass any errors to the error-handling middleware
        next(new ErrorHandler(error.message, 400));
    }
});

// Other controller functions can be added here as needed
