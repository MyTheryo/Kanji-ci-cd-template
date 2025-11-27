import { catchAsyncError } from "../middleware/catchAsyncErrors.js";
import Mood from "../model/mood.model.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import WeeklyReportSummary from "../model/weeklyReport.model.js";
import mongoose from "mongoose"; // Ensure mongoose is imported
import { logActivity } from "../utils/logger.js";

/**
 * @function createMood
 * This function handles the creation of a new mood entry for the authenticated user.
 * The mood data is extracted from the request body, processed, and saved in the database.
 * After the mood entry is saved, background processing occurs to generate a seven-day mood summary using an external API.
 */

export const createMood = catchAsyncError(async (req, res, next) => {
  try {
    // Extract the authenticated user's ID from the request object
    const userId = req.user?._id;

    // Destructure the mood data from the request body
    let {
      mood,
      emoji,
      activities,
      goal,
      betterme,
      productivity,
      therapyProcess,
      sleepRoutine,
      notes,
      date,
    } = req.body;

    // Capitalize the first letter of the mood string and ensure the rest is lowercase
    mood = mood.charAt(0).toUpperCase() + mood.slice(1).toLowerCase();

    // Placeholder for future functionality to upload icons to Cloudinary
    // Upload icons related to mood, betterme, and productivity to Cloudinary
    // const moodIcon = await uploadIconToCloudinary(emoji);

    // let foodIcon;
    // let bettermeIcon;
    // let productivityIcon;

    // if (food.foodIcon) {
    //   foodIcon = await uploadIconToCloudinary(food.foodIcon);
    // }
    // if (betterme.bettermeIcon) {
    //   bettermeIcon = await uploadIconToCloudinary(betterme.bettermeIcon);
    // }
    // if (productivity.productivityIcon) {
    //   productivityIcon = await uploadIconToCloudinary(productivity.productivityIcon);
    // }

    // Create a new Mood object and set its properties based on the request data
    const newMood = new Mood({
      mood,
      emoji,
      // Assign goal details if provided in the request
      goal: {
        goalTitle: goal.goalTitle,
        goalIcon: goal.goalIcon,
      },
      // Uncomment and set additional fields like betterme, productivity, therapyProcess, and sleepRoutine when needed
      // betterme: {
      //   bettermeTitle: betterme.bettermeTitle,
      //   bettermeIcon: betterme.bettermeIcon,
      // },
      // productivity: {
      //   productivityTitle: productivity.productivityTitle,
      //   productivityIcon: productivity.productivityIcon,
      // },
      // therapyProcess,
      // sleepRoutine,
      notes,
      date,
      userId, // Assign the authenticated user's ID
    });

    // Save the new mood entry to the database
    await newMood.save();

    // Log user activity
    await logActivity({
      userId: userId,
      action: "Mood Created",
      description: `User ${req?.user?.customerId} added a new mood.`,
      metadata: {
        id: newMood._id,
        emoji: emoji,
        goal: goal,
      },
    });

    // Respond immediately to the client with a success message
    res.status(200).json({
      success: true,
      newMood, // Send the newly created mood entry back in the response
      message: "Mood created successfully", // Indicate background processing is ongoing
      // message: "Processing in the background", // Indicate background processing is ongoing
    });

    // Background processing to generate a seven-day mood summary
    // setImmediate(async () => {
    //   try {
    //     // Fetch the last 7 mood entries for the user, sorted by date in descending order
    //     const summary = await Mood.find({ userId: userId })
    //       .sort({ date: -1 })
    //       .limit(7)
    //       .lean(); // Use lean to return plain JavaScript objects for faster processing

    //     // If no mood data is found, exit the background processing
    //     if (!summary || summary.length === 0) {
    //       return;
    //     }

    //     // Helper function to query an external API for generating a mood summary
    //     async function query(data) {
    //       const response = await fetch(
    //         "http://54.218.176.251/api/v1/prediction/a945831b-1f6c-4d38-8c40-b78d955772ff",
    //         {
    //           headers: {
    //             Authorization:
    //               "Bearer dg0OzH4CP9QjBvhnNwnAP14_AUvzNBpn_AD4YU6vLdA", // API auth token
    //             "Content-Type": "application/json",
    //           },
    //           method: "POST",
    //           body: JSON.stringify(data), // Send mood data as JSON in the request body
    //         }
    //       );

    //       // If the API response is not successful, throw an error with details
    //       if (!response.ok) {
    //         const errorDetail = await response.json();
    //         throw new Error(
    //           `API Error: ${response.status} ${response.statusText} - ${errorDetail.message}`
    //         );
    //       }

    //       const responseBody = await response.text();

    //       // If the response is HTML instead of JSON, throw an error
    //       if (responseBody.startsWith("<!DOCTYPE html>")) {
    //         throw new Error("Received HTML response instead of JSON");
    //       }

    //       // Parse and return the API response as JSON
    //       const result = JSON.parse(responseBody);
    //       return result;
    //     }

    //     // Call the query function to generate a summary based on the last 7 mood entries
    //     const response = await query({ question: summary });

    //     // If the response doesn't contain the expected 'text' field, throw an error
    //     if (!response.text) {
    //       throw new Error("Response does not contain 'text' field");
    //     }

    //     // Create a new sevenDaySum document with the generated summary
    //     const newsevenDaySum = new sevenDaySum({
    //       userId: userId, // Associate the summary with the user's ID
    //       summary: response.text, // Store the generated summary text
    //     });

    //     // Save the seven-day summary to the database
    //     await newsevenDaySum.save();
    //   } catch (error) {
    //     // Log any errors that occur during background processing
    //     console.error("Background processing failed:", error);
    //   }
    // });
  } catch (error) {
    // Log any errors that occur during mood creation and return a 400 Bad Request
    console.error("Save failed:", error);
    return next(new ErrorHandler(error.message, 400));
  }
});

