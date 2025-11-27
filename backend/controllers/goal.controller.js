import { catchAsyncError } from "../middleware/catchAsyncErrors.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import Goal from "../model/goal.model.js";
import { logActivity } from "../utils/logger.js";

export const createGoal = catchAsyncError(async (req, res, next) => {
  try {
    const { goalTitle, emoji } = req.body;
    const userId = req.user?._id;

    const newGoal = new Goal({
      goalTitle,
      emoji,
      userId,
    });

    const savedGoal = await newGoal.save();

    // Log user activity
    await logActivity({
      userId: userId,
      action: "Goal Created",
      description: `User ${req?.user?.customerId} created a new Goal.`,
      metadata: {
        id: savedGoal._id,
        emoji: emoji,
        goal: goalTitle,
      },
    });

    res.status(201).json({
      success: true,
      savedGoal,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

export const getSingleGoal = catchAsyncError(async (req, res, next) => {
  try {
    const goalId = req.params.id;
    const userId = req.user?._id;

    const goal = await Goal.findOne({ _id: goalId, userId });

    if (!goal) {
      return next(new ErrorHandler("Goal not found", 404));
    }

    res.status(200).json({
      success: true,
      goal,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

export const updateGoal = catchAsyncError(async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;
    const { goalTitle, emoji } = req.body;

    // Find the existing mood entry
    const goalEntry = await Goal.findById(id);

    if (!goalEntry) {
      return next(new ErrorHandler("Goal entry not found", 404));
    }

    goalEntry.goalTitle = goalTitle;
    goalEntry.emoji = emoji;

    // Save the updated mood entry
    await goalEntry.save();

    res.status(200).json({
      success: true,
      message: "gaol entry updated successfully",
      goalEntry,
    });
  } catch (error) {
    console.error("Update failed:", error);
    return next(new ErrorHandler(error.message, 400));
  }
});

export const getAllGoal = catchAsyncError(async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const goals = await Goal.find({ userId, isDeleted: false });
    res.status(201).json({
      success: true,
      goals,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

export const getUserAllGoals = catchAsyncError(async (req, res, next) => {
  try {
    const { id } = req.params;

    const goals = await Goal.find({ userId: id, isDeleted: false });
    res.status(201).json({
      success: true,
      goals,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

export const getAllCompletedGoal = catchAsyncError(async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const goals = await Goal.find({ userId, isDeleted: true });
    res.status(201).json({
      success: true,
      goals,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

export const deleteGoal = catchAsyncError(async (req, res, next) => {
  try {
    const goalId = req.params.id;
    const userId = req.user?._id;

    const goal = await Goal.findOneAndUpdate(
      { _id: goalId, userId, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );

    if (!goal) {
      return next(new ErrorHandler("Goal not found or already deleted", 404));
    }

    // Log user activity
    await logActivity({
      userId: userId,
      action: "Goal Achieved",
      description: `User ${req?.user?.customerId} Achieved a Goal.`,
      metadata: {
        id: goalId,
        emoji: goal?.emoji,
        goal: goal?.goalTitle,
      },
    });

    res.status(200).json({
      success: true,
      message: "Goal deleted successfully",
      goal,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});
