import mongoose from 'mongoose';
import Notification from "../model/notification.model.js";
import Todo from "../model/todo.model.js";  // Assuming your Todo model is correctly imported
import TodoNotification from "../model/todoNotification.model.js";  // Assuming your TodoNotification model
import { catchAsyncError } from "../middleware/catchAsyncErrors.js";
import userModel from "../model/user.model.js";
// import User from '../models/User.js';
import patientInvitationModel from "../model/patientInvitation.model.js";
import invitationModel from "../model/invitation.model.js";
import cron from "node-cron";
import sendMail from "../utils/sendMail.js";

export const goalNotification = catchAsyncError(async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const { newFrequency: frequency } = req.body;

    let notification = await Notification.findOne({ user: userId });
    let isNewNotification = false;

    if (!notification && frequency) {
      notification = new Notification({
        user: userId,
        frequency,
        status: "active",
        lastSent: new Date(),
      });
      await notification.save();
      isNewNotification = true;
    } else if (notification) {
      notification.frequency = frequency || notification.frequency;
      await notification.save();
    }

    // Fetch user details
    const user = await userModel.findById(userId);
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    if (isNewNotification) {
      const data = { userData: { name: user.firstName } };
      try {
        await sendMail({
          email: user.email,
          subject: "Stay on Track with Your Goals!",
          template: "goal-mail.ejs",
          data,
        });
        res.status(200).json({
          success: true,
          message: "Notification created and email sent.",
          notification,
        });
      } catch (error) {
        return next(new ErrorHandler(error.message, 400));
      }
    } else {
      res.status(200).json({
        success: true,
        message: "Notification updated.",
        notification,
      });
    }
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

export const sendTodoNotificationsController = async (req, res) => {
  try {
    const doctors = await TodoNotification.find().populate('doctorId');
    console.log('doctors ', doctors);


    for (const doctor of doctors) {

      if (shouldSendNotification()) {

        const patientInvitations = await patientInvitationModel.find({ senderId: doctor.doctorId._id });
        let totalPatientsFromInvitations = patientInvitations.length;
        let countedNPIs = new Set();
        let totalPatientsFromNPI = 0;

        for (const invitation of patientInvitations) {
          const npiNumber = invitation.npiNumber;
          if (!countedNPIs.has(npiNumber)) {
            countedNPIs.add(npiNumber);
            const patientsByNpi = await invitationModel.find({ npiNumber: npiNumber });
            totalPatientsFromNPI += patientsByNpi.length;
          }
        }

        let totalPatients = totalPatientsFromInvitations + totalPatientsFromNPI;

        const todos = await Todo.find({
          doctorId: doctor.doctorId._id,
          status: { $in: ['pending', 'in-progress'] }
        });

        const pendingTodos = todos.filter(todo => todo.status === 'pending').length;
        const inProgressTodos = todos.filter(todo => todo.status === 'in-progress').length;

        const patientIdsWithPendingTodos = new Set(todos.filter(todo => todo.status === 'pending').map(todo => todo.patientId.toString()));
        const patientIdsWithInProgressTodos = new Set(todos.filter(todo => todo.status === 'in-progress').map(todo => todo.patientId.toString()));

        let displayFrequency = doctor.notificationFrequency.charAt(0).toUpperCase() + doctor.notificationFrequency.slice(1);
        // Simplified data for the email template
        const emailData = {
          doctorName: doctor.doctorId.firstName + ' ' + doctor.doctorId.lastName,
          notificationFrequency: displayFrequency,
          totalPatients: totalPatients,
          pendingTodos: pendingTodos,
          inProgressTodos: inProgressTodos,
          uniquePatientsWithPendingTodos: patientIdsWithPendingTodos.size,
          uniquePatientsWithInProgressTodos: patientIdsWithInProgressTodos.size
        };

        // Email sending setup
        await sendMail({
          email: doctor.doctorId.email, // Assuming doctor's email is stored like this
          subject: displayFrequency + "Todo Notification",
          template: "todos-mail.ejs",
          data: emailData
        });

        doctor.lastSent = new Date();
        await doctor.save();
      }
    }
    res.status(200).send('Notifications sent successfully.');
  } catch (error) {
    console.error('Failed to send notifications:', error);
    res.status(500).send('Failed to send notifications.');
  }
};

// Function to send notifications based on schedule
async function sendNotifications() {
  const doctors = await TodoNotification.find().populate('doctorId');
  for (const doctor of doctors) {
    if (shouldSendNotification(doctor.lastSent, doctor.notificationFrequency)) {
      // Fetch data and send emails, similar to your current implementation
      console.log('Sending notification to', doctor.doctorId.email);
      // Your existing logic here
    }
  }
}

function shouldSendNotification(lastSent, frequency) {
  const now = new Date();
  if (!lastSent) return true;
  const dayDiff = (now - lastSent) / (1000 * 3600 * 24);

  switch (frequency) {
    case 'daily': return dayDiff >= 1;
    case 'weekly': return dayDiff >= 7;
    case 'monthly': return dayDiff >= 30;
    default: return false;
  }
}

// Setup cron jobs
function setupCronJobs() {
  // Run every day at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('Running daily check for notifications');
    await sendNotifications(); // This will check each doctor's frequency
  });
}
// Connect to MongoDB and start the cron job
mongoose.connect('your-mongodb-connection-string', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
    setupCronJobs();
  })
  .catch(err => console.error('Failed to connect to MongoDB', err));

export { sendNotifications };
// Exporting for possible external usage or testing