/**
 * End of createMood function.
 * This function processes and saves a user's mood data, then triggers background processing to generate a seven-day mood summary.
 * The summary is generated using an external API and saved to the database if successful. Errors are handled at various stages.
 */

/**
 * @function updateMood
 * This function handles updating an existing mood entry for the authenticated user.
 * It retrieves the mood entry by its ID, updates the provided fields, and saves the changes to the database.
 * If the mood entry is not found, it returns a 404 error.
 */

export const updateMood = catchAsyncError(async (req, res, next) => {
  try {
    // Extract the authenticated user's ID from the request object
    const userId = req.user?._id;

    // Extract the mood entry ID from the request parameters (e.g., /mood/:id)
    const { id } = req.params;

    // Destructure the updated mood data from the request body
    let {
      mood,
      emoji,
      activities,
      food,
      betterme,
      productivity,
      therapyProcess,
      sleepRoutine,
      notes,
      date,
    } = req.body;

    // Find the existing mood entry by its ID
    const moodEntry = await Mood.findById(id);

    // If no mood entry is found, return a 404 Not Found error
    if (!moodEntry) {
      return next(new ErrorHandler("Mood entry not found", 404));
    }

    // Update the mood entry's fields with the data provided in the request body
    moodEntry.mood = mood;
    moodEntry.emoji = emoji;
    moodEntry.activities = activities;
    moodEntry.food = food;
    moodEntry.betterme = betterme;
    moodEntry.productivity = productivity;
    moodEntry.notes = notes;
    moodEntry.date = date;

    // Save the updated mood entry to the database
    await moodEntry.save();

    // Respond to the client with a success message and the updated mood entry
    res.status(200).json({
      success: true, // Indicate the request was successful
      message: "Mood entry updated successfully", // Send a success message
      moodEntry, // Include the updated mood entry in the response
    });
  } catch (error) {
    // If an error occurs during the update, log the error and return a 400 Bad Request
    console.error("Update failed:", error);
    return next(new ErrorHandler(error.message, 400));
  }
});

/**
 * End of updateMood function.
 * This function is designed to update an existing mood entry by finding it via its ID, applying changes, and saving them.
 * If the mood entry is not found or an error occurs during the update, appropriate error messages are returned.
 */

/**
 * @function getAllmoods
 * This function retrieves all the mood entries for the authenticated user, sorted by creation date in descending order.
 * It sends the entire list of moods in the response, allowing the user to view all their mood records.
 */
