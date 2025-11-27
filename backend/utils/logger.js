import Log from "../model/log.model.js";

export const logActivity = async ({
  userId,
  action,
  description = "",
  metadata = {},
}) => {
  try {
    await Log.create({ userId, action, description, metadata });
  } catch (error) {
    console.error("Error logging activity:", error);
  }
};