// Get All moods with pagination
export const getAllmoods = catchAsyncError(async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Use aggregation to convert date strings to dates and sort them
    const moods = await Mood.aggregate([
      { $match: { userId } },
      { $addFields: { dateAsDate: { $toDate: "$date" } } },
      { $sort: { dateAsDate: -1 } }, // Sort by date in descending order
      { $skip: skip },
      { $limit: limit },
    ]);

    const totalMoods = await Mood.countDocuments({ userId });

    res.status(200).json({
      success: true,
      moods,
      totalPages: Math.ceil(totalMoods / limit),
      currentPage: page,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

/**
 * End of getAllmoods function.
 * This function is designed to fetch all mood records for the authenticated user, providing them in descending order of creation date.
 * If an error occurs during the process, an appropriate error response is returned.
 */

/**
 * @function getLatestmoods
 * This function retrieves the latest mood entry for the authenticated user,
 * sorted by creation date in descending order, ensuring the most recent mood is returned.
 * It sends the most recent mood entry in the response.
 */

export const getLatestmoods = catchAsyncError(async (req, res, next) => {
  try {
    // Extract the authenticated user's ID from the request object
    const userId = req.user?._id;

    // Fetch the latest (most recent) mood entry for the user, sorted by creation date (most recent first)
    const latestMood = await Mood.findOne({ userId }).sort({ createdAt: -1 });

    // Send the retrieved latest mood entry in the response with a success message
    res.status(201).json({
      success: true, // Indicate the request was successful
      latestMood, // Include the latest mood entry in the response
    });
  } catch (error) {
    // If an error occurs during fetching, pass it to the error handler middleware with a 400 status code
    return next(new ErrorHandler(error.message, 400));
  }
});

/**
 * End of getLatestmoods function.
 * This function is designed to fetch the most recent mood entry for the authenticated user.
 * If an error occurs during the process, an appropriate error response is returned.
 */

/**
 * @function groupByMood
 * This function groups the user's mood entries by the "mood" field and returns the count of each mood.
 * It also includes the first emoji associated with each mood. The results are aggregated using MongoDB's aggregation framework.
 */

export const groupByMood = catchAsyncError(async (req, res, next) => {
  try {
    // Extract the authenticated user's ID from the request object
    const userId = req.user?._id;

    // Perform MongoDB aggregation to group mood entries by "mood"
    const moodCounts = await Mood.aggregate([
      {
        $match: {
          userId: userId, // Filter mood entries to only include those belonging to the authenticated user
        },
      },
      {
        $group: {
          _id: "$mood", // Group by the "mood" field
          count: { $sum: 1 }, // Count the number of entries for each mood
          emoji: { $first: "$emoji" }, // Retrieve the first emoji associated with each mood group
        },
      },
    ]);

    // Return the grouped mood data with a success response
    res.status(200).json({
      success: true, // Indicate that the request was successful
      data: moodCounts.map(({ _id, count, emoji }) => ({
        mood: _id, // The mood name (grouped by)
        count, // The count of entries for this mood
        emoji, // The first emoji associated with this mood
      })),
    });
  } catch (error) {
    // If an error occurs during aggregation, pass it to the error handler with a 400 Bad Request
    return next(new ErrorHandler(error.message, 400));
  }
});

/**
 * End of groupByMood function.
 * This function uses MongoDB's aggregation pipeline to group mood entries by their "mood" field, counting how many entries exist for each mood.
 * It returns the mood, the count, and the first associated emoji for each group. If an error occurs, it is passed to the error handler.
 */

/**
 * @function groupByDate
 * This function groups the user's mood entries by the "date" field, converting the date string into a proper date format.
 * It returns all mood entries for each unique date in the format "YYYY-MM-DD".
 */

export const groupByDate = catchAsyncError(async (req, res, next) => {
  try {
    // Extract the authenticated user's ID from the request object
    const userId = req.user?._id;

    // Perform MongoDB aggregation to group mood entries by "date"
    const dateGroups = await Mood.aggregate([
      {
        $match: {
          userId: userId, // Filter mood entries to only include those belonging to the authenticated user
        },
      },
      {
        $addFields: {
          // Convert the "date" field (assumed to be a string) into a proper date format
          dateAsDate: {
            $toDate: "$date", // Converts the "date" string to a Date object
          },
        },
      },
      {
        $group: {
          _id: {
            // Group by the date string in "YYYY-MM-DD" format
            $dateToString: {
              format: "%Y-%m-%d", // Specify the date format for grouping
              date: "$dateAsDate", // Use the converted date field for grouping
            },
          },
          moods: { $push: "$$ROOT" }, // Push all mood entries into an array for each date
        },
      },
      {
        $project: {
          _id: 0, // Exclude the _id field in the result
          date: "$_id", // Use the grouped date as the "date" field in the result
          moods: 1, // Include the array of mood entries for each date
        },
      },
    ]);

    // Send the grouped mood data by date with a success response
    res.status(200).json({
      success: true, // Indicate that the request was successful
      data: dateGroups, // Return the grouped mood data
    });
  } catch (error) {
    // If an error occurs during aggregation, pass it to the error handler with a 400 Bad Request
    return next(new ErrorHandler(error.message, 400));
  }
});

/**
 * End of groupByDate function.
 * This function uses MongoDB's aggregation pipeline to group mood entries by date (in "YYYY-MM-DD" format).
 * The function returns all mood entries for each unique date, and handles any errors by returning a 400 status code.
 */

/**
 * @function getCurrentWeekMoods
 * This function retrieves the count of mood entries for each day within the current week for the authenticated user.
 * It calculates the start and end dates of the current week, then groups the mood entries by date and counts them.
 */

export const getCurrentWeekMoods = catchAsyncError(async (req, res, next) => {
  try {
    // Extract the authenticated user's ID from the request object
    const userId = req.user?._id;

    // Get the current date in UTC
    const currentDate = new Date();
    const currentUTCDate = new Date(
      Date.UTC(
        currentDate.getUTCFullYear(),
        currentDate.getUTCMonth(),
        currentDate.getUTCDate(),
        currentDate.getUTCHours(),
        currentDate.getUTCMinutes(),
        currentDate.getUTCSeconds(),
        currentDate.getUTCMilliseconds()
      )
    );

    // Calculate the start of the current week (Monday) in UTC, set time to midnight (00:00:00)
    const startOfWeek = new Date(currentUTCDate);
    const dayOfWeek = currentUTCDate.getUTCDay();
    const diffToMonday = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek; // Adjust for Monday as the start of the week
    startOfWeek.setUTCDate(currentUTCDate.getUTCDate() + diffToMonday);
    startOfWeek.setUTCHours(0, 0, 0, 0); // Set time to midnight

    // Calculate the end of the current week (Sunday) in UTC, set time to the last millisecond of the day (23:59:59.999)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setUTCDate(startOfWeek.getUTCDate() + 6); // Get the date for Sunday
    endOfWeek.setUTCHours(23, 59, 59, 999); // Set time to the end of the day

    // MongoDB aggregation pipeline to count mood entries grouped by date within the current week
    const moodCounts = await Mood.aggregate([
      {
        $match: {
          userId: userId, // Filter mood entries by the authenticated user's ID
          date: {
            $gte: startOfWeek.toISOString(),
            $lte: endOfWeek.toISOString(),
          }, // Filter mood entries within the current week
        },
      },
      {
        $group: {
          _id: { $substr: ["$date", 0, 10] }, // Extract the date part (format: YYYY-MM-DD)
          count: { $sum: 1 }, // Count the number of mood entries for each day
        },
      },
    ]);

    // Respond with the mood count data for the current week
    res.status(200).json({
      success: true, // Indicate that the request was successful
      moodCounts: moodCounts, // Return the mood count data for each day of the current week
    });
  } catch (error) {
    // If an error occurs during processing, pass it to the error handler with a 400 Bad Request status
    return next(new ErrorHandler(error.message, 400));
  }
});

/**
 * End of getCurrentWeekMoods function.
 * This function calculates the start and end of the current week, groups mood entries by day,
 * and returns the count of moods for each day within the week. Errors are handled appropriately.
 */

/**
 * @function groupByMoodForLastTwoWeeks
 * This function groups the user's mood entries by the "mood" field for the last 14 days.
 * It retrieves the mood entries within this period and groups them by day, including the mood and associated emoji for each day.
 */

export const groupByMoodForLastTwoWeeks = catchAsyncError(
  async (req, res, next) => {
    try {
      // Extract the authenticated user's ID from the request object
      const userId = req.user?._id;

      // Get the current date
      const currentDate = new Date();

      // Calculate the start of the last 14 days (including today)
      const startOfTwoWeeks = new Date(currentDate);
      startOfTwoWeeks.setDate(currentDate.getDate() - 13); // Subtract 13 days to get 14 days in total
      startOfTwoWeeks.setHours(0, 0, 0, 0); // Set time to midnight at the start of the day

      // Set the end of the period to the current date (today) at the last millisecond of the day
      const endOfTwoWeeks = new Date(currentDate);
      endOfTwoWeeks.setHours(23, 59, 59, 999); // Set time to the end of the day

      // MongoDB aggregation pipeline to group mood entries by day for the last 14 days
      const moodData = await Mood.aggregate([
        {
          $match: {
            userId: userId, // Filter by the authenticated user's ID
            date: {
              $gte: startOfTwoWeeks.toISOString(),
              $lte: endOfTwoWeeks.toISOString(),
            }, // Filter entries within the last 14 days
          },
        },
        {
          $group: {
            _id: { $substr: ["$date", 0, 10] }, // Extract the date part (format: YYYY-MM-DD)
            emojis: { $push: { emoji: "$emoji", name: "$mood" } }, // Collect emojis and mood names for each day
          },
        },
        {
          $sort: { _id: 1 }, // Sort the result by date (ascending order)
        },
      ]);

      // Format the grouped data by converting the _id fields to a readable date string
      const formattedData = moodData.map(({ _id, emojis }) => ({
        date: new Intl.DateTimeFormat("en-US").format(new Date(_id)), // Convert the grouped date string into a proper date
        emojis, // Include the list of emojis and mood names for that day
      }));

      // Send the grouped and formatted data back to the client
      res.status(200).json({
        success: true, // Indicate that the request was successful
        data: formattedData, // Return the formatted mood data
      });
    } catch (error) {
      // If an error occurs during processing, pass it to the error handler with a 400 Bad Request status
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

/**
 * End of groupByMoodForLastTwoWeeks function.
 * This function groups mood entries by day for the last 14 days, including the mood name and associated emoji for each day.
 * It formats the result as a list of dates with mood data and returns it to the client.
 */

/**
 * @function getAllActivities
 * This function retrieves all the mood entries for the authenticated user and groups them by the "Activity" field.
 * It returns all mood entries that contain activity information for the user.
 */

export const getAllActivities = catchAsyncError(async (req, res, next) => {
  try {
    // Extract the authenticated user's ID from the request object
    const userId = req.user?._id;

    // Query the database to find all mood entries for the user
    const activities = await Mood.find({ userId }); // Find all mood entries with the given userId

    // Send the retrieved mood activities back to the client with a success message
    res.status(201).json({
      success: true, // Indicate that the request was successful
      activities, // Return the list of activities (mood entries) for the user
    });
  } catch (error) {
    // If an error occurs during fetching, pass it to the error handler with a 400 Bad Request
    return next(new ErrorHandler(error.message, 400));
  }
});

/**
 * End of getAllActivities function.
 * This function retrieves all mood entries for the authenticated user, focusing on entries that contain activities.
 * If an error occurs during the process, it is handled and returned with an appropriate error message.
 */

/**
 * @function groupByActivity
 * This function groups the user's mood entries by the "Activity" field and returns the count of each activity.
 * It also includes the first emoji associated with each activity. The results are aggregated using MongoDB's aggregation framework.
 */

export const groupByActivity = catchAsyncError(async (req, res, next) => {
  try {
    // Extract the authenticated user's ID from the request object
    const userId = req.user?._id;

    // Perform MongoDB aggregation to group mood entries by "activity"
    const ActivityCounts = await Mood.aggregate([
      {
        $match: {
          userId: userId, // Filter mood entries to only include those belonging to the authenticated user
        },
      },
      {
        $group: {
          _id: "$activity", // Group by the "activity" field
          count: { $sum: 1 }, // Count the number of entries for each activity
          emoji: { $first: "$emoji" }, // Retrieve the first emoji associated with each activity group
        },
      },
    ]);

    // Respond with the grouped activity data
    res.status(200).json({
      success: true, // Indicate that the request was successful
      data: ActivityCounts.map(({ _id, count, emoji }) => ({
        Activity: _id, // Activity name
        count, // Number of occurrences of the activity
        emoji, // First emoji associated with the activity
      })),
    });
  } catch (error) {
    // If an error occurs during aggregation, pass it to the error handler with a 400 Bad Request
    return next(new ErrorHandler(error.message, 400));
  }
});

/**
 * End of groupByActivity function.
 * This function groups mood entries by activity and returns the count of entries for each activity, including the first emoji.
 * If an error occurs during the aggregation process, it is handled and returned with an appropriate error message.
 */

/**
 * @function groupBySleepActivity
 * This function groups the user's mood entries by the "sleepRoutine" field, excluding empty values,
 * and returns the count of entries for each sleep routine.
 * The results are aggregated using MongoDB's aggregation framework.
 */

export const groupBySleepActivity = catchAsyncError(async (req, res, next) => {
  try {
    // Extract the authenticated user's ID from the request object
    const userId = req.user?._id;

    // Perform MongoDB aggregation to group mood entries by "sleepRoutine"
    const ActivityCounts = await Mood.aggregate([
      {
        $match: {
          userId: userId, // Filter mood entries to only include those belonging to the authenticated user
          sleepRoutine: { $ne: "" }, // Exclude entries where "sleepRoutine" is an empty string
        },
      },
      {
        $group: {
          _id: "$sleepRoutine", // Group by the "sleepRoutine" field
          count: { $sum: 1 }, // Count the number of entries for each sleep routine
        },
      },
    ]);

    // Respond with the grouped sleep routine data
    res.status(200).json({
      success: true, // Indicate that the request was successful
      data: ActivityCounts.map(({ _id, count }) => ({
        Activity: _id, // Sleep routine description
        count, // Number of occurrences of the sleep routine
      })),
    });
  } catch (error) {
    // If an error occurs during aggregation, pass it to the error handler with a 400 Bad Request
    return next(new ErrorHandler(error.message, 400));
  }
});

/**
 * End of groupBySleepActivity function.
 * This function groups mood entries by the user's sleep routine, excluding empty values, and returns the count of each routine.
 * If an error occurs during the aggregation process, it is handled and returned with an appropriate error message.
 */

/**
 * @function updateMoodSwpById
 * This controller updates the 'swp' (status, workflow, or progress) field of a specific mood entry by its ID.
 * It fetches both the `id` of the mood entry and the new `swp` value from the request body, updates the mood entry, and returns the updated document.
 */

export const updateMoodSwpById = async (req, res, next) => {
  // Destructure `id` and `swp` from the request body
  const { id, swp } = req.body;

  try {
    // Find the mood entry by ID and update the 'swp' field with the new value
    const updatedMood = await Mood.findByIdAndUpdate(
      id,
      { $set: { swp: swp } }, // Set the new 'swp' value
      { new: true, runValidators: true } // Return the updated document and validate the new value
    );

    // If no mood entry is found with the given ID, return a 204 No Content
    if (!updatedMood) {
      return res.status(204).json({
        success: false, // Indicate the operation failed
        message: "Mood not found", // Explain that no mood entry was found with the given ID
      });
    }

    // Respond with the updated mood entry
    res.json({
      success: true, // Indicate the update was successful
      message: "Mood updated successfully", // Confirmation message for the update
      data: updatedMood, // Return the updated mood entry data
    });
  } catch (error) {
    // Pass any errors to the error handler middleware
    next(error);
  }
};

/**
 * End of updateMoodSwpById function.
 * This function handles updating the 'swp' field for a mood entry by ID. If the mood entry is found and updated, it is returned to the client. If not, an error or failure message is sent.
 */

/**
 * @function findMoodByDoctorAndPatient
 * This controller finds mood entries for a specific patient (by patientId) where the 'swp' field is set to 1, typically indicating a specific status or condition.
 * It returns all matching mood entries.
 */

export const findMoodByDoctorAndPatient = catchAsyncError(
  async (req, res, next) => {
    try {
      // Extract the patient's ID from the request parameters
      const patientId = req.params.patientId;

      // Find all mood entries for the patient where 'swp' is set to 1
      const mood = await Mood.find({ userId: patientId, swp: 1 });

      // Respond with the found mood entries
      res.status(200).json({
        success: true, // Indicate the request was successful
        mood: mood, // Return the mood entries for the patient
      });
    } catch (error) {
      // If an error occurs, pass it to the error handler with a 400 Bad Request status
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

/**
 * End of findMoodByDoctorAndPatient function.
 * This function searches for mood entries for a patient with a specific 'swp' value. If the entries are found, they are returned to the client. Errors are handled appropriately.
 */

/**
 * @function findLatestMoodByDoctorAndPatient
 * This function finds the latest mood entry for a specific patient (by patientId) where the 'swp' field is set to 1.
 * It retrieves the most recent mood entry based on the creation date.
 */

export const findLatestMoodByDoctorAndPatient = catchAsyncError(
  async (req, res, next) => {
    try {
      // Extract the patient's ID from the request parameters
      const patientId = req.params.patientId;

      // Find the latest mood entry for the patient where 'swp' is set to 1, sorted by creation date (most recent first)
      const mood = await Mood.findOne({ userId: patientId, swp: 1 }).sort({
        createdAt: -1,
      });

      // Respond with the latest mood entry
      res.status(200).json({
        success: true, // Indicate that the request was successful
        mood: mood, // Return the most recent mood entry for the patient
      });
    } catch (error) {
      // If an error occurs, pass it to the error handler with a 400 Bad Request status
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

/**
 * End of findLatestMoodByDoctorAndPatient function.
 * This function retrieves the latest mood entry for a patient where 'swp' is set to 1. If an error occurs, it is handled appropriately.
 */

// /**
//  * @function reportByMoodForLastFourWeeks
//  * This function generates mood reports for the last 4 weeks for the authenticated user. It groups mood entries by week
//  * and provides the latest mood and emoji for each day within that week, along with a weekly report summary.
//  */

// export const reportByMoodForLastFourWeeks = catchAsyncError(
//   async (req, res, next) => {
//     try {
//       // Extract the authenticated user's ID from the request object
//       const userId = req.user?._id;
//       const currentDate = new Date();

//       // Initialize an empty array to store the weekly reports
//       const reports = [];

//       // Loop through the last 4 weeks
//       for (let i = 0; i < 4; i++) {
//         // Calculate the start of the week (Sunday)
//         const startOfWeek = new Date(currentDate);
//         startOfWeek.setDate(
//           currentDate.getDate() - i * 7 - currentDate.getDay()
//         );
//         startOfWeek.setHours(0, 0, 0, 0); // Set time to midnight

//         // Calculate the end of the week (Saturday)
//         const endOfWeek = new Date(startOfWeek);
//         endOfWeek.setDate(startOfWeek.getDate() + 6); // End of the week (Saturday)
//         endOfWeek.setHours(23, 59, 59, 999); // Set time to the end of the day

//         // Format the week date range (M/D/YYYY to M/D/YYYY)
//         const formatDate = (date) => {
//           const month = date.getMonth() + 1; // No leading zero for month
//           const day = date.getDate(); // No leading zero for day
//           const year = date.getFullYear();
//           return `${month}/${day}/${year}`;
//         };

//         const weekRange = `${formatDate(startOfWeek)} to ${formatDate(
//           endOfWeek
//         )}`;

//         // Fetch mood data for the current week
//         const moodData = await Mood.aggregate([
//           {
//             $match: {
//               userId, // Filter by authenticated user
//               date: { $gte: startOfWeek, $lte: endOfWeek }, // Date range for the current week
//             },
//           },
//           {
//             $group: {
//               _id: {
//                 year: { $year: "$date" }, // Group by year
//                 month: { $month: "$date" }, // Group by month
//                 day: { $dayOfMonth: "$date" }, // Group by day
//               },
//               latestEmoji: { $last: "$emoji" }, // Get the latest emoji for the day
//               latestMood: { $last: "$mood" }, // Get the latest mood for the day
//               lastDate: { $last: "$date" }, // Get the last date of the mood entry
//             },
//           },
//           {
//             $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 }, // Sort by year, month, and day
//           },
//         ]);

//         // Format the mood data to include the date, emoji, mood, and last date
//         const formattedData = moodData.map((entry) => {
//           const { _id, latestEmoji, latestMood, lastDate } = entry;
//           const date = new Date(
//             _id.year,
//             _id.month - 1,
//             _id.day
//           ).toLocaleDateString("en-US");
//           return {
//             date,
//             emoji: latestEmoji,
//             mood: latestMood,
//             lastDate,
//           };
//         });

//         // Fetch the weekly report summary from the WeeklyReportSummary model for the current week
//         const weeklyReportData = await WeeklyReportSummary.findOne({
//           userId: new mongoose.Types.ObjectId(userId), // Convert userId to ObjectId
//           weekRange: weekRange, // Ensure weekRange matches the format
//         });

//         // Add the report for the current week, including the weekRange, mood data, and report summary
//         reports.push({
//           week: i + 1, // Week number (1-4)
//           weekRange, // The week date range
//           weeklyReportSummary: weeklyReportData || "", // Include the weekly report summary or an empty string if not found
//           data: formattedData, // The mood data for each day of the week
//         });
//       }

//       // Respond with the generated reports for the last 4 weeks
//       res.status(200).json({
//         success: true, // Indicate that the request was successful
//         data: reports, // Return the weekly reports
//       });
//     } catch (error) {
//       // If an error occurs, pass it to the error handler with a 400 Bad Request status
//       return next(new ErrorHandler(error.message, 400));
//     }
//   }
// );

// /**
//  * End of reportByMoodForLastFourWeeks function.
//  * This function generates a report for the last 4 weeks, including mood data for each day of the week and weekly report summaries.
//  * It handles errors and returns appropriate responses.
//  */

/**
 * @function reportByMoodForLastEightWeeks
 * This function generates mood reports for the last 8 weeks for the authenticated user.
 * It groups mood entries by week and provides the latest mood and emoji for each day within that week,
 * along with a weekly report summary.
 */

export const reportByMoodForLastEightWeeks = catchAsyncError(
  async (req, res, next) => {
    try {
      // Extract the authenticated user's ID from the request object
      const userId = req.user?._id;
      const currentDate = new Date();

      // Initialize an empty array to store the weekly reports
      const reports = [];

      // Loop through the last 8 weeks
      for (let i = 0; i < 8; i++) {
        // Calculate the start of the week (Sunday)
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(
          currentDate.getDate() - i * 7 - currentDate.getDay()
        );
        startOfWeek.setHours(0, 0, 0, 0); // Set time to midnight

        // Calculate the end of the week (Saturday)
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // End of the week (Saturday)
        endOfWeek.setHours(23, 59, 59, 999); // Set time to the end of the day

        // Format the week date range (M/D/YYYY to M/D/YYYY)
        const formatDate = (date) => {
          const month = date.getMonth() + 1; // No leading zero for month
          const day = date.getDate(); // No leading zero for day
          const year = date.getFullYear();
          return `${month}/${day}/${year}`;
        };

        const weekRange = `${formatDate(startOfWeek)} to ${formatDate(
          endOfWeek
        )}`;

        // Fetch mood data for the current week
        const moodData = await Mood.aggregate([
          {
            $match: {
              userId, // Filter by authenticated user
              date: { $gte: startOfWeek, $lte: endOfWeek }, // Date range for the current week
            },
          },
          {
            $group: {
              _id: {
                year: { $year: "$date" }, // Group by year
                month: { $month: "$date" }, // Group by month
                day: { $dayOfMonth: "$date" }, // Group by day
              },
              latestEmoji: { $last: "$emoji" }, // Get the latest emoji for the day
              latestMood: { $last: "$mood" }, // Get the latest mood for the day
              lastDate: { $last: "$date" }, // Get the last date of the mood entry
            },
          },
          {
            $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 }, // Sort by year, month, and day
          },
        ]);

        // Format the mood data to include the date, emoji, mood, and last date
        const formattedData = moodData.map((entry) => {
          const { _id, latestEmoji, latestMood, lastDate } = entry;
          const date = new Date(
            _id.year,
            _id.month - 1,
            _id.day
          ).toLocaleDateString("en-US");
          return {
            date,
            emoji: latestEmoji,
            mood: latestMood,
            lastDate,
          };
        });

        // Fetch the weekly report summary from the WeeklyReportSummary model for the current week
        const weeklyReportData = await WeeklyReportSummary.findOne({
          userId: new mongoose.Types.ObjectId(userId), // Convert userId to ObjectId
          weekRange: weekRange, // Ensure weekRange matches the format
        });

        // Add the report for the current week, including the weekRange, mood data, and report summary
        reports.push({
          week: i + 1, // Week number (1-8)
          weekRange, // The week date range
          weeklyReportSummary: weeklyReportData || "", // Include the weekly report summary or an empty string if not found
          data: formattedData, // The mood data for each day of the week
        });
      }

      // Respond with the generated reports for the last 8 weeks
      res.status(200).json({
        success: true, // Indicate that the request was successful
        data: reports, // Return the weekly reports
      });
    } catch (error) {
      // If an error occurs, pass it to the error handler with a 400 Bad Request status
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

/**
 * End of reportByMoodForLastEightWeeks function.
 * This function generates a report for the last 8 weeks, including mood data for each day of the week and weekly report summaries.
 * It handles errors and returns appropriate responses.
 */

/**
 * @function generateWeeklyReport
 * This function generates a weekly report based on the mood data of a user between the provided startDate and endDate.
 * It queries mood data for the user, processes the data through an external API for generating a report,
 * and then stores the result in the database if successful.
 */

export const generateWeeklyReport = catchAsyncError(async (req, res) => {
  // Destructure startDate and endDate from the request body
  const { startDate, endDate } = req.body;

  // Extract userId from the authenticated user's data in the request object
  const userId = req.user._id;

  // Check if userId is present; if not, return a 400 Bad Request
  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "User ID is required",
    });
  }

  // Validate that both startDate and endDate are provided; if not, return a 400 Bad Request
  if (!startDate || !endDate) {
    return res.status(400).json({
      success: false,
      message: "Please provide startDate, endDate.",
    });
  }

  try {
    // Fetch mood data for the user in the specified date range (startDate to endDate)
    const moodData = await Mood.find({
      userId: userId, // Match the mood data with the authenticated user's ID
      date: {
        $gte: new Date(startDate).toISOString(), // Ensure mood data is from the start date or later
        $lte: new Date(endDate).toISOString(), // Ensure mood data is up to the end date
      },
    }).sort({ date: -1 }); // Sort mood data by date in descending order

    // If no mood data is found for the given date range, return a 204 No Content
    if (!moodData || moodData.length === 0) {
      return res.status(204).json({
        success: false,
        message: "No mood data found for the given week range",
      });
    }

    // Helper function to send mood data to an external API for prediction or analysis
    async function query(data) {
      try {
        // Make a POST request to the external API with the mood data
        const response = await fetch(
          "http://54.218.176.251/api/v1/prediction/a945831b-1f6c-4d38-8c40-b78d955772ff",
          {
            headers: {
              Authorization:
                "Bearer dg0OzH4CP9QjBvhnNwnAP14_AUvzNBpn_AD4YU6vLdA", // Auth token for API
              "Content-Type": "application/json", // Content type is set to JSON
            },
            method: "POST",
            body: JSON.stringify(data), // Send the mood data in the request body
          }
        );

        // Check for HTTP errors; if found, log and return a custom error response
        if (!response.ok) {
          const errorDetail = await response.json();
          console.error(
            `API Error: ${response.status} ${response.statusText} - ${errorDetail.message}`
          );
          return {
            success: false,
            message: `API Error: ${
              errorDetail.message || "Something went wrong"
            }`,
            status: response.status,
          };
        }

        // Parse the API response body as text and check if it's a valid JSON response
        const responseBody = await response.text();
        if (responseBody.startsWith("<!DOCTYPE html>")) {
          console.error("Received HTML response instead of JSON");
          return {
            success: false,
            message: "Received HTML response instead of JSON",
          };
        }

        // Return the parsed JSON response from the API
        const result = JSON.parse(responseBody);
        return {
          success: true,
          data: result,
        };
      } catch (error) {
        // Handle any unexpected errors during the API call
        console.error("Error while querying the API:", error);
        return {
          success: false,
          message: "An unexpected error occurred. Please try again later.",
        };
      }
    }

    // If no summary is found, return a 204 No Content response
    if (!moodData) {
      return res.status(204).json({
        success: false,
        message: "No summary found for the given user",
      });
    } else {
      // Call the query function to fetch the generated report from the external API
      const apiResponse = await query({
        question: moodData, // Send the mood data to the API
      });

      // If the API response indicates failure, return a 500 Internal Server Error
      if (!apiResponse.success) {
        return res.status(500).json({
          success: false,
          message: apiResponse.message || "Failed to generate weekly report",
        });
      }

      // Format the week range for the generated report
      const weekRange = `${new Date(
        startDate
      ).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`;

      // Helper function to save the generated report to the database
      async function saveTextAndSessionId() {
        try {
          // Create a new WeeklyReportSummary document to store the generated report
          const weeklyReport = new WeeklyReportSummary({
            weekRange: weekRange, // Set the formatted week range
            userId: userId, // Associate the report with the user's ID
            summary: apiResponse.data.text, // Store the generated report text
          });
          await weeklyReport.save(); // Save the report to the database

          // Return the saved report as the response with a 200 OK status
          return res.status(200).json({
            success: true,
            message: "Generate weekly report successfully",
            data: weeklyReport, // Send back the saved weekly report
          });
        } catch (err) {
          // If an error occurs during saving, return a 500 Internal Server Error
          return res.status(500).json({
            success: false,
            message: "Failed to generate summary",
          });
        }
      }

      // Call the function to save the report to the database
      await saveTextAndSessionId();
    }
  } catch (err) {
    // Log any errors that occur during report generation and return a 500 Internal Server Error
    console.error("Error generating weekly report:", err);
    return res.status(500).json({
      success: false,
      message: "Error retrieving journey summary",
      error: err.message, // Include the error message for additional context
    });
  }
});

/**
 * End of generateWeeklyReport function.
 * This function retrieves mood data for a specific date range, processes it through an external API,
 * and stores the generated report in the database if successful.
 * If no mood data is found or any error occurs during the process, appropriate error messages are returned.
 */